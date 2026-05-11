/**
 * =============================================================================
 * Job BullMQ — Alertes Stock Minimum
 * =============================================================================
 * Ce worker s'execute quotidiennement pour :
 *   1. Scanner les articles dont la quantite <= stockMinimum
 *   2. Envoyer une notification WebSocket aux responsables et magasiniers
 *   3. Logger l'alerte pour historique
 *
 * Le job est declenche par un cron quotidien a 08h00.
 * =============================================================================
 */

import { Queue, Worker, Job } from 'bullmq';
import { prisma } from '../config/database';
import { redisClient } from '../config/redis';
import { logger } from '../utils/logger';
import { env } from '../config/env';
import { emitToRole } from '../socket';

const QUEUE_NAME = 'stock-alerts';
const CRON_EXPRESSION = env.STOCK_ALERT_CRON ?? '0 8 * * *'; // 08h00 tous les jours

export const stockAlertQueue = new Queue(QUEUE_NAME, {
  connection: redisClient,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { count: 30 },
    removeOnFail: { count: 10 },
  },
});

export const stockAlertWorker = new Worker(
  QUEUE_NAME,
  async (_job: Job) => {
    logger.info('[StockAlertJob] Verification des stocks minimums...');

    const lowStockItems = await prisma.stockItem.findMany({
      where: {
        active: true,
        deletedAt: null,
        quantite: { lte: prisma.stockItem.fields.stockMinimum },
      },
      orderBy: { quantite: 'asc' },
    });

    if (lowStockItems.length === 0) {
      logger.info('[StockAlertJob] Aucun article sous seuil.');
      return { alertedCount: 0 };
    }

    // Envoyer notification temps reel aux responsables et magasiniers
    try {
      emitToRole('responsable', 'stock:alert', {
        type: 'stock_alert',
        title: 'Alerte stock minimum',
        message: `${lowStockItems.length} article(s) sous seuil minimum`,
        items: lowStockItems.map((i) => ({
          id: i.id,
          code: i.code,
          name: i.name,
          quantite: Number(i.quantite),
          stockMinimum: Number(i.stockMinimum),
        })),
        createdAt: new Date().toISOString(),
      });
      emitToRole('magasinier', 'stock:alert', {
        type: 'stock_alert',
        title: 'Alerte stock minimum',
        message: `${lowStockItems.length} article(s) sous seuil minimum`,
        items: lowStockItems.map((i) => ({
          id: i.id,
          code: i.code,
          name: i.name,
          quantite: Number(i.quantite),
          stockMinimum: Number(i.stockMinimum),
        })),
        createdAt: new Date().toISOString(),
      });
    } catch (wsErr: any) {
      logger.error('[StockAlertJob] Erreur emission WebSocket :', wsErr.message);
    }

    logger.info(`[StockAlertJob] ${lowStockItems.length} article(s) sous seuil alertes.`);
    return { alertedCount: lowStockItems.length, items: lowStockItems.map((i) => i.code) };
  },
  {
    connection: redisClient,
    concurrency: 1,
  }
);

stockAlertWorker.on('completed', (job: Job, result: any) => {
  logger.info(`[StockAlertJob] Job ${job.id} complete : ${JSON.stringify(result)}`);
});

stockAlertWorker.on('failed', (job: Job | undefined, err: Error) => {
  logger.error(`[StockAlertJob] Job ${job?.id} echec : ${err.message}`);
});

export async function scheduleStockAlertJob(): Promise<void> {
  await stockAlertQueue.obliterate({ force: true });
  await stockAlertQueue.add(
    'check-stock-minimum',
    {},
    {
      repeat: { pattern: CRON_EXPRESSION },
      jobId: 'recurrent-stock-alert',
    }
  );
  logger.info(`[StockAlertJob] Planification active : ${CRON_EXPRESSION}`);
}

export async function triggerStockAlertNow(): Promise<{ alertedCount: number }> {
  await stockAlertQueue.add('check-stock-minimum', { manual: true });
  return { alertedCount: 0 };
}
