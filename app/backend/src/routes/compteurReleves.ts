import { Router } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import { paginate } from '../utils/pagination';
import { AppError } from '../middleware/errorHandler';

const router = Router();

router.use(authenticate);

// Lister les relevés d'un équipement
router.get('/equipment/:equipmentId', async (req, res, next) => {
  try {
    const { equipmentId } = req.params;
    const result = await paginate({
      model: prisma.compteurReleve,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      where: { equipmentId },
      orderBy: { dateReleve: 'desc' },
      include: { utilisateur: { select: { id: true, firstName: true, lastName: true } } },
    });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

// Créer un relevé + mettre à jour compteurActuel de l'équipement
router.post('/', async (req, res, next) => {
  try {
    const { equipmentId, valeur, dateReleve, commentaire } = req.body;
    if (!equipmentId || valeur === undefined || valeur === null) {
      throw new AppError('equipmentId et valeur sont requis', 400);
    }
    const valNum = Number(valeur);
    if (Number.isNaN(valNum)) throw new AppError('La valeur doit être un nombre', 400);

    const equipment = await prisma.equipment.findUnique({ where: { id: equipmentId, deletedAt: null } });
    if (!equipment) throw new AppError('Équipement introuvable', 404);

    const created = await prisma.$transaction(async (tx) => {
      const releve = await tx.compteurReleve.create({
        data: {
          equipmentId,
          valeur: valNum,
          dateReleve: dateReleve ? new Date(dateReleve) : new Date(),
          utilisateurId: req.user!.id,
          commentaire,
        },
        include: { utilisateur: { select: { id: true, firstName: true, lastName: true } } },
      });
      await tx.equipment.update({
        where: { id: equipmentId },
        data: { compteurActuel: valNum },
      });
      return releve;
    });

    res.status(201).json({ success: true, data: created });
  } catch (err) {
    next(err);
  }
});

// Détails
router.get('/:id', async (req, res, next) => {
  try {
    const releve = await prisma.compteurReleve.findUnique({
      where: { id: req.params.id },
      include: {
        equipment: { select: { id: true, code: true, name: true } },
        utilisateur: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!releve) throw new AppError('Relevé introuvable', 404);
    res.json({ success: true, data: releve });
  } catch (err) {
    next(err);
  }
});

// Modifier un relevé (commentaire uniquement — valeur figée pour audit)
router.patch('/:id', async (req, res, next) => {
  try {
    const { commentaire } = req.body;
    const existing = await prisma.compteurReleve.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError('Relevé introuvable', 404);

    const updated = await prisma.compteurReleve.update({
      where: { id: req.params.id },
      data: { commentaire },
      include: { utilisateur: { select: { id: true, firstName: true, lastName: true } } },
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// Supprimer un relevé
router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.compteurReleve.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError('Relevé introuvable', 404);

    await prisma.$transaction(async (tx) => {
      await tx.compteurReleve.delete({ where: { id: req.params.id } });
      // Recalculer compteurActuel avec le dernier relevé restant
      const dernier = await tx.compteurReleve.findFirst({
        where: { equipmentId: existing.equipmentId },
        orderBy: { dateReleve: 'desc' },
      });
      await tx.equipment.update({
        where: { id: existing.equipmentId },
        data: { compteurActuel: dernier?.valeur ?? 0 },
      });
    });

    res.json({ success: true, message: 'Relevé supprimé' });
  } catch (err) {
    next(err);
  }
});

export default router;
