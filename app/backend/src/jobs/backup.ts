/**
 * =============================================================================
 * Job BullMQ — Sauvegarde automatique quotidienne
 * =============================================================================
 * Ce worker s'execute quotidiennement pour :
 *   1. pg_dump de la base PostgreSQL
 *   2. Archivage gzip du dump
 *   3. Rotation des sauvegardes (garde 7 jours)
 * =============================================================================
 */

import { Queue, Worker, Job } from 'bullmq';
import { spawn } from 'child_process';
import { redisClient } from '../config/redis';
import { logger } from '../utils/logger';
import { env } from '../config/env';
import fs from 'fs';
import path from 'path';

const QUEUE_NAME = 'backup-daily';
const CRON_EXPRESSION = env.BACKUP_CRON ?? '0 2 * * *'; // 02h00 par defaut

export const backupQueue = new Queue(QUEUE_NAME, {
  connection: redisClient,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 60000 },
    removeOnComplete: { count: 10 },
    removeOnFail: { count: 5 },
  },
});

export const backupWorker = new Worker(
  QUEUE_NAME,
  async (_job: Job) => {
    logger.info('[BackupJob] Demarrage sauvegarde...');

    const backupDir = env.BACKUP_DIR ?? '/backups';
    const dbUrl = env.DATABASE_URL;
    const uploadDir = env.UPLOAD_DIR;
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const dumpFile = path.join(backupDir, `simply-gmao_gmao_${dateStr}.sql.gz`);

    // Creer le repertoire de backup si inexistant
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    try {
      // pg_dump via spawn (pas d'injection shell possible)
      await new Promise<void>((resolve, reject) => {
        const pgDump = spawn('pg_dump', [dbUrl], { timeout: 300000 });
        const gzip = spawn('gzip', { timeout: 300000 });
        const dumpStream = fs.createWriteStream(dumpFile);

        pgDump.stdout.pipe(gzip.stdin);
        gzip.stdout.pipe(dumpStream);

        pgDump.on('error', reject);
        gzip.on('error', reject);
        dumpStream.on('error', reject);

        dumpStream.on('finish', () => {
          logger.info(`[BackupJob] Dump cree : ${dumpFile}`);
          resolve();
        });
      });

      // Sauvegarde des uploads (copie recursive Node — pas de shell)
      const uploadsBackupDir = path.join(backupDir, 'uploads');
      if (!fs.existsSync(uploadsBackupDir)) {
        fs.mkdirSync(uploadsBackupDir, { recursive: true });
      }
      fs.cpSync(uploadDir, uploadsBackupDir, { recursive: true, force: true });
      logger.info('[BackupJob] Uploads copies.');

      // Rotation : garder 7 jours de dumps
      const files = fs.readdirSync(backupDir)
        .filter((f) => f.startsWith('simply-gmao_gmao_') && f.endsWith('.sql.gz'))
        .map((f) => ({
          name: f,
          path: path.join(backupDir, f),
          stat: fs.statSync(path.join(backupDir, f)),
        }))
        .sort((a, b) => b.stat.mtime.getTime() - a.stat.mtime.getTime());

      const toDelete = files.slice(7);
      for (const f of toDelete) {
        fs.unlinkSync(f.path);
        logger.info(`[BackupJob] Ancien dump supprime : ${f.name}`);
      }

      logger.info('[BackupJob] Sauvegarde terminee avec succes.');
      return { dumpFile, uploadsBackedUp: true, deletedOld: toDelete.length };
    } catch (err: any) {
      logger.error('[BackupJob] Erreur :', err.message);
      throw err;
    }
  },
  {
    connection: redisClient,
    concurrency: 1,
  }
);

backupWorker.on('completed', (job: Job, result: any) => {
  logger.info(`[BackupJob] Job ${job.id} complete : ${JSON.stringify(result)}`);
});

backupWorker.on('failed', (job: Job | undefined, err: Error) => {
  logger.error(`[BackupJob] Job ${job?.id} echec : ${err.message}`);
});

export async function scheduleBackupJob(): Promise<void> {
  await backupQueue.obliterate({ force: true });
  await backupQueue.add(
    'daily-backup',
    {},
    {
      repeat: { pattern: CRON_EXPRESSION },
      jobId: 'recurrent-backup',
    }
  );
  logger.info(`[BackupJob] Planification active : ${CRON_EXPRESSION}`);
}
