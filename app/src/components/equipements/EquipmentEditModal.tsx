import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Pencil, AlertTriangle, CheckCircle } from 'lucide-react';
import { useEquipmentStore } from '@/stores/equipmentStore';
import type { Equipment } from '@/types';

interface Props {
  open: boolean;
  equipment: Equipment | null;
  onClose: () => void;
}

const TYPES = [
  'presse', 'laquage', 'serigraphie', 'recuit', 'compresseur', 'depoussiereur',
  'emballage', 'four', 'decoupe', 'convoyeur', 'ventilation', 'ecluse',
  'electricite', 'manutention', 'traitementeau', 'metrologie', 'controlequalite', 'autre',
];

const CRITICALITIES = ['CRITIQUE', 'ELEVEE', 'MOYENNE', 'FAIBLE'];
const STATUSES = ['EN_SERVICE', 'EN_ARRET', 'EN_MAINTENANCE', 'HORS_SERVICE'];

function frontendStatusToBackend(status: string): string {
  switch (status) {
    case 'running': return 'EN_SERVICE';
    case 'maintenance': return 'EN_MAINTENANCE';
    case 'stopped': return 'HORS_SERVICE';
    case 'breakdown': return 'EN_ARRET';
    default: return 'EN_SERVICE';
  }
}

export function EquipmentEditModal({ open, equipment, onClose }: Props) {
  const { updateEquipment } = useEquipmentStore();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('autre');
  const [criticality, setCriticality] = useState('MOYENNE');
  const [statut, setStatut] = useState('EN_SERVICE');
  const [localisation, setLocalisation] = useState('');
  const [constructeur, setConstructeur] = useState('');
  const [numSerie, setNumSerie] = useState('');
  const [dateMiseService, setDateMiseService] = useState('');
  const [dateAchat, setDateAchat] = useState('');
  const [compteurActuel, setCompteurActuel] = useState('');
  const [compteurUnite, setCompteurUnite] = useState('h');
  const [contactAlimentaire, setContactAlimentaire] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (equipment) {
      setCode(equipment.code);
      setName(equipment.name);
      setType(equipment.type);
      setCriticality(equipment.criticality === 'critique' ? 'CRITIQUE' : equipment.criticality === 'elevee' ? 'ELEVEE' : equipment.criticality === 'moyenne' ? 'MOYENNE' : 'FAIBLE');
      setStatut(frontendStatusToBackend(equipment.status));
      setLocalisation(equipment.location ?? '');
      setConstructeur(equipment.manufacturer ?? '');
      setNumSerie(equipment.serialNumber ?? '');
      setDateMiseService(equipment.commissioningDate ?? '');
      setDateAchat('');
      setCompteurActuel('');
      setCompteurUnite('h');
      setContactAlimentaire(false);
      setError('');
      setSuccess(false);
      setLoading(false);
    }
  }, [equipment]);

  const handleClose = () => {
    setError('');
    setSuccess(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipment) return;
    setError('');
    if (!code || code.length < 3) return setError('Le code doit faire au moins 3 caractères');
    if (!name) return setError('Le nom est requis');

    setLoading(true);
    const payload: Record<string, any> = {
      code: code.trim().toUpperCase(),
      name: name.trim(),
      type,
      criticality,
      statut,
      localisation: localisation.trim() || undefined,
      constructeur: constructeur.trim() || undefined,
      numSerie: numSerie.trim() || undefined,
      dateMiseService: dateMiseService || undefined,
      dateAchat: dateAchat || undefined,
      compteurActuel: compteurActuel ? Number(compteurActuel) : undefined,
      compteurUnite: compteurUnite.trim() || undefined,
      contactAlimentaire,
    };

    const result = await updateEquipment(equipment.id, payload);
    setLoading(false);
    if (result) {
      setSuccess(true);
      setTimeout(() => handleClose(), 1200);
    } else {
      setError("Erreur lors de la modification. Vérifiez que le code n'existe pas déjà.");
    }
  };

  if (!open || !equipment) return null;

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
              <Pencil className="w-5 h-5 text-accent-teal" />
              Modifier l&apos;équipement
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
                Équipement modifié avec succès !
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-text-secondary">Code <span className="text-status-critical">*</span></label>
                <input
                  id="eq-edit-code"
                  name="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="EX-001"
                  className="input-industrial w-full"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-text-secondary">Type <span className="text-status-critical">*</span></label>
                <select id="eq-edit-type" name="type" value={type} onChange={(e) => setType(e.target.value)} className="input-industrial w-full">
                  {TYPES.map((t) => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary">Nom <span className="text-status-critical">*</span></label>
              <input
                id="eq-edit-name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nom de l'équipement"
                className="input-industrial w-full"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-text-secondary">Criticité</label>
                <select id="eq-edit-criticality" name="criticality" value={criticality} onChange={(e) => setCriticality(e.target.value)} className="input-industrial w-full">
                  {CRITICALITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-text-secondary">Statut</label>
                <select id="eq-edit-statut" name="statut" value={statut} onChange={(e) => setStatut(e.target.value)} className="input-industrial w-full">
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-text-secondary">Date d&apos;achat</label>
                <input
                  id="eq-edit-dateAchat"
                  name="dateAchat"
                  type="date"
                  value={dateAchat}
                  onChange={(e) => setDateAchat(e.target.value)}
                  className="input-industrial w-full"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-text-secondary">Date mise en service</label>
                <input
                  id="eq-edit-dateMiseService"
                  name="dateMiseService"
                  type="date"
                  value={dateMiseService}
                  onChange={(e) => setDateMiseService(e.target.value)}
                  className="input-industrial w-full"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary">Localisation</label>
              <input
                id="eq-edit-localisation"
                name="localisation"
                value={localisation}
                onChange={(e) => setLocalisation(e.target.value)}
                placeholder="Zone, bâtiment, étage..."
                className="input-industrial w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-text-secondary">Constructeur</label>
                <input
                  id="eq-edit-constructeur"
                  name="constructeur"
                  value={constructeur}
                  onChange={(e) => setConstructeur(e.target.value)}
                  placeholder="Fabricant"
                  className="input-industrial w-full"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-text-secondary">N° série</label>
                <input
                  id="eq-edit-numSerie"
                  name="numSerie"
                  value={numSerie}
                  onChange={(e) => setNumSerie(e.target.value)}
                  placeholder="SN-12345"
                  className="input-industrial w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-text-secondary">Compteur actuel</label>
                <input
                  id="eq-edit-compteurActuel"
                  name="compteurActuel"
                  type="number"
                  min={0}
                  step="0.01"
                  value={compteurActuel}
                  onChange={(e) => setCompteurActuel(e.target.value)}
                  placeholder="0"
                  className="input-industrial w-full"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-text-secondary">Unité compteur</label>
                <input
                  id="eq-edit-compteurUnite"
                  name="compteurUnite"
                  value={compteurUnite}
                  onChange={(e) => setCompteurUnite(e.target.value)}
                  placeholder="h, km, cycles..."
                  className="input-industrial w-full"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="eq-edit-contactAlimentaire"
                name="contactAlimentaire"
                type="checkbox"
                checked={contactAlimentaire}
                onChange={(e) => setContactAlimentaire(e.target.checked)}
                className="w-4 h-4 rounded border-border bg-bg-elevated text-primary"
              />
              <label htmlFor="eq-edit-contactAlimentaire" className="text-sm text-text-secondary">Contact alimentaire</label>
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
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
