/**
 * =============================================================================
 * useNetworkStatus — Detection de la connexion reseau
 * =============================================================================
 * Hook qui retourne l'etat de la connexion (online/offline) et ecoute les
 * evenements du navigateur.
 * =============================================================================
 */

import { useState, useEffect } from 'react';

export function useNetworkStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
