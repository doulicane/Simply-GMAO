/**
 * =============================================================================
 * Configuration Prisma — Singleton Client
 * =============================================================================
 * Garantit une unique instance du PrismaClient dans l'application.
 * En mode developpement, hot-reload de nodemon peut creer plusieurs instances :
 * on stocke le client dans `globalThis` pour le reutiliser.
 * =============================================================================
 */

import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// Serialiser les Decimal Prisma en nombre (au lieu d'objet) pour l'API JSON
Decimal.prototype.toJSON = function () {
  return this.toNumber();
};

// ---------------------------------------------------------------------------
// Type extension pour stocker prisma dans globalThis
// ---------------------------------------------------------------------------
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// ---------------------------------------------------------------------------
// Singleton : cree le client une seule fois
// ---------------------------------------------------------------------------
export const prisma: PrismaClient = globalThis.prisma ?? new PrismaClient({
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'info', 'warn', 'error']
      : ['error'],
});

// En mode dev, stocker dans globalThis pour eviter duplication HMR
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// ---------------------------------------------------------------------------
// Graceful shutdown : deconnexion propre de Prisma
// ---------------------------------------------------------------------------
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  console.log('[DB] Deconnexion Prisma effectuee');
}
