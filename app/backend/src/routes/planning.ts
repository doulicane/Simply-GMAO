/**
 * =============================================================================
 * Routes Planning
 * =============================================================================
 * Endpoint :
 *   GET /api/planning?month=YYYY-MM — Liste des evenements du mois
 * =============================================================================
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

const planningQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
});

function mapWorkOrderType(type: string): 'preventive' | 'corrective' | 'inspection' {
  switch (type) {
    case 'PREVENTIF': return 'preventive';
    case 'CONDITIONNEL': return 'inspection';
    default: return 'corrective';
  }
}

router.get(
  '/',
  authenticate,
  validate(planningQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { month } = req.query as { month: string };
      const [year, m] = month.split('-').map(Number);
      const start = new Date(year, m - 1, 1);
      const end = new Date(year, m, 1);

      const workOrders = await prisma.workOrder.findMany({
        where: {
          deletedAt: null,
          datePlanifiee: { gte: start, lt: end },
        },
        select: {
          id: true,
          numero: true,
          title: true,
          type: true,
          status: true,
          priority: true,
          datePlanifiee: true,
          dureeMinutes: true,
          equipment: { select: { id: true, code: true } },
        },
      });

      const preventivePlans = await prisma.preventivePlan.findMany({
        where: {
          deletedAt: null,
          active: true,
          nextExecution: { gte: start, lt: end },
        },
        select: {
          id: true,
          title: true,
          frequencyType: true,
          frequencyValue: true,
          nextExecution: true,
          equipment: { select: { id: true, code: true } },
        },
      });

      const events = [
        ...workOrders.map((wo) => ({
          id: wo.id,
          title: wo.title ?? wo.numero,
          date: wo.datePlanifiee!.toISOString(),
          type: mapWorkOrderType(wo.type),
          status: wo.status,
          equipmentId: wo.equipment?.id,
          equipmentCode: wo.equipment?.code,
        })),
        ...preventivePlans.map((pp) => ({
          id: pp.id,
          title: pp.title,
          date: pp.nextExecution!.toISOString(),
          type: 'preventive' as const,
          status: 'planifie',
          equipmentId: pp.equipment?.id,
          equipmentCode: pp.equipment?.code,
        })),
      ];

      res.json({ success: true, data: events });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
