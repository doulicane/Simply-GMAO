/**
 * =============================================================================
 * SyncStatusIndicator — Indicateur de synchronisation
 * =============================================================================
 * Petit indicateur dans la navbar (tourbillon quand sync en cours,
 * check quand a jour, warning quand pending).
 * =============================================================================
 */

import { useState } from 'react';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export type SyncStatus = 'syncing' | 'synced' | 'pending';

interface SyncStatusIndicatorProps {
  status: SyncStatus;
  pendingCount?: number;
  onSync?: () => void;
}

export function SyncStatusIndicator({ status, pendingCount = 0, onSync }: SyncStatusIndicatorProps) {
  const [open, setOpen] = useState(false);

  const icon =
    status === 'syncing' ? (
      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
    ) : status === 'pending' ? (
      <AlertCircle className="w-4 h-4 text-orange-500" />
    ) : (
      <Check className="w-4 h-4 text-green-500" />
    );

  const label =
    status === 'syncing' ? 'Synchronisation...' : status === 'pending' ? `${pendingCount} en attente` : 'A jour';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-accent transition-colors"
          title={label}
        >
          {icon}
          <span className="text-xs text-muted-foreground hidden sm:inline">{label}</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Etat de la synchronisation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              {icon}
            </div>
            <div>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">
                {status === 'syncing'
                  ? 'Envoi des modifications en cours...'
                  : status === 'pending'
                  ? `${pendingCount} modification(s) en attente de synchronisation`
                  : 'Toutes les donnees sont synchronisees'}
              </p>
            </div>
          </div>
          {status === 'pending' && onSync && (
            <Button onClick={onSync} className="w-full">
              <Loader2 className="w-4 h-4 mr-2" />
              Synchroniser maintenant
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
