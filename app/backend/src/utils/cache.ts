import { redisClient } from '../config/redis';

const DEFAULT_TTL = 300; // 5 minutes

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function setCache(key: string, value: unknown, ttl = DEFAULT_TTL): Promise<void> {
  try {
    await redisClient.setex(key, ttl, JSON.stringify(value));
  } catch {
    // Silently fail — cache is best-effort
  }
}

export async function invalidateCache(pattern: string): Promise<void> {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  } catch {
    // Silently fail
  }
}
