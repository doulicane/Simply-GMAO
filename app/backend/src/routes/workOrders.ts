/**
 * =============================================================================
 * Routes Bons de Travail (Work Orders)
 * =============================================================================
 * Endpoints complets du workflow BT :
 *   GET    /api/work-orders              — Liste + filtres
 *   POST   /api/work-orders              — Creation
 *   GET    /api/work-orders/:id          — Detail
 *   PUT    /api/work-orders/:id          — Modification
 *   PUT    /api/work-orders/:id/status   — Changement de statut
 *   PUT    /api/work-orders/:id/assign   — Affectation technicien
 *   POST   /api/work-orders/:id/start   — Demarrer intervention
 *   POST   /api/work-orders/:id/complete — Terminer intervention
 *   POST   /api/work-orders/:id/validate — Valider / cloturer
 * =============================================================================
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  Role,
  WorkOrderStatus,
  WorkOrderType,
  Priority,
} from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';
import { validate, validateRequest, paginationQuerySchema, uuidParamSchema } from '../middleware/validation';
import {
  createWorkOrder,
  listWorkOrders,
  getWorkOrderById,
  updateWorkOrder,
  updateWorkOrderStatus,
  assignWorkOrder,
  startWorkOrder,
  completeWorkOrder,
  validateWorkOrder,
} from '../services/workOrderService';

const router = Router();

// ---------------------------------------------------------------------------
// Transitions autorisees par role
// ---------------------------------------------------------------------------
export const allowedTransitions: Record<
  WorkOrderStatus,
  { to: WorkOrderStatus[]; roles: Role[] }
> = {
  [WorkOrderStatus.CREE]: {
    to: [WorkOrderStatus.PLANIFIE, WorkOrderStatus.ANNULE],
    roles: [Role.RESPONSABLE, Role.ADMIN],
  },
  [WorkOrderStatus.PLANIFIE]: {
    to: [WorkOrderStatus.EN_COURS, WorkOrderStatus.CREE, WorkOrderStatus.ANNULE],
    roles: [Role.RESPONSABLE, Role.TECHNICIEN, Role.ADMIN],
  },
  [WorkOrderStatus.EN_COURS]: {
    to: [WorkOrderStatus.TERMINE],
    roles: [Role.TECHNICIEN, Role.RESPONSABLE, Role.ADMIN],
  },
  [WorkOrderStatus.TERMINE]: {
    to: [WorkOrderStatus.CLOTURE, WorkOrderStatus.EN_COURS],
    roles: [Role.RESPONSABLE, Role.ADMIN],
  },
  [WorkOrderStatus.CLOTURE]: {
    to: [WorkOrderStatus.EN_COURS],
    roles: [Role.RESPONSABLE, Role.ADMIN],
  },
  [WorkOrderStatus.ANNULE]: {
    to: [],
    roles: [],
  },
};

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------
const createWOSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  equipmentId: z.string().uuid(),
  type: z.nativeEnum(WorkOrderType),
  priority: z.nativeEnum(Priority),
});

const updateWOSchema = createWOSchema.partial().extend({
  technicienId: z.string().uuid().optional().nullable(),
  responsableId: z.string().uuid().optional().nullable(),
  datePlanifiee: z.coerce.date().optional().nullable(),
});

const statusUpdateSchema = z.object({
  status: z.nativeEnum(WorkOrderStatus),
  commentaire: z.string().optional(),
});

const assignSchema = z.object({
  technicienId: z.string().uuid(),
  datePlanifiee: z.coerce.date().optional(),
});

const completeSchema = z.object({
  causePanne: z.string().max(200).optional().nullable(),
  actionsRealisees: z.string().max(2000).optional().nullable(),
  piecesConsommees: z.string().max(2000).optional().nullable(),
  dureeMinutes: z.coerce.number().min(0).optional(),
  commentaireCloture: z.string().max(2000).optional().nullable(),
  photos: z.array(z.string()).optional(),
});

const woQuerySchema = paginationQuerySchema.extend({
  status: z.nativeEnum(WorkOrderStatus).optional(),
  type: z.nativeEnum(WorkOrderType).optional(),
  priority: z.nativeEnum(Priority).optional(),
  equipmentId: z.string().uuid().optional(),
  technicienId: z.string().uuid().optional(),
  demandeurId: z.string().uuid().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  search: z.string().optional(),
});

// ---------------------------------------------------------------------------
// GET /api/work-orders
// ---------------------------------------------------------------------------
router.get(
  '/',
  authenticate,
  validate(woQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { items, total, page, limit } = await listWorkOrders(
        req.query,
        req.user!
      );

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
// POST /api/work-orders
// ---------------------------------------------------------------------------
router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN, Role.RESPONSABLE, Role.TECHNICIEN, Role.OPERATEUR),
  validate(createWOSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workOrder = await createWorkOrder(
        req.body,
        req.user!,
        req.ip ?? undefined
      );

      res.status(201).json({
        success: true,
        data: workOrder,
        message: 'Bon de travail cree avec succes',
      });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/work-orders/:id
// ---------------------------------------------------------------------------
router.get(
  '/:id',
  authenticate,
  validate(uuidParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workOrder = await getWorkOrderById(req.params.id);
      res.json({ success: true, data: workOrder });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// PUT /api/work-orders/:id
// ---------------------------------------------------------------------------
router.put(
  '/:id',
  authenticate,
  authorize(Role.ADMIN, Role.RESPONSABLE),
  validateRequest({ params: uuidParamSchema, body: updateWOSchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workOrder = await updateWorkOrder(
        req.params.id,
        req.body,
        req.user!
      );

      res.json({ success: true, data: workOrder, message: 'Bon de travail modifie' });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// PUT /api/work-orders/:id/status
// ---------------------------------------------------------------------------
router.put(
  '/:id/status',
  authenticate,
  validateRequest({ params: uuidParamSchema, body: statusUpdateSchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status: newStatus, commentaire } = req.body;
      const updated = await updateWorkOrderStatus(
        req.params.id,
        newStatus,
        req.user!,
        allowedTransitions,
        commentaire,
        req.ip ?? undefined
      );

      res.json({ success: true, data: updated, message: `Statut mis a jour : ${newStatus}` });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// PUT /api/work-orders/:id/assign
// ---------------------------------------------------------------------------
router.put(
  '/:id/assign',
  authenticate,
  authorize(Role.ADMIN, Role.RESPONSABLE),
  validateRequest({ params: uuidParamSchema, body: assignSchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { technicienId, datePlanifiee } = req.body;
      const updated = await assignWorkOrder(
        req.params.id,
        technicienId,
        datePlanifiee,
        req.user!
      );

      res.json({ success: true, data: updated, message: 'Technicien affecte avec succes' });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/work-orders/:id/start
// ---------------------------------------------------------------------------
router.post(
  '/:id/start',
  authenticate,
  authorize(Role.ADMIN, Role.RESPONSABLE, Role.TECHNICIEN),
  validate(uuidParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updated = await startWorkOrder(
        req.params.id,
        req.user!,
        req.ip ?? undefined
      );

      res.json({ success: true, data: updated, message: 'Intervention demarree' });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/work-orders/:id/complete
// ---------------------------------------------------------------------------
router.post(
  '/:id/complete',
  authenticate,
  authorize(Role.ADMIN, Role.RESPONSABLE, Role.TECHNICIEN),
  validateRequest({ params: uuidParamSchema, body: completeSchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updated = await completeWorkOrder(
        req.params.id,
        req.body,
        req.user!,
        req.ip ?? undefined
      );

      res.json({ success: true, data: updated, message: 'Intervention terminee' });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/work-orders/:id/validate
// ---------------------------------------------------------------------------
router.post(
  '/:id/validate',
  authenticate,
  authorize(Role.ADMIN, Role.RESPONSABLE),
  validate(uuidParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updated = await validateWorkOrder(
        req.params.id,
        req.user!,
        req.ip ?? undefined
      );

      res.json({ success: true, data: updated, message: 'Bon de travail valide et cloture' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
