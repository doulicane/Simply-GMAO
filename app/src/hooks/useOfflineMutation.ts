/**
 * =============================================================================
 * useOfflineMutation — Wrapper TanStack Query avec fallback offline
 * =============================================================================
 * Si le navigateur est offline, la mutation est mise en file d'attente
 * IndexedDB au lieu d'echouer. Synchro automatique au retour online.
 * =============================================================================
 */

import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { useSync } from './useSync';
import { toast } from 'sonner';

interface OfflineMutationConfig {
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  entityType: string;
}

export function useOfflineMutation<TData = unknown, TError = unknown, TVariables = void, TContext = unknown>(
  config: OfflineMutationConfig,
  options?: UseMutationOptions<TData, TError, TVariables, TContext>
) {
  const { isOnline, queueChange } = useSync();
  const qc = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: async (variables: TVariables) => {
      if (!isOnline) {
        // Queue offline
        await queueChange({
          endpoint: config.endpoint,
          method: config.method,
          payload: variables as any,
          entityType: config.entityType,
        });
        throw new Error('OFFLINE_QUEUED');
      }
      // Appel normal si online
      if (options?.mutationFn) {
        return options.mutationFn(variables);
      }
      throw new Error('mutationFn requis');
    },
    onSuccess: (data, variables, context) => {
      options?.onSuccess?.(data, variables, context);
    },
    onError: (err, variables, context) => {
      if ((err as any)?.message === 'OFFLINE_QUEUED') {
        // Ne pas afficher d'erreur, c'est volontaire
        return;
      }
      toast.error((err as any)?.message || 'Erreur');
      options?.onError?.(err, variables, context);
    },
  });
}
