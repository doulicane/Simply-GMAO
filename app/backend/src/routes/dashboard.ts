/**
 * =============================================================================
 * Routes Dashboard / Reporting
 * =============================================================================
 * Endpoints :
 *   GET /api/dashboard/kpis                — KPIs agreges
 *   GET /api/dashboard/alerts              — Alertes en cours
 *   GET /api/dashboard/recent-work-orders  — BT recents
 *   GET /api/dashboard/upcoming-preventive — Preventifs a venir
 *   GET /api/dashboard/pareto              — Pareto pannes
 *   GET /api/dashboard/compare             — Comparaison N vs N-1
 *   GET /api/dashboard/export-work-orders  — Export Excel BT periode
 * =============================================================================
 */

import { Router, Request, Response, NextFunction } from 'express';
import { WorkOrderStatus, WorkOrderType, EquipmentStatus } from '@prisma/client';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { generateMonthlyReportPDF } from '../services/pdfService';
import { getCache, setCache } from '../utils/cache';

const router = Router();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfPrevMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() - 1, 1);
}

// ---------------------------------------------------------------------------
// GET /api/dashboard/kpis
// ---------------------------------------------------------------------------
router.get(
  '/kpis',
  authenticate,
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cacheKey = 'dashboard:kpis';
      const cached = await getCache(cacheKey);
      if (cached) {
        res.json({ success: true, data: cached, cached: true });
        return;
      }

      const now = new Date();
      const som = startOfMonth(now);
      const prevSom = startOfPrevMonth(now);

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
        totalWOPrevMonth,
      ] = await Promise.all([
        prisma.equipment.count({ where: { deletedAt: null } }),
        prisma.equipment.groupBy({ by: ['statut'], _count: { id: true } }),
        prisma.workOrder.count({ where: { deletedAt: null } }),
        prisma.workOrder.groupBy({ by: ['status'], _count: { id: true } }),
        prisma.workOrder.groupBy({ by: ['type'], _count: { id: true } }),
        prisma.workOrder.count({ where: { dateCreation: { gte: som }, deletedAt: null } }),
        prisma.workOrder.aggregate({
          where: { dureeMinutes: { not: null }, dateCreation: { gte: som }, deletedAt: null },
          _avg: { dureeMinutes: true },
        }),
        prisma.preventivePlan.count({ where: { active: true, deletedAt: null } }),
        prisma.preventivePlan.count({
          where: { active: true, deletedAt: null, nextExecution: { lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) } },
        }),
        prisma.stockItem.count({
          where: { active: true, quantite: { lte: prisma.stockItem.fields.stockMinimum } },
        }),
        prisma.workOrder.count({ where: { dateCreation: { gte: prevSom, lt: som }, deletedAt: null } }),
      ]);

      // --- MTTR (temps moyen de reparation) ---
      const correctifWO = await prisma.workOrder.findMany({
        where: {
          type: { in: [WorkOrderType.CORRECTIF, WorkOrderType.CONDITIONNEL] },
          status: WorkOrderStatus.CLOTURE,
          dateCreation: { gte: som },
          dureeMinutes: { not: null },
          deletedAt: null,
        },
        select: { dureeMinutes: true },
      });
      const mttr = correctifWO.length > 0
        ? correctifWO.reduce((sum, wo) => sum + (wo.dureeMinutes ?? 0), 0) / correctifWO.length
        : 0;

      // --- MTBF (temps moyen entre pannes) ---
      // Duree du mois en heures / nombre de pannes
      const pannesMonth = await prisma.workOrder.count({
        where: {
          type: { in: [WorkOrderType.CORRECTIF, WorkOrderType.CONDITIONNEL] },
          dateCreation: { gte: som },
          deletedAt: null,
        },
      });
      const hoursInMonth = 30 * 24;
      const mtbf = pannesMonth > 0 ? Math.round((hoursInMonth / pannesMonth) * 10) / 10 : 0;

      // --- Taux preventif ---
      const preventiveWO = await prisma.workOrder.count({
        where: { type: WorkOrderType.PREVENTIF, dateCreation: { gte: som }, deletedAt: null },
      });
      const totalWOMonth = woThisMonth || 1;
      const tauxPreventif = (preventiveWO / totalWOMonth) * 100;

      // --- Disponibilite ---
      // (1 - (temps d'arret / temps total)) * 100
      const equipDown = await prisma.equipment.count({
        where: { statut: { in: [EquipmentStatus.EN_ARRET, EquipmentStatus.HORS_SERVICE] }, deletedAt: null },
      });
      const disponibilite = totalEquipments > 0
        ? Math.round(((totalEquipments - equipDown) / totalEquipments) * 100 * 100) / 100
        : 0;

      // --- Cout maintenance du mois ---
      const coutMois = await prisma.workOrder.aggregate({
        where: {
          status: WorkOrderStatus.CLOTURE,
          dateCreation: { gte: som },
          deletedAt: null,
        },
        _sum: { coutMainOeuvre: true },
      });

      // --- Temps de reponse moyen (planifie - cree) ---
      const woAvecDates = await prisma.workOrder.findMany({
        where: {
          status: { not: WorkOrderStatus.CREE },
          dateCreation: { gte: som },
          datePlanifiee: { not: null },
          deletedAt: null,
        },
        select: { dateCreation: true, datePlanifiee: true },
      });
      const tempsReponse = woAvecDates.length > 0
        ? woAvecDates.reduce((sum, wo) => {
            const diff = (wo.datePlanifiee!.getTime() - wo.dateCreation.getTime()) / (1000 * 60 * 60);
            return sum + diff;
          }, 0) / woAvecDates.length
        : 0;

      // --- Respect plan preventif ---
      const plansDone = await prisma.workOrder.count({
        where: { type: WorkOrderType.PREVENTIF, status: WorkOrderStatus.CLOTURE, dateCreation: { gte: som }, deletedAt: null },
      });
      const plansPlanned = await prisma.workOrder.count({
        where: { type: WorkOrderType.PREVENTIF, dateCreation: { gte: som }, deletedAt: null },
      });
      const respectPreventif = plansPlanned > 0 ? (plansDone / plansPlanned) * 100 : 0;

      const data = {
        equipements: {
          total: totalEquipments,
          byStatus: equipmentByStatus.reduce((acc, item) => {
            acc[item.statut] = item._count.id;
            return acc;
          }, {} as Record<string, number>),
          disponibilitePct: disponibilite,
          arretCount: equipDown,
        },
        workOrders: {
          total: totalWO,
          thisMonth: woThisMonth,
          prevMonth: totalWOPrevMonth,
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
          mtbfHours: mtbf,
          coutMois: Number(coutMois._sum.coutMainOeuvre ?? 0),
          tempsReponseHeures: Math.round(tempsReponse * 100) / 100,
        },
        preventive: {
          totalPlans: totalPreventivePlans,
          upcoming30Days: upcomingPreventive,
          tauxPreventifPct: Math.round(tauxPreventif * 100) / 100,
          respectPlanPct: Math.round(respectPreventif * 100) / 100,
        },
        stock: {
          lowStockCount: lowStockItems,
        },
      };
      await setCache(cacheKey, data, 300);
      res.json({ success: true, data });
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
          where: { priority: 'URGENTE', status: { in: [WorkOrderStatus.CREE, WorkOrderStatus.PLANIFIE] }, deletedAt: null },
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
            deletedAt: null,
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
            deletedAt: null,
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
        where: { deletedAt: null },
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
          deletedAt: null,
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

