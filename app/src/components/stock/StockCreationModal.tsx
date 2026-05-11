import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, AlertTriangle, CheckCircle } from 'lucide-react';
import { useStockStore } from '@/stores/stockStore';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function StockCreationModal({ open, onClose }: Props) {
  const { createItem } = useStockStore();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [famille, setFamille] = useState('');
  const [sousFamille, setSousFamille] = useState('');
  const [designation, setDesignation] = useState('');
  const [quantite, setQuantite] = useState('0');
  const [stockMinimum, setStockMinimum] = useState('');
  const [stockMaximum, setStockMaximum] = useState('');
  const [localisation, setLocalisation] = useState('');
  const [unite, setUnite] = useState('pc');
  const [prixUnitaire, setPrixUnitaire] = useState('');
  const [fournisseur, setFournisseur] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setCode('');
    setName('');
    setFamille('');
    setSousFamille('');
    setDesignation('');
    setQuantite('0');
    setStockMinimum('');
    setStockMaximum('');
    setLocalisation('');
    setUnite('pc');
    setPrixUnitaire('');
    setFournisseur('');
    setError('');
    setSuccess(false);
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!code.trim()) return setError('Le code est requis');
    if (!name.trim()) return setError('Le nom est requis');
    if (!famille.trim()) return setError('La famille est requise');
    if (!stockMinimum.trim()) return setError('Le stock minimum est requis');

    setLoading(true);
    const payload: Record<string, any> = {
      code: code.trim().toUpperCase(),
      name: name.trim(),
      famille: famille.trim(),
      sousFamille: sousFamille.trim() || null,
      designation: designation.trim() || null,
      quantite: Number(quantite) || 0,
      stockMinimum: Number(stockMinimum),
      stockMaximum: stockMaximum ? Number(stockMaximum) : null,
      localisation: localisation.trim() || null,
      unite: unite.trim() || null,
      prixUnitaire: prixUnitaire ? Number(prixUnitaire) : null,
      fournisseur: fournisseur.trim() || null,
    };

    const result = await createItem(payload);
    setLoading(false);
    if (result) {
      setSuccess(true);
      setTimeout(() => handleClose(), 1200);
    } else {
      setError("Erreur lors de la création. Vérifiez que le code n'existe pas déjà.");
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
          className="bg-bg-elevated border border-[rgba(90,94,117,0.3)] rounded-xl shadow-card-hover pointer-events-auto w-full max-w-lg overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(90,94,117,0.2)]">
            <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
              <Plus className="w-5 h-5 text-accent-teal" />
              Nouvelle pièce
            </h3>
            <button onClick={handleClose} className="p-1 rounded-md hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {error && (
              <div className="flex items-center gap-2 text-sm text-status-critical bg-status-critical/10 border border-status-critical/20 rounded-lg px-3 py-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 text-sm text-status-ok bg-status-ok/10 border border-status-ok/20 rounded-lg px-3 py-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                Article créé avec succès !
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-text-secondary">Code <span className="text-status-critical">*</span></label>
                <input
                  id="stock-create-code"
                  name="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="ART-001"
                  className="input-industrial w-full"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-text-secondary">Quantité</label>
                <input
                  id="stock-create-quantite"
                  name="quantite"
                  type="number"
                  min={0}
                  value={quantite}
                  onChange={(e) => setQuantite(e.target.value)}
                  className="input-industrial w-full"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary">Nom <span className="text-status-critical">*</span></label>
              <input
                id="stock-create-name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Désignation de l'article"
                className="input-industrial w-full"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-text-secondary">Famille <span className="text-status-critical">*</span></label>
                <input
                  id="stock-create-famille"
                  name="famille"
                  value={famille}
                  onChange={(e) => setFamille(e.target.value)}
                  placeholder="Mécanique, Électrique..."
                  className="input-industrial w-full"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-text-secondary">Sous-famille</label>
                <input
                  id="stock-create-sousFamille"
                  name="sousFamille"
                  value={sousFamille}
                  onChange={(e) => setSousFamille(e.target.value)}
                  placeholder="Optionnel"
                  className="input-industrial w-full"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary">Désignation détaillée</label>
              <input
                id="stock-create-designation"
                name="designation"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="Description complète"
                className="input-industrial w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-text-secondary">Stock min <span className="text-status-critical">*</span></label>
                <input
                  id="stock-create-stockMinimum"
                  name="stockMinimum"
                  type="number"
                  min={0}
                  value={stockMinimum}
                  onChange={(e) => setStockMinimum(e.target.value)}
                  className="input-industrial w-full"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-text-secondary">Stock max</label>
                <input
                  id="stock-create-stockMaximum"
                  name="stockMaximum"
                  type="number"
                  min={0}
                  value={stockMaximum}
                  onChange={(e) => setStockMaximum(e.target.value)}
                  className="input-industrial w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-text-secondary">Localisation</label>
                <input
                  id="stock-create-localisation"
                  name="localisation"
                  value={localisation}
                  onChange={(e) => setLocalisation(e.target.value)}
                  placeholder="Emplacement en magasin"
                  className="input-industrial w-full"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-text-secondary">Unité</label>
                <input
                  id="stock-create-unite"
                  name="unite"
                  value={unite}
                  onChange={(e) => setUnite(e.target.value)}
                  placeholder="pc, kg, L, m..."
                  className="input-industrial w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-text-secondary">Prix unitaire (€)</label>
                <input
                  id="stock-create-prixUnitaire"
                  name="prixUnitaire"
                  type="number"
                  min={0}
                  step="0.01"
                  value={prixUnitaire}
                  onChange={(e) => setPrixUnitaire(e.target.value)}
                  placeholder="0.00"
                  className="input-industrial w-full"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-text-secondary">Fournisseur</label>
                <input
                  id="stock-create-fournisseur"
                  name="fournisseur"
                  value={fournisseur}
                  onChange={(e) => setFournisseur(e.target.value)}
                  placeholder="Nom du fournisseur"
                  className="input-industrial w-full"
                />
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[rgba(90,94,117,0.2)]">
            <button type="button" onClick={handleClose} className="btn-ghost h-9 px-4 text-sm">
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || success}
              className="btn-primary h-9 px-4 text-sm flex items-center gap-2"
            >
              {loading ? 'Création...' : 'Créer'}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
