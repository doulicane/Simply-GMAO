/**
 * =============================================================================
 * WorkOrderStepTracker — Suivi étape par étape d'un bon de travail
 * =============================================================================
 * Stepper vertical interactif qui affiche le workflow complet du BT :
 * Créé → Planifié → En cours → Terminé → Clôturé
 * Chaque étape montre les dates, utilisateurs, actions et détails.
 * =============================================================================
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FilePlus, Calendar, Play, Pause, CheckCircle, Lock, Unlock,
  ChevronDown, ChevronUp, Clock, User, Wrench, Package, DollarSign,
  AlertCircle,
} from 'lucide-react';
import type { WorkOrder, WorkOrderStatus } from '@/types';
import {
  STATUS_LABELS,
  STATUS_VARIANTS,
  TYPE_LABELS,
  formatDateTime,
  formatDuration,
  getInitials,
} from './utils';
import { StatusBadge } from '@/components/StatusBadge';

interface WorkOrderStepTrackerProps {
  workOrder: WorkOrder;
  onStatusChange?: (newStatus: WorkOrderStatus) => void;
  transitions?: { label: string; next: WorkOrderStatus; icon: typeof Play }[];
}

interface StepDef {
  status: WorkOrderStatus;
  label: string;
  icon: typeof FilePlus;
  getDate: (wo: WorkOrder) => string | undefined;
  getUser: (wo: WorkOrder) => string | undefined;
  color: string;
}

const STEPS: StepDef[] = [
  {
    status: 'draft',
    label: 'Création',
    icon: FilePlus,
    getDate: (wo) => wo.createdAt,
    getUser: (wo) => wo.requestedBy,
    color: '#3B82F6',
  },
  {
    status: 'planned',
    label: 'Planification',
    icon: Calendar,
    getDate: (wo) => wo.plannedStart,
    getUser: (wo) => wo.assignedTo,
    color: '#8B5CF6',
  },
  {
    status: 'in_progress',
    label: 'Exécution',
    icon: Play,
    getDate: (wo) => wo.actualStart,
    getUser: (wo) => wo.assignedTo,
    color: '#F59E0B',
  },
  {
    status: 'completed',
    label: 'Terminaison',
    icon: CheckCircle,
    getDate: (wo) => wo.actualEnd,
    getUser: (wo) => wo.assignedTo,
    color: '#22C55E',
  },
  {
    status: 'closed',
    label: 'Clôture',
    icon: Lock,
    getDate: () => undefined,
    getUser: () => undefined,
    color: '#6B7280',
  },
];

const STATUS_ORDER: WorkOrderStatus[] = ['draft', 'planned', 'in_progress', 'completed', 'closed'];

function getStepIndex(status: WorkOrderStatus): number {
  // waiting_parts est une sous-étape de in_progress
  if (status === 'waiting_parts') return STATUS_ORDER.indexOf('in_progress');
  if (status === 'cancelled') return -1;
  return STATUS_ORDER.indexOf(status);
}

export function WorkOrderStepTracker({ workOrder, onStatusChange, transitions }: WorkOrderStepTrackerProps) {
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});

  const currentIndex = getStepIndex(workOrder.status);

  const toggleStep = (status: string) => {
    setExpandedSteps((prev) => ({ ...prev, [status]: !prev[status] }));
  };

  const isExpanded = (status: string) => {
    // Auto-expand l'étape actuelle et les étapes complétées
    if (expandedSteps[status] !== undefined) return expandedSteps[status];
    const idx = STATUS_ORDER.indexOf(status as WorkOrderStatus);
    return idx === currentIndex || idx < currentIndex;
  };

  return (
    <div className="space-y-0">
      {STEPS.map((step, idx) => {
        const stepIndex = idx;
        const isCompleted = stepIndex < currentIndex;
        const isCurrent = stepIndex === currentIndex;
        const isFuture = stepIndex > currentIndex;
        const date = step.getDate(workOrder);
        const user = step.getUser(workOrder);
        const expanded = isExpanded(step.status);

        return (
          <div key={step.status} className="relative">
            {/* Connector line */}
            {idx < STEPS.length - 1 && (
              <div
                className="absolute left-[19px] top-10 w-[2px] h-[calc(100%-24px)]"
                style={{
                  backgroundColor: isCompleted ? step.color : 'rgba(90,94,117,0.15)',
                }}
              />
            )}

            {/* Step header */}
            <button
              onClick={() => toggleStep(step.status)}
              className="w-full flex items-start gap-3 py-3 text-left group"
            >
              {/* Status dot */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all duration-300 mt-0.5"
                style={{
                  backgroundColor: isCompleted || isCurrent ? step.color : 'transparent',
                  borderColor: isCompleted || isCurrent ? step.color : 'rgba(90,94,117,0.3)',
                  opacity: isFuture ? 0.5 : 1,
                }}
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5 text-white" />
                ) : (
                  <step.icon className="w-5 h-5" style={{ color: isCurrent ? '#fff' : 'rgba(90,94,117,0.5)' }} />
                )}
              </div>

              {/* Step info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-semibold ${
                      isFuture ? 'text-text-muted' : 'text-text-primary'
                    }`}
                  >
                    {step.label}
                  </span>
                  {isCurrent && (
                    <span className="px-1.5 py-0.5 rounded-full bg-status-warning/20 text-status-warning text-[10px] font-bold uppercase tracking-wide">
                      En cours
                    </span>
                  )}
                  {workOrder.status === 'waiting_parts' && step.status === 'in_progress' && isCurrent && (
                    <span className="px-1.5 py-0.5 rounded-full bg-status-info/20 text-status-info text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
                      <Pause className="w-3 h-3" />
                      Attente pièces
                    </span>
                  )}
                </div>
                {date && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3 h-3 text-text-muted" />
                    <span className="text-xs text-text-secondary">{formatDateTime(date)}</span>
                  </div>
                )}
                {!date && isFuture && (
                  <span className="text-xs text-text-muted italic">À venir</span>
                )}
              </div>

              {/* Expand chevron */}
              <div className="flex-shrink-0 mt-2">
                {expanded ? (
                  <ChevronUp className="w-4 h-4 text-text-muted" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-text-muted" />
                )}
              </div>
            </button>

            {/* Step details */}
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pl-[52px] pb-4 space-y-3">
                    {/* User */}
                    {user && (
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                          style={{ backgroundColor: step.color }}
                        >
                          {getInitials(user)}
                        </div>
                        <span className="text-sm text-text-secondary">{user}</span>
                      </div>
                    )}

                    {/* Step-specific content */}
                    {step.status === 'draft' && (
                      <div className="space-y-2">
                        <div className="bg-bg-primary rounded-lg p-3 border border-[rgba(90,94,117,0.15)]">
                          <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">Description</p>
                          <p className="text-sm text-text-primary">{workOrder.description}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge label={TYPE_LABELS[workOrder.type]} color={step.color} />
                          <Badge label={`Priorité ${workOrder.priority}`} color={step.color} />
                        </div>
                      </div>
                    )}

                    {step.status === 'planned' && (
                      <div className="space-y-2">
                        {workOrder.plannedEnd && (
                          <div className="flex items-center gap-2 text-sm text-text-secondary">
                            <Clock className="w-4 h-4" />
                            <span>Fin planifiée : {formatDateTime(workOrder.plannedEnd)}</span>
                          </div>
                        )}
                        {workOrder.duration && (
                          <div className="flex items-center gap-2 text-sm text-text-secondary">
                            <Clock className="w-4 h-4" />
                            <span>Durée estimée : {formatDuration(workOrder.duration)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                          <Wrench className="w-4 h-4" />
                          <span>Équipement : {workOrder.equipmentName}</span>
                        </div>
                      </div>
                    )}

                    {step.status === 'in_progress' && (
                      <div className="space-y-2">
                        {workOrder.checklist && workOrder.checklist.length > 0 && (
                          <div>
                            <p className="text-xs text-text-secondary uppercase tracking-wide mb-2">Checklist</p>
                            <div className="space-y-1.5">
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
                                  {item.required && !item.completed && (
                                    <span className="text-[10px] text-status-critical">*</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {workOrder.notes && (
                          <div className="bg-bg-primary rounded-lg p-3 border border-[rgba(90,94,117,0.15)]">
                            <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">Notes</p>
                            <p className="text-sm text-text-primary">{workOrder.notes}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {step.status === 'completed' && (
                      <div className="space-y-2">
                        {workOrder.duration && (
                          <div className="flex items-center gap-2 text-sm text-text-secondary">
                            <Clock className="w-4 h-4" />
                            <span>Durée réelle : {formatDuration(workOrder.duration)}</span>
                          </div>
                        )}
                        {workOrder.cost !== undefined && workOrder.cost > 0 && (
                          <div className="flex items-center gap-2 text-sm text-text-secondary">
                            <DollarSign className="w-4 h-4" />
                            <span>Coût total : {workOrder.cost.toFixed(2)} €</span>
                          </div>
                        )}
                        {workOrder.partsUsed && workOrder.partsUsed.length > 0 && (
                          <div>
                            <p className="text-xs text-text-secondary uppercase tracking-wide mb-2">Pièces utilisées ({workOrder.partsUsed.length})</p>
                            <div className="space-y-1">
                              {workOrder.partsUsed.map((part, i) => (
                                <div key={i} className="flex items-center justify-between text-sm bg-bg-primary rounded px-2 py-1">
                                  <span className="text-text-primary">{part.partName}</span>
                                  <span className="text-text-secondary font-mono text-xs">×{part.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {workOrder.notes && (
                          <div className="bg-bg-primary rounded-lg p-3 border border-[rgba(90,94,117,0.15)]">
                            <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">Rapport</p>
                            <p className="text-sm text-text-primary">{workOrder.notes}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions for current step */}
                    {isCurrent && transitions && transitions.length > 0 && (
                      <div className="pt-2 border-t border-[rgba(90,94,117,0.15)]">
                        <p className="text-xs text-text-secondary uppercase tracking-wide mb-2">Actions disponibles</p>
                        <div className="flex flex-wrap gap-2">
                          {transitions.map((t) => (
                            <button
                              key={t.label}
                              onClick={() => onStatusChange?.(t.next)}
                              className="btn-primary text-sm h-9 px-3 flex items-center gap-1.5"
                            >
                              <t.icon className="w-4 h-4" />
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Cancelled status */}
                    {workOrder.status === 'cancelled' && step.status === 'draft' && (
                      <div className="flex items-center gap-2 text-status-critical">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">BT annulé</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="px-2 py-0.5 rounded-full text-[11px] font-medium text-white"
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  );
}
