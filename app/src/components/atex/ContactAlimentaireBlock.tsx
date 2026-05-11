/**
 * =============================================================================
 * ContactAlimentaireBlock — Bloc contact alimentaire sur BT
 * =============================================================================
 */

import { CheckCircle2, Circle, Utensils } from 'lucide-react';
import { useContactAlimBlock, useUpdateContactAlim } from '@/hooks/useAtex';
import { cn } from '@/lib/utils';

interface ContactAlimentaireBlockProps {
  workOrderId: string;
  readOnly?: boolean;
}

const CHECKS = [
  { key: 'nettoyageRealise', label: 'Nettoyage post-intervention realise' },
  { key: 'rincageRealise', label: 'Rincage a l\'eau potable realise' },
] as const;

export function ContactAlimentaireBlock({ workOrderId, readOnly }: ContactAlimentaireBlockProps) {
  const { data: ca, isLoading } = useContactAlimBlock(workOrderId);
  const update = useUpdateContactAlim();

  if (isLoading) return <p className="text-sm text-muted-foreground">Chargement...</p>;

  return (
    <div className="rounded-xl border bg-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Utensils className="w-5 h-5 text-blue-500" />
        <h3 className="font-semibold">Contact alimentaire</h3>
      </div>

      <div className="space-y-2">
        {CHECKS.map((check) => {
          const checked = !!ca?.[check.key as keyof typeof ca];
          return (
            <button
              key={check.key}
              disabled={readOnly}
              onClick={() =>
                update.mutate({
                  id: workOrderId,
                  data: { [check.key]: !checked },
                })
              }
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-sm transition-colors text-left',
                checked
                  ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-background border-input hover:bg-accent',
                readOnly && 'opacity-70 cursor-default'
              )}
            >
              {checked ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <Circle className="w-4 h-4 flex-shrink-0" />}
              {check.label}
            </button>
          );
        })}
      </div>

      {!readOnly && (
        <div className="space-y-2">
          <input
            type="text"
            value={ca?.produitsUtilises ?? ''}
            onChange={(e) => update.mutate({ id: workOrderId, data: { produitsUtilises: e.target.value } })}
            placeholder="Produits de nettoyage utilises"
            className="w-full px-3 py-2 rounded-md border bg-background text-sm"
          />
          <textarea
            value={ca?.commentaire ?? ''}
            onChange={(e) => update.mutate({ id: workOrderId, data: { commentaire: e.target.value } })}
            placeholder="Commentaire"
            rows={2}
            className="w-full px-3 py-2 rounded-md border bg-background text-sm resize-none"
          />
        </div>
      )}
    </div>
  );
}
