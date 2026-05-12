import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CheckCircle, ArrowDownLeft, ArrowUpRight, SlidersHorizontal } from 'lucide-react';
import { useStockItems, useCreateStockMovement } from '@/hooks/useStock';
import type { StockItem } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  preselectedItem?: StockItem | null;
  defaultType?: 'ENTREE' | 'SORTIE' | 'AJUSTEMENT';
}

const TYPE_OPTIONS = [
  { key: 'ENTREE' as const, label: 'Entrée', icon: ArrowDownLeft, color: 'text-status-ok' },
  { key: 'SORTIE' as const, label: 'Sortie', icon: ArrowUpRight, color: 'text-status-critical' },
  { key: 'AJUSTEMENT' as const, label: 'Ajustement', icon: SlidersHorizontal, color: 'text-accent-teal' },
];

export function StockMovementModal({ open, onClose, preselectedItem, defaultType }: Props) {
  const { data: stockItems = [] } = useStockItems();
  const createMutation = useCreateStockMovement();
  const [itemId, setItemId] = useState(preselectedItem?.id ?? '');
  const [type, setType] = useState<'ENTREE' | 'SORTIE' | 'AJUSTEMENT'>(defaultType ?? 'ENTREE');
  const [quantite, setQuantite] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const selectedItem = useMemo(() => stockItems.find((i) => i.id === itemId) ?? null, [stockItems, itemId]);

  const reset = () => {
    setItemId(preselectedItem?.id ?? '');
    setType(defaultType ?? 'ENTREE');
    setQuantite('');
    setCommentaire('');
    setError('');
    setSuccess(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!itemId) return setError('Veuillez sélectionner un article');
    if (!quantite || Number(quantite) <= 0) return setError('La quantité doit être supérieure à 0');
    if (type === 'SORTIE' && selectedItem && Number(quantite) > selectedItem.quantity) {
      return setError(`Stock insuffisant. Disponible : ${selectedItem.quantity}`);
    }

    const ok = await createMutation.mutateAsync({
      stockItemId: itemId,
      type,
      quantite: Number(quantite),
      commentaire: commentaire.trim() || undefined,
    });
    if (ok) {
      setSuccess(true);
      setTimeout(() => handleClose(), 1200);
    } else {
      setError('Erreur lors de l\'enregistrement du mouvement');
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[100] bg-[rgba(10,11,20,0.75)] backdrop-blur-sm"
        onClick={handleClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 10 }}
        transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className="bg-bg-elevated border border-[rgba(90,94,117,0.3)] rounded-xl shadow-card-hover pointer-events-auto w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(90,94,117,0.2)]">
            <h3 className="text-base font-semibold text-text-primary">Nouveau mouvement</h3>
            <button onClick={handleClose} className="p-1 rounded-md hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {error && (
              <div className="flex items-center gap-2 text-sm text-status-critical bg-status-critical/10 border border-status-critical/20 rounded-lg px-3 py-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 text-sm text-status-ok bg-status-ok/10 border border-status-ok/20 rounded-lg px-3 py-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                Mouvement enregistré !
              </div>
            )}

            {/* Article */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary">Article <span className="text-status-critical">*</span></label>
              {preselectedItem ? (
                <div className="input-industrial w-full bg-bg-primary text-text-primary">
                  {preselectedItem.code} — {preselectedItem.name}
                </div>
              ) : (
                <select value={itemId} onChange={(e) => setItemId(e.target.value)} className="input-industrial w-full">
                  <option value="">Sélectionner un article...</option>
                  {stockItems.map((i) => (
                    <option key={i.id} value={i.id}>{i.code} — {i.name} (dispo: {i.quantity})</option>
                  ))}
                </select>
              )}
            </div>

            {/* Type */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary">Type de mouvement</label>
              <div className="grid grid-cols-3 gap-2">
                {TYPE_OPTIONS.map((t) => {
                  const active = type === t.key;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setType(t.key)}
                      className={`flex flex-col items-center gap-1 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                        active
                          ? 'border-accent-teal bg-accent-teal/10 text-accent-teal'
                          : 'border-[rgba(90,94,117,0.2)] bg-bg-primary text-text-secondary hover:text-text-primary hover:bg-bg-hover'
                      }`}
                    >
                      <t.icon className={`w-4 h-4 ${active ? t.color : ''}`} />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantité */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary">Quantité <span className="text-status-critical">*</span></label>
              <input
                type="number"
                min={1}
                value={quantite}
                onChange={(e) => setQuantite(e.target.value)}
                placeholder="1"
                className="input-industrial w-full"
                required
              />
              {selectedItem && (
                <p className="text-[11px] text-text-muted">Stock actuel : {selectedItem.quantity} {selectedItem.unit}</p>
              )}
            </div>

            {/* Commentaire */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary">Commentaire / Motif</label>
              <input
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                placeholder="Optionnel"
                className="input-industrial w-full"
              />
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[rgba(90,94,117,0.2)]">
            <button type="button" onClick={handleClose} className="btn-ghost h-9 px-4 text-sm">Annuler</button>
            <button
              onClick={handleSubmit}
              disabled={createMutation.isPending || success}
              className="btn-primary h-9 px-4 text-sm flex items-center gap-2"
            >
              {createMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
