/**
 * =============================================================================
 * StockAlertBadge — Indicateur d'alerte stock temps reel
 * =============================================================================
 * Ecoute les evenements WebSocket `stock:alert` et affiche un badge avec
 * le nombre d'articles sous seuil.
 * =============================================================================
 */

import { useEffect, useState } from 'react';
import { PackageAlert } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

interface StockAlertItem {
  id: string;
  code: string;
  name: string;
  quantite: number;
  stockMinimum: number;
}

export function StockAlertBadge() {
  const { notifications } = useNotifications();
  const [alerts, setAlerts] = useState<StockAlertItem[]>([]);

  useEffect(() => {
    const stockAlerts = notifications
      .filter((n) => n.type === 'warning' && n.title.includes('stock'))
      .flatMap((n) => (n as any).items ?? []);
    if (stockAlerts.length > 0) {
      setAlerts(stockAlerts);
    }
  }, [notifications]);

  if (alerts.length === 0) return null;

  return (
    <div className="relative inline-flex items-center">
      <PackageAlert className="w-5 h-5 text-amber-500" />
      <span
        className={cn(
          'absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[10px] font-bold rounded-full min-w-[1.1rem] h-[1.1rem] flex items-center justify-center'
        )}
      >
        {alerts.length > 9 ? '9+' : alerts.length}
      </span>
    </div>
  );
}
