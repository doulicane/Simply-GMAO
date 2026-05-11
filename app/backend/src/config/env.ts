/**
 * =============================================================================
 * Configuration & Validation des variables d'environnement
 * =============================================================================
 * Centralise toutes les variables d'env avec validation Zod au demarrage.
 * Lance une erreur fatale explicative si une variable obligatoire est manquante
 * ou invalide.
 * =============================================================================
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Schema de validation des variables d'environnement
// ---------------------------------------------------------------------------
const envSchema = z.object({
  // --- Obligatoires ---
  DATABASE_URL: z.string().min(1, 'DATABASE_URL est requise').refine(
    (val) => val.startsWith('postgresql://'),
    { message: 'DATABASE_URL doit commencer par postgresql://' }
  ),
  REDIS_URL: z.string().min(1, 'REDIS_URL est requise').refine(
    (val) => val.startsWith('redis://'),
    { message: 'REDIS_URL doit commencer par redis://' }
  ),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET doit faire au moins 32 caracteres'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().min(1).max(65535).default(3000),

  // --- Optionnelles avec defaults ---
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  UPLOAD_DIR: z.string().default('./uploads'),
  RATE_LIMIT_MAX: z.coerce.number().min(1).default(500),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
  JWT_ACCESS_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),
  MAX_FILE_SIZE: z.coerce.number().default(20 * 1024 * 1024),
  PREVENTIVE_CRON: z.string().default('0 * * * *'),
  PREVENTIVE_ALERT_CRON: z.string().default('0 7 * * *'),
  PREVENTIVE_ALERT_DAYS: z.coerce.number().default(3),
  BACKUP_CRON: z.string().default('0 2 * * *'),
  BACKUP_DIR: z.string().default('/backups'),
  STOCK_ALERT_CRON: z.string().default('0 8 * * *'),
});

// ---------------------------------------------------------------------------
// Parsing avec gestion d'erreur explicative
// ---------------------------------------------------------------------------
function parseEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.issues.map(
      (issue) => `  - ${issue.path.join('.')}: ${issue.message}`
    );

    console.error('\n=============================================================');
    console.error('  ERREUR DE CONFIGURATION — Variables d\'environnement invalides');
    console.error('=============================================================\n');
    console.error(errors.join('\n'));
    console.error('\n-------------------------------------------------------------');
    console.error('  Veuillez verifier votre fichier .env ou les variables systeme.');
    console.error('=============================================================\n');
    process.exit(1);
  }

  return result.data;
}

// ---------------------------------------------------------------------------
// Export de la configuration typee
// ---------------------------------------------------------------------------
export const env = parseEnv();

export type Env = typeof env;
