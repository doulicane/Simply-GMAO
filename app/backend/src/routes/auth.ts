/**
 * =============================================================================
 * Routes d'authentification
 * =============================================================================
 * Endpoints :
 *   POST /api/auth/login     — Authentification (email + password)
 *   POST /api/auth/refresh   — Rafraichissement du access token
 *   GET  /api/auth/me        — Profil de l'utilisateur connecte
 * =============================================================================
 */

import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../config/database';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  authenticate,
} from '../middleware/auth';
import { validate } from '../middleware/validation';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = Router();

// ---------------------------------------------------------------------------
// Schemas de validation
// ---------------------------------------------------------------------------
const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token requis'),
});

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------
router.post(
  '/login',
  validate(loginSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Recherche de l'utilisateur
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.active) {
        throw new AppError('Email ou mot de passe incorrect', 401);
      }

      // Verification du mot de passe
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        logger.warn(`Tentative de connexion echouee : ${email}`);
        throw new AppError('Email ou mot de passe incorrect', 401);
      }

      // Generation des tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      logger.info(`Connexion reussie : ${user.email} (${user.role})`);

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
          accessToken,
          refreshToken,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/auth/refresh
// ---------------------------------------------------------------------------
router.post(
  '/refresh',
  validate(refreshSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      // Verification du refresh token
      const decoded = verifyToken(refreshToken);

      if (decoded.type !== 'refresh') {
        throw new AppError('Token de rafraichissement invalide', 401);
      }

      // Verification que l'utilisateur existe toujours
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId, active: true },
      });

      if (!user) {
        throw new AppError('Utilisateur non trouve ou desactive', 401);
      }

      // Generation d'un nouveau access token
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      };

      const newAccessToken = generateAccessToken(tokenPayload);

      res.json({
        success: true,
        data: {
          accessToken: newAccessToken,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/auth/me
// ---------------------------------------------------------------------------
router.get(
  '/me',
  authenticate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          active: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new AppError('Utilisateur introuvable', 404);
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
