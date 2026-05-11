/**
 * =============================================================================
 * Middleware d'authentification JWT + RBAC
 * =============================================================================
 * - Verifie le token JWT dans le header Authorization (Bearer)
 * - Decode et attache l'utilisateur a la requete (req.user)
 * - Fournit des helpers pour le controle d'acces base sur les roles (RBAC)
 * - Blacklist des refresh tokens via Redis
 * =============================================================================
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { Role } from '@prisma/client';
import { prisma } from '../config/database';
import { redisClient } from '../config/redis';
import { env } from '../config/env';
import { AppError } from './errorHandler';
import { runWithContext } from '../utils/asyncContext';

// ---------------------------------------------------------------------------
// Configuration JWT (depuis env validee)
// ---------------------------------------------------------------------------
const JWT_SECRET = env.JWT_SECRET;
const JWT_ACCESS_EXPIRATION = env.JWT_ACCESS_EXPIRATION;
const JWT_REFRESH_EXPIRATION = env.JWT_REFRESH_EXPIRATION;

// ---------------------------------------------------------------------------
// Interface etendue pour Request
// ---------------------------------------------------------------------------
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: Role;
        firstName: string;
        lastName: string;
      };
    }
  }
}

// ---------------------------------------------------------------------------
// Payload du token JWT
// ---------------------------------------------------------------------------
export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  type: 'access' | 'refresh';
  jti: string;
  iat?: number;
  exp?: number;
}

// ---------------------------------------------------------------------------
// Generation des tokens
// ---------------------------------------------------------------------------
export function generateAccessToken(payload: Omit<JwtPayload, 'type' | 'jti'>): { token: string; jti: string } {
  const jti = randomUUID();
  const token = jwt.sign({ ...payload, type: 'access', jti }, JWT_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRATION as any,
  });
  return { token, jti };
}

export function generateRefreshToken(payload: Omit<JwtPayload, 'type' | 'jti'>): { token: string; jti: string } {
  const jti = randomUUID();
  const token = jwt.sign({ ...payload, type: 'refresh', jti }, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRATION as any,
  });
  return { token, jti };
}

// ---------------------------------------------------------------------------
// Stockage Redis d'un refresh token (au login)
// ---------------------------------------------------------------------------
export async function storeRefreshToken(userId: string, jti: string): Promise<void> {
  const key = `refresh:${userId}:${jti}`;
  // TTL = duree du refresh token en secondes (7 jours par defaut)
  const ttlSeconds = 7 * 24 * 60 * 60;
  await redisClient.set(key, '1', 'EX', ttlSeconds);
}

// ---------------------------------------------------------------------------
// Verification qu'un refresh token n'est pas blackliste
// ---------------------------------------------------------------------------
export async function isRefreshTokenBlacklisted(userId: string, jti: string): Promise<boolean> {
  const key = `refresh:${userId}:${jti}`;
  const exists = await redisClient.exists(key);
  return exists === 0; // Si la cle n'existe pas, c'est qu'elle a ete supprimee (blacklist) ou expiree
}

// ---------------------------------------------------------------------------
// Blacklist d'un refresh token (au logout)
// ---------------------------------------------------------------------------
export async function blacklistRefreshToken(userId: string, jti: string): Promise<void> {
  const key = `refresh:${userId}:${jti}`;
  await redisClient.del(key);
}

// ---------------------------------------------------------------------------
// Blacklist de tous les refresh tokens d'un utilisateur
// ---------------------------------------------------------------------------
export async function blacklistAllUserRefreshTokens(userId: string): Promise<void> {
  const pattern = `refresh:${userId}:*`;
  const stream = redisClient.scanStream({ match: pattern, count: 100 });
  const keysToDelete: string[] = [];

  return new Promise((resolve, reject) => {
    stream.on('data', (keys: string[]) => {
      if (keys.length) keysToDelete.push(...keys);
    });
    stream.on('end', async () => {
      if (keysToDelete.length) {
        await redisClient.del(...keysToDelete);
      }
      resolve();
    });
    stream.on('error', reject);
  });
}

// ---------------------------------------------------------------------------
// Verification d'un token
// ---------------------------------------------------------------------------
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

// ---------------------------------------------------------------------------
// Middleware : authentification requise
// ---------------------------------------------------------------------------
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token d\'authentification manquant', 401);
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    // Verifier que c'est un access token
    if (decoded.type !== 'access') {
      throw new AppError('Type de token invalide', 401);
    }

    // Verifier que l'utilisateur existe toujours et est actif
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId, active: true },
      select: { id: true, email: true, role: true, firstName: true, lastName: true },
    });

    if (!user) {
      throw new AppError('Utilisateur non trouve ou desactive', 401);
    }

    req.user = user;
    runWithContext(
      {
        userId: user.id,
        ipAddress: req.ip ?? req.socket.remoteAddress ?? undefined,
      },
      () => next()
    );
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// Middleware optionnel : authentification si token present
// ---------------------------------------------------------------------------
export async function optionalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (decoded.type === 'access') {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId, active: true },
        select: { id: true, email: true, role: true, firstName: true, lastName: true },
      });
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch {
    // Token invalide : on continue sans authentifier
    next();
  }
}

// ---------------------------------------------------------------------------
// Helper RBAC : generer un middleware pour roles autorises
// ---------------------------------------------------------------------------
export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentification requise', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Acces refuse. Roles autorises : ${allowedRoles.join(', ')}`,
          403
        )
      );
    }

    next();
  };
}

// ---------------------------------------------------------------------------
// Helper : verifier un role specifique
// ---------------------------------------------------------------------------
export function hasRole(userRole: Role, ...requiredRoles: Role[]): boolean {
  return requiredRoles.includes(userRole);
}

// ---------------------------------------------------------------------------
// Middleware composite : auth + roles
// ---------------------------------------------------------------------------
export function requireAuth(...roles: Role[]) {
  return [authenticate, authorize(...roles)];
}
