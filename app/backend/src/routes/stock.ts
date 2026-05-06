/**
 * =============================================================================
 * Routes Gestion des Stocks
 * =============================================================================
 * Endpoints :
 *   GET  /api/stock-items              — Liste articles
 *   POST /api/stock-items              — Creation article
 *   PUT  /api/stock-items/:id          — Modification
 *   GET  /api/stock-items/:id          — Fiche article
 *   GET  /api/stock-items/low-stock    — Articles sous seuil
 *   POST /api/stock-movements          — Mouvement de stock
 *   GET  /api/stock-movements          — Historique mouvements
 * =============================================================================
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Role, StockMovementType } from '@prisma/client';
import { prisma } from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { validate, validateRequest, paginationQuerySchema, uuidParamSchema } from '../middleware/validation';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = Router();

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------
const createStockItemSchema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(100),
  famille: z.string().min(1).max(50),
  sousFamille: z.string().max(50).optional().nullable(),
  designation: z.string().max(200).optional().nullable(),
  quantite: z.coerce.number().min(0).default(0),
  stockMinimum: z.coerce.number().min(0),
  stockMaximum: z.coerce.number().optional().nullable(),
  localisation: z.string().max(100).optional().nullable(),
  unite: z.string().max(20).optional().nullable(),
  prixUnitaire: z.coerce.number().min(0).optional().nullable(),
  fournisseur: z.string().max(100).optional().nullable(),
});

const updateStockItemSchema = createStockItemSchema.partial();

const stockItemQuerySchema = paginationQuerySchema.extend({
  famille: z.string().optional(),
  search: z.string().optional(),
  lowStock: z.coerce.boolean().optional(),
});

const movementSchema = z.object({
  stockItemId: z.string().uuid(),
  type: z.nativeEnum(StockMovementType),
  quantite: z.coerce.number().min(0),
  workOrderId: z.string().uuid().optional().nullable(),
  commentaire: z.string().max(500).optional().nullable(),
});

// ---------------------------------------------------------------------------
// GET /api/stock-items
// ---------------------------------------------------------------------------
router.get(
  '/',
  authenticate,
  validate(stockItemQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit, sortBy, order, famille, search, lowStock } = req.query as unknown as z.infer<typeof stockItemQuerySchema>;

      const where: any = { active: true };
      if (famille) where.famille = famille;
      if (search) {
        where.OR = [
          { code: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
          { designation: { contains: search, mode: 'insensitive' } },
        ];
      }
      if (lowStock) {
        where.quantite = { lte: prisma.stockItem.fields.stockMinimum };
      }

      const skip = (page - 1) * limit;
      const orderBy: any = sortBy ? { [sortBy]: order } : { name: 'asc' };

      const [items, total] = await Promise.all([
        prisma.stockItem.findMany({
          where,
          skip,
          take: limit,
          orderBy,
        }),
        prisma.stockItem.count({ where }),
      ]);

      res.json({
        success: true,
        data: items,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/stock-items
// ---------------------------------------------------------------------------
router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN, Role.RESPONSABLE, Role.MAGASINIER),
  validate(createStockItemSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req.body;

      const item = await prisma.stockItem.create({
        data: {
          code: data.code,
          name: data.name,
          famille: data.famille,
          sousFamille: data.sousFamille,
          designation: data.designation,
          quantite: data.quantite ?? 0,
          stockMinimum: data.stockMinimum,
          stockMaximum: data.stockMaximum,
          localisation: data.localisation,
          unite: data.unite,
          prixUnitaire: data.prixUnitaire,
          fournisseur: data.fournisseur,
          active: true,
        },
      });

      // Mouvement d'entree initial si quantite > 0
      if (data.quantite > 0) {
        await prisma.stockMovement.create({
          data: {
            stockItemId: item.id,
            type: StockMovementType.ENTREE,
            quantite: data.quantite,
            commentaire: 'Stock initial a la creation',
            utilisateurId: req.user!.id,
          },
        });
      }

      logger.info(`Article cree : ${item.code} par ${req.user!.email}`);

      res.status(201).json({ success: true, data: item, message: 'Article cree' });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// PUT /api/stock-items/:id
// ---------------------------------------------------------------------------
router.put(
  '/:id',
  authenticate,
  authorize(Role.ADMIN, Role.RESPONSABLE, Role.MAGASINIER),
  validateRequest({ params: uuidParamSchema, body: updateStockItemSchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data = req.body;

      const existing = await prisma.stockItem.findUnique({ where: { id } });
      if (!existing) {
        throw new AppError('Article introuvable', 404);
      }

      const item = await prisma.stockItem.update({
        where: { id },
        data,
      });

      logger.info(`Article modifie : ${item.code} par ${req.user!.email}`);

      res.json({ success: true, data: item, message: 'Article modifie' });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/stock-items/:id
// ---------------------------------------------------------------------------
router.get(
  '/:id',
  authenticate,
  validate(uuidParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const item = await prisma.stockItem.findUnique({
        where: { id },
        include: {
          stockMovements: {
            orderBy: { date: 'desc' },
            take: 20,
            include: {
              utilisateur: { select: { id: true, firstName: true, lastName: true } },
              workOrder: { select: { id: true, numero: true } },
            },
          },
        },
      });

      if (!item) {
        throw new AppError('Article introuvable', 404);
      }

      res.json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/stock-items/low-stock
// ---------------------------------------------------------------------------
router.get(
  '/low-stock',
  authenticate,
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const items = await prisma.stockItem.findMany({
        where: {
          active: true,
          quantite: { lte: prisma.stockItem.fields.stockMinimum },
        },
        orderBy: { quantite: 'asc' },
      });

      res.json({ success: true, data: items, count: items.length });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/stock-movements
// ---------------------------------------------------------------------------
router.post(
  '/movements',
  authenticate,
  authorize(Role.ADMIN, Role.RESPONSABLE, Role.MAGASINIER),
  validate(movementSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { stockItemId, type, quantite, workOrderId, commentaire } = req.body;

      const item = await prisma.stockItem.findUnique({ where: { id: stockItemId } });
      if (!item || !item.active) {
        throw new AppError('Article introuvable ou inactif', 404);
      }

      // Verifier la quantite disponible pour sorties
      if ((type === StockMovementType.SORTIE || type === StockMovementType.RESERVATION) && quantite > item.quantite) {
        throw new AppError(`Stock insuffisant. Disponible : ${item.quantite}`, 400);
      }

      const movement = await prisma.$transaction(async (tx) => {
        // Creer le mouvement
        const mov = await tx.stockMovement.create({
          data: {
            stockItemId,
            type,
            quantite,
            workOrderId,
            commentaire,
            utilisateurId: req.user!.id,
          },
        });

        // Mettre a jour la quantite
        let newQuantite = item.quantite;
        switch (type) {
          case StockMovementType.ENTREE:
          case StockMovementType.RETOUR:
            newQuantite = newQuantite + quantite;
            break;
          case StockMovementType.SORTIE:
          case StockMovementType.RESERVATION:
            newQuantite = newQuantite - quantite;
            break;
          case StockMovementType.AJUSTEMENT:
            newQuantite = quantite; // La quantite devient la valeur passee
            break;
          case StockMovementType.TRANSFERT:
            // Le transfert est geré comme sortie + entree
            break;
        }

        await tx.stockItem.update({
          where: { id: stockItemId },
          data: { quantite: newQuantite },
        });

        return mov;
      });

      logger.info(`Mouvement ${type} : ${quantite} x ${item.code} par ${req.user!.email}`);

      res.status(201).json({
        success: true,
        data: movement,
        message: 'Mouvement enregistre',
      });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/stock-movements
// ---------------------------------------------------------------------------
router.get(
  '/movements',
  authenticate,
  validate(paginationQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit } = req.query as unknown as z.infer<typeof paginationQuerySchema>;
      const { stockItemId, type, dateFrom, dateTo } = req.query as any;

      const where: any = {};
      if (stockItemId) where.stockItemId = stockItemId;
      if (type) where.type = type;
      if (dateFrom || dateTo) {
        where.date = {};
        if (dateFrom) where.date.gte = new Date(dateFrom as string);
        if (dateTo) where.date.lte = new Date(dateTo as string);
      }

      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        prisma.stockMovement.findMany({
          where,
          skip,
          take: limit,
          orderBy: { date: 'desc' },
          include: {
            stockItem: { select: { id: true, code: true, name: true } },
            utilisateur: { select: { id: true, firstName: true, lastName: true } },
            workOrder: { select: { id: true, numero: true } },
          },
        }),
        prisma.stockMovement.count({ where }),
      ]);

      res.json({
        success: true,
        data: items,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
