/**
 * =============================================================================
 * Routes Lignes de Production
 * =============================================================================
 * Endpoints :
 *   GET /api/lignes — Liste des lignes actives avec leur zone et site
 * =============================================================================
 */

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get(
  '/',
  authenticate,
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const lignes = await prisma.ligne.findMany({
        include: {
          zone: {
            select: { id: true, name: true, site: { select: { id: true, name: true } } },
          },
        },
        orderBy: { name: 'asc' },
      });
      res.json({ success: true, data: lignes });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
