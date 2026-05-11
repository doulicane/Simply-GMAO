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
import { paginate } from '../utils/pagination';

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

      const result = await paginate({
        page: Number(page),
        limit: Number(limit),
        model: prisma.auditLog,
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
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

export default router;
