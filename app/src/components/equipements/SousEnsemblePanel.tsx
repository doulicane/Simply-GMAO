import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, ChevronRight, ChevronDown, Plus, Trash2, Pencil, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSousEnsembles, useCreateSousEnsemble, useDeleteSousEnsemble } from '@/hooks/useSousEnsembles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props {
  equipmentId: string;
}

export function SousEnsemblePanel({ equipmentId }: Props) {
  const { data, isLoading } = useSousEnsembles(equipmentId);
  const create = useCreateSousEnsemble();
  const remove = useDeleteSousEnsemble();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', description: '' });

  const sousEnsembles = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-accent-teal" />
      </div>
    );
  }

  if (sousEnsembles.length === 0 && !formOpen) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-text-muted">
        <GitBranch className="w-10 h-10 mb-3" />
        <p className="text-sm mb-4">Aucun sous-ensemble enregistré</p>
        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Plus className="w-4 h-4 mr-1" /> Ajouter
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {!formOpen ? (
        <Button size="sm" className="self-start" onClick={() => setFormOpen(true)}>
          <Plus className="w-4 h-4 mr-1" /> Ajouter un sous-ensemble
        </Button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-[rgba(90,94,117,0.2)] bg-bg-elevated p-4 space-y-3"
        >
          <h4 className="text-sm font-semibold text-text-primary">Nouveau sous-ensemble</h4>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            <Input placeholder="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <Input placeholder="Description (optionnel)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                if (!form.code || !form.name) return;
                create.mutate({ equipmentId, code: form.code, name: form.name, description: form.description || undefined, statut: 'EN_SERVICE', active: true }, {
                  onSuccess: () => {
                    setForm({ code: '', name: '', description: '' });
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
        </motion.div>
      )}

      <div className="flex flex-col gap-1">
        {sousEnsembles.map((sub) => {
          const isExpanded = expanded.has(sub.id);
          return (
            <div key={sub.id} className="rounded-lg border border-[rgba(90,94,117,0.15)] bg-bg-primary overflow-hidden">
              <button
                onClick={() => {
                  const next = new Set(expanded);
                  if (next.has(sub.id)) next.delete(sub.id);
                  else next.add(sub.id);
                  setExpanded(next);
                }}
                className="flex items-center gap-2 w-full px-4 py-3 hover:bg-bg-hover transition-colors"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
                <span className="text-sm font-medium text-text-primary">{sub.name}</span>
                <span className="text-xs text-text-muted ml-1">({sub.code})</span>
                <span className={cn(
                  'ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded',
                  sub.statut === 'EN_SERVICE' ? 'bg-status-ok/15 text-status-ok' :
                  sub.statut === 'EN_MAINTENANCE' ? 'bg-status-warning/15 text-status-warning' :
                  'bg-status-critical/15 text-status-critical'
                )}>
                  {sub.statut}
                </span>
              </button>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 py-3 border-t border-[rgba(90,94,117,0.1)] space-y-2">
                      {sub.description && <p className="text-sm text-text-secondary">{sub.description}</p>}
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 rounded-md hover:bg-bg-hover text-text-muted hover:text-text-primary">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="p-1.5 rounded-md hover:bg-bg-hover text-text-muted hover:text-status-critical"
                          onClick={() => remove.mutate({ id: sub.id, equipmentId })}
                          disabled={remove.isPending}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