// ---------------------------------------------------------------------------
// GET /api/dashboard/pareto — Pareto pannes (causes + frequences)
// ---------------------------------------------------------------------------
router.get(
  '/pareto',
  authenticate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const months = Number(req.query.months ?? 6);
      const cacheKey = `dashboard:pareto:${months}`;
      const cached = await getCache(cacheKey);
      if (cached) {
        res.json({ success: true, data: cached, cached: true });
        return;
      }
      const cutoff = new Date();
      cutoff.setMonth(cutoff.getMonth() - months);

      const pannes = await prisma.workOrder.findMany({
        where: {
          type: { in: [WorkOrderType.CORRECTIF, WorkOrderType.CONDITIONNEL] },
          status: WorkOrderStatus.CLOTURE,
          dateCreation: { gte: cutoff },
          causePanne: { not: null },
          deletedAt: null,
        },
        select: { causePanne: true, dureeMinutes: true },
      });

      // Grouper par cause
      const grouped = pannes.reduce((acc, p) => {
        const cause = p.causePanne!;
        if (!acc[cause]) acc[cause] = { count: 0, totalDuree: 0 };
        acc[cause].count++;
        acc[cause].totalDuree += p.dureeMinutes ?? 0;
        return acc;
      }, {} as Record<string, { count: number; totalDuree: number }>);

      const total = pannes.length || 1;
      let cumul = 0;

      const pareto = Object.entries(grouped)
        .map(([cause, data]) => ({
          cause,
          count: data.count,
          frequencyPct: Math.round((data.count / total) * 100 * 100) / 100,
          totalDuree: data.totalDuree,
        }))
        .sort((a, b) => b.count - a.count)
        .map((item) => {
          cumul += item.frequencyPct;
          return { ...item, cumulPct: Math.round(cumul * 100) / 100 };
        });

      const response = { success: true, data: pareto, totalPannes: pannes.length };
      await setCache(cacheKey, response.data, 300);
      res.json(response);
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/dashboard/compare — Comparaison N vs N-1
// ---------------------------------------------------------------------------
router.get(
  '/compare',
  authenticate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const months = Number(req.query.months ?? 1);
      const cacheKey = `dashboard:compare:${months}`;
      const cached = await getCache(cacheKey);
      if (cached) {
        res.json({ success: true, data: cached, cached: true });
        return;
      }
      const now = new Date();

      const currentStart = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
      const prevStart = new Date(now.getFullYear(), now.getMonth() - months * 2 + 1, 1);
      const prevEnd = new Date(currentStart.getTime() - 1);

      const [current, previous] = await Promise.all([
        getPeriodStats(currentStart, prevEnd), // currentStart = debut periode N, prevEnd = fin periode N
        getPeriodStats(prevStart, prevEnd),    // periode N-1
      ]);

      const response = { success: true, data: { current, previous } };
      await setCache(cacheKey, response.data, 300);
      res.json(response);
    } catch (err) {
      next(err);
    }
  }
);

