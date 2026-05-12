import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Printer, CheckCircle, Play, Pause,
  Lock, Unlock, Wrench,
  Package, FileText, MessageSquare, User, Calendar,
  Route,
} from 'lucide-react';
import type { WorkOrder, WorkOrderStatus } from '@/types';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';
import { useUpdateWorkOrderStatus } from '@/hooks/useWorkOrders';
import { StatusTimeline } from './StatusTimeline';
import { WorkOrderStepTracker } from './WorkOrderStepTracker';
import {
  STATUS_LABELS,
  STATUS_VARIANTS,
  TYPE_LABELS,
  formatDateTime,
  formatDuration,
  formatRelativeTime,
  getInitials,
} from './utils';

interface DetailDrawerProps {
  workOrder: WorkOrder | null;
  onClose: () => void;
}

const STATUS_TRANSITIONS: Record<WorkOrderStatus, { label: string; next: WorkOrderStatus; icon: typeof Play }[]> = {
  draft: [{ label: 'Planifier', next: 'planned', icon: Calendar }],
  planned: [{ label: 'Démarrer', next: 'in_progress', icon: Play }],
  in_progress: [
    { label: 'Terminer', next: 'completed', icon: CheckCircle },
    { label: 'Pause', next: 'waiting_parts', icon: Pause },
  ],
  waiting_parts: [{ label: 'Reprendre', next: 'in_progress', icon: Play }],
  completed: [
    { label: 'Clôturer', next: 'closed', icon: Lock },
    { label: 'Rouvrir', next: 'in_progress', icon: Unlock },
  ],
  closed: [{ label: 'Rouvrir', next: 'in_progress', icon: Unlock }],
  cancelled: [],
};

