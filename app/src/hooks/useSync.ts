/**
 * =============================================================================
 * useSync — Gestionnaire de synchronisation offline-first
 * =============================================================================
 * Detecte la connexion/deconnexion reseau, stocke les mutations en attente
 * dans IndexedDB, et les envoie en FIFO au retour online.
 * =============================================================================
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useNetworkStatus } from './useNetworkStatus';
import {
  getPendingChanges,
  markChangeSynced,
  markChangeFailed,
  queuePendingChange,
} from '@/lib/db';
import { API_URL } from '@/lib/config';

export type SyncStatus = 'syncing' | 'synced' | 'pending';

export function useSync() {
  const isOnline = useNetworkStatus();
  const [status, setStatus] = useState<SyncStatus>('synced');
  const [pendingCount, setPendingCount] = useState(0);
  const syncingRef = useRef(false);

  // Mettre a jour le compteur de pending
  const refreshPendingCount = useCallback(async () => {
    const pending = await getPendingChanges();
    setPendingCount(pending.length);
    setStatus(pending.length > 0 ? 'pending' : 'synced');
  }, []);

  useEffect(() => {
    refreshPendingCount();
  }, [refreshPendingCount]);

  // Synchroniser au retour online
  useEffect(() => {
    if (!isOnline) {
      setStatus((prev) => (prev === 'pending' ? 'pending' : 'synced'));
      return;
    }

    async function syncPending() {
      if (syncingRef.current) return;
      syncingRef.current = true;
      setStatus('syncing');

      try {
        const pending = await getPendingChanges();
        if (pending.length === 0) {
          setStatus('synced');
          syncingRef.current = false;
          return;
        }

        let successCount = 0;
        let failCount = 0;

        for (const change of pending) {
          try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${API_URL}${change.endpoint}`, {
              method: change.method,
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: change.method !== 'DELETE' ? JSON.stringify(change.payload) : undefined,
            });

            if (res.ok) {
              await markChangeSynced(change.id!);
              successCount++;
            } else {
              await markChangeFailed(change.id!, `HTTP ${res.status}`);
              failCount++;
            }
          } catch (err: any) {
            await markChangeFailed(change.id!, err.message);
            failCount++;
          }
        }

        await refreshPendingCount();

        if (successCount > 0) {
          toast.success(`${successCount} modification(s) synchronisee(s)`);
        }
        if (failCount > 0) {
          toast.error(`${failCount} modification(s) en echec`);
        }
      } catch {
        // ignore
      } finally {
        syncingRef.current = false;
      }
    }

    syncPending();
  }, [isOnline, refreshPendingCount]);

  const queueChange = useCallback(
    async (change: Parameters<typeof queuePendingChange>[0]) => {
      await queuePendingChange(change);
      await refreshPendingCount();
      if (!isOnline) {
        toast.info('Modification enregistree localement. Synchronisation au retour de la connexion.');
      }
    },
    [isOnline, refreshPendingCount]
  );

  const syncNow = useCallback(async () => {
    if (!isOnline) {
      toast.warning('Pas de connexion Internet');
      return;
    }
    // Trigger le sync manuellement
    setStatus('syncing');
    const event = new Event('online');
    window.dispatchEvent(event);
  }, [isOnline]);

  return {
    isOnline,
    status,
    pendingCount,
    queueChange,
    syncNow,
    refreshPendingCount,
  };
}
