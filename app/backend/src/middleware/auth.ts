/**
 * =============================================================================
 * Middleware d'authentification JWT + RBAC
 * =============================================================================
 * - Verifie le token JWT dans le header Authorization (Bearer)
 * - Decode et attache l'utilisateur a la requete (req.user)
 * - Fournit des helpers pour le controle d'acces base sur les roles (RBAC)
 * =============================================================================
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { prisma } from '../config/database';
import { AppError } from './errorHandler';

// ---------------------------------------------------------------------------
// Configuration JWT
// ---------------------------------------------------------------------------
const JWT_SECRET = process.env.JWT_SECRET ?? 'change_me_in_production';
const JWT_ACCESS_EXPIRATION = process.env.JWT_ACCESS_EXPIRATION ?? '15m';
const JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION ?? '7d';

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
  iat?: number;
  exp?: number;
}

// ---------------------------------------------------------------------------
// Generation des tokens
// ---------------------------------------------------------------------------
export function generateAccessToken(payload: Omit<JwtPayload, 'type'>): string {
  return jwt.sign({ ...payload, type: 'access' }, JWT_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRATION as any,
  });
}

export function generateRefreshToken(payload: Omit<JwtPayload, 'type'>): string {
  return jwt.sign({ ...payload, type: 'refresh' }, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRATION as any,
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
    const demoRole = req.headers['x-demo-role'] as string | undefined;

    // Mode dev : autoriser l'authentification via header x-demo-role
    if (process.env.NODE_ENV === 'development' && demoRole) {
      const roleMap: Record<string, Role> = {
        responsable: Role.RESPONSABLE,
        technicien: Role.TECHNICIEN,
        operateur: Role.OPERATEUR,
        magasinier: Role.MAGASINIER,
        hse: Role.HSE,
        admin: Role.ADMIN,
      };
      const role = roleMap[demoRole.toLowerCase()];
      if (role) {
        // Chercher un utilisateur de ce role en DB
        const user = await prisma.user.findFirst({
          where: { role, active: true },
          select: { id: true, email: true, role: true, firstName: true, lastName: true },
        });
        if (user) {
          req.user = user;
          return next();
        }
      }
    }

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
    next();
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
