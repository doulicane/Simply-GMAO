/**
 * =============================================================================
 * Routes API — Connecteur SCADA (v1)
 * =============================================================================
 * Endpoint pour réception des données compteurs depuis le système SCADA.
 *
 * POST /api/v1/compteurs/push
 *   Headers : X-API-Key
 *   Body    : { equipmentCode, valeur, unite?, timestamp? }
 *
 * Authentification par API key (env SCADA_API_KEY).
 * Validation stricte des données.
 * =============================================================================
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { emitToRole } from '../socket';

const router = Router();

const SCADA_API_KEY = process.env.SCADA_API_KEY || 'scada-dev-key-change-in-prod';

// Middleware d'authentification API key
function scadaAuth(req: Request, _res: Response, next: NextFunction): void {
  const key = req.headers['x-api-key'] as string | undefined;
  if (!key || key !== SCADA_API_KEY) {
    return next(new AppError('API key invalide', 401));
  }
  next();
}

const pushSchema = z.object({
  equipmentCode: z.string().min(1),
  valeur: z.number().or(z.string().transform((v) => Number(v))),
  unite: z.string().optional(),
  timestamp: z.string().datetime().optional(),
});

// ---------------------------------------------------------------------------
// POST /api/v1/compteurs/push — Réception données SCADA
// ---------------------------------------------------------------------------
router.post(
  '/compteurs/push',
  scadaAuth,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parse = pushSchema.safeParse(req.body);
      if (!parse.success) {
        throw new AppError(`Donnees invalides : ${parse.error.message}`, 400);
      }

      const { equipmentCode, valeur, unite, timestamp } = parse.data;

      const equipment = await prisma.equipment.findUnique({
        where: { code: equipmentCode },
      });
      if (!equipment) {
        throw new AppError(`Equipement ${equipmentCode} introuvable`, 404);
      }

      const dateReleve = timestamp ? new Date(timestamp) : new Date();

      // Créer le relevé + mettre à jour compteurActuel
      await prisma.$transaction(async (tx) => {
        await tx.compteurReleve.create({
          data: {
            equipmentId: equipment.id,
            valeur,
            dateReleve,
            utilisateurId: 'system-scada',
            commentaire: 'Automatique — SCADA',
          },
        });
        await tx.equipment.update({
          where: { id: equipment.id },
          data: {
            compteurActuel: valeur,
            compteurUnite: unite || equipment.compteurUnite || undefined,
          },
        });
      });

      logger.info(`SCADA push — ${equipmentCode} = ${valeur} ${unite || ''}`);

      // Notifier les responsables en temps réel
      emitToRole('responsable', 'scada:counter', {
        equipmentCode,
        valeur,
        unite,
        timestamp: dateReleve.toISOString(),
      });

      res.json({
        success: true,
        message: 'Donnees compteur enregistrees',
        data: { equipmentCode, valeur, dateReleve },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/v1/compteurs/status — Healthcheck SCADA
// ---------------------------------------------------------------------------
router.get(
  '/compteurs/status',
  scadaAuth,
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const count = await prisma.compteurReleve.count();
      res.json({
        success: true,
        status: 'ok',
        relevesTotal: count,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
