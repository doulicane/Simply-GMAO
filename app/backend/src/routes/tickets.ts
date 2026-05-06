/**
 * =============================================================================
 * Routes API — Tickets (Demandes d'intervention)
 * =============================================================================
 * - Opérateur : créer un ticket, voir ses tickets
 * - Manager   : lister tous les tickets, approuver/rejeter, convertir en BT
 * =============================================================================
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { generateUniqueBTNumber, generateUniqueTicketNumber } from '../utils/generators';
import { AppError } from '../middleware/errorHandler';
import { Role, TicketStatus, Priority, WorkOrderType, WorkOrderStatus } from '@prisma/client';

const router = Router();

// ---------------------------------------------------------------------------
// Helper : wrapper async pour Express (propagation erreurs vers next)
// ---------------------------------------------------------------------------
const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// ---------------------------------------------------------------------------
// Schémas de validation Zod
// ---------------------------------------------------------------------------
const createTicketSchema = z.object({
  title: z.string().min(3, 'Titre requis (min 3 caracteres)').max(200),
  description: z.string().max(2000).optional(),
  equipmentId: z.string().optional(),
  equipmentCode: z.string().optional(),
  priority: z.enum(['URGENTE', 'HAUTE', 'MOYENNE', 'BASSE']).default('MOYENNE'),
});

const updateStatusSchema = z.object({
  status: z.enum(['EN_ATTENTE', 'EN_COURS', 'RESOLU', 'REJETE', 'CONVERTI_EN_BT']),
  commentaire: z.string().max(1000).optional(),
});

const convertToBTSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  priority: z.enum(['URGENTE', 'HAUTE', 'MOYENNE', 'BASSE']).default('MOYENNE'),
  technicienId: z.string().uuid().optional(),
});

// ---------------------------------------------------------------------------
// Helper : generer un numero de ticket
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// POST /api/tickets — Créer un ticket (opérateur)
// ---------------------------------------------------------------------------
router.post(
  '/',
  authenticate,
  authorize(Role.OPERATEUR, Role.RESPONSABLE, Role.TECHNICIEN, Role.HSE),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = createTicketSchema.parse(req.body);

      // Resoudre l'equipement : par UUID (equipmentId) ou par code (equipmentCode)
      let resolvedEquipmentId: string | null = null;
      if (data.equipmentId) {
        const eq = await prisma.equipment.findUnique({ where: { id: data.equipmentId } });
        if (eq) resolvedEquipmentId = eq.id;
      }
      if (!resolvedEquipmentId && data.equipmentCode) {
        const eq = await prisma.equipment.findUnique({ where: { code: data.equipmentCode } });
        if (eq) resolvedEquipmentId = eq.id;
      }
      if ((data.equipmentId || data.equipmentCode) && !resolvedEquipmentId) {
        throw new AppError('Equipement non trouve', 404);
      }

      const ticket = await prisma.ticket.create({
        data: {
          numero: await generateUniqueTicketNumber(prisma),
          title: data.title,
          description: data.description,
          equipmentId: resolvedEquipmentId,
          operateurId: req.user!.id,
          status: TicketStatus.CREE,
          priority: data.priority as Priority,
        },
        include: {
          equipment: { select: { id: true, code: true, name: true } },
          operateur: { select: { id: true, firstName: true, lastName: true } },
        },
      });

      res.status(201).json({ success: true, data: ticket });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/tickets — Liste des tickets
// ---------------------------------------------------------------------------
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { status, operateurId, equipmentId, page = '1', limit = '20' } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (operateurId) where.operateurId = operateurId;
    if (equipmentId) where.equipmentId = equipmentId;

    // Si operateur : ne voit que ses propres tickets
    if (req.user!.role === Role.OPERATEUR) {
      where.operateurId = req.user!.id;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          equipment: { select: { id: true, code: true, name: true } },
          operateur: { select: { id: true, firstName: true, lastName: true } },
          workOrder: { select: { id: true, numero: true, status: true } },
        },
      }),
      prisma.ticket.count({ where }),
    ]);

    res.json({
      success: true,
      data: { items, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
    });
  })
);

// ---------------------------------------------------------------------------
// GET /api/tickets/:id — Détail d'un ticket
// ---------------------------------------------------------------------------
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
      include: {
        equipment: { select: { id: true, code: true, name: true, statut: true } },
        operateur: { select: { id: true, firstName: true, lastName: true, email: true } },
        workOrder: {
          include: {
            technicien: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!ticket) throw new AppError('Ticket non trouve', 404);

    // Securite : un operateur ne voit que ses tickets
    if (req.user!.role === Role.OPERATEUR && ticket.operateurId !== req.user!.id) {
      throw new AppError('Acces refuse', 403);
    }

    res.json({ success: true, data: ticket });
  })
);

// ---------------------------------------------------------------------------
// PATCH /api/tickets/:id/status — Changer le statut (manager)
// ---------------------------------------------------------------------------
router.patch(
  '/:id/status',
  authenticate,
  authorize(Role.RESPONSABLE),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { status, commentaire } = updateStatusSchema.parse(req.body);

    const ticket = await prisma.ticket.findUnique({ where: { id: req.params.id } });
    if (!ticket) throw new AppError('Ticket non trouve', 404);
    if (ticket.status === TicketStatus.CONVERTI_EN_BT) {
      throw new AppError('Ticket deja converti en BT, statut non modifiable', 400);
    }

    const updated = await prisma.ticket.update({
      where: { id: req.params.id },
      data: {
        status: status as TicketStatus,
        description: commentaire ? `${ticket.description || ''}\n---\n[${new Date().toISOString()}] ${commentaire}` : undefined,
      },
      include: {
        equipment: { select: { id: true, code: true, name: true } },
        operateur: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    res.json({ success: true, data: updated });
  })
);

// ---------------------------------------------------------------------------
// POST /api/tickets/:id/convert — Convertir un ticket en BT (manager)
// ---------------------------------------------------------------------------
router.post(
  '/:id/convert',
  authenticate,
  authorize(Role.RESPONSABLE),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = convertToBTSchema.parse(req.body);

    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
      include: { equipment: true },
    });
    if (!ticket) throw new AppError('Ticket non trouve', 404);
    if (ticket.status === TicketStatus.CONVERTI_EN_BT) {
      throw new AppError('Ticket deja converti en BT', 400);
    }

    // Generer un numero de BT
    const numeroBT = await generateUniqueBTNumber(prisma, 'TK');

    // Creer le BT
    const workOrder = await prisma.workOrder.create({
      data: {
        numero: numeroBT,
        title: data.title || ticket.title,
        description: data.description || ticket.description,
        equipmentId: ticket.equipmentId,
        type: WorkOrderType.CORRECTIF,
        priority: data.priority as Priority,
        status: WorkOrderStatus.CREE,
        demandeurId: req.user!.id,
        technicienId: data.technicienId,
      },
    });

    // Mettre a jour le ticket
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        status: TicketStatus.CONVERTI_EN_BT,
        workOrderId: workOrder.id,
      },
      include: {
        equipment: { select: { id: true, code: true, name: true } },
        operateur: { select: { id: true, firstName: true, lastName: true } },
        workOrder: true,
      },
    });

    res.status(201).json({ success: true, data: { ticket: updatedTicket, workOrder } });
  })
);

export default router;
