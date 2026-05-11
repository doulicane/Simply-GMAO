import { Router } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import { paginate } from '../utils/pagination';
import { AppError } from '../middleware/errorHandler';

const router = Router();

router.use(authenticate);

// Lister les sous-ensembles d'un équipement
router.get('/equipment/:equipmentId', async (req, res, next) => {
  try {
    const { equipmentId } = req.params;
    const result = await paginate({
      model: prisma.sousEnsemble,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      where: { equipmentId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

// Créer un sous-ensemble
router.post('/', async (req, res, next) => {
  try {
    const { equipmentId, code, name, description, statut, dateAchat, dateMiseService } = req.body;
    if (!equipmentId || !code || !name) throw new AppError('equipmentId, code et name sont requis', 400);

    const equipment = await prisma.equipment.findUnique({ where: { id: equipmentId, deletedAt: null } });
    if (!equipment) throw new AppError('Équipement introuvable', 404);

    const sousEnsemble = await prisma.sousEnsemble.create({
      data: {
        equipmentId,
        code,
        name,
        description,
        statut: statut || 'EN_SERVICE',
        dateAchat: dateAchat ? new Date(dateAchat) : undefined,
        dateMiseService: dateMiseService ? new Date(dateMiseService) : undefined,
      },
    });
    res.status(201).json({ success: true, data: sousEnsemble });
  } catch (err) {
    next(err);
  }
});

// Détails
router.get('/:id', async (req, res, next) => {
  try {
    const sousEnsemble = await prisma.sousEnsemble.findUnique({
      where: { id: req.params.id },
      include: { equipment: { select: { id: true, code: true, name: true } } },
    });
    if (!sousEnsemble || sousEnsemble.deletedAt) throw new AppError('Sous-ensemble introuvable', 404);
    res.json({ success: true, data: sousEnsemble });
  } catch (err) {
    next(err);
  }
});

// Modifier
router.patch('/:id', async (req, res, next) => {
  try {
    const { code, name, description, statut, dateAchat, dateMiseService, active } = req.body;
    const existing = await prisma.sousEnsemble.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) throw new AppError('Sous-ensemble introuvable', 404);

    const updated = await prisma.sousEnsemble.update({
      where: { id: req.params.id },
      data: {
        code,
        name,
        description,
        statut,
        dateAchat: dateAchat !== undefined ? (dateAchat ? new Date(dateAchat) : null) : undefined,
        dateMiseService: dateMiseService !== undefined ? (dateMiseService ? new Date(dateMiseService) : null) : undefined,
        active,
      },
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// Suppression logique
router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.sousEnsemble.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) throw new AppError('Sous-ensemble introuvable', 404);

    await prisma.sousEnsemble.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, message: 'Sous-ensemble supprimé' });
  } catch (err) {
    next(err);
  }
});

// Restaurer
router.post('/:id/restore', async (req, res, next) => {
  try {
    const existing = await prisma.sousEnsemble.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError('Sous-ensemble introuvable', 404);
    if (!existing.deletedAt) throw new AppError('Sous-ensemble déjà actif', 400);

    const restored = await prisma.sousEnsemble.update({ where: { id: req.params.id }, data: { deletedAt: null } });
    res.json({ success: true, data: restored });
  } catch (err) {
    next(err);
  }
});

export default router;
