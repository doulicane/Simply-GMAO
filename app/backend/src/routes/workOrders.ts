/**
 * =============================================================================
 * Routes Bons de Travail (Work Orders)
 * =============================================================================
 * Endpoints complets du workflow BT :
 *   GET    /api/work-orders              — Liste + filtres
 *   POST   /api/work-orders              — Creation
 *   GET    /api/work-orders/:id          — Detail
 *   PUT    /api/work-orders/:id          — Modification
 *   DELETE /api/work-orders/:id          — Suppression logique
 *   POST   /api/work-orders/:id/restore  — Restauration
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
import { AppError } from '../middleware/errorHandler';
import { prisma } from '../config/database';
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
  reopenWorkOrder,
  addPhotosToWorkOrder,
  consumePartsOnWorkOrder,
  deleteWorkOrder,
  restoreWorkOrder,
} from '../services/workOrderService';
import { generateUniqueBTNumber } from '../utils/generators';
import { broadcastEvent } from '../socket';

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
      const result = await listWorkOrders(
        req.query,
        req.user!
      );

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
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
// DELETE /api/work-orders/:id — Suppression logique (soft delete)
// ---------------------------------------------------------------------------
router.delete(
  '/:id',
  authenticate,
  authorize(Role.ADMIN, Role.RESPONSABLE),
  validate(uuidParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await deleteWorkOrder(req.params.id, req.user!);
      res.json({ success: true, message: 'Bon de travail supprime avec succes' });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/work-orders/:id/restore — Restauration
// ---------------------------------------------------------------------------
router.post(
  '/:id/restore',
  authenticate,
  authorize(Role.ADMIN, Role.RESPONSABLE),
  validate(uuidParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const restored = await restoreWorkOrder(req.params.id, req.user!);
      res.json({ success: true, data: restored, message: 'Bon de travail restaure avec succes' });
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

      broadcastEvent('workorder:completed', { id: updated.id, numero: updated.numero, equipmentId: updated.equipmentId, status: updated.status });

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

      broadcastEvent('workorder:completed', { id: updated.id, numero: updated.numero, equipmentId: updated.equipmentId, status: updated.status });

      res.json({ success: true, data: updated, message: 'Bon de travail valide et cloture' });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/work-orders/:id/reopen — Rouvrir un BT cloture
// ---------------------------------------------------------------------------
const reopenSchema = z.object({
  reason: z.string().max(500).optional(),
});

router.post(
  '/:id/reopen',
  authenticate,
  authorize(Role.ADMIN, Role.RESPONSABLE),
  validateRequest({ params: uuidParamSchema, body: reopenSchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updated = await reopenWorkOrder(
        req.params.id,
        req.user!,
        req.body.reason,
        req.ip ?? undefined
      );

      res.json({ success: true, data: updated, message: 'Bon de travail rouvert' });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/work-orders/:id/photos — Ajouter des photos
// ---------------------------------------------------------------------------
const photosSchema = z.object({
  urls: z.array(z.string().min(1)).min(1).max(10),
});

router.post(
  '/:id/photos',
  authenticate,
  authorize(Role.ADMIN, Role.RESPONSABLE, Role.TECHNICIEN),
  validateRequest({ params: uuidParamSchema, body: photosSchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updated = await addPhotosToWorkOrder(
        req.params.id,
        req.body.urls,
        req.user!
      );

      res.json({ success: true, data: updated, message: 'Photos ajoutees' });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/work-orders/:id/consume-parts — Consommer des pieces
// ---------------------------------------------------------------------------
const consumePartsSchema = z.object({
  stockItemId: z.string().uuid(),
  quantite: z.coerce.number().min(0.01),
  commentaire: z.string().max(500).optional().nullable(),
});

router.post(
  '/:id/consume-parts',
  authenticate,
  authorize(Role.ADMIN, Role.RESPONSABLE, Role.TECHNICIEN),
  validateRequest({ params: uuidParamSchema, body: consumePartsSchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const movement = await consumePartsOnWorkOrder(
        req.params.id,
        req.body,
        req.user!
      );

      res.status(201).json({ success: true, data: movement, message: 'Pieces consommees' });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/work-orders/:id/duplicate — Dupliquer un BT
// ---------------------------------------------------------------------------
router.post(
  '/:id/duplicate',
  authenticate,
  authorize(Role.ADMIN, Role.RESPONSABLE, Role.TECHNICIEN),
  validateRequest({ params: uuidParamSchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const original = await prisma.workOrder.findUnique({
        where: { id, deletedAt: null },
        include: { atexIntervention: true, contactAlimentaireIntervention: true },
      });
      if (!original) throw new AppError('Bon de travail introuvable', 404);

      const duplicated = await prisma.workOrder.create({
        data: {
          numero: await generateUniqueBTNumber(prisma),
          title: `${original.title} (copie)`,
          description: original.description,
          equipmentId: original.equipmentId,
          type: original.type,
          priority: original.priority,
          status: WorkOrderStatus.CREE,
          demandeurId: req.user!.id,
          coutMainOeuvre: original.coutMainOeuvre,
        },
        include: { equipment: true, demandeur: true },
      });

      res.status(201).json({ success: true, data: duplicated, message: 'BT duplique' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