async function getPeriodStats(start: Date, end: Date) {
  const [woCount, pannesCount, mttrAgg, coutSum, clotureCount] = await Promise.all([
    prisma.workOrder.count({ where: { dateCreation: { gte: start, lte: end }, deletedAt: null } }),
    prisma.workOrder.count({
      where: { type: { in: [WorkOrderType.CORRECTIF, WorkOrderType.CONDITIONNEL] }, dateCreation: { gte: start, lte: end }, deletedAt: null },
    }),
    prisma.workOrder.aggregate({
      where: { status: WorkOrderStatus.CLOTURE, type: { in: [WorkOrderType.CORRECTIF, WorkOrderType.CONDITIONNEL] }, dateCreation: { gte: start, lte: end }, dureeMinutes: { not: null }, deletedAt: null },
      _avg: { dureeMinutes: true },
    }),
    prisma.workOrder.aggregate({
      where: { status: WorkOrderStatus.CLOTURE, dateCreation: { gte: start, lte: end }, deletedAt: null },
      _sum: { coutMainOeuvre: true },
    }),
    prisma.workOrder.count({ where: { status: WorkOrderStatus.CLOTURE, dateCreation: { gte: start, lte: end }, deletedAt: null } }),
  ]);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
    workOrders: woCount,
    pannes: pannesCount,
    mttrMinutes: Math.round(mttrAgg._avg.dureeMinutes ?? 0),
    coutTotal: Number(coutSum._sum.coutMainOeuvre ?? 0),
    clotures: clotureCount,
  };
}

