/**
 * =============================================================================
 * Routes Equipements
 * =============================================================================
 * Endpoints :
 *   GET    /api/equipments              — Liste paginee + filtres
 *   GET    /api/equipments/:id          — Fiche detaillee
 *   POST   /api/equipments              — Creation
 *   PUT    /api/equipments/:id          — Modification
 *   DELETE /api/equipments/:id          — Suppression (soft)
 *   GET    /api/equipments/:id/history  — Historique des BT
 * =============================================================================
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Role, EquipmentStatus, EquipmentCriticality } from '@prisma/client';
import { prisma } from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { validate, validateRequest, paginationQuerySchema, uuidParamSchema } from '../middleware/validation';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = Router();

// ---------------------------------------------------------------------------
// Schemas de validation
// ---------------------------------------------------------------------------
const createEquipmentSchema = z.object({
  code: z.string().min(3).max(20),
  name: z.string().min(1).max(100),
  type: z.string().min(1).max(50),
  criticality: z.nativeEnum(EquipmentCriticality),
  localisation: z.string().max(100).optional(),
  ligneId: z.string().uuid().optional(),
  contactAlimentaire: z.boolean().default(false),
  dateAchat: z.coerce.date().optional().nullable(),
  numSerie: z.string().max(50).optional().nullable(),
  constructeur: z.string().max(100).optional().nullable(),
  dateMiseService: z.coerce.date().optional().nullable(),
  statut: z.nativeEnum(EquipmentStatus).default(EquipmentStatus.EN_SERVICE),
  compteurActuel: z.coerce.number().default(0),
  compteurUnite: z.string().max(20).optional().nullable(),
});

const updateEquipmentSchema = createEquipmentSchema.partial();

const equipmentQuerySchema = paginationQuerySchema.extend({
  type: z.string().optional(),
  criticality: z.nativeEnum(EquipmentCriticality).optional(),
  statut: z.nativeEnum(EquipmentStatus).optional(),
  contactAlimentaire: z.coerce.boolean().optional(),
  ligneId: z.string().uuid().optional(),
  search: z.string().optional(),
});

// ---------------------------------------------------------------------------
// GET /api/equipments — Liste paginee avec filtres
// ---------------------------------------------------------------------------
router.get(
  '/',
  authenticate,
  validate(equipmentQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        page,
        limit,
        sortBy,
        order,
        type,
        criticality,
        statut,
        contactAlimentaire,
        ligneId,
        search,
      } = req.query as unknown as z.infer<typeof equipmentQuerySchema>;

      // Construction des filtres Prisma
      const where: any = {};
      if (type) where.type = type;
      if (criticality) where.criticality = criticality;
      if (statut) where.statut = statut;
      if (contactAlimentaire !== undefined) where.contactAlimentaire = contactAlimentaire;
      if (ligneId) where.ligneId = ligneId;
      if (search) {
        where.OR = [
          { code: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
          { constructeur: { contains: search, mode: 'insensitive' } },
        ];
      }

      const skip = (page - 1) * limit;
      const orderBy: any = sortBy ? { [sortBy]: order } : { createdAt: 'desc' };

      const [items, total] = await Promise.all([
        prisma.equipment.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            ligne: {
              include: {
                zone: {
                  include: { site: true },
                },
              },
            },
            _count: {
              select: { workOrders: true, documents: true },
            },
          },
        }),
        prisma.equipment.count({ where }),
      ]);

      res.json({
        success: true,
        data: items,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/equipments/:id — Fiche detaillee
// ---------------------------------------------------------------------------
router.get(
  '/:id',
  authenticate,
  validate(uuidParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const equipment = await prisma.equipment.findUnique({
        where: { id },
        include: {
          ligne: {
            include: {
              zone: {
                include: { site: true },
              },
            },
          },
          workOrders: {
            orderBy: { dateCreation: 'desc' },
            take: 10,
            select: {
              id: true,
              numero: true,
              title: true,
              status: true,
              priority: true,
              type: true,
              dateCreation: true,
              dureeMinutes: true,
            },
          },
          documents: {
            orderBy: { uploadedAt: 'desc' },
            take: 5,
          },
          preventivePlans: {
            where: { active: true },
            orderBy: { nextExecution: 'asc' },
          },
        },
      });

      if (!equipment) {
        throw new AppError('Equipement introuvable', 404);
      }

      res.json({ success: true, data: equipment });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/equipments — Creation
// ---------------------------------------------------------------------------
router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN, Role.RESPONSABLE),
  validate(createEquipmentSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req.body;

      const equipment = await prisma.equipment.create({
        data,
        include: {
          ligne: {
            include: {
              zone: {
                include: { site: true },
              },
            },
          },
        },
      });

      logger.info(`Equipement cree : ${equipment.code} par ${req.user!.email}`);

      res.status(201).json({
        success: true,
        data: equipment,
        message: 'Equipement cree avec succes',
      });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// PUT /api/equipments/:id — Modification
// ---------------------------------------------------------------------------
router.put(
  '/:id',
  authenticate,
  authorize(Role.ADMIN, Role.RESPONSABLE),
  validateRequest({ params: uuidParamSchema, body: updateEquipmentSchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data = req.body;

      // Verifier que l'equipement existe
      const existing = await prisma.equipment.findUnique({ where: { id } });
      if (!existing) {
        throw new AppError('Equipement introuvable', 404);
      }

      const equipment = await prisma.equipment.update({
        where: { id },
        data,
        include: {
          ligne: {
            include: {
              zone: {
                include: { site: true },
              },
            },
          },
        },
      });

      logger.info(`Equipement modifie : ${equipment.code} par ${req.user!.email}`);

      res.json({
        success: true,
        data: equipment,
        message: 'Equipement modifie avec succes',
      });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// DELETE /api/equipments/:id — Suppression logique
// ---------------------------------------------------------------------------
router.delete(
  '/:id',
  authenticate,
  authorize(Role.ADMIN, Role.RESPONSABLE),
  validate(uuidParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const existing = await prisma.equipment.findUnique({ where: { id } });
      if (!existing) {
        throw new AppError('Equipement introuvable', 404);
      }

      // Soft delete : passer le statut a HORS_SERVICE
      await prisma.equipment.update({
        where: { id },
        data: { statut: EquipmentStatus.HORS_SERVICE },
      });

      logger.info(`Equipement supprime (soft) : ${existing.code} par ${req.user!.email}`);

      res.json({
        success: true,
        message: 'Equipement supprime avec succes',
      });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/equipments/:id/history — Historique des interventions
// ---------------------------------------------------------------------------
router.get(
  '/:id/history',
  authenticate,
  validateRequest({ params: uuidParamSchema, query: paginationQuerySchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { page, limit } = req.query as unknown as z.infer<typeof paginationQuerySchema>;

      const skip = (page - 1) * limit;

      const [workOrders, total] = await Promise.all([
        prisma.workOrder.findMany({
          where: { equipmentId: id },
          skip,
          take: limit,
          orderBy: { dateCreation: 'desc' },
          include: {
            demandeur: { select: { id: true, firstName: true, lastName: true } },
            technicien: { select: { id: true, firstName: true, lastName: true } },
            responsable: { select: { id: true, firstName: true, lastName: true } },
          },
        }),
        prisma.workOrder.count({ where: { equipmentId: id } }),
      ]);

      res.json({
        success: true,
        data: workOrders,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
