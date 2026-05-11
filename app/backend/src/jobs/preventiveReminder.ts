import { Queue, Worker } from 'bullmq';
import { prisma } from '../config/database';
import { redisClient } from '../config/redis';
import { logger } from '../utils/logger';
import { broadcastEvent } from '../socket';

const REMINDER_QUEUE = 'preventive-reminder';

export const preventiveReminderQueue = new Queue(REMINDER_QUEUE, { connection: redisClient });

export async function schedulePreventiveReminderJob() {
  const repeatables = await preventiveReminderQueue.getRepeatableJobs();
  for (const job of repeatables) {
    await preventiveReminderQueue.removeRepeatableByKey(job.key);
  }

  await preventiveReminderQueue.add(
    'check',
    {},
    {
      repeat: {
        pattern: '0 7 * * *', // Tous les jours à 7h00
      },
    }
  );

  logger.info('Job rappel preventif planifie (tous les jours 07h00)');
}

const worker = new Worker(
  REMINDER_QUEUE,
  async (_job) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const plans = await prisma.preventivePlan.findMany({
      where: {
        active: true,
        deletedAt: null,
        nextExecution: { gte: tomorrow, lte: tomorrowEnd },
      },
      include: { equipment: { select: { code: true, name: true } } },
    });

    for (const plan of plans) {
      broadcastEvent('preventive:reminder', {
        title: 'Rappel maintenance préventive',
        message: `Préventif « ${plan.title} » prévu demain sur ${plan.equipment?.name ?? 'équipement'}`,
        equipmentId: plan.equipmentId,
        preventivePlanId: plan.id,
      });
    }

    logger.info(`${plans.length} rappels preventifs envoyes`);
    return { count: plans.length };
  },
  { connection: redisClient }
);

worker.on('failed', (job, err) => {
  logger.error(`Job rappel preventif echoue : ${err.message}`, { jobId: job?.id });
});
