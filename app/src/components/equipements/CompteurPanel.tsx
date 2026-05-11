import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Plus, Trash2, Loader2 } from 'lucide-react';
import { useCompteurReleves, useCreateCompteurReleve, useDeleteCompteurReleve } from '@/hooks/useCompteurReleves';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props {
  equipmentId: string;
  compteurActuel?: number | null;
  unite?: string | null;
}

export function CompteurPanel({ equipmentId, compteurActuel, unite }: Props) {
  const { data, isLoading } = useCompteurReleves(equipmentId);
  const create = useCreateCompteurReleve();
  const remove = useDeleteCompteurReleve();
  const [formOpen, setFormOpen] = useState(false);
  const [valeur, setValeur] = useState('');
  const [commentaire, setCommentaire] = useState('');

  const releves = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-accent-teal" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Compteur actuel */}
      <div className="rounded-lg border border-[rgba(90,94,117,0.2)] bg-bg-elevated p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-accent-teal" />
          <div>
            <p className="text-xs text-text-secondary uppercase">Compteur actuel</p>
            <p className="text-xl font-bold text-text-primary tabular-nums">
              {compteurActuel?.toLocaleString('fr-FR') ?? '—'} {unite ?? ''}
            </p>
          </div>
        </div>
        <Button size="sm" onClick={() => setFormOpen((v) => !v)}>
          <Plus className="w-4 h-4 mr-1" /> Relevé
        </Button>
      </div>

      {/* Formulaire */}
      <AnimatePresence>
        {formOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-lg border border-[rgba(90,94,117,0.2)] bg-bg-elevated p-4 space-y-3">
              <h4 className="text-sm font-semibold text-text-primary">Nouveau relevé</h4>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Valeur"
                  value={valeur}
                  onChange={(e) => setValeur(e.target.value)}
                />
                <Input
                  placeholder="Commentaire (optionnel)"
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    const v = parseFloat(valeur);
                    if (Number.isNaN(v)) return;
                    create.mutate({ equipmentId, valeur: v, commentaire: commentaire || undefined }, {
                      onSuccess: () => {
                        setValeur('');
                        setCommentaire('');
                        setFormOpen(false);
                      }
                    });
                  }}
                  disabled={create.isPending}
                >
                  {create.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setFormOpen(false)}>Annuler</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Historique */}
      <div className="flex flex-col gap-1">
        {releves.length === 0 ? (
          <p className="text-sm text-text-muted py-4 text-center">Aucun relevé enregistré</p>
        ) : (
          releves.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between px-4 py-3 rounded-lg border border-[rgba(90,94,117,0.1)] bg-bg-primary hover:bg-bg-hover transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-text-primary tabular-nums">
                  {Number(r.valeur).toLocaleString('fr-FR')} {unite ?? ''}
                </p>
                <p className="text-xs text-text-muted">
                  {new Date(r.dateReleve).toLocaleDateString('fr-FR')} — {r.utilisateur?.firstName} {r.utilisateur?.lastName}
                </p>
                {r.commentaire && <p className="text-xs text-text-secondary mt-0.5">{r.commentaire}</p>}
              </div>
              <button
                className="p-1.5 rounded-md hover:bg-bg-hover text-text-muted hover:text-status-critical"
                onClick={() => remove.mutate({ id: r.id, equipmentId })}
                disabled={remove.isPending}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
