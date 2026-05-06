/**
 * =============================================================================
 * Routes API — Documents
 * =============================================================================
 * Endpoints :
 *   GET  /api/documents?equipmentId=xxx — Liste des documents d'un équipement
 *   DELETE /api/documents/:id           — Supprimer un document
 * =============================================================================
 */

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import fs from 'fs';
import path from 'path';

const router = Router();
const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.resolve(__dirname, '../../uploads');

// ---------------------------------------------------------------------------
// GET /api/documents — Liste paginée
// ---------------------------------------------------------------------------
router.get(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { equipmentId, page = '1', limit = '20' } = req.query;

      const where: any = {};
      if (equipmentId) where.equipmentId = equipmentId;

      const skip = (Number(page) - 1) * Number(limit);

      const [items, total] = await Promise.all([
        prisma.document.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { uploadedAt: 'desc' },
          include: {
            uploader: { select: { id: true, firstName: true, lastName: true } },
            equipment: { select: { id: true, code: true, name: true } },
          },
        }),
        prisma.document.count({ where }),
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

// ---------------------------------------------------------------------------
// DELETE /api/documents/:id — Suppression document + fichier
// ---------------------------------------------------------------------------
router.delete(
  '/:id',
  authenticate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const doc = await prisma.document.findUnique({ where: { id } });
      if (!doc) throw new AppError('Document non trouve', 404);

      // Supprimer le fichier physique
      const filePath = path.join(UPLOAD_DIR, doc.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      await prisma.document.delete({ where: { id } });

      res.json({ success: true, message: 'Document supprime' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
