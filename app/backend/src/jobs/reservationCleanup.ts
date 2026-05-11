/**
 * =============================================================================
 * Job BullMQ — Annulation auto des reservations expirees
 * =============================================================================
 * Ce worker s'execute toutes les heures pour :
 *   1. Trouver les mouvements RESERVATION de plus de 48h
 *   2. Les annuler (creer un mouvement RETOUR et remettre le stock)
 * =============================================================================
 */

import { Queue, Worker, Job } from 'bullmq';
import { StockMovementType } from '@prisma/client';
import { prisma } from '../config/database';
import { redisClient } from '../config/redis';
import { logger } from '../utils/logger';

const QUEUE_NAME = 'reservation-cleanup';

export const reservationCleanupQueue = new Queue(QUEUE_NAME, {
  connection: redisClient,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { count: 30 },
    removeOnFail: { count: 10 },
  },
});

export const reservationCleanupWorker = new Worker(
  QUEUE_NAME,
  async (_job: Job) => {
    logger.info('[ReservationCleanup] Verification des reservations expirees...');

    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - 48);

    const expiredReservations = await prisma.stockMovement.findMany({
      where: {
        type: StockMovementType.RESERVATION,
        date: { lt: cutoff },
      },
      include: {
        stockItem: true,
      },
    });

    let cancelledCount = 0;

    for (const mov of expiredReservations) {
      try {
        await prisma.$transaction(async (tx) => {
          // Creer un mouvement RETOUR
          await tx.stockMovement.create({
            data: {
              stockItemId: mov.stockItemId,
              type: StockMovementType.RETOUR,
              quantite: mov.quantite,
              commentaire: `Annulation auto reservation apres 48h (origine ${mov.id})`,
            },
          });

          // Remettre le stock
          const newQuantite = Number(mov.stockItem.quantite) + Number(mov.quantite);
          await tx.stockItem.update({
            where: { id: mov.stockItemId },
            data: { quantite: newQuantite },
          });
        });

        cancelledCount++;
        logger.info(`[ReservationCleanup] Reservation ${mov.id} annulee.`);
      } catch (err: any) {
        logger.error(`[ReservationCleanup] Erreur annulation ${mov.id} :`, err.message);
      }
    }

    logger.info(`[ReservationCleanup] ${cancelledCount}/${expiredReservations.length} reservations annulees.`);
    return { cancelledCount, totalExpired: expiredReservations.length };
  },
  {
    connection: redisClient,
    concurrency: 1,
  }
);

reservationCleanupWorker.on('completed', (job: Job, result: any) => {
  logger.info(`[ReservationCleanup] Job ${job.id} complete : ${JSON.stringify(result)}`);
});

reservationCleanupWorker.on('failed', (job: Job | undefined, err: Error) => {
  logger.error(`[ReservationCleanup] Job ${job?.id} echec : ${err.message}`);
});

export async function scheduleReservationCleanupJob(): Promise<void> {
  await reservationCleanupQueue.obliterate({ force: true });
  await reservationCleanupQueue.add(
    'cleanup-expired-reservations',
    {},
    {
      repeat: { pattern: '0 * * * *' }, // Toutes les heures
      jobId: 'recurrent-reservation-cleanup',
    }
  );
  logger.info('[ReservationCleanup] Planification active : toutes les heures');
}
