/**
 * =============================================================================
 * Middleware de lockout progressif (brute-force protection)
 * =============================================================================
 * Apres 5 echecs de login : blocage 1 minute
 * Apres 10 echecs        : blocage 5 minutes
 * Apres 15 echecs        : blocage 15 minutes
 *
 * Stocke les tentatives dans Redis avec TTL pour eviter la saturation memoire.
 * Cle : `lockout:{identifier}` (identifier = IP ou email normalise)
 * =============================================================================
 */

import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../config/redis';
import { AppError } from './errorHandler';

// Seuils et delais (en secondes)
const THRESHOLDS = [
  { max: 5, lockoutSeconds: 0 },      // Pas de blocage
  { max: 10, lockoutSeconds: 60 },    // 1 minute
  { max: 15, lockoutSeconds: 300 },   // 5 minutes
  { max: Infinity, lockoutSeconds: 900 }, // 15 minutes
];

const WINDOW_SECONDS = 900; // 15 minutes de fenetre glissante

function getLockoutDelay(attempts: number): number {
  for (const threshold of THRESHOLDS) {
    if (attempts <= threshold.max) {
      return threshold.lockoutSeconds;
    }
  }
  return THRESHOLDS[THRESHOLDS.length - 1].lockoutSeconds;
}

function getIdentifier(req: Request): string {
  // Utilise l'email du body si disponible, sinon l'IP
  const email = (req.body?.email as string)?.toLowerCase()?.trim();
  if (email) return `lockout:email:${email}`;
  const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';
  return `lockout:ip:${ip}`;
}

/**
 * Enregistrer une tentative echouee
 */
export async function recordFailedAttempt(identifier: string): Promise<void> {
  const key = identifier;
  const pipeline = redisClient.pipeline();
  pipeline.incr(key);
  pipeline.expire(key, WINDOW_SECONDS);
  const results = await pipeline.exec();
  const attempts = (results?.[0]?.[1] as number) ?? 1;
  const lockoutDelay = getLockoutDelay(attempts);

  if (lockoutDelay > 0) {
    // Si on vient de depasser un seuil, on etend le TTL au delai de lockout
    await redisClient.expire(key, lockoutDelay);
  }
}

/**
 * Reinitialiser les tentatives (login reussi)
 */
export async function resetAttempts(identifier: string): Promise<void> {
  await redisClient.del(identifier);
}

/**
 * Middleware Express complet : check + blocage
 */
export function progressiveLockout() {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const identifier = getIdentifier(req);

    try {
      const attemptsStr = await redisClient.get(identifier);
      const attempts = attemptsStr ? parseInt(attemptsStr, 10) : 0;
      const lockoutDelay = getLockoutDelay(attempts);

      if (attempts >= 5 && lockoutDelay > 0) {
        // Verifier si on est dans la periode de lockout
        const ttl = await redisClient.ttl(identifier);
        if (ttl > 0 && attempts >= 5) {
          const minutes = Math.ceil(ttl / 60);
          return next(
            new AppError(
              `Trop de tentatives echouees. Veuillez reessayer dans ${minutes} minute(s).`,
              429
            )
          );
        }
      }

      // Attacher les helpers a la requete pour les utiliser dans la route
      (req as any).__lockoutIdentifier = identifier;

      next();
    } catch {
      next();
    }
  };
}

/**
 * Helper a appeler dans la route apres un echec de login
 */
export async function markLoginFailed(req: Request): Promise<void> {
  const identifier = (req as any).__lockoutIdentifier as string | undefined;
  if (identifier) {
    await recordFailedAttempt(identifier);
  }
}

/**
 * Helper a appeler dans la route apres un succes de login
 */
export async function markLoginSuccess(req: Request): Promise<void> {
  const identifier = (req as any).__lockoutIdentifier as string | undefined;
  if (identifier) {
    await resetAttempts(identifier);
  }
}
