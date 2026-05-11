/**
 * =============================================================================
 * AsyncLocalStorage — Contexte de requete HTTP
 * =============================================================================
 * Stocke le contexte de la requete courante (utilisateur authentifie, IP)
 * pour le rendre accessible dans Prisma $extends ou autres callbacks async.
 *
 * Usage dans un middleware Express :
 *   asyncContext.run({ userId, ipAddress }, () => next());
 *
 * Usage dans Prisma $extends :
 *   const ctx = asyncContext.getStore();
 *   if (ctx) { ... }
 * =============================================================================
 */

import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
  userId?: string;
  ipAddress?: string;
}

export const asyncContext = new AsyncLocalStorage<RequestContext>();

/**
 * Helper : executer un callback dans un contexte de requete
 */
export function runWithContext<T>(context: RequestContext, callback: () => T): T {
  return asyncContext.run(context, callback);
}

/**
 * Helper : recuperer le contexte courant
 */
export function getContext(): RequestContext | undefined {
  return asyncContext.getStore();
}
