/**
 * =============================================================================
 * Routes Equipements
 * =============================================================================
 * Endpoints :
 *   GET    /api/equipments              — Liste paginee + filtres
 *   GET    /api/equipments/:id          — Fiche detaillee
 *   POST   /api/equipments              — Creation
 *   PUT    /api/equipments/:id          — Modification
 *   DELETE /api/equipments/:id          — Suppression logique (soft delete)
 *   POST   /api/equipments/:id/restore  — Restauration
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
import { paginate } from '../utils/pagination';
import QRCode from 'qrcode';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { generateEquipmentPDF } from '../services/pdfService';

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
      const where: any = { deletedAt: null };
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

      const orderBy: any = sortBy ? { [sortBy]: order } : { createdAt: 'desc' };

      const result = await paginate({
        page,
        limit,
        model: prisma.equipment,
        where,
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
        where: { id, deletedAt: null },
        include: {
          ligne: {
            include: {
              zone: {
                include: { site: true },
              },
            },
          },
          workOrders: {
            where: { deletedAt: null },
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
            where: { deletedAt: null },
            orderBy: { uploadedAt: 'desc' },
            take: 5,
          },
          preventivePlans: {
            where: { active: true, deletedAt: null },
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

      // Verifier que le code est unique
      const existing = await prisma.equipment.findUnique({ where: { code: data.code } });
      if (existing) {
        throw new AppError('Un equipement avec ce code existe deja', 409);
      }

      // Verifier que la ligne existe si fournie
      if (data.ligneId) {
        const ligne = await prisma.ligne.findUnique({ where: { id: data.ligneId } });
        if (!ligne) {
          throw new AppError('Ligne introuvable', 404);
        }
      }

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
      const existing = await prisma.equipment.findUnique({ where: { id, deletedAt: null } });
      if (!existing) {
        throw new AppError('Equipement introuvable', 404);
      }

      // Verifier l'unicite du code si modifie
      if (data.code && data.code !== existing.code) {
        const codeExists = await prisma.equipment.findUnique({ where: { code: data.code } });
        if (codeExists) {
          throw new AppError('Un equipement avec ce code existe deja', 409);
        }
      }

      // Verifier que la ligne existe si fournie
      if (data.ligneId) {
        const ligne = await prisma.ligne.findUnique({ where: { id: data.ligneId } });
        if (!ligne) {
          throw new AppError('Ligne introuvable', 404);
        }
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
// DELETE /api/equipments/:id — Suppression logique (soft delete)
// ---------------------------------------------------------------------------
router.delete(
  '/:id',
  authenticate,
  authorize(Role.ADMIN, Role.RESPONSABLE),
  validate(uuidParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const existing = await prisma.equipment.findUnique({ where: { id, deletedAt: null } });
      if (!existing) {
        throw new AppError('Equipement introuvable', 404);
      }

      await prisma.equipment.update({
        where: { id },
        data: { deletedAt: new Date(), statut: EquipmentStatus.HORS_SERVICE },
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
// POST /api/equipments/:id/restore — Restauration
// ---------------------------------------------------------------------------
router.post(
  '/:id/restore',
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

      if (!existing.deletedAt) {
        throw new AppError('L\'equipement n\'est pas supprime', 400);
      }

      const equipment = await prisma.equipment.update({
        where: { id },
        data: { deletedAt: null, statut: EquipmentStatus.EN_SERVICE },
      });

      logger.info(`Equipement restaure : ${equipment.code} par ${req.user!.email}`);

      res.json({
        success: true,
        data: equipment,
        message: 'Equipement restaure avec succes',
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

      const result = await paginate({
        page,
        limit,
        model: prisma.workOrder,
        where: { equipmentId: id, deletedAt: null },
        orderBy: { dateCreation: 'desc' },
        include: {
          demandeur: { select: { id: true, firstName: true, lastName: true } },
          technicien: { select: { id: true, firstName: true, lastName: true } },
          responsable: { select: { id: true, firstName: true, lastName: true } },
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
// GET /api/equipments/:id/qrcode — Generation QR code individuel
// ---------------------------------------------------------------------------
router.get(
  '/:id/qrcode',
  authenticate,
  validate(uuidParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const equipment = await prisma.equipment.findUnique({
        where: { id, deletedAt: null },
        select: { id: true, code: true, name: true },
      });

      if (!equipment) {
        throw new AppError('Equipement introuvable', 404);
      }

      const url = `${req.protocol}://${req.get('host')}/equipments/${equipment.id}`;
      const qrBuffer = await QRCode.toBuffer(url, {
        type: 'png',
        width: 300,
        margin: 2,
        color: { dark: '#B71C1C', light: '#FFFFFF' },
      });

      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `inline; filename="qrcode-${equipment.code}.png"`);
      res.send(qrBuffer);
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/equipments/qrcode-batch — Generation PDF avec QR codes en lot
// ---------------------------------------------------------------------------
const batchQRSchema = z.object({
  equipmentIds: z.array(z.string().uuid()).min(1).max(50),
});

router.post(
  '/qrcode-batch',
  authenticate,
  authorize(Role.ADMIN, Role.RESPONSABLE),
  validate(batchQRSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { equipmentIds } = req.body;

      const equipments = await prisma.equipment.findMany({
        where: { id: { in: equipmentIds }, deletedAt: null },
        select: { id: true, code: true, name: true, ligne: { select: { name: true } } },
      });

      if (equipments.length === 0) {
        throw new AppError('Aucun equipement trouve', 404);
      }

      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      for (const eq of equipments) {
        const page = pdfDoc.addPage([400, 400]);
        const url = `${req.protocol}://${req.get('host')}/equipments/${eq.id}`;
        const qrDataUrl = await QRCode.toDataURL(url, {
          type: 'image/png',
          width: 300,
          margin: 1,
          color: { dark: '#B71C1C', light: '#FFFFFF' },
        });

        const qrImage = await pdfDoc.embedPng(qrDataUrl);
        const qrSize = 200;
        const x = (page.getWidth() - qrSize) / 2;
        const y = (page.getHeight() - qrSize) / 2 + 20;

        page.drawImage(qrImage, { x, y, width: qrSize, height: qrSize });

        page.drawText(eq.code, {
          x: 20,
          y: page.getHeight() - 40,
          size: 18,
          font: fontBold,
          color: rgb(0.72, 0.11, 0.11),
        });

        page.drawText(eq.name, {
          x: 20,
          y: page.getHeight() - 65,
          size: 12,
          font,
          color: rgb(0.2, 0.2, 0.2),
        });

        if (eq.ligne?.name) {
          page.drawText(eq.ligne.name, {
            x: 20,
            y: page.getHeight() - 85,
            size: 10,
            font,
            color: rgb(0.5, 0.5, 0.5),
          });
        }

        page.drawText('Scanner pour acceder a la fiche equipement', {
          x: (page.getWidth() - 220) / 2,
          y: 30,
          size: 9,
          font,
          color: rgb(0.5, 0.5, 0.5),
        });
      }

      const pdfBytes = await pdfDoc.save();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="qrcodes-equipements.pdf"');
      res.send(Buffer.from(pdfBytes));
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/equipments/:id/pdf — Fiche équipement PDF
// ---------------------------------------------------------------------------
router.get(
  '/:id/pdf',
  authenticate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const equipment = await prisma.equipment.findUnique({
        where: { id, deletedAt: null },
        include: {
          ligne: true,
          workOrders: { where: { deletedAt: null }, orderBy: { dateCreation: 'desc' }, take: 50 },
          preventivePlans: { where: { deletedAt: null } },
          documents: { where: { deletedAt: null } },
          sousEnsembles: { where: { deletedAt: null } },
        },
      });
      if (!equipment) throw new AppError('Equipement introuvable', 404);

      const pdfBuffer = await generateEquipmentPDF({
        equipment,
        workOrders: equipment.workOrders,
        preventivePlans: equipment.preventivePlans,
        sousEnsembles: equipment.sousEnsembles,
        documents: equipment.documents,
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="fiche-${equipment.code}.pdf"`);
      res.send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/equipments/:id/duplicate — Dupliquer un équipement
// ---------------------------------------------------------------------------
router.post(
  '/:id/duplicate',
  authenticate,
  authorize(Role.ADMIN, Role.RESPONSABLE),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const original = await prisma.equipment.findUnique({
        where: { id, deletedAt: null },
        include: { sousEnsembles: true },
      });
      if (!original) throw new AppError('Equipement introuvable', 404);

      // Générer un nouveau code unique
      let suffix = 1;
      let newCode = `${original.code}-COPY-${suffix}`;
      while (await prisma.equipment.findUnique({ where: { code: newCode } })) {
        suffix++;
        newCode = `${original.code}-COPY-${suffix}`;
      }

      const duplicated = await prisma.equipment.create({
        data: {
          code: newCode,
          name: `${original.name} (copie)`,
          type: original.type,
          criticality: original.criticality,
          localisation: original.localisation,
          ligneId: original.ligneId,
          contactAlimentaire: original.contactAlimentaire,
          zoneAtex: original.zoneAtex,
          statut: original.statut,
          compteurActuel: original.compteurActuel,
          compteurUnite: original.compteurUnite,
          constructeur: original.constructeur,
          numSerie: original.numSerie,
        },
      });

      // Dupliquer les sous-ensembles
      if (original.sousEnsembles.length > 0) {
        await prisma.sousEnsemble.createMany({
          data: original.sousEnsembles.map((se) => ({
            equipmentId: duplicated.id,
            code: `${se.code}-COPY`,
            name: se.name,
            description: se.description,
            statut: se.statut,
          })),
        });
      }

      logger.info(`Equipement duplique : ${original.code} -> ${newCode} par ${req.user!.email}`);
      res.status(201).json({ success: true, data: duplicated, message: 'Equipement duplique' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
