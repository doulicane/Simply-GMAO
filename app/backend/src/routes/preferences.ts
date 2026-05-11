import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';


const router = Router();

router.use(authenticate);

// GET /api/preferences — Récupérer les préférences
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const prefs = await prisma.userPreference.findUnique({
      where: { userId: req.user!.id },
    });
    res.json({ success: true, data: prefs });
  } catch (err) {
    next(err);
  }
});

// PUT /api/preferences — Mettre à jour les préférences
router.put('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { dashboardLayout, theme, language } = req.body;
    const prefs = await prisma.userPreference.upsert({
      where: { userId: req.user!.id },
      update: {
        dashboardLayout: dashboardLayout !== undefined ? dashboardLayout : undefined,
        theme: theme !== undefined ? theme : undefined,
        language: language !== undefined ? language : undefined,
      },
      create: {
        userId: req.user!.id,
        dashboardLayout,
        theme,
        language,
      },
    });
    res.json({ success: true, data: prefs });
  } catch (err) {
    next(err);
  }
});

export default router;
