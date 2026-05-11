/**
 * =============================================================================
 * AtexBlock — Bloc securite ATEX sur BT
 * =============================================================================
 */

import { useState } from 'react';
import { Shield, CheckCircle2, Circle, Lock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAtexBlock, useUpdateAtex, useSignAtex } from '@/hooks/useAtex';
import { cn } from '@/lib/utils';

interface AtexBlockProps {
  workOrderId: string;
  readOnly?: boolean;
}

const CHECKS = [
  { key: 'consignationEffectuee', label: 'Consignation effectuee' },
  { key: 'permisDeFeu', label: 'Permis de feu delivre' },
  { key: 'outillageEx', label: 'Outillage ATEX (Ex) verifie' },
  { key: 'nettoyageRealise', label: 'Nettoyage pre-intervention realise' },
  { key: 'depressionRealise', label: 'Mise en depression / ventilation realisee' },
] as const;

export function AtexBlock({ workOrderId, readOnly }: AtexBlockProps) {
  const { data: atex, isLoading } = useAtexBlock(workOrderId);
  const update = useUpdateAtex();
  const sign = useSignAtex();
  const [password, setPassword] = useState('');
  const [showSign, setShowSign] = useState(false);

  if (isLoading) return <p className="text-sm text-muted-foreground">Chargement ATEX...</p>;

  const allChecked = CHECKS.every((c) => atex?.[c.key as keyof typeof atex]);
  const isSigned = !!atex?.inspecteurAtexSigneAt;

  return (
    <div className="rounded-xl border bg-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5 text-amber-500" />
        <h3 className="font-semibold">Bloc securite ATEX</h3>
        {isSigned && <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />}
      </div>

      <div className="space-y-2">
        {CHECKS.map((check) => {
          const checked = !!atex?.[check.key as keyof typeof atex];
          return (
            <button
              key={check.key}
              disabled={readOnly || isSigned}
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
                (readOnly || isSigned) && 'opacity-70 cursor-default'
              )}
            >
              {checked ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <Circle className="w-4 h-4 flex-shrink-0" />}
              {check.label}
            </button>
          );
        })}
      </div>

      {atex?.commentaireAtex && (
        <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
          {atex.commentaireAtex}
        </p>
      )}

      {!readOnly && (
        <div className="pt-2 border-t">
          {isSigned ? (
            <p className="text-sm text-green-600 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Signe le {new Date(atex.inspecteurAtexSigneAt!).toLocaleString('fr-FR')}
            </p>
          ) : allChecked ? (
            <div className="space-y-2">
              {!showSign ? (
                <Button size="sm" onClick={() => setShowSign(true)} className="w-full">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Signer la conformite ATEX
                </Button>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mot de passe inspecteur"
                    className="flex-1 px-3 py-2 rounded-md border bg-background text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      sign.mutate({ id: workOrderId, password });
                      setPassword('');
                      setShowSign(false);
                    }}
                    disabled={!password || sign.isPending}
                  >
                    Signer
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-amber-600">
              Cochez toutes les cases pour activer la signature.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
