/**
 * =============================================================================
 * ChecklistExecutor — Exécution d'une checklist sur un BT préventif
 * =============================================================================
 * Affiche les items de checklist et permet au technicien de les remplir.
 * =============================================================================
 */

import { useState } from 'react';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ChecklistItem } from '@/hooks/useChecklists';

interface ChecklistExecutorProps {
  items: ChecklistItem[];
  onSubmit: (results: Record<string, string | boolean | number>) => void;
  readOnly?: boolean;
  initialValues?: Record<string, string | boolean | number>;
}

export function ChecklistExecutor({ items, onSubmit, readOnly, initialValues }: ChecklistExecutorProps) {
  const [values, setValues] = useState<Record<string, string | boolean | number>>(initialValues ?? {});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const handleChange = (label: string, value: string | boolean | number) => {
    setValues((prev) => ({ ...prev, [label]: value }));
    setTouched((prev) => new Set(prev).add(label));
  };

  const allRequiredFilled = items
    .filter((i) => i.required)
    .every((i) => {
      const v = values[i.label];
      return v !== undefined && v !== '' && v !== false;
    });

  const missingRequired = items.filter((i) => i.required && !values[i.label]);

  return (
    <div className="space-y-4">
      {items.map((item, idx) => {
        const value = values[item.label];
        const isMissing = item.required && !value && touched.has(item.label);

        return (
          <div
            key={item.label}
            className={cn(
              'p-3 rounded-lg border transition-colors',
              isMissing ? 'border-red-300 bg-red-50/50 dark:bg-red-950/20' : 'border-border bg-card'
            )}
          >
            <div className="flex items-start gap-2">
              {item.required ? (
                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {item.label}
                  {item.required && <span className="text-red-500 ml-0.5">*</span>}
                </p>

                {readOnly ? (
                  <p className="text-sm text-muted-foreground mt-1">
                    {String(value ?? '—')}
                  </p>
                ) : (
                  <div className="mt-2">
                    {item.type === 'checkbox' && (
                      <button
                        onClick={() => handleChange(item.label, !value)}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors',
                          value
                            ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-background border-input hover:bg-accent'
                        )}
                      >
                        {value ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                        {value ? 'OK' : 'A cocher'}
                      </button>
                    )}

                    {item.type === 'text' && (
                      <input
                        type="text"
                        value={String(value ?? '')}
                        onChange={(e) => handleChange(item.label, e.target.value)}
                        className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Saisir..."
                      />
                    )}

                    {item.type === 'number' && (
                      <input
                        type="number"
                        value={String(value ?? '')}
                        onChange={(e) => handleChange(item.label, Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="0"
                      />
                    )}

                    {item.type === 'select' && item.options && (
                      <select
                        value={String(value ?? '')}
                        onChange={(e) => handleChange(item.label, e.target.value)}
                        className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Choisir...</option>
                        {item.options.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {!readOnly && (
        <div className="flex items-center justify-between pt-2">
          {missingRequired.length > 0 && (
            <p className="text-xs text-red-500">
              {missingRequired.length} champ(s) obligatoire(s) manquant(s)
            </p>
          )}
          <Button
            onClick={() => onSubmit(values)}
            disabled={!allRequiredFilled}
            className="ml-auto"
          >
            Valider la checklist
          </Button>
        </div>
      )}
    </div>
  );
}
