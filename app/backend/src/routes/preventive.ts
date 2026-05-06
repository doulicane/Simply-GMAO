/**
 * =============================================================================
 * Routes Maintenance Preventive
 * =============================================================================
 * Endpoints :
 *   GET  /api/preventive-plans              — Liste des plans
 *   POST /api/preventive-plans              — Creation
 *   PUT  /api/preventive-plans/:id          — Modification
 *   DELETE /api/preventive-plans/:id        — Suppression (soft)
 *   POST /api/preventive-plans/:id/generate-wo — Generation manuelle BT
 *   GET  /api/preventive-plans/upcoming     — Echeances a venir
 * =============================================================================
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Role, WorkOrderType, Priority, WorkOrderStatus } from '@prisma/client';
import { prisma } from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { validate, validateRequest, paginationQuerySchema, uuidParamSchema } from '../middleware/validation';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { generateUniqueBTNumber } from '../utils/generators';

const router = Router();

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------
const createPlanSchema = z.object({
  equipmentId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  frequencyType: z.enum(['jours', 'semaines', 'mois', 'annees', 'compteur']),
  frequencyValue: z.coerce.number().min(1),
  checklist: z.any().optional(),
  nextExecution: z.coerce.date().optional(),
  alerteAvantJours: z.coerce.number().min(0).default(3),
  autoGenerateWO: z.boolean().default(true),
});

const updatePlanSchema = createPlanSchema.partial();

const planQuerySchema = paginationQuerySchema.extend({
  equipmentId: z.string().uuid().optional(),
  active: z.coerce.boolean().optional(),
});

// ---------------------------------------------------------------------------
// GET /api/preventive-plans
// ---------------------------------------------------------------------------
router.get(
  '/',
  authenticate,
  validate(planQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit, sortBy, order, equipmentId, active } = req.query as unknown as z.infer<typeof planQuerySchema>;

      const where: any = {};
      if (equipmentId) where.equipmentId = equipmentId;
      if (active !== undefined) where.active = active;

      const skip = (page - 1) * limit;
      const orderBy: any = sortBy ? { [sortBy]: order } : { nextExecution: 'asc' };

      const [items, total] = await Promise.all([
        prisma.preventivePlan.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            equipment: {
              select: { id: true, code: true, name: true, statut: true, compteurActuel: true },
            },
          },
        }),
        prisma.preventivePlan.count({ where }),
      ]);

      res.json({
        success: true,
        data: items,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/preventive-plans
// ---------------------------------------------------------------------------
router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN, Role.RESPONSABLE),
  validate(createPlanSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req.body;

      // Verifier l'equipement
      const equipment = await prisma.equipment.findUnique({
        where: { id: data.equipmentId },
      });
      if (!equipment) {
        throw new AppError('Equipement introuvable', 404);
      }

      // Calculer nextExecution si non fourni
      let nextExecution = data.nextExecution;
      if (!nextExecution) {
        const now = new Date();
        switch (data.frequencyType) {
          case 'jours':
            nextExecution = new Date(now.setDate(now.getDate() + data.frequencyValue));
            break;
          case 'semaines':
            nextExecution = new Date(now.setDate(now.getDate() + data.frequencyValue * 7));
            break;
          case 'mois':
            nextExecution = new Date(now.setMonth(now.getMonth() + data.frequencyValue));
            break;
          case 'annees':
            nextExecution = new Date(now.setFullYear(now.getFullYear() + data.frequencyValue));
            break;
          case 'compteur':
            nextExecution = new Date(); // immediate pour compteur
            break;
        }
      }

      const plan = await prisma.preventivePlan.create({
        data: {
          ...data,
          nextExecution,
        },
        include: {
          equipment: { select: { id: true, code: true, name: true } },
        },
      });

      logger.info(`Plan preventif cree : ${plan.title} par ${req.user!.email}`);

      res.status(201).json({
        success: true,
        data: plan,
        message: 'Plan preventif cree avec succes',
      });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// PUT /api/preventive-plans/:id
// ---------------------------------------------------------------------------
router.put(
  '/:id',
  authenticate,
  authorize(Role.ADMIN, Role.RESPONSABLE),
  validateRequest({ params: uuidParamSchema, body: updatePlanSchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data = req.body;

      const existing = await prisma.preventivePlan.findUnique({ where: { id } });
      if (!existing) {
        throw new AppError('Plan preventif introuvable', 404);
      }

      const plan = await prisma.preventivePlan.update({
        where: { id },
        data,
        include: {
          equipment: { select: { id: true, code: true, name: true } },
        },
      });

      logger.info(`Plan preventif modifie : ${plan.title} par ${req.user!.email}`);

      res.json({ success: true, data: plan, message: 'Plan preventif modifie' });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// DELETE /api/preventive-plans/:id
// ---------------------------------------------------------------------------
router.delete(
  '/:id',
  authenticate,
  authorize(Role.ADMIN, Role.RESPONSABLE),
  validate(uuidParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const existing = await prisma.preventivePlan.findUnique({ where: { id } });
      if (!existing) {
        throw new AppError('Plan preventif introuvable', 404);
      }

      // Soft delete : desactiver le plan
      await prisma.preventivePlan.update({
        where: { id },
        data: { active: false },
      });

      logger.info(`Plan preventif desactive : ${existing.title} par ${req.user!.email}`);

      res.json({ success: true, message: 'Plan preventif desactive' });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/preventive-plans/:id/generate-wo
// ---------------------------------------------------------------------------
router.post(
  '/:id/generate-wo',
  authenticate,
  authorize(Role.ADMIN, Role.RESPONSABLE),
  validate(uuidParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const plan = await prisma.preventivePlan.findUnique({
        where: { id, active: true },
        include: { equipment: true },
      });
      if (!plan) {
        throw new AppError('Plan preventif introuvable ou inactif', 404);
      }

      // Verifier qu'il n'y a pas deja un BT preventif ouvert pour ce plan
      const existingWO = await prisma.workOrder.findFirst({
        where: {
          equipmentId: plan.equipmentId,
          type: WorkOrderType.PREVENTIF,
          status: { in: [WorkOrderStatus.CREE, WorkOrderStatus.PLANIFIE, WorkOrderStatus.EN_COURS] },
        },
      });

      if (existingWO) {
        throw new AppError('Un BT preventif est deja ouvert pour cet equipement', 409);
      }

      // Generer le BT preventif
      const numero = await generateUniqueBTNumber(prisma, 'PRE');

      const workOrder = await prisma.workOrder.create({
        data: {
          numero,
          title: `Preventif : ${plan.title}`,
          description: plan.description,
          equipmentId: plan.equipmentId,
          type: WorkOrderType.PREVENTIF,
          priority: Priority.MOYENNE,
          status: WorkOrderStatus.PLANIFIE,
          demandeurId: req.user!.id,
          datePlanifiee: plan.nextExecution,
        },
        include: {
          equipment: { select: { id: true, code: true, name: true } },
        },
      });

      // Mettre a jour le plan
      await prisma.preventivePlan.update({
        where: { id },
        data: { lastExecution: new Date() },
      });

      logger.info(`BT preventif genere : ${workOrder.numero} depuis plan ${plan.title}`);

      res.status(201).json({
        success: true,
        data: workOrder,
        message: 'Bon de travail preventif genere avec succes',
      });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/preventive-plans/upcoming
// ---------------------------------------------------------------------------
router.get(
  '/upcoming',
  authenticate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const daysAhead = Number(req.query.days ?? 30);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() + daysAhead);

      const plans = await prisma.preventivePlan.findMany({
        where: {
          active: true,
          nextExecution: {
            lte: cutoffDate,
          },
        },
        orderBy: { nextExecution: 'asc' },
        include: {
          equipment: {
            select: { id: true, code: true, name: true, statut: true, compteurActuel: true, compteurUnite: true },
          },
        },
      });

      // Calculer les alertes
      const now = new Date();
      const enrichedPlans = plans.map((plan) => {
        const daysUntil = plan.nextExecution
          ? Math.ceil((plan.nextExecution.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : null;

        let alertLevel: 'vert' | 'orange' | 'rouge' = 'vert';
        if (daysUntil !== null) {
          if (daysUntil < 0) alertLevel = 'rouge';
          else if (daysUntil <= plan.alerteAvantJours) alertLevel = 'orange';
        }

        return { ...plan, daysUntil, alertLevel };
      });

      res.json({ success: true, data: enrichedPlans });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
