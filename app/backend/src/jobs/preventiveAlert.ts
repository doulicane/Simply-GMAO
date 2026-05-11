/**
 * =============================================================================
 * Job BullMQ — Alertes Echeances Preventives
 * =============================================================================
 * Ce worker s'execute quotidiennement pour :
 *   1. Scanner les plans preventifs actifs
 *   2. Envoyer des notifications WebSocket selon l'echeance :
 *      - 7 jours avant  → info
 *      - 3 jours avant  → warning
 *      - Jour J         → error
 *      - Retard         → error
 * =============================================================================
 */

import { Queue, Worker, Job } from 'bullmq';
import { prisma } from '../config/database';
import { redisClient } from '../config/redis';
import { logger } from '../utils/logger';
import { env } from '../config/env';
import { emitToRole } from '../socket';

const QUEUE_NAME = 'preventive-alerts';
const CRON_EXPRESSION = env.PREVENTIVE_ALERT_CRON ?? '0 7 * * *'; // 07h00 par defaut

export const preventiveAlertQueue = new Queue(QUEUE_NAME, {
  connection: redisClient,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { count: 30 },
    removeOnFail: { count: 10 },
  },
});

export const preventiveAlertWorker = new Worker(
  QUEUE_NAME,
  async (_job: Job) => {
    logger.info('[PreventiveAlertJob] Verification des echeances preventives...');

    const now = new Date();
    const plans = await prisma.preventivePlan.findMany({
      where: {
        active: true,
        deletedAt: null,
        nextExecution: { not: null },
      },
      include: {
        equipment: { select: { id: true, code: true, name: true } },
      },
    });

    let alertCount = 0;

    for (const plan of plans) {
      if (!plan.nextExecution) continue;

      const daysUntil = Math.ceil(
        (plan.nextExecution.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      let shouldAlert = false;
      let alertType: 'info' | 'warning' | 'error' = 'info';
      let alertTitle = '';

      if (daysUntil < 0) {
        shouldAlert = true;
        alertType = 'error';
        alertTitle = `Retard preventif : ${plan.title}`;
      } else if (daysUntil === 0) {
        shouldAlert = true;
        alertType = 'error';
        alertTitle = `Preventif aujourd'hui : ${plan.title}`;
      } else if (daysUntil <= 3) {
        shouldAlert = true;
        alertType = 'warning';
        alertTitle = `Preventif dans ${daysUntil} jours : ${plan.title}`;
      } else if (daysUntil <= 7) {
        shouldAlert = true;
        alertType = 'info';
        alertTitle = `Preventif dans ${daysUntil} jours : ${plan.title}`;
      }

      if (shouldAlert) {
        try {
          emitToRole('responsable', 'preventive:alert', {
            type: alertType,
            title: alertTitle,
            message: `Equipement ${plan.equipment?.code ?? ''} — ${plan.equipment?.name ?? ''}`,
            planId: plan.id,
            equipmentId: plan.equipmentId,
            equipmentCode: plan.equipment?.code,
            daysUntil,
            nextExecution: plan.nextExecution.toISOString(),
            createdAt: now.toISOString(),
          });
          alertCount++;
        } catch (wsErr: any) {
          logger.error('[PreventiveAlertJob] Erreur WS :', wsErr.message);
        }
      }
    }

    logger.info(`[PreventiveAlertJob] ${alertCount} alertes emises sur ${plans.length} plans.`);
    return { alertCount, plansExamined: plans.length };
  },
  {
    connection: redisClient,
    concurrency: 1,
  }
);

preventiveAlertWorker.on('completed', (job: Job, result: any) => {
  logger.info(`[PreventiveAlertJob] Job ${job.id} complete : ${JSON.stringify(result)}`);
});

preventiveAlertWorker.on('failed', (job: Job | undefined, err: Error) => {
  logger.error(`[PreventiveAlertJob] Job ${job?.id} echec : ${err.message}`);
});

export async function schedulePreventiveAlertJob(): Promise<void> {
  await preventiveAlertQueue.obliterate({ force: true });
  await preventiveAlertQueue.add(
    'check-preventive-alerts',
    {},
    {
      repeat: { pattern: CRON_EXPRESSION },
      jobId: 'recurrent-preventive-alert',
    }
  );
  logger.info(`[PreventiveAlertJob] Planification active : ${CRON_EXPRESSION}`);
}
