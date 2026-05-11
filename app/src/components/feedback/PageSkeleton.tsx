/**
 * =============================================================================
 * PageSkeleton — Etat de chargement avec effet shimmer
 * =============================================================================
 * Fallback pour React.Suspense lors du lazy loading des pages.
 * Variantes disponibles : dashboard, table, form, detail
 * =============================================================================
 */

import { cn } from '@/lib/utils';

interface SkeletonBlockProps {
  className?: string;
}

function SkeletonBlock({ className }: SkeletonBlockProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className
      )}
    />
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <SkeletonBlock className="h-4 w-1/3 mb-4" />
      <SkeletonBlock className="h-8 w-2/3 mb-2" />
      <SkeletonBlock className="h-3 w-full" />
    </div>
  );
}

function SkeletonTableRow({ cols = 4 }: { cols?: number }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b">
      {Array.from({ length: cols }).map((_, i) => (
        <SkeletonBlock key={i} className={cn('h-4', i === 0 ? 'w-12' : 'flex-1')} />
      ))}
    </div>
  );
}

interface PageSkeletonProps {
  variant?: 'dashboard' | 'table' | 'form' | 'detail';
}

export function PageSkeleton({ variant = 'dashboard' }: PageSkeletonProps) {
  if (variant === 'table') {
    return (
      <div className="space-y-4 p-4 animate-in fade-in duration-300">
        <SkeletonBlock className="h-8 w-48 mb-6" />
        <div className="rounded-lg border bg-card">
          <div className="flex items-center gap-4 p-4 border-b bg-muted/30">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBlock key={i} className={cn('h-4', i === 0 ? 'w-12' : 'flex-1')} />
            ))}
          </div>
          <div className="p-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonTableRow key={i} cols={4} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'form') {
    return (
      <div className="space-y-6 p-4 max-w-2xl mx-auto animate-in fade-in duration-300">
        <SkeletonBlock className="h-8 w-48 mb-6" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-10 w-full" />
          </div>
        ))}
        <SkeletonBlock className="h-10 w-32 mt-4" />
      </div>
    );
  }

  if (variant === 'detail') {
    return (
      <div className="space-y-6 p-4 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <SkeletonBlock className="h-8 w-64" />
          <SkeletonBlock className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Dashboard par defaut
  return (
    <div className="space-y-6 p-4 animate-in fade-in duration-300">
      <SkeletonBlock className="h-8 w-64" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-lg border bg-card p-4 shadow-sm">
          <SkeletonBlock className="h-4 w-1/4 mb-4" />
          <SkeletonBlock className="h-64 w-full" />
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <SkeletonBlock className="h-4 w-1/3 mb-4" />
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-3 w-full mb-3" />
          ))}
        </div>
      </div>
    </div>
  );
}
