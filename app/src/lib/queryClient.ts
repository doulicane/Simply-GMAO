/**
 * =============================================================================
 * TanStack Query — Configuration du QueryClient
 * =============================================================================
 * Client global pour la gestion du cache, du retry et du refetch.
 * =============================================================================
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});
