/**
 * =============================================================================
 * Routes d'authentification
 * =============================================================================
 * Endpoints :
 *   POST /api/auth/login     — Authentification (email + password)
 *   POST /api/auth/logout    — Deconnexion (blacklist du refresh token)
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
  storeRefreshToken,
  isRefreshTokenBlacklisted,
  blacklistRefreshToken,
} from '../middleware/auth';
import { validate } from '../middleware/validation';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { env } from '../config/env';
import {
  progressiveLockout,
  markLoginFailed,
  markLoginSuccess,
} from '../middleware/lockout';

const router = Router();

// ---------------------------------------------------------------------------
// Schemas de validation
// ---------------------------------------------------------------------------
const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

const refreshSchema = z.object({
  refreshToken: z.string().optional(),
});

const logoutSchema = z.object({
  refreshToken: z.string().optional(),
});

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------
router.post(
  '/login',
  progressiveLockout(),
  validate(loginSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Recherche de l'utilisateur
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.active) {
        await markLoginFailed(req);
        throw new AppError('Email ou mot de passe incorrect', 401);
      }

      // Verification du mot de passe
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        await markLoginFailed(req);
        logger.warn(`Tentative de connexion echouee : ${email}`);
        throw new AppError('Email ou mot de passe incorrect', 401);
      }

      // Reinitialiser les tentatives echouees
      await markLoginSuccess(req);

      // Generation des tokens avec JTI
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      };

      const access = generateAccessToken(tokenPayload);
      const refresh = generateRefreshToken(tokenPayload);

      // Stockage du refresh token dans Redis (TTL = 7 jours gere par Redis)
      await storeRefreshToken(user.id, refresh.jti);

      logger.info(`Connexion reussie : ${user.email} (${user.role})`);

      res.cookie('refreshToken', refresh.token, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

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
          accessToken: access.token,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/auth/logout
// ---------------------------------------------------------------------------
router.post(
  '/logout',
  validate(logoutSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

      try {
        if (refreshToken) {
          const decoded = verifyToken(refreshToken);
          if (decoded.type === 'refresh') {
            // Blacklist le refresh token dans Redis
            await blacklistRefreshToken(decoded.userId, decoded.jti);
            logger.info(`Deconnexion : refresh token blackliste pour ${decoded.userId}`);
          }
        }
      } catch {
        // Token invalide ou expire : on ignore, la deconnexion se fait quand meme cote client
        logger.warn('Deconnexion avec refresh token invalide');
      }

      res.clearCookie('refreshToken');
      res.json({
        success: true,
        message: 'Deconnexion reussie',
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
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      if (!refreshToken) {
        throw new AppError('Refresh token manquant', 401);
      }

      // Verification du refresh token
      const decoded = verifyToken(refreshToken);

      if (decoded.type !== 'refresh') {
        throw new AppError('Token de rafraichissement invalide', 401);
      }

      // Verification que le refresh token n'est pas blackliste
      const blacklisted = await isRefreshTokenBlacklisted(decoded.userId, decoded.jti);
      if (blacklisted) {
        throw new AppError('Token de rafraichissement invalide ou revoque', 401);
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

      const newAccess = generateAccessToken(tokenPayload);

      res.json({
        success: true,
        data: {
          accessToken: newAccess.token,
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
