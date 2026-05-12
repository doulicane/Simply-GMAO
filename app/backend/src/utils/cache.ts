/**
 * =============================================================================
 * Utilitaires de cache Redis — Pattern Cache-Aside
 * =============================================================================
 * getOrSetCache : recupere du cache ou execute le fetcher et stocke
 * invalidateCache : supprime les cles correspondant a un pattern
 * =============================================================================
 */

import { redisClient } from '../config/redis';

const DEFAULT_TTL = 300; // 5 minutes

export async function getOrSetCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = DEFAULT_TTL
): Promise<T> {
  const cached = await redisClient.get(key);
  if (cached) {
    return JSON.parse(cached) as T;
  }
  const data = await fetcher();
  await redisClient.setex(key, ttlSeconds, JSON.stringify(data));
  return data;
}

export async function getCache<T>(key: string): Promise<T | null> {
  const cached = await redisClient.get(key);
  if (cached) {
    return JSON.parse(cached) as T;
  }
  return null;
}

export async function setCache<T>(key: string, value: T, ttlSeconds: number = DEFAULT_TTL): Promise<void> {
  await redisClient.setex(key, ttlSeconds, JSON.stringify(value));
}

export async function invalidateCache(pattern: string): Promise<void> {
  const stream = redisClient.scanStream({ match: pattern, count: 100 });
  const keys: string[] = [];

  await new Promise<void>((resolve, reject) => {
    stream.on('data', (k: string[]) => keys.push(...k));
    stream.on('end', async () => {
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
      resolve();
    });
    stream.on('error', reject);
  });
}
