/**
 * =============================================================================
 * Configuration Redis — Client pour BullMQ et Cache
 * =============================================================================
 * Fournit un client Redis connecte a l'instance Redis du docker-compose.
 * Utilise pour :
 *   - File d'attente BullMQ (jobs asynchrones)
 *   - Cache des reponses API (donnees referentielles)
 *   - Sessions JWT (blacklist tokens)
 * =============================================================================
 */

import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379';

// ---------------------------------------------------------------------------
// Client Redis principal
// ---------------------------------------------------------------------------
export const redisClient = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  showFriendlyErrorStack: process.env.NODE_ENV === 'development',
});

// ---------------------------------------------------------------------------
// Evenements de connexion (logging)
// ---------------------------------------------------------------------------
redisClient.on('connect', () => {
  console.log('[Redis] Connexion etablie');
});

redisClient.on('ready', () => {
  console.log('[Redis] Client pret');
});

redisClient.on('error', (err: Error) => {
  console.error('[Redis] Erreur :', err.message);
});

redisClient.on('reconnecting', () => {
  console.warn('[Redis] Reconnexion en cours...');
});

// ---------------------------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------------------------
export async function disconnectRedis(): Promise<void> {
  await redisClient.quit();
  console.log('[Redis] Deconnexion effectuee');
}