// ---------------------------------------------------------------------------
// GET /api/dashboard/export-work-orders — Export Excel BT periode
// ---------------------------------------------------------------------------
router.get(
  '/export-work-orders',
  authenticate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : startOfMonth(new Date());
      const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : new Date();

      const workOrders = await prisma.workOrder.findMany({
        where: {
          dateCreation: { gte: dateFrom, lte: dateTo },
          deletedAt: null,
        },
        orderBy: { dateCreation: 'desc' },
        include: {
          equipment: { select: { code: true, name: true } },
          demandeur: { select: { firstName: true, lastName: true } },
          technicien: { select: { firstName: true, lastName: true } },
        },
      });

      const rows = workOrders.map((wo) => ({
        Numero: wo.numero,
        Titre: wo.title,
        Type: wo.type,
        Statut: wo.status,
        Priorite: wo.priority,
        Equipement: wo.equipment ? `${wo.equipment.code} - ${wo.equipment.name}` : '',
        Demandeur: wo.demandeur ? `${wo.demandeur.firstName} ${wo.demandeur.lastName}` : '',
        Technicien: wo.technicien ? `${wo.technicien.firstName} ${wo.technicien.lastName}` : '',
        'Date creation': wo.dateCreation.toLocaleDateString('fr-FR'),
        'Duree (min)': wo.dureeMinutes ?? 0,
        'Cout MO': Number(wo.coutMainOeuvre ?? 0),
        'Cause panne': wo.causePanne ?? '',
        'Actions realisees': wo.actionsRealisees ?? '',
      }));

      const XLSX = await import('xlsx');
      const ws = XLSX.utils.json_to_sheet(rows);
      ws['!cols'] = [
        { wch: 15 }, { wch: 30 }, { wch: 12 }, { wch: 12 }, { wch: 10 },
        { wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 12 }, { wch: 10 },
        { wch: 10 }, { wch: 25 }, { wch: 40 },
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Bons de Travail');

      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="bt-${dateFrom.toISOString().slice(0, 10)}-${dateTo.toISOString().slice(0, 10)}.xlsx"`);
      res.send(buffer);
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/dashboard/monthly-report/pdf — Rapport mensuel PDF à la demande
// ---------------------------------------------------------------------------
router.get(
  '/monthly-report/pdf',
  authenticate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const month = Number(req.query.month) || new Date().getMonth() + 1;
      const year = Number(req.query.year) || new Date().getFullYear();

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const [woCreated, woClosed, stockAlerts] = await Promise.all([
        prisma.workOrder.count({
          where: { dateCreation: { gte: startDate, lte: endDate }, deletedAt: null },
        }),
        prisma.workOrder.count({
          where: { status: 'CLOTURE', validatedAt: { gte: startDate, lte: endDate }, deletedAt: null },
        }),
        prisma.stockItem.count({
          where: { quantite: { lt: prisma.stockItem.fields.stockMinimum }, deletedAt: null },
        }),
      ]);

      const kpis = {
        workOrdersCreated: woCreated,
        workOrdersClosed: woClosed,
        mttr: '—',
        mtbf: '—',
        availability: '—',
        totalCost: '—',
        preventiveCompliance: '—',
        stockAlerts,
      };

      const pdfBuffer = await generateMonthlyReportPDF({ month, year, kpis });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="rapport-mensuel-${year}-${String(month).padStart(2, '0')}.pdf"`);
      res.send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/dashboard/export-data — Export multi-critères (Excel streaming)
// ---------------------------------------------------------------------------
router.get(
  '/export-data',
  authenticate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { entity, from, to, status, type } = req.query;
      const XLSX = await import('xlsx');

      let data: any[] = [];
      const dateFrom = from ? new Date(from as string) : new Date(0);
      const dateTo = to ? new Date(to as string) : new Date();

      if (entity === 'work-orders') {
        data = await prisma.workOrder.findMany({
          where: {
            deletedAt: null,
            dateCreation: { gte: dateFrom, lte: dateTo },
            ...(status ? { status: status as WorkOrderStatus } : {}),
            ...(type ? { type: type as WorkOrderType } : {}),
          },
          include: {
            equipment: { select: { code: true, name: true } },
            demandeur: { select: { firstName: true, lastName: true } },
            technicien: { select: { firstName: true, lastName: true } },
          },
          orderBy: { dateCreation: 'desc' },
        });
      } else if (entity === 'equipments') {
        data = await prisma.equipment.findMany({
          where: { deletedAt: null },
          include: { ligne: { select: { name: true } } },
          orderBy: { code: 'asc' },
        });
      } else if (entity === 'stock-items') {
        data = await prisma.stockItem.findMany({
          where: { deletedAt: null },
          orderBy: { code: 'asc' },
        });
      } else {
        throw new AppError('Entite invalide. Utilisez : work-orders, equipments, stock-items', 400);
      }

      const ws = XLSX.utils.json_to_sheet(data.map((item: any) => ({
        ...item,
        equipment: item.equipment?.code || '',
        demandeur: item.demandeur ? `${item.demandeur.firstName} ${item.demandeur.lastName}` : '',
        technicien: item.technicien ? `${item.technicien.firstName} ${item.technicien.lastName}` : '',
        ligne: item.ligne?.name || '',
      })));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, String(entity));

      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="export-${entity}-${new Date().toISOString().slice(0,10)}.xlsx"`);
      res.send(buffer);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
