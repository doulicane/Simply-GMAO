/**
 * =============================================================================
 * Routes API — Audit Logs
 * =============================================================================
 * Endpoints :
 *   GET /api/audit-logs — Liste paginée (admin / responsable uniquement)
 * =============================================================================
 */

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.get(
  '/',
  authenticate,
  authorize(Role.ADMIN, Role.RESPONSABLE),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, entityType, entityId, page = '1', limit = '50' } = req.query;

      const where: any = {};
      if (userId) where.userId = userId;
      if (entityType) where.entityType = entityType;
      if (entityId) where.entityId = entityId;

      const skip = (Number(page) - 1) * Number(limit);

      const [items, total] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        }),
        prisma.auditLog.count({ where }),
      ]);

      res.json({
        success: true,
        data: { items, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
