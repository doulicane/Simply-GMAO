/**
 * =============================================================================
 * ErrorState — Etat d'erreur
 * =============================================================================
 * Affiche un message d'erreur avec icone, message detaille et bouton retry.
 * =============================================================================
 */

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Une erreur est survenue',
  message = 'Impossible de charger les donnees. Veuillez reessayer.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center p-8', className)}>
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Reessayer
        </Button>
      )}
    </div>
  );
}
