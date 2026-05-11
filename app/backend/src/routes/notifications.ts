/**
 * =============================================================================
 * Routes API — Notifications
 * =============================================================================
 * Endpoints :
 *   GET  /api/notifications              — Liste des notifications
 *   PATCH /api/notifications/:id/read    — Marquer comme lue
 *   PATCH /api/notifications/read-all    — Marquer toutes comme lues
 * =============================================================================
 */

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { paginate } from '../utils/pagination';

const router = Router();

// ---------------------------------------------------------------------------
// GET /api/notifications — Liste paginée
// ---------------------------------------------------------------------------
router.get(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { unreadOnly, page = '1', limit = '20' } = req.query;
      const userId = req.user!.id;

      const where: any = { userId };
      if (unreadOnly === 'true') {
        where.read = false;
      }

      const result = await paginate({
        page: Number(page),
        limit: Number(limit),
        model: prisma.notification,
        where,
        orderBy: { createdAt: 'desc' },
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
// PATCH /api/notifications/:id/read — Marquer une notification comme lue
// ---------------------------------------------------------------------------
router.patch(
  '/:id/read',
  authenticate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const notification = await prisma.notification.findUnique({ where: { id } });
      if (!notification) throw new AppError('Notification non trouvee', 404);
      if (notification.userId !== userId) throw new AppError('Acces refuse', 403);

      const updated = await prisma.notification.update({
        where: { id },
        data: { read: true },
      });

      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// PATCH /api/notifications/read-all — Marquer toutes comme lues
// ---------------------------------------------------------------------------
router.patch(
  '/read-all',
  authenticate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;

      const { count } = await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      });

      res.json({ success: true, data: { markedAsRead: count } });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
