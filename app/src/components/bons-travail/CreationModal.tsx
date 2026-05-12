import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, AlertTriangle, CheckCircle } from 'lucide-react';
import type { WorkOrder, WorkOrderType, Priority, WorkOrderStatus } from '@/types';
import { useCreateWorkOrder } from '@/hooks/useWorkOrders';
import { useEquipments } from '@/hooks/useEquipments';
import { useAuthStore } from '@/stores/authStore';
import {
  TYPE_LABELS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
} from './utils';

interface CreationModalProps {
  open: boolean;
  onClose: () => void;
  initialStatus?: WorkOrderStatus;
}

const WORK_ORDER_TYPES: WorkOrderType[] = ['corrective', 'preventive', 'improvement', 'safety'];
const PRIORITIES: Priority[] = ['P1', 'P2', 'P3', 'P4'];

export function CreationModal({ open, onClose, initialStatus = 'draft' }: CreationModalProps) {
  const { data: equipment = [] } = useEquipments(undefined, open);
  const createWorkOrder = useCreateWorkOrder();
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [equipmentId, setEquipmentId] = useState('');
  const [type, setType] = useState<WorkOrderType>('corrective');
  const [priority, setPriority] = useState<Priority>('P3');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState('');
  const [plannedDate, setPlannedDate] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const reset = () => {
    setStep(1);
    setEquipmentId('');
    setType('corrective');
    setPriority('P3');
    setDescription('');
    setAssignee('');
    setPlannedDate('');
    setEstimatedDuration('');
    setError('');
    setSuccess(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const validateStep1 = () => {
    if (!equipmentId) return setError('Veuillez sélectionner un équipement');
    if (description.length < 10) return setError('La description doit faire au moins 10 caractères');
    setError('');
    setStep(2);
  };

  const handleCreate = () => {
    const selectedEquipment = equipment.find((e) => e.id === equipmentId);
    if (!selectedEquipment) return;

    const priorityMap: Record<Priority, string> = { P1: 'URGENTE', P2: 'HAUTE', P3: 'MOYENNE', P4: 'BASSE' };
    const typeMap: Record<WorkOrderType, string> = { corrective: 'CORRECTIF', preventive: 'PREVENTIF', predictive: 'PREDICTIF', improvement: 'AMELIORATION', safety: 'SECURITE' };

    createWorkOrder.mutateAsync({
      title: description.slice(0, 50),
      description,
      equipmentId: selectedEquipment.id,
      type: typeMap[type],
      priority: priorityMap[priority],
      datePlanifiee: plannedDate ? new Date(plannedDate).toISOString() : undefined,
    }).then(() => {
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1500);
    });
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
        transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className="w-full max-w-lg bg-bg-elevated border border-[rgba(90,94,117,0.3)] rounded-xl shadow-card-hover pointer-events-auto overflow-hidden flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(90,94,117,0.2)]">
            <h2 className="text-lg font-semibold text-text-primary">
              {success ? 'BT créé avec succès' : 'Nouveau Bon de Travail'}
            </h2>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-md hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-5 py-5 overflow-y-auto">
            {success ? (
              <div className="flex flex-col items-center py-8">
                <div className="w-16 h-16 rounded-full bg-status-ok/20 flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-status-ok" />
                </div>
                <p className="text-lg font-semibold text-text-primary mb-1">BT créé avec succès</p>
                <p className="text-sm text-text-secondary">Le bon de travail a été ajouté à la liste.</p>
              </div>
            ) : step === 1 ? (
              <div className="space-y-5">
                {/* Step indicator */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-1.5 flex-1 rounded-full bg-accent-teal" />
                  <div className="h-1.5 flex-1 rounded-full bg-[rgba(90,94,117,0.3)]" />
                </div>

                <div>
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-1.5 block">
                    Équipement <span className="text-status-critical">*</span>
                  </label>
                  <select
                    value={equipmentId}
                    onChange={(e) => setEquipmentId(e.target.value)}
                    className="w-full h-10 px-3 bg-bg-input border border-[rgba(90,94,117,0.3)] rounded-md text-sm text-text-primary focus:outline-none focus:border-accent-teal focus:shadow-glow"
                  >
                    <option value="">Sélectionner un équipement...</option>
                    {equipment.map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.name} ({eq.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-1.5 block">
                    Type d&apos;intervention <span className="text-status-critical">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {WORK_ORDER_TYPES.map((t) => (
                      <button
                        key={t}
                        onClick={() => setType(t)}
                        className={`h-10 px-3 rounded-md text-sm font-medium border transition-all ${
                          type === t
                            ? 'bg-accent-teal/10 border-accent-teal text-accent-teal'
                            : 'bg-bg-input border-[rgba(90,94,117,0.3)] text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        {TYPE_LABELS[t]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-1.5 block">
                    Priorité
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {PRIORITIES.map((p) => (
                      <button
                        key={p}
                        onClick={() => setPriority(p)}
                        className={`h-10 px-2 rounded-md text-sm font-medium border transition-all ${
                          priority === p
                            ? 'text-white border-transparent'
                            : 'bg-bg-input border-[rgba(90,94,117,0.3)] text-text-secondary hover:text-text-primary'
                        }`}
                        style={
                          priority === p
                            ? { backgroundColor: PRIORITY_COLORS[p] }
                            : undefined
                        }
                      >
                        {PRIORITY_LABELS[p]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-1.5 block">
                    Description <span className="text-status-critical">*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Décrivez la panne ou l'intervention..."
                    rows={4}
                    className="w-full p-3 bg-bg-input border border-[rgba(90,94,117,0.3)] rounded-md text-sm text-text-primary focus:outline-none focus:border-accent-teal focus:shadow-glow placeholder:text-text-muted resize-none"
                  />
                  <p className="text-[11px] text-text-muted mt-1">
                    Minimum 10 caractères
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-1.5 block">
                    Demandeur
                  </label>
                  <input
                    type="text"
                    value={user?.name ?? ''}
                    readOnly
                    className="w-full h-10 px-3 bg-bg-input border border-[rgba(90,94,117,0.3)] rounded-md text-sm text-text-primary opacity-60 cursor-not-allowed"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Step indicator */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-1.5 flex-1 rounded-full bg-accent-teal" />
                  <div className="h-1.5 flex-1 rounded-full bg-accent-teal" />
                </div>

                <div>
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-1.5 block">
                    Technicien assigné
                  </label>
                  <input
                    type="text"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    placeholder="Nom du technicien..."
                    className="w-full h-10 px-3 bg-bg-input border border-[rgba(90,94,117,0.3)] rounded-md text-sm text-text-primary focus:outline-none focus:border-accent-teal focus:shadow-glow placeholder:text-text-muted"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-1.5 block">
                    Date planifiée
                  </label>
                  <input
                    type="datetime-local"
                    value={plannedDate}
                    onChange={(e) => setPlannedDate(e.target.value)}
                    className="w-full h-10 px-3 bg-bg-input border border-[rgba(90,94,117,0.3)] rounded-md text-sm text-text-primary focus:outline-none focus:border-accent-teal focus:shadow-glow"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-1.5 block">
                    Durée estimée (heures)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(e.target.value)}
                    placeholder="Ex: 2.5"
                    className="w-full h-10 px-3 bg-bg-input border border-[rgba(90,94,117,0.3)] rounded-md text-sm text-text-primary focus:outline-none focus:border-accent-teal focus:shadow-glow placeholder:text-text-muted"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-status-critical/10 border border-status-critical/30">
                <AlertTriangle className="w-4 h-4 text-status-critical flex-shrink-0" />
                <p className="text-sm text-status-critical">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {!success && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-[rgba(90,94,117,0.2)]">
              {step === 1 ? (
                <>
                  <button onClick={handleClose} className="btn-ghost text-sm h-9 px-4">
                    Annuler
                  </button>
                  <button onClick={validateStep1} className="btn-primary text-sm h-9 px-4 flex items-center gap-1.5">
                    Suivant
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setStep(1)} className="btn-ghost text-sm h-9 px-4">
                    Retour
                  </button>
                  <button onClick={handleCreate} disabled={createWorkOrder.isPending} className="btn-primary text-sm h-9 px-4">
                    {createWorkOrder.isPending ? 'Création...' : 'Créer le BT'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
