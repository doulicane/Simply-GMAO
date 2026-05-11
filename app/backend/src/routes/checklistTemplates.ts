/**
 * =============================================================================
 * Routes Checklist Templates
 * =============================================================================
 * Endpoints :
 *   GET  /api/checklist-templates              — Liste
 *   POST /api/checklist-templates              — Creation
 *   PUT  /api/checklist-templates/:id          — Modification
 *   DELETE /api/checklist-templates/:id        — Suppression logique
 *   POST /api/checklist-templates/:id/restore  — Restauration
 *   POST /api/checklist-templates/:id/duplicate — Duplication
 * =============================================================================
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { prisma } from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { validate, validateRequest, paginationQuerySchema, uuidParamSchema } from '../middleware/validation';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { paginate } from '../utils/pagination';

const router = Router();

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------
const checklistItemSchema = z.object({
  label: z.string().min(1).max(200),
  type: z.enum(['checkbox', 'text', 'number', 'select']),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
});

const createSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  category: z.string().max(50).optional(),
  items: z.array(checklistItemSchema).min(1).max(100),
});

const updateSchema = createSchema.partial();

const querySchema = paginationQuerySchema.extend({
  category: z.string().optional(),
  search: z.string().optional(),
});

// ---------------------------------------------------------------------------
// GET /api/checklist-templates
// ---------------------------------------------------------------------------
router.get(
  '/',
  authenticate,
  validate(querySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit, sortBy, order, category, search } = req.query as unknown as z.infer<typeof querySchema>;

      const where: any = { active: true, deletedAt: null };
      if (category) where.category = category;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      const orderBy: any = sortBy ? { [sortBy]: order } : { name: 'asc' };

      const result = await paginate({
        page,
        limit,
        model: prisma.checklistTemplate,
        where,
        orderBy,
      });

      res.json({ success: true, data: result.data, pagination: result.pagination });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/checklist-templates
// ---------------------------------------------------------------------------
router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN, Role.RESPONSABLE),
  validate(createSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const template = await prisma.checklistTemplate.create({
        data: req.body,
      });
      logger.info(`Checklist cree : ${template.name} par ${req.user!.email}`);
      res.status(201).json({ success: true, data: template, message: 'Checklist creee' });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/checklist-templates/:id
// ---------------------------------------------------------------------------
router.get(
  '/:id',
  authenticate,
  validate(uuidParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const template = await prisma.checklistTemplate.findUnique({
        where: { id: req.params.id, deletedAt: null },
      });
      if (!template) throw new AppError('Checklist introuvable', 404);
      res.json({ success: true, data: template });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// PUT /api/checklist-templates/:id
// ---------------------------------------------------------------------------
router.put(
  '/:id',
  authenticate,
  authorize(Role.ADMIN, Role.RESPONSABLE),
  validateRequest({ params: uuidParamSchema, body: updateSchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const existing = await prisma.checklistTemplate.findUnique({
        where: { id: req.params.id, deletedAt: null },
      });
      if (!existing) throw new AppError('Checklist introuvable', 404);

      const template = await prisma.checklistTemplate.update({
        where: { id: req.params.id },
        data: req.body,
      });
      logger.info(`Checklist modifie : ${template.name} par ${req.user!.email}`);
      res.json({ success: true, data: template, message: 'Checklist modifiee' });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// DELETE /api/checklist-templates/:id
// ---------------------------------------------------------------------------
router.delete(
  '/:id',
  authenticate,
  authorize(Role.ADMIN, Role.RESPONSABLE),
  validate(uuidParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const existing = await prisma.checklistTemplate.findUnique({
        where: { id: req.params.id, deletedAt: null },
      });
      if (!existing) throw new AppError('Checklist introuvable', 404);

      await prisma.checklistTemplate.update({
        where: { id: req.params.id },
        data: { deletedAt: new Date() },
      });
      logger.info(`Checklist supprime : ${existing.name} par ${req.user!.email}`);
      res.json({ success: true, message: 'Checklist supprimee' });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/checklist-templates/:id/restore
// ---------------------------------------------------------------------------
router.post(
  '/:id/restore',
  authenticate,
  authorize(Role.ADMIN, Role.RESPONSABLE),
  validate(uuidParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const existing = await prisma.checklistTemplate.findUnique({ where: { id: req.params.id } });
      if (!existing) throw new AppError('Checklist introuvable', 404);
      if (!existing.deletedAt) throw new AppError('La checklist n\'est pas supprimee', 400);

      const template = await prisma.checklistTemplate.update({
        where: { id: req.params.id },
        data: { deletedAt: null },
      });
      res.json({ success: true, data: template, message: 'Checklist restauree' });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/checklist-templates/:id/duplicate
// ---------------------------------------------------------------------------
router.post(
  '/:id/duplicate',
  authenticate,
  authorize(Role.ADMIN, Role.RESPONSABLE),
  validate(uuidParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const existing = await prisma.checklistTemplate.findUnique({
        where: { id: req.params.id, deletedAt: null },
      });
      if (!existing) throw new AppError('Checklist introuvable', 404);

      const template = await prisma.checklistTemplate.create({
        data: {
          name: `${existing.name} (copie)`,
          description: existing.description,
          category: existing.category,
          items: existing.items as any,
        },
      });
      logger.info(`Checklist dupliquee : ${existing.name} -> ${template.name} par ${req.user!.email}`);
      res.status(201).json({ success: true, data: template, message: 'Checklist dupliquee' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
