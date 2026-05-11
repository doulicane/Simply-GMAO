/**
 * =============================================================================
 * Routes API — Documents
 * =============================================================================
 * Endpoints :
 *   GET  /api/documents?equipmentId=xxx — Liste des documents d'un équipement
 *   DELETE /api/documents/:id           — Suppression logique (soft delete)
 *   POST /api/documents/:id/restore     — Restauration
 * =============================================================================
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '@prisma/client';
import { validate, paginationQuerySchema, uuidParamSchema } from '../middleware/validation';
import { AppError } from '../middleware/errorHandler';
import { paginate } from '../utils/pagination';
import { generateFicheTechnicienPDF, generateFicheOperateurPDF, generateDocAdminPDF } from '../services/docService';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env';

const router = Router();
const UPLOAD_DIR = env.UPLOAD_DIR;

// ---------------------------------------------------------------------------
// GET /api/documents — Liste paginée
// ---------------------------------------------------------------------------
router.get(
  '/',
  authenticate,
  validate(paginationQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit } = req.query as unknown as z.infer<typeof paginationQuerySchema>;
      const { equipmentId } = req.query;

      const where: any = { deletedAt: null };
      if (equipmentId) where.equipmentId = equipmentId;

      const result = await paginate({
        page,
        limit,
        model: prisma.document,
        where,
        orderBy: { uploadedAt: 'desc' },
        include: {
          uploader: { select: { id: true, firstName: true, lastName: true } },
          equipment: { select: { id: true, code: true, name: true } },
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
// DELETE /api/documents/:id — Suppression document + fichier (soft delete)
// ---------------------------------------------------------------------------
router.delete(
  '/:id',
  authenticate,
  validate(uuidParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const doc = await prisma.document.findUnique({ where: { id, deletedAt: null } });
      if (!doc) throw new AppError('Document non trouve', 404);

      // Supprimer le fichier physique
      const filePath = path.join(UPLOAD_DIR, doc.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      await prisma.document.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      res.json({ success: true, message: 'Document supprime' });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/documents/:id/restore — Restauration
// ---------------------------------------------------------------------------
router.post(
  '/:id/restore',
  authenticate,
  validate(uuidParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const existing = await prisma.document.findUnique({ where: { id } });
      if (!existing) {
        throw new AppError('Document non trouve', 404);
      }

      if (!existing.deletedAt) {
        throw new AppError('Le document n\'est pas supprime', 400);
      }

      const doc = await prisma.document.update({
        where: { id },
        data: { deletedAt: null },
      });

      res.json({
        success: true,
        data: doc,
        message: 'Document restaure avec succes',
      });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/documents/fiches/technicien — Fiche procédure technicien PDF
// ---------------------------------------------------------------------------
router.get(
  '/fiches/technicien',
  authenticate,
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pdf = await generateFicheTechnicienPDF();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="fiche-technicien.pdf"');
      res.send(pdf);
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/documents/fiches/operateur — Fiche procédure opérateur PDF
// ---------------------------------------------------------------------------
router.get(
  '/fiches/operateur',
  authenticate,
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pdf = await generateFicheOperateurPDF();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="fiche-operateur.pdf"');
      res.send(pdf);
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/documents/fiches/admin — Documentation admin PDF
// ---------------------------------------------------------------------------
router.get(
  '/fiches/admin',
  authenticate,
  authorize(Role.ADMIN, Role.RESPONSABLE),
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pdf = await generateDocAdminPDF();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="doc-admin.pdf"');
      res.send(pdf);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
