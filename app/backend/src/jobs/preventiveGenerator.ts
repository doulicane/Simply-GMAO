/**
 * =============================================================================
 * Job BullMQ — Generateur automatique de BT preventifs
 * =============================================================================
 * Ce worker s'execute en arriere-plan pour :
 *   1. Scanner les plans preventifs actifs dont l'echeance approche
 *   2. Generer automatiquement un BT preventif si aucun n'est deja ouvert
 *   3. Envoyer des notifications aux techniciens assignes
 *
 * Le job est declenche par un cron (configurable via env PREVENTIVE_CRON).
 * =============================================================================
 */

import { Queue, Worker, Job } from 'bullmq';
import { Role, WorkOrderType, Priority, WorkOrderStatus, EquipmentStatus } from '@prisma/client';
import { prisma } from '../config/database';
import { redisClient } from '../config/redis';
import { logger } from '../utils/logger';
import { generateUniqueBTNumber } from '../utils/generators';
import { calculateNextExecution } from '../utils/preventive';
import { env } from '../config/env';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const QUEUE_NAME = 'preventive-generation';
const CRON_EXPRESSION = env.PREVENTIVE_CRON;

// ---------------------------------------------------------------------------
// Queue BullMQ
// ---------------------------------------------------------------------------
export const preventiveQueue = new Queue(QUEUE_NAME, {
  connection: redisClient,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});

// ---------------------------------------------------------------------------
// Worker — Traitement des jobs
// ---------------------------------------------------------------------------
export const preventiveWorker = new Worker(
  QUEUE_NAME,
  async (_job: Job) => {
    logger.info('[PreventiveJob] Demarrage generation automatique BT preventifs...');

    const now = new Date();
    const alertDays = env.PREVENTIVE_ALERT_DAYS;
    const alertDate = new Date(now.getTime() + alertDays * 24 * 60 * 60 * 1000);

    // Rechercher les plans preventifs actifs dont l'echeance est proche
    const plans = await prisma.preventivePlan.findMany({
      where: {
        active: true,
        autoGenerateWO: true,
        nextExecution: {
          lte: alertDate,
        },
      },
      include: {
        equipment: {
          select: {
            id: true,
            code: true,
            name: true,
            statut: true,
          },
        },
      },
    });

    let generatedCount = 0;

    for (const plan of plans) {
      try {
        // Ignorer si equipement hors service
        if (plan.equipment.statut === EquipmentStatus.HORS_SERVICE) {
          logger.info(`[PreventiveJob] Equipement ${plan.equipment.code} hors service, ignore`);
          continue;
        }

        // Verifier qu'aucun BT preventif n'est deja ouvert
        const existingWO = await prisma.workOrder.findFirst({
          where: {
            equipmentId: plan.equipmentId,
            type: WorkOrderType.PREVENTIF,
            status: { in: [WorkOrderStatus.CREE, WorkOrderStatus.PLANIFIE, WorkOrderStatus.EN_COURS] },
          },
        });

        if (existingWO) {
          logger.info(`[PreventiveJob] BT preventif deja ouvert pour ${plan.equipment.code}, ignore`);
          continue;
        }

        // Generer un numero de BT
        const numero = await generateUniqueBTNumber(prisma, 'PRE');

        // Trouver un responsable ou un admin pour le demandeur
        let demandeurId = await prisma.user.findFirst({
          where: { role: Role.RESPONSABLE, active: true },
          select: { id: true },
        }).then(u => u?.id);

        if (!demandeurId) {
          demandeurId = await prisma.user.findFirst({
            where: { role: Role.ADMIN, active: true },
            select: { id: true },
          }).then(u => u?.id);
        }

        if (!demandeurId) {
          logger.error(`[PreventiveJob] Aucun responsable ou admin trouve pour generer le BT preventif du plan ${plan.id}`);
          continue;
        }

        // Creer le BT preventif
        const workOrder = await prisma.workOrder.create({
          data: {
            numero,
            title: `Preventif : ${plan.title}`,
            description: plan.description,
            equipmentId: plan.equipmentId,
            type: WorkOrderType.PREVENTIF,
            priority: Priority.MOYENNE,
            status: WorkOrderStatus.PLANIFIE,
            demandeurId,
            datePlanifiee: plan.nextExecution,
          },
        });

        // Recalculer nextExecution et mettre a jour lastExecution
        const newNextExecution = calculateNextExecution(
          now,
          plan.frequencyType,
          plan.frequencyValue
        );

        await prisma.preventivePlan.update({
          where: { id: plan.id },
          data: {
            lastExecution: now,
            nextExecution: newNextExecution,
          },
        });

        generatedCount++;
        logger.info(`[PreventiveJob] BT preventif genere : ${workOrder.numero} pour ${plan.equipment.code}`);

      } catch (planErr: any) {
        logger.error(`[PreventiveJob] Erreur plan ${plan.id} : ${planErr.message}`);
      }
    }

    logger.info(`[PreventiveJob] Termine. ${generatedCount} BT preventifs generes sur ${plans.length} plans examines.`);
    return { generatedCount, plansExamined: plans.length };
  },
  {
    connection: redisClient,
    concurrency: 1,
  }
);

// ---------------------------------------------------------------------------
// Gestion des evenements du worker
// ---------------------------------------------------------------------------
preventiveWorker.on('completed', (job: Job, result: any) => {
  logger.info(`[PreventiveJob] Job ${job.id} complete : ${JSON.stringify(result)}`);
});

preventiveWorker.on('failed', (job: Job | undefined, err: Error) => {
  logger.error(`[PreventiveJob] Job ${job?.id} echec : ${err.message}`);
});

// ---------------------------------------------------------------------------
// Scheduler — Programmation recurrente
// ---------------------------------------------------------------------------
export async function schedulePreventiveJob(): Promise<void> {
  // Supprimer les anciennes repetitions
  await preventiveQueue.obliterate({ force: true });

  // Ajouter le job recurrent
  await preventiveQueue.add(
    'generate-preventive-wo',
    {},
    {
      repeat: {
        pattern: CRON_EXPRESSION,
      },
      jobId: 'recurrent-preventive',
    }
  );

  logger.info(`[PreventiveJob] Planification active : ${CRON_EXPRESSION}`);
}

// ---------------------------------------------------------------------------
// Fonction manuelle (pour test ou trigger API)
// ---------------------------------------------------------------------------
export async function triggerPreventiveGeneration(): Promise<{ generatedCount: number; plansExamined: number }> {
  await preventiveQueue.add('generate-preventive-wo', { manual: true });
  // Le worker traitera le job de maniere asynchrone
  return { generatedCount: 0, plansExamined: 0 };
}
