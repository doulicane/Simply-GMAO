/**
 * =============================================================================
 * Service Bons de Travail (Work Orders)
 * =============================================================================
 * Couche metier des work orders — appelee par les route handlers.
 * =============================================================================
 */

import {
  Role,
  WorkOrderStatus,
  WorkOrderType,
  Priority,
  EquipmentStatus,
  StockMovementType,
} from '@prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { logAudit } from '../utils/audit';
import { generateUniqueBTNumber } from '../utils/generators';
import { paginate } from '../utils/pagination';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface CreateWOData {
  title: string;
  description?: string;
  equipmentId: string;
  type: WorkOrderType;
  priority: Priority;
}

export interface CompleteWOData {
  causePanne?: string | null;
  actionsRealisees?: string | null;
  piecesConsommees?: string | null;
  dureeMinutes?: number;
  commentaireCloture?: string | null;
  photos?: string[];
}

export interface ConsumePartsData {
  stockItemId: string;
  quantite: number;
  commentaire?: string | null;
}

// ---------------------------------------------------------------------------
// createWorkOrder
// ---------------------------------------------------------------------------
export async function createWorkOrder(
  data: CreateWOData,
  user: any,
  ipAddress?: string
) {
  const equipment = await prisma.equipment.findUnique({
    where: { id: data.equipmentId, deletedAt: null },
  });
  if (!equipment) {
    throw new AppError('Equipement introuvable', 404);
  }

  const workOrder = await prisma.workOrder.create({
    data: {
      numero: await generateUniqueBTNumber(prisma),
      title: data.title,
      description: data.description,
      equipmentId: data.equipmentId,
      type: data.type,
      priority: data.priority,
      status: WorkOrderStatus.CREE,
      demandeurId: user.id,
    },
    include: {
      equipment: { select: { id: true, code: true, name: true } },
      demandeur: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  logger.info(`BT cree : ${workOrder.numero} par ${user.email}`);
  await logAudit({
    userId: user.id,
    action: 'CREATE_WORK_ORDER',
    entityType: 'WorkOrder',
    entityId: workOrder.id,
    details: { numero: workOrder.numero, title: workOrder.title, type: data.type },
    ipAddress,
  });

  return workOrder;
}

// ---------------------------------------------------------------------------
// listWorkOrders
// ---------------------------------------------------------------------------
export async function listWorkOrders(filters: any, user: any) {
  const {
    page,
    limit,
    sortBy,
    order,
    status,
    type,
    priority,
    equipmentId,
    technicienId,
    demandeurId,
    dateFrom,
    dateTo,
    search,
  } = filters;

  const where: any = { deletedAt: null };
  if (status) where.status = status;
  if (type) where.type = type;
  if (priority) where.priority = priority;
  if (equipmentId) where.equipmentId = equipmentId;
  if (technicienId) where.technicienId = technicienId;
  if (demandeurId) where.demandeurId = demandeurId;
  if (dateFrom || dateTo) {
    where.dateCreation = {};
    if (dateFrom) where.dateCreation.gte = dateFrom;
    if (dateTo) where.dateCreation.lte = dateTo;
  }
  if (search) {
    where.OR = [
      { numero: { contains: search, mode: 'insensitive' } },
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Filtrage par role
  if (user.role === Role.TECHNICIEN) {
    where.OR = [
      ...(where.OR ?? []),
      { technicienId: user.id },
      { demandeurId: user.id },
    ];
  }
  if (user.role === Role.OPERATEUR) {
    where.demandeurId = user.id;
  }

  const orderBy: any = sortBy ? { [sortBy]: order } : { dateCreation: 'desc' };

  return paginate({
    page,
    limit,
    model: prisma.workOrder,
    where,
    orderBy,
    include: {
      equipment: {
        select: { id: true, code: true, name: true, contactAlimentaire: true },
      },
      demandeur: { select: { id: true, firstName: true, lastName: true } },
      technicien: { select: { id: true, firstName: true, lastName: true } },
      responsable: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}

// ---------------------------------------------------------------------------
// getWorkOrderById
// ---------------------------------------------------------------------------
export async function getWorkOrderById(id: string) {
  const workOrder = await prisma.workOrder.findUnique({
    where: { id, deletedAt: null },
    include: {
      equipment: {
        include: {
          ligne: {
            include: { zone: { include: { site: true } } },
          },
        },
      },
      demandeur: { select: { id: true, firstName: true, lastName: true, email: true } },
      technicien: { select: { id: true, firstName: true, lastName: true, email: true } },
      responsable: { select: { id: true, firstName: true, lastName: true, email: true } },
      validateur: { select: { id: true, firstName: true, lastName: true } },
      stockMovements: {
        include: {
          stockItem: { select: { id: true, code: true, name: true, unite: true } },
        },
      },
    },
  });

  if (!workOrder) {
    throw new AppError('Bon de travail introuvable', 404);
  }

  return workOrder;
}

// ---------------------------------------------------------------------------
// updateWorkOrder (modification generale)
// ---------------------------------------------------------------------------
export async function updateWorkOrder(id: string, data: any, user?: any) {
  const existing = await prisma.workOrder.findUnique({ where: { id, deletedAt: null } });
  if (!existing) {
    throw new AppError('Bon de travail introuvable', 404);
  }

  const workOrder = await prisma.workOrder.update({
    where: { id },
    data,
    include: {
      equipment: { select: { id: true, code: true, name: true } },
      technicien: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  logger.info(`BT modifie : ${workOrder.numero} par ${user?.email}`);
  return workOrder;
}

// ---------------------------------------------------------------------------
// updateWorkOrderStatus
// ---------------------------------------------------------------------------
export async function updateWorkOrderStatus(
  id: string,
  newStatus: WorkOrderStatus,
  user: any,
  allowedTransitions: Record<WorkOrderStatus, { to: WorkOrderStatus[]; roles: Role[] }>,
  commentaire?: string,
  ipAddress?: string
) {
  const workOrder = await prisma.workOrder.findUnique({ where: { id, deletedAt: null } });
  if (!workOrder) {
    throw new AppError('Bon de travail introuvable', 404);
  }

  const transition = allowedTransitions[workOrder.status];
  if (!transition.to.includes(newStatus)) {
    throw new AppError(
      `Transition ${workOrder.status} -> ${newStatus} non autorisee`,
      400
    );
  }

  if (!transition.roles.includes(user.role) && user.role !== Role.ADMIN) {
    throw new AppError('Role insuffisant pour cette transition', 403);
  }

  const updateData: any = { status: newStatus };
  if (commentaire) updateData.commentaireCloture = commentaire;

  const updated = await prisma.workOrder.update({
    where: { id },
    data: updateData,
    include: {
      equipment: { select: { id: true, code: true, name: true } },
    },
  });

  logger.info(`BT ${id} : statut ${workOrder.status} -> ${newStatus} par ${user.email}`);
  await logAudit({
    userId: user.id,
    action: 'UPDATE_WORK_ORDER_STATUS',
    entityType: 'WorkOrder',
    entityId: id,
    details: { oldStatus: workOrder.status, newStatus, commentaire },
    ipAddress,
  });

  return updated;
}

// ---------------------------------------------------------------------------
// assignWorkOrder
// ---------------------------------------------------------------------------
export async function assignWorkOrder(
  id: string,
  technicienId: string,
  datePlanifiee?: Date,
  user?: any
) {
  const workOrder = await prisma.workOrder.findUnique({ where: { id, deletedAt: null } });
  if (!workOrder) {
    throw new AppError('Bon de travail introuvable', 404);
  }

  const tech = await prisma.user.findUnique({
    where: { id: technicienId, role: Role.TECHNICIEN, active: true, deletedAt: null },
  });
  if (!tech) {
    throw new AppError('Technicien introuvable ou inactif', 404);
  }

  const updated = await prisma.workOrder.update({
    where: { id },
    data: {
      technicienId,
      responsableId: user.id,
      datePlanifiee: datePlanifiee ?? workOrder.datePlanifiee,
      status:
        workOrder.status === WorkOrderStatus.CREE
          ? WorkOrderStatus.PLANIFIE
          : workOrder.status,
    },
    include: {
      technicien: { select: { id: true, firstName: true, lastName: true } },
      equipment: { select: { id: true, code: true, name: true } },
    },
  });

  logger.info(`BT ${id} assigne a ${tech.email} par ${user.email}`);
  return updated;
}

// ---------------------------------------------------------------------------
// startWorkOrder
// ---------------------------------------------------------------------------
export async function startWorkOrder(id: string, user: any, _ipAddress?: string) {
  const workOrder = await prisma.workOrder.findUnique({
    where: { id, deletedAt: null },
    include: { equipment: true },
  });
  if (!workOrder) {
    throw new AppError('Bon de travail introuvable', 404);
  }

  if (workOrder.status !== WorkOrderStatus.PLANIFIE) {
    throw new AppError('Le BT doit etre en statut PLANIFIE pour demarrer', 400);
  }

  if (user.role === Role.TECHNICIEN && workOrder.technicienId !== user.id) {
    throw new AppError('Ce BT ne vous est pas assigne', 403);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedWO = await tx.workOrder.update({
      where: { id },
      data: {
        status: WorkOrderStatus.EN_COURS,
        dateDebut: new Date(),
      },
    });

    if (workOrder.equipment) {
      await tx.equipment.update({
        where: { id: workOrder.equipment.id },
        data: { statut: EquipmentStatus.EN_MAINTENANCE },
      });
    }

    return updatedWO;
  });

  logger.info(`BT ${id} demarre par ${user.email}`);
  return updated;
}

// ---------------------------------------------------------------------------
// completeWorkOrder
// ---------------------------------------------------------------------------
export async function completeWorkOrder(
  id: string,
  data: CompleteWOData,
  user: any,
  ipAddress?: string
) {
  const workOrder = await prisma.workOrder.findUnique({
    where: { id, deletedAt: null },
    include: { equipment: true },
  });
  if (!workOrder) {
    throw new AppError('Bon de travail introuvable', 404);
  }

  if (workOrder.status !== WorkOrderStatus.EN_COURS) {
    throw new AppError('Le BT doit etre EN_COURS pour etre termine', 400);
  }

  let dureeMinutes = data.dureeMinutes;
  if (!dureeMinutes && workOrder.dateDebut) {
    dureeMinutes = Math.round((Date.now() - workOrder.dateDebut.getTime()) / 60000);
  }

  const updated = await prisma.workOrder.update({
    where: { id },
    data: {
      status: WorkOrderStatus.TERMINE,
      dateFin: new Date(),
      dureeMinutes: dureeMinutes ?? 0,
      causePanne: data.causePanne,
      actionsRealisees: data.actionsRealisees,
      piecesConsommees: data.piecesConsommees,
      commentaireCloture: data.commentaireCloture,
      photos: data.photos ?? workOrder.photos,
    },
    include: {
      equipment: { select: { id: true, code: true, name: true } },
      technicien: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  logger.info(`BT ${id} termine par ${user.email}`);
  await logAudit({
    userId: user.id,
    action: 'COMPLETE_WORK_ORDER',
    entityType: 'WorkOrder',
    entityId: id,
    details: { dureeMinutes, causePanne: data.causePanne },
    ipAddress,
  });

  return updated;
}

// ---------------------------------------------------------------------------
// validateWorkOrder (cloture)
// ---------------------------------------------------------------------------
export async function validateWorkOrder(id: string, user: any, _ipAddress?: string) {
  const workOrder = await prisma.workOrder.findUnique({
    where: { id, deletedAt: null },
    include: {
      equipment: true,
      atexIntervention: true,
      contactAlimentaireIntervention: true,
    },
  });
  if (!workOrder) {
    throw new AppError('Bon de travail introuvable', 404);
  }

  if (workOrder.status !== WorkOrderStatus.TERMINE) {
    throw new AppError('Le BT doit etre TERMINE pour etre valide', 400);
  }

  // Validation blocante ATEX
  if (workOrder.equipment?.zoneAtex && workOrder.equipment.zoneAtex !== 'NON_ATEX') {
    const atex = workOrder.atexIntervention;
    if (!atex || !atex.consignationEffectuee || !atex.permisDeFeu || !atex.outillageEx || !atex.nettoyageRealise || !atex.depressionRealise) {
      throw new AppError('Bloc ATEX incomplet. Toutes les cases doivent etre cochees.', 400);
    }
    if (!atex.inspecteurAtexSigneAt) {
      throw new AppError('Signature ATEX requise avant cloture.', 400);
    }
  }

  // Validation blocante Contact Alimentaire
  if (workOrder.equipment?.contactAlimentaire) {
    const ca = workOrder.contactAlimentaireIntervention;
    if (!ca || !ca.nettoyageRealise || !ca.rincageRealise) {
      throw new AppError('Bloc contact alimentaire incomplet. Nettoyage et rincage requis.', 400);
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedWO = await tx.workOrder.update({
      where: { id },
      data: {
        status: WorkOrderStatus.CLOTURE,
        validatedBy: user.id,
        validatedAt: new Date(),
      },
    });

    if (workOrder.equipment) {
      const ongoingWO = await tx.workOrder.count({
        where: {
          equipmentId: workOrder.equipment.id,
          status: { in: [WorkOrderStatus.EN_COURS, WorkOrderStatus.PLANIFIE] },
          deletedAt: null,
        },
      });

      if (ongoingWO === 0) {
        await tx.equipment.update({
          where: { id: workOrder.equipment.id },
          data: { statut: EquipmentStatus.EN_SERVICE },
        });
      }
    }

    return updatedWO;
  });

  logger.info(`BT ${id} valide/cloture par ${user.email}`);
  return updated;
}

// ---------------------------------------------------------------------------
// reopenWorkOrder — Rouvrir un BT cloture
// ---------------------------------------------------------------------------
export async function reopenWorkOrder(id: string, user: any, reason?: string, _ipAddress?: string) {
  const workOrder = await prisma.workOrder.findUnique({
    where: { id, deletedAt: null },
    include: { equipment: true },
  });
  if (!workOrder) {
    throw new AppError('Bon de travail introuvable', 404);
  }

  if (workOrder.status !== WorkOrderStatus.CLOTURE) {
    throw new AppError('Le BT doit etre CLOTURE pour etre rouvert', 400);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedWO = await tx.workOrder.update({
      where: { id },
      data: {
        status: WorkOrderStatus.EN_COURS,
        validatedBy: null,
        validatedAt: null,
        commentaireCloture: reason ? `Rouvert : ${reason}` : workOrder.commentaireCloture,
      },
    });

    if (workOrder.equipment) {
      await tx.equipment.update({
        where: { id: workOrder.equipment.id },
        data: { statut: EquipmentStatus.EN_MAINTENANCE },
      });
    }

    return updatedWO;
  });

  logger.info(`BT ${id} rouvert par ${user.email}. Raison : ${reason ?? 'non specifiee'}`);
  return updated;
}

// ---------------------------------------------------------------------------
// addPhotosToWorkOrder
// ---------------------------------------------------------------------------
export async function addPhotosToWorkOrder(id: string, photoUrls: string[], user?: any) {
  const workOrder = await prisma.workOrder.findUnique({ where: { id, deletedAt: null } });
  if (!workOrder) {
    throw new AppError('Bon de travail introuvable', 404);
  }

  const currentPhotos = (workOrder.photos as string[]) ?? [];
  const updatedPhotos = [...currentPhotos, ...photoUrls];

  const updated = await prisma.workOrder.update({
    where: { id },
    data: { photos: updatedPhotos },
    include: {
      equipment: { select: { id: true, code: true, name: true } },
    },
  });

  logger.info(`BT ${id} : ${photoUrls.length} photo(s) ajoutees par ${user?.email}`);
  return updated;
}

// ---------------------------------------------------------------------------
// consumeParts — Consommer des pieces sur un BT (mouvement de stock SORTIE)
// ---------------------------------------------------------------------------
export async function consumePartsOnWorkOrder(
  id: string,
  data: ConsumePartsData,
  user: any
) {
  const workOrder = await prisma.workOrder.findUnique({ where: { id, deletedAt: null } });
  if (!workOrder) {
    throw new AppError('Bon de travail introuvable', 404);
  }

  if (workOrder.status !== WorkOrderStatus.EN_COURS && workOrder.status !== WorkOrderStatus.PLANIFIE) {
    throw new AppError('Le BT doit etre PLANIFIE ou EN_COURS pour consommer des pieces', 400);
  }

  const item = await prisma.stockItem.findUnique({
    where: { id: data.stockItemId, deletedAt: null },
  });
  if (!item || !item.active) {
    throw new AppError('Article introuvable ou inactif', 404);
  }

  const movement = await prisma.$transaction(async (tx) => {
    const lockedItem = await tx.stockItem.findUnique({
      where: { id: data.stockItemId },
    });
    if (!lockedItem || !lockedItem.active) {
      throw new AppError('Article introuvable ou inactif', 404);
    }
    if (data.quantite > Number(lockedItem.quantite)) {
      throw new AppError(`Stock insuffisant. Disponible : ${lockedItem.quantite}`, 400);
    }

    const mov = await tx.stockMovement.create({
      data: {
        stockItemId: data.stockItemId,
        type: StockMovementType.SORTIE,
        quantite: data.quantite,
        workOrderId: id,
        commentaire: data.commentaire ?? `Consommation BT ${workOrder.numero}`,
        utilisateurId: user.id,
      },
    });

    await tx.stockItem.update({
      where: { id: data.stockItemId },
      data: { quantite: { decrement: data.quantite } },
    });

    return mov;
  });

  logger.info(`BT ${id} : ${data.quantite} x ${item.code} consomme par ${user.email}`);
  return movement;
}

// ---------------------------------------------------------------------------
// deleteWorkOrder (soft delete)
// ---------------------------------------------------------------------------
export async function deleteWorkOrder(id: string, user?: any) {
  const existing = await prisma.workOrder.findUnique({ where: { id, deletedAt: null } });
  if (!existing) {
    throw new AppError('Bon de travail introuvable', 404);
  }

  await prisma.workOrder.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  logger.info(`BT ${id} supprime (soft) par ${user?.email}`);
  return { message: 'Bon de travail supprime avec succes' };
}

// ---------------------------------------------------------------------------
// restoreWorkOrder
// ---------------------------------------------------------------------------
export async function restoreWorkOrder(id: string, user?: any) {
  const existing = await prisma.workOrder.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Bon de travail introuvable', 404);
  }
  if (!existing.deletedAt) {
    throw new AppError('Le bon de travail n\'est pas supprime', 400);
  }

  const restored = await prisma.workOrder.update({
    where: { id },
    data: { deletedAt: null },
    include: {
      equipment: { select: { id: true, code: true, name: true } },
      demandeur: { select: { id: true, firstName: true, lastName: true } },
      technicien: { select: { id: true, firstName: true, lastName: true } },
      responsable: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  logger.info(`BT ${id} restaure par ${user?.email}`);
  return restored;
}
