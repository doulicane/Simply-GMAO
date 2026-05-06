/**
 * =============================================================================
 * Routes Dashboard / Reporting
 * =============================================================================
 * Endpoints :
 *   GET /api/dashboard/kpis                — KPIs agreges
 *   GET /api/dashboard/alerts            — Alertes en cours
 *   GET /api/dashboard/recent-work-orders — BT recents
 *   GET /api/dashboard/upcoming-preventive — Preventifs a venir
 * =============================================================================
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Role, WorkOrderStatus, WorkOrderType, EquipmentStatus } from '@prisma/client';
import { prisma } from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { validate, validateRequest, paginationQuerySchema, uuidParamSchema } from '../middleware/validation';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// ---------------------------------------------------------------------------
// GET /api/dashboard/kpis
// ---------------------------------------------------------------------------
router.get(
  '/kpis',
  authenticate,
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [
        totalEquipments,
        equipmentByStatus,
        totalWO,
        woByStatus,
        woByType,
        woThisMonth,
        avgDuration,
        totalPreventivePlans,
        upcomingPreventive,
        lowStockItems,
      ] = await Promise.all([
        prisma.equipment.count(),
        prisma.equipment.groupBy({ by: ['statut'], _count: { id: true } }),
        prisma.workOrder.count(),
        prisma.workOrder.groupBy({ by: ['status'], _count: { id: true } }),
        prisma.workOrder.groupBy({ by: ['type'], _count: { id: true } }),
        prisma.workOrder.count({ where: { dateCreation: { gte: startOfMonth } } }),
        prisma.workOrder.aggregate({
          where: { dureeMinutes: { not: null }, dateCreation: { gte: startOfMonth } },
          _avg: { dureeMinutes: true },
        }),
        prisma.preventivePlan.count({ where: { active: true } }),
        prisma.preventivePlan.count({
          where: {
            active: true,
            nextExecution: { lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) },
          },
        }),
        prisma.stockItem.count({
          where: {
            active: true,
            quantite: { lte: prisma.stockItem.fields.stockMinimum },
          },
        }),
      ]);

      // Calcul MTTR (temps moyen de reparation) — BT correctifs du mois
      const correctifWO = await prisma.workOrder.findMany({
        where: {
          type: { in: [WorkOrderType.CORRECTIF, WorkOrderType.CONDITIONNEL] },
          status: WorkOrderStatus.CLOTURE,
          dateCreation: { gte: startOfMonth },
          dureeMinutes: { not: null },
        },
        select: { dureeMinutes: true },
      });
      const mttr = correctifWO.length > 0
        ? correctifWO.reduce((sum, wo) => sum + (wo.dureeMinutes ?? 0), 0) / correctifWO.length
        : 0;

      // Taux preventif
      const preventiveWO = await prisma.workOrder.count({
        where: { type: WorkOrderType.PREVENTIF, dateCreation: { gte: startOfMonth } },
      });
      const totalWOMonth = woThisMonth || 1;
      const tauxPreventif = (preventiveWO / totalWOMonth) * 100;

      res.json({
        success: true,
        data: {
          equipements: {
            total: totalEquipments,
            byStatus: equipmentByStatus.reduce((acc, item) => {
              acc[item.statut] = item._count.id;
              return acc;
            }, {} as Record<string, number>),
          },
          workOrders: {
            total: totalWO,
            thisMonth: woThisMonth,
            byStatus: woByStatus.reduce((acc, item) => {
              acc[item.status] = item._count.id;
              return acc;
            }, {} as Record<string, number>),
            byType: woByType.reduce((acc, item) => {
              acc[item.type] = item._count.id;
              return acc;
            }, {} as Record<string, number>),
            avgDurationMinutes: Math.round(avgDuration._avg.dureeMinutes ?? 0),
            mttrMinutes: Math.round(mttr),
          },
          preventive: {
            totalPlans: totalPreventivePlans,
            upcoming30Days: upcomingPreventive,
            tauxPreventifPct: Math.round(tauxPreventif * 100) / 100,
          },
          stock: {
            lowStockCount: lowStockItems,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/dashboard/alerts
// ---------------------------------------------------------------------------
router.get(
  '/alerts',
  authenticate,
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const now = new Date();

      const [
        urgentWO,
        overdueWO,
        lowStock,
        equipmentStopped,
      ] = await Promise.all([
        prisma.workOrder.findMany({
          where: { priority: 'URGENTE', status: { in: [WorkOrderStatus.CREE, WorkOrderStatus.PLANIFIE] } },
          orderBy: { dateCreation: 'desc' },
          take: 5,
          include: {
            equipment: { select: { id: true, code: true, name: true } },
          },
        }),
        prisma.workOrder.findMany({
          where: {
            status: { in: [WorkOrderStatus.PLANIFIE, WorkOrderStatus.EN_COURS] },
            datePlanifiee: { lt: now },
          },
          orderBy: { datePlanifiee: 'asc' },
          take: 5,
          include: {
            equipment: { select: { id: true, code: true, name: true } },
            technicien: { select: { id: true, firstName: true, lastName: true } },
          },
        }),
        prisma.stockItem.findMany({
          where: {
            active: true,
            quantite: { lte: prisma.stockItem.fields.stockMinimum },
          },
          take: 5,
        }),
        prisma.equipment.findMany({
          where: {
            statut: { in: [EquipmentStatus.EN_ARRET, EquipmentStatus.EN_MAINTENANCE] },
          },
          take: 5,
          include: {
            ligne: { include: { zone: true } },
          },
        }),
      ]);

      res.json({
        success: true,
        data: {
          urgentWorkOrders: urgentWO,
          overdueWorkOrders: overdueWO,
          lowStockItems: lowStock,
          equipmentStopped,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/dashboard/recent-work-orders
// ---------------------------------------------------------------------------
router.get(
  '/recent-work-orders',
  authenticate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = Number(req.query.limit ?? 10);

      const workOrders = await prisma.workOrder.findMany({
        take: limit,
        orderBy: { dateCreation: 'desc' },
        include: {
          equipment: { select: { id: true, code: true, name: true } },
          demandeur: { select: { id: true, firstName: true, lastName: true } },
          technicien: { select: { id: true, firstName: true, lastName: true } },
        },
      });

      res.json({ success: true, data: workOrders });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/dashboard/upcoming-preventive
// ---------------------------------------------------------------------------
router.get(
  '/upcoming-preventive',
  authenticate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const days = Number(req.query.days ?? 30);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() + days);

      const plans = await prisma.preventivePlan.findMany({
        where: {
          active: true,
          nextExecution: { lte: cutoff },
        },
        orderBy: { nextExecution: 'asc' },
        include: {
          equipment: {
            select: { id: true, code: true, name: true, statut: true },
          },
        },
      });

      res.json({ success: true, data: plans, count: plans.length });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
