/**
 * =============================================================================
 * OfflineBanner — Bandeau mode hors-ligne
 * =============================================================================
 * Banner fixe en haut de page quand !navigator.onLine.
 * Disparait avec animation au retour online.
 * =============================================================================
 */

import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [visible, setVisible] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Laisse le banner visible 2 secondes puis le cache
      setTimeout(() => setVisible(false), 2000);
    };
    const handleOffline = () => {
      setIsOffline(true);
      setVisible(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 transition-all duration-500',
        isOffline ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      )}
    >
      <WifiOff className="w-4 h-4" />
      <span>Mode hors-ligne — vos modifications seront synchronisees automatiquement</span>
    </div>
  );
}