export function DetailDrawer({ workOrder, onClose }: DetailDrawerProps) {
  const updateWorkOrderStatus = useUpdateWorkOrderStatus();
  const [activeTab, setActiveTab] = useState<'info' | 'tracking' | 'actions' | 'parts' | 'notes'>('info');

  if (!workOrder) return null;

  const transitions = STATUS_TRANSITIONS[workOrder.status];

  const handleStatusChange = (newStatus: WorkOrderStatus) => {
    updateWorkOrderStatus.mutateAsync({ id: workOrder.id, status: newStatus }).catch(() => {});
  };

  const tabs = [
    { id: 'info' as const, label: 'Informations', icon: FileText },
    { id: 'tracking' as const, label: 'Suivi', icon: Route },
    { id: 'actions' as const, label: 'Actions réalisées', icon: Wrench },
    { id: 'parts' as const, label: 'Pièces utilisées', icon: Package },
    { id: 'notes' as const, label: 'Commentaires', icon: MessageSquare },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[100] bg-[rgba(10,11,20,0.75)] backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
        className="fixed top-0 right-0 bottom-0 w-full md:w-[560px] z-[200] bg-bg-elevated border-l border-[rgba(90,94,117,0.2)] flex flex-col shadow-card-hover pt-[env(safe-area-inset-top)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between min-h-14 px-5 border-b border-[rgba(90,94,117,0.2)] flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-base font-semibold text-text-primary">
              {workOrder.number}
            </span>
            <StatusBadge
              status={STATUS_VARIANTS[workOrder.status]}
              label={STATUS_LABELS[workOrder.status]}
            />
          </div>
          <div className="flex items-center gap-1">
            <button
              className="p-2 rounded-md hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors"
              aria-label="Imprimer"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Title block */}
          <div className="px-5 py-4 border-b border-[rgba(90,94,117,0.15)]">
            <h2 className="text-lg font-semibold text-text-primary mb-1">
              {workOrder.title}
            </h2>
            <p className="text-sm text-text-secondary">
              {workOrder.equipmentName} · Créé le {formatDateTime(workOrder.createdAt)} par {workOrder.requestedBy}
            </p>
          </div>

          {/* Timeline */}
          <div className="px-5">
            <StatusTimeline currentStatus={workOrder.status} />
          </div>

          {/* Tabs */}
          <div className="px-5 flex items-center gap-1 border-b border-[rgba(90,94,117,0.15)]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-accent-teal border-accent-teal'
                    : 'text-text-secondary border-transparent hover:text-text-primary'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="px-5 py-5">
            {activeTab === 'tracking' && (
              <WorkOrderStepTracker
                workOrder={workOrder}
                onStatusChange={handleStatusChange}
                transitions={transitions}
              />
            )}

            {activeTab === 'info' && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <InfoField label="Type" value={TYPE_LABELS[workOrder.type]} />
                  <InfoField label="Priorité" value={<PriorityBadge priority={workOrder.priority} />} />
                  <InfoField label="Équipement" value={workOrder.equipmentName} />
                  <InfoField label="Demandeur" value={workOrder.requestedBy} />
                  <InfoField
                    label="Technicien assigné"
                    value={
                      workOrder.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-accent-teal/20 text-accent-teal flex items-center justify-center text-[10px] font-bold">
                            {getInitials(workOrder.assignedTo)}
                          </div>
                          <span>{workOrder.assignedTo}</span>
                        </div>
                      ) : (
                        'Non assigné'
                      )
                    }
                  />
                  <InfoField label="Durée estimée" value={formatDuration(workOrder.duration)} />
                </div>

                <div>
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-1.5 block">
                    Description
                  </label>
                  <p className="text-sm text-text-primary leading-relaxed bg-bg-primary rounded-lg p-3 border border-[rgba(90,94,117,0.15)]">
                    {workOrder.description}
                  </p>
                </div>

                {(workOrder.plannedStart || workOrder.actualStart) && (
                  <div className="grid grid-cols-2 gap-4">
                    <InfoField
                      label="Début planifié"
                      value={workOrder.plannedStart ? formatDateTime(workOrder.plannedStart) : '-'}
                    />
                    <InfoField
                      label="Début réel"
                      value={workOrder.actualStart ? formatDateTime(workOrder.actualStart) : '-'}
                    />
                    <InfoField
                      label="Fin réelle"
                      value={workOrder.actualEnd ? formatDateTime(workOrder.actualEnd) : '-'}
                    />
                    <InfoField
                      label="Coût total"
                      value={workOrder.cost ? `${workOrder.cost.toFixed(2)} €` : '-'}
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'actions' && (
              <div>
                <label className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-1.5 block">
                  Actions réalisées
                </label>
                <textarea
                  readOnly
                  value={workOrder.notes ?? 'Aucune action documentée'}
                  className="w-full h-32 p-3 bg-bg-primary border border-[rgba(90,94,117,0.15)] rounded-lg text-sm text-text-primary resize-none"
                />
                {workOrder.checklist && workOrder.checklist.length > 0 && (
                  <div className="mt-4">
                    <label className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2 block">
                      Checklist
                    </label>
                    <div className="space-y-2">
                      {workOrder.checklist.map((item) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center ${
                              item.completed
                                ? 'bg-accent-teal border-accent-teal'
                                : 'border-text-muted'
                            }`}
                          >
                            {item.completed && <CheckCircle className="w-3 h-3 text-white" />}
                          </div>
                          <span className={`text-sm ${item.completed ? 'text-text-primary' : 'text-text-secondary'}`}>
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'parts' && (
              <div>
                {workOrder.partsUsed && workOrder.partsUsed.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-[rgba(90,94,117,0.2)]">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-bg-primary border-b border-[rgba(90,94,117,0.2)]">
                        <tr>
                          <th className="px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-text-secondary">Code</th>
                          <th className="px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-text-secondary">Désignation</th>
                          <th className="px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-text-secondary text-right">Qté</th>
                          <th className="px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-text-secondary text-right">Prix U.</th>
                          <th className="px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-text-secondary text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {workOrder.partsUsed.map((part, idx) => (
                          <tr
                            key={`${part.partId}-${idx}`}
                            className="border-b border-[rgba(90,94,117,0.1)] hover:bg-bg-hover"
                          >
                            <td className="px-3 py-2.5 font-mono text-[12px] text-accent-teal">{part.partId}</td>
                            <td className="px-3 py-2.5 text-text-primary">{part.partName}</td>
                            <td className="px-3 py-2.5 text-right text-text-primary">{part.quantity}</td>
                            <td className="px-3 py-2.5 text-right font-mono text-[12px] text-text-secondary">{part.unitCost.toFixed(2)} €</td>
                            <td className="px-3 py-2.5 text-right font-mono text-[12px] text-text-primary">{(part.quantity * part.unitCost).toFixed(2)} €</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-text-muted">
                    <Package className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Aucune pièce utilisée</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent-teal/20 text-accent-teal flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {getInitials(workOrder.requestedBy)}
                  </div>
                  <div className="flex-1 bg-bg-primary rounded-lg p-3 border border-[rgba(90,94,117,0.15)]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-text-primary">{workOrder.requestedBy}</span>
                      <span className="text-[11px] text-text-muted">{formatRelativeTime(workOrder.createdAt)}</span>
                    </div>
                    <p className="text-sm text-text-secondary">BT créé</p>
                  </div>
                </div>
                {workOrder.assignedTo && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-status-warning/20 text-status-warning flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {getInitials(workOrder.assignedTo)}
                    </div>
                    <div className="flex-1 bg-bg-primary rounded-lg p-3 border border-[rgba(90,94,117,0.15)]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-text-primary">{workOrder.assignedTo}</span>
                        <span className="text-[11px] text-text-muted">{formatRelativeTime(workOrder.createdAt)}</span>
                      </div>
                      <p className="text-sm text-text-secondary">Pris en charge</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 pt-2">
                  <div className="w-8 h-8 rounded-full bg-accent-teal/20 text-accent-teal flex items-center justify-center text-xs font-bold flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Ajouter un commentaire..."
                    className="flex-1 h-10 px-3 bg-bg-input border border-[rgba(90,94,117,0.3)] rounded-md text-sm text-text-primary focus:outline-none focus:border-accent-teal focus:shadow-glow placeholder:text-text-muted"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-[rgba(90,94,117,0.2)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {transitions.map((t) => (
              <button
                key={t.label}
                onClick={() => handleStatusChange(t.next)}
                className="btn-primary text-sm h-9 px-3 flex items-center gap-1.5"
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-ghost text-sm h-9 px-3">
              Imprimer
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function InfoField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] font-medium text-text-secondary uppercase tracking-wide mb-1 block">
        {label}
      </label>
      <div className="text-sm text-text-primary">{value}</div>
    </div>
  );
}
