/**
 * =============================================================================
 * Routes Gestion des Utilisateurs
 * =============================================================================
 * Endpoints :
 *   GET  /api/users              — Liste utilisateurs actifs
 *   POST /api/users              — Creation utilisateur (admin uniquement)
 *   GET  /api/users/:id          — Detail utilisateur
 *   PUT  /api/users/:id          — Modification
 *   DELETE /api/users/:id        — Suppression logique
 * =============================================================================
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { prisma } from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { validate, paginationQuerySchema, uuidParamSchema } from '../middleware/validation';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { paginate } from '../utils/pagination';
import { sanitizeString } from '../utils/sanitize';
import bcrypt from 'bcryptjs';

const router = Router();

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------
const createUserSchema = z.object({
  email: z.string().email().max(100),
  password: z.string().min(6).max(100),
  firstName: z.string().min(1).max(50).transform(sanitizeString),
  lastName: z.string().min(1).max(50).transform(sanitizeString),
  role: z.nativeEnum(Role),
});

const updateUserSchema = z.object({
  email: z.string().email().max(100).optional(),
  password: z.string().min(6).max(100).optional(),
  firstName: z.string().min(1).max(50).optional().transform((v) => (v ? sanitizeString(v) : v)),
  lastName: z.string().min(1).max(50).optional().transform((v) => (v ? sanitizeString(v) : v)),
  role: z.nativeEnum(Role).optional(),
  active: z.boolean().optional(),
});

const userQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
  role: z.string().optional(),
});

// ---------------------------------------------------------------------------
// GET /api/users
// ---------------------------------------------------------------------------
router.get(
  '/',
  authenticate,
  authorize(Role.ADMIN, Role.RESPONSABLE),
  validate(userQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit, sortBy, order, search, role } = req.query as unknown as z.infer<typeof userQuerySchema>;

      const where: any = { deletedAt: null };
      if (role) where.role = role;
      if (search) {
        where.OR = [
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ];
      }

      const orderBy: any = sortBy ? { [sortBy]: order } : { createdAt: 'desc' };
      const result = await paginate({
        page,
        limit,
        model: prisma.user,
        where,
        orderBy,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          active: true,
          createdAt: true,
        },
      });

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
// POST /api/users
// ---------------------------------------------------------------------------
router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN),
  validate(createUserSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, firstName, lastName, role } = req.body;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        throw new AppError('Un utilisateur avec cet email existe deja', 409);
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const user = await prisma.user.create({
        data: {
          email,
          password: passwordHash,
          firstName,
          lastName,
          role,
          active: true,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          active: true,
          createdAt: true,
        },
      });

      logger.info(`Utilisateur cree : ${user.email} (${user.role}) par ${req.user!.email}`);
      res.status(201).json({ success: true, data: user, message: 'Utilisateur cree' });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/users/:id
// ---------------------------------------------------------------------------
router.get(
  '/:id',
  authenticate,
  authorize(Role.ADMIN, Role.RESPONSABLE),
  validate(uuidParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const user = await prisma.user.findFirst({
        where: { id, deletedAt: null },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          active: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new AppError('Utilisateur introuvable', 404);
      }

      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// PUT /api/users/:id
// ---------------------------------------------------------------------------
router.put(
  '/:id',
  authenticate,
  authorize(Role.ADMIN),
  validate(uuidParamSchema, 'params'),
  validate(updateUserSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data = req.body;

      const user = await prisma.user.findFirst({ where: { id, deletedAt: null } });
      if (!user) {
        throw new AppError('Utilisateur introuvable', 404);
      }

      // Si changement d'email, verifier l'unicite
      if (data.email && data.email !== user.email) {
        const existing = await prisma.user.findUnique({ where: { email: data.email } });
        if (existing) {
          throw new AppError('Un utilisateur avec cet email existe deja', 409);
        }
      }

      const updateData: any = {};
      if (data.email !== undefined) updateData.email = data.email;
      if (data.firstName !== undefined) updateData.firstName = data.firstName;
      if (data.lastName !== undefined) updateData.lastName = data.lastName;
      if (data.role !== undefined) updateData.role = data.role;
      if (data.active !== undefined) updateData.active = data.active;
      if (data.password) {
        updateData.password = await bcrypt.hash(data.password, 12);
      }

      const updated = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          active: true,
          createdAt: true,
        },
      });

      logger.info(`Utilisateur mis a jour : ${updated.email} par ${req.user!.email}`);
      res.json({ success: true, data: updated, message: 'Utilisateur mis a jour' });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// DELETE /api/users/:id — suppression logique
// ---------------------------------------------------------------------------
router.delete(
  '/:id',
  authenticate,
  authorize(Role.ADMIN),
  validate(uuidParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const user = await prisma.user.findFirst({ where: { id, deletedAt: null } });
      if (!user) {
        throw new AppError('Utilisateur introuvable', 404);
      }

      // Empecher la suppression de soi-meme
      if (id === req.user!.id) {
        throw new AppError('Vous ne pouvez pas supprimer votre propre compte', 400);
      }

      await prisma.user.update({
        where: { id },
        data: { deletedAt: new Date(), active: false },
      });

      logger.info(`Utilisateur supprime : ${user.email} par ${req.user!.email}`);
      res.json({ success: true, message: 'Utilisateur supprime' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
