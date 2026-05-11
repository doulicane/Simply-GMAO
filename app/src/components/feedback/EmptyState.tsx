/**
 * =============================================================================
 * EmptyState — Etat vide
 * =============================================================================
 * Affiche un message d'etat vide avec illustration, titre, description et CTA.
 * Variantes : aucune donnee, recherche sans resultat, erreur de chargement,
 * offline sans cache.
 * =============================================================================
 */

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Inbox,
  SearchX,
  WifiOff,
  AlertTriangle,
  type LucideIcon,
} from 'lucide-react';

export type EmptyVariant = 'empty' | 'search' | 'error' | 'offline';

interface EmptyStateProps {
  variant?: EmptyVariant;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const VARIANT_CONFIG: Record<EmptyVariant, { icon: LucideIcon; defaultTitle: string; defaultDesc: string }> = {
  empty: {
    icon: Inbox,
    defaultTitle: 'Aucune donnee',
    defaultDesc: 'Il n\'y a encore rien a afficher ici.',
  },
  search: {
    icon: SearchX,
    defaultTitle: 'Aucun resultat',
    defaultDesc: 'Votre recherche ne correspond a aucun element.',
  },
  error: {
    icon: AlertTriangle,
    defaultTitle: 'Erreur de chargement',
    defaultDesc: 'Impossible de charger les donnees. Veuillez reessayer.',
  },
  offline: {
    icon: WifiOff,
    defaultTitle: 'Mode hors-ligne',
    defaultDesc: 'Aucune donnee en cache. Connectez-vous a Internet pour charger.',
  },
};

export function EmptyState({
  variant = 'empty',
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  const config = VARIANT_CONFIG[variant];
  const Icon = config.icon;

  return (
    <div className={cn('flex flex-col items-center justify-center text-center p-8', className)}>
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">
        {title ?? config.defaultTitle}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">
        {description ?? config.defaultDesc}
      </p>
      {onAction && actionLabel && (
        <Button onClick={onAction} variant="outline" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
