/**
 * =============================================================================
 * Configuration Prisma — Singleton Client avec Audit Trail
 * =============================================================================
 * Garantit une unique instance du PrismaClient dans l'application.
 * En mode developpement, hot-reload de nodemon peut creer plusieurs instances :
 * on stocke le client dans `globalThis` pour le reutiliser.
 *
 * Extension Prisma ($extends) :
 *   - Logue automatiquement CREATE, UPDATE, DELETE dans la table audit_logs
 *   - Recupere le userId et IP depuis l'AsyncLocalStorage (asyncContext)
 * =============================================================================
 */

import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { env } from './env';
import { getContext } from '../utils/asyncContext';

// Serialiser les Decimal Prisma en nombre (au lieu d'objet) pour l'API JSON
(Decimal.prototype as any).toJSON = function () {
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
const basePrisma = globalThis.prisma ?? new PrismaClient({
  log:
    env.NODE_ENV === 'development'
      ? ['query', 'info', 'warn', 'error']
      : ['error'],
});

// En mode dev, stocker dans globalThis pour eviter duplication HMR
if (env.NODE_ENV !== 'production') {
  globalThis.prisma = basePrisma;
}

// ---------------------------------------------------------------------------
// Extension Prisma — Audit Trail automatique
// ---------------------------------------------------------------------------
const AUDIT_MODELS = new Set([
  'User',
  'Equipment',
  'WorkOrder',
  'StockItem',
  'Document',
  'PreventivePlan',
  'Ticket',
]);

export const prisma = basePrisma.$extends({
  query: {
    async $allOperations({ operation, model, args, query }) {
      const result = await query(args);

      // Ignorer les operations sur AuditLog pour eviter la recursion infinie
      if (model === 'AuditLog') return result;

      // Ignorer les models non audites
      if (!model || !AUDIT_MODELS.has(model)) return result;

      // Ignorer les lectures
      if (!['create', 'update', 'upsert', 'delete', 'deleteMany', 'updateMany'].includes(operation)) {
        return result;
      }

      const ctx = getContext();
      const actionMap: Record<string, string> = {
        create: 'CREATE',
        update: 'UPDATE',
        upsert: 'UPDATE',
        delete: 'DELETE',
        deleteMany: 'DELETE',
        updateMany: 'UPDATE',
      };

      try {
        // Recuperer l'ID de l'entite affectee
        let entityId: string | undefined;
        if (result && typeof result === 'object') {
          if ('id' in result) entityId = (result as any).id;
        }
        if (!entityId && args && typeof args === 'object' && 'where' in args) {
          const where = (args as any).where;
          if (where && typeof where === 'object' && 'id' in where) {
            entityId = where.id;
          }
        }

        // Construire oldValues / newValues
        let oldValues: any = null;
        let newValues: any = null;

        if (operation === 'update' || operation === 'upsert') {
          newValues = (args as any).data ?? null;
        } else if (operation === 'create') {
          newValues = result ?? null;
        } else if (operation === 'delete') {
          oldValues = result ?? null;
        }

        await basePrisma.auditLog.create({
          data: {
            userId: ctx?.userId ?? null,
            action: actionMap[operation] ?? operation.toUpperCase(),
            entityType: model,
            entityId: entityId ?? 'unknown',
            details: {
              oldValues: oldValues ? sanitizeForJson(oldValues) : undefined,
              newValues: newValues ? sanitizeForJson(newValues) : undefined,
              ipAddress: ctx?.ipAddress,
            } as any,
            ipAddress: ctx?.ipAddress ?? null,
          },
        });
      } catch (err: any) {
        // Silencieux — on ne veut pas planter une requete si l'audit echoue
        console.error('[Audit] Erreur ecriture audit log :', err.message);
      }

      return result;
    },
  },
});

// ---------------------------------------------------------------------------
// Helper : nettoyer les objets pour le JSON (retirer les champs sensibles)
// ---------------------------------------------------------------------------
function sanitizeForJson(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  const cleaned: any = Array.isArray(obj) ? [] : {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === 'password') continue; // Ne jamais logger les mots de passe
    if (value instanceof Date) {
      cleaned[key] = value.toISOString();
    } else if (typeof value === 'object' && value !== null) {
      cleaned[key] = sanitizeForJson(value);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

// ---------------------------------------------------------------------------
// Graceful shutdown : deconnexion propre de Prisma
// ---------------------------------------------------------------------------
// Type du client Prisma etendu (pour les fonctions qui l'acceptent en parametre)
export type PrismaClientInstance = typeof prisma;

export async function disconnectDatabase(): Promise<void> {
  await basePrisma.$disconnect();
  console.log('[DB] Deconnexion Prisma effectuee');
}
