/**
 * =============================================================================
 * Middleware d'erreur global
 * =============================================================================
 * Capture toutes les erreurs non gerees et renvoie une reponse JSON
 * structuree coherente avec le format :
 *   { success: false, error: string, message?: string }
 * =============================================================================
 */

import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { logger } from '../utils/logger';

// ---------------------------------------------------------------------------
// Interface pour les erreurs HTTP personnalisees
// ---------------------------------------------------------------------------
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ---------------------------------------------------------------------------
// Handler d'erreurs Prisma connues
// ---------------------------------------------------------------------------
function handlePrismaError(err: any): { statusCode: number; message: string } {
  // Prisma P2002 : violation d'unicite
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] ?? 'champ';
    return { statusCode: 409, message: `Violation d'unicite sur le champ : ${field}` };
  }

  // Prisma P2025 : record not found
  if (err.code === 'P2025') {
    return { statusCode: 404, message: 'Ressource introuvable' };
  }

  // Prisma P2003 : foreign key constraint failed
  if (err.code === 'P2003') {
    return { statusCode: 400, message: 'Contrainte de cle etrangeree violee' };
  }

  // Prisma P2014 : relation violation
  if (err.code === 'P2014') {
    return { statusCode: 400, message: 'Violation de relation entre entites' };
  }

  return { statusCode: 500, message: 'Erreur base de donnees' };
}

// ---------------------------------------------------------------------------
// Middleware d'erreur global Express
// ---------------------------------------------------------------------------
export function globalErrorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  let statusCode = 500;
  let message = err.message ?? 'Erreur interne du serveur';
  let errorCode = 'INTERNAL_ERROR';

  // Erreur HTTP operationnelle (notre AppError)
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorCode = 'OPERATIONAL_ERROR';
  }

  // Erreur Prisma
  else if ((err as any).code?.startsWith('P')) {
    const prismaError = handlePrismaError(err);
    statusCode = prismaError.statusCode;
    message = prismaError.message;
    errorCode = `PRISMA_${(err as any).code}`;
  }

  // Erreur JWT
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token invalide';
    errorCode = 'INVALID_TOKEN';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expire';
    errorCode = 'TOKEN_EXPIRED';
  }

  // Erreur Zod (devrait etre catch avant, mais securite)
  else if (err.name === 'ZodError') {
    statusCode = 400;
    message = 'Donnees invalides';
    errorCode = 'VALIDATION_ERROR';
  }

  // Logging
  if (statusCode >= 500) {
    logger.error('Erreur serveur', {
      message: err.message,
      stack: err.stack,
      code: errorCode,
    });
  } else {
    logger.warn('Erreur client', {
      message: err.message,
      code: errorCode,
      statusCode,
    });
  }

  // Reponse au client (ne jamais exposer le stack en production)
  const response: Record<string, unknown> = {
    success: false,
    error: message,
    code: errorCode,
  };

  if (env.NODE_ENV === 'development' && err.stack) {
    response.stack = err.stack.split('\n');
  }

  res.status(statusCode).json(response);
}

// ---------------------------------------------------------------------------
// Handler pour les routes non trouvees
// ---------------------------------------------------------------------------
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} introuvable`,
    code: 'NOT_FOUND',
  });
}
