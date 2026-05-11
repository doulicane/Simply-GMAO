/**
 * =============================================================================
 * Routes ATEX & Contact Alimentaire
 * =============================================================================
 * Endpoints :
 *   GET  /api/work-orders/:id/atex              — Bloc ATEX du BT
 *   PATCH /api/work-orders/:id/atex             — Mise a jour bloc ATEX
 *   POST /api/work-orders/:id/atex/sign         — Signature inspecteur ATEX
 *   GET  /api/work-orders/:id/contact-alimentaire — Bloc contact alimentaire
 *   PATCH /api/work-orders/:id/contact-alimentaire — Mise a jour
 * =============================================================================
 */

import { Router, Request, Response, NextFunction } from 'express';
import { generateAtexCompliancePDF } from '../services/pdfService';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { prisma } from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { validate, validateRequest, uuidParamSchema } from '../middleware/validation';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = Router({ mergeParams: true });

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------
const atexSchema = z.object({
  consignationEffectuee: z.boolean().optional(),
  permisDeFeu: z.boolean().optional(),
  outillageEx: z.boolean().optional(),
  nettoyageRealise: z.boolean().optional(),
  depressionRealise: z.boolean().optional(),
  commentaireAtex: z.string().max(1000).optional().nullable(),
});

const signAtexSchema = z.object({
  password: z.string().min(1),
});

const contactAlimSchema = z.object({
  nettoyageRealise: z.boolean().optional(),
  produitsUtilises: z.string().max(500).optional().nullable(),
  rincageRealise: z.boolean().optional(),
  commentaire: z.string().max(1000).optional().nullable(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function getOrCreateAtex(workOrderId: string) {
  let atex = await prisma.atexIntervention.findUnique({
    where: { workOrderId },
  });
  if (!atex) {
    atex = await prisma.atexIntervention.create({
      data: { workOrderId },
    });
  }
  return atex;
}

async function getOrCreateContactAlim(workOrderId: string) {
  let ca = await prisma.contactAlimentaireIntervention.findUnique({
    where: { workOrderId },
  });
  if (!ca) {
    ca = await prisma.contactAlimentaireIntervention.create({
      data: { workOrderId },
    });
  }
  return ca;
}

async function checkWorkOrderExists(id: string) {
  const wo = await prisma.workOrder.findUnique({
    where: { id, deletedAt: null },
    include: { equipment: true },
  });
  if (!wo) throw new AppError('Bon de travail introuvable', 404);
  return wo;
}

// ---------------------------------------------------------------------------
// GET /api/work-orders/:id/atex
// ---------------------------------------------------------------------------
router.get(
  '/atex',
  authenticate,
  validate(uuidParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await checkWorkOrderExists(id);
      const atex = await getOrCreateAtex(id);
      res.json({ success: true, data: atex });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// PATCH /api/work-orders/:id/atex
// ---------------------------------------------------------------------------
router.patch(
  '/atex',
  authenticate,
  authorize(Role.ADMIN, Role.RESPONSABLE, Role.TECHNICIEN, Role.HSE),
  validateRequest({ params: uuidParamSchema, body: atexSchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await checkWorkOrderExists(id);
      const atex = await prisma.atexIntervention.update({
        where: { workOrderId: id },
        data: req.body,
      });
      logger.info(`Bloc ATEX mis a jour pour BT ${id} par ${req.user!.email}`);
      res.json({ success: true, data: atex });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/work-orders/:id/atex/sign — Signature inspecteur ATEX
// ---------------------------------------------------------------------------
router.post(
  '/atex/sign',
  authenticate,
  authorize(Role.ADMIN, Role.RESPONSABLE, Role.HSE),
  validateRequest({ params: uuidParamSchema, body: signAtexSchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { password } = req.body;

      const wo = await checkWorkOrderExists(id);
      if (wo.equipment?.zoneAtex === 'NON_ATEX') {
        throw new AppError('Cet equipement n\'est pas en zone ATEX', 400);
      }

      // Verifier le mot de passe de l'inspecteur
      const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
      if (!user) throw new AppError('Utilisateur introuvable', 404);

      const bcrypt = await import('bcryptjs');
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new AppError('Mot de passe incorrect', 403);
      }

      const atex = await prisma.atexIntervention.update({
        where: { workOrderId: id },
        data: {
          inspecteurAtexId: req.user!.id,
          inspecteurAtexSigneAt: new Date(),
        },
      });

      logger.info(`Signature ATEX BT ${id} par ${req.user!.email}`);
      res.json({ success: true, data: atex, message: 'Signe avec succes' });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/work-orders/:id/contact-alimentaire
// ---------------------------------------------------------------------------
router.get(
  '/contact-alimentaire',
  authenticate,
  validate(uuidParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await checkWorkOrderExists(id);
      const ca = await getOrCreateContactAlim(id);
      res.json({ success: true, data: ca });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// PATCH /api/work-orders/:id/contact-alimentaire
// ---------------------------------------------------------------------------
router.patch(
  '/contact-alimentaire',
  authenticate,
  authorize(Role.ADMIN, Role.RESPONSABLE, Role.TECHNICIEN),
  validateRequest({ params: uuidParamSchema, body: contactAlimSchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await checkWorkOrderExists(id);
      const ca = await prisma.contactAlimentaireIntervention.update({
        where: { workOrderId: id },
        data: req.body,
      });
      logger.info(`Bloc contact alimentaire mis a jour pour BT ${id} par ${req.user!.email}`);
      res.json({ success: true, data: ca });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/atex/compliance/pdf — Rapport conformité ATEX annuel
// ---------------------------------------------------------------------------
router.get(
  '/compliance/pdf',
  authenticate,
  authorize(Role.ADMIN, Role.RESPONSABLE, Role.HSE),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const year = Number(req.query.year) || new Date().getFullYear();
      const equipments = await prisma.equipment.findMany({
        where: { deletedAt: null },
        orderBy: { code: 'asc' },
      });

      const pdfBuffer = await generateAtexCompliancePDF(equipments, year);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="atex-compliance-${year}.pdf"`);
      res.send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
