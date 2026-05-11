import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History, CalendarClock, FileText, GitBranch, X, Pencil, Trash2, Copy,
  ClipboardList, MoreVertical, Cog, Download, Plus,
  ChevronRight, ChevronDown, Activity, FileDown, Copy as CopyIcon
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/StatusBadge';
import { DocumentPanel } from './DocumentPanel';
import { SousEnsemblePanel } from './SousEnsemblePanel';
import { CompteurPanel } from './CompteurPanel';
import type { Equipment, WorkOrder, PreventivePlan } from '@/types';
import { STATUS_LABELS, STATUS_VARIANTS, CRITICALITY_LABELS, SUB_ASSEMBLIES } from './types';

interface EquipmentDetailProps {
  equipment: Equipment;
  workOrders: WorkOrder[];
  preventivePlans: PreventivePlan[];
  onClose: () => void;
  onShowQR: (eq: Equipment) => void;
  onNewBT: (eq: Equipment) => void;
  onEdit?: (eq: Equipment) => void;
  onDelete?: (eq: Equipment) => void;
  onShowHistory?: (eq: Equipment) => void;
}

const TAB_ITEMS = [
  { id: 'bt', label: 'Historique BT', icon: History },
  { id: 'mp', label: 'Maint. Préventive', icon: CalendarClock },
  { id: 'docs', label: 'Documents', icon: FileText },
  { id: 'sub', label: 'Sous-ensembles', icon: GitBranch },
  { id: 'compteur', label: 'Compteur', icon: Activity },
] as const;

type TabId = typeof TAB_ITEMS[number]['id'];

function InfoRow({ label, value, mono, copyable }: { label: string; value: React.ReactNode; mono?: boolean; copyable?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (copyable) {
      navigator.clipboard.writeText(copyable);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="flex items-start justify-between gap-2 py-1.5">
      <span className="text-xs text-text-secondary uppercase tracking-wide flex-shrink-0">{label}</span>
      <div className="flex items-center gap-1 min-w-0 justify-end">
        <span className={cn('text-sm font-medium text-text-primary truncate', mono && 'font-mono')}>{value}</span>
        {copyable && (
          <button onClick={handleCopy} className="text-text-muted hover:text-accent-teal transition-colors flex-shrink-0">
            {copied ? <span className="text-[10px] text-status-ok">OK</span> : <Copy className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
}

function BTStatusBadge({ status }: { status: WorkOrder['status'] }) {
  const map: Record<string, { variant: 'ok' | 'warning' | 'critical' | 'info' | 'neutral'; label: string }> = {
    draft: { variant: 'neutral', label: 'Brouillon' },
    planned: { variant: 'info', label: 'Planifié' },
    in_progress: { variant: 'warning', label: 'En cours' },
    waiting_parts: { variant: 'warning', label: 'Attente pièces' },
    completed: { variant: 'ok', label: 'Terminé' },
    closed: { variant: 'ok', label: 'Clôturé' },
    cancelled: { variant: 'neutral', label: 'Annulé' },
  };
  const s = map[status] ?? { variant: 'neutral', label: status };
  return <StatusBadge status={s.variant} label={s.label} />;
}

function PMProgressBar({ lastDone, nextDue }: { lastDone?: string; nextDue: string }) {
  const last = lastDone ? new Date(lastDone) : new Date();
  const next = new Date(nextDue);
  const now = new Date();
  const total = next.getTime() - last.getTime();
  const elapsed = now.getTime() - last.getTime();
  const pct = total > 0 ? Math.min(100, Math.max(0, (elapsed / total) * 100)) : 0;
  const overdue = now > next;

  return (
    <div className="w-full">
      <div className="h-1.5 w-full bg-bg-input rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', overdue ? 'bg-status-critical' : pct > 80 ? 'bg-status-warning' : 'bg-status-ok')}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  );
}

function SubAssemblyTree({ equipmentId }: { equipmentId: string }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const subs = SUB_ASSEMBLIES.filter((s) => s.equipmentId === equipmentId);

  if (subs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-text-muted">
        <GitBranch className="w-10 h-10 mb-3" />
        <p className="text-sm">Aucun sous-ensemble enregistré</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {subs.map((sub) => {
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
              <span className={cn(
                'ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded',
                sub.criticality === 'critique' ? 'bg-status-critical/15 text-status-critical' :
                sub.criticality === 'elevee' ? 'bg-status-warning/15 text-status-warning' :
                sub.criticality === 'moyenne' ? 'bg-status-info/15 text-status-info' :
                'bg-status-neutral/15 text-status-neutral'
              )}>
                {CRITICALITY_LABELS[sub.criticality]}
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
                  <div className="px-4 py-3 border-t border-[rgba(90,94,117,0.1)]">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[11px] text-text-secondary uppercase">Criticité</p>
                        <p className="text-sm text-text-primary">{CRITICALITY_LABELS[sub.criticality]}</p>
                      </div>
                      {sub.cost && (
                        <div>
                          <p className="text-[11px] text-text-secondary uppercase">Coût</p>
                          <p className="text-sm text-text-primary tabular-nums">{sub.cost.toLocaleString('fr-FR')} €</p>
                        </div>
                      )}
                    </div>
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

export function EquipmentDetail({ equipment, workOrders, preventivePlans, onClose, onShowQR, onNewBT, onEdit, onDelete, onShowHistory }: EquipmentDetailProps) {
  const [activeTab, setActiveTab] = useState<TabId>('bt');
  const [menuOpen, setMenuOpen] = useState(false);

  const eqWOs = useMemo(() => workOrders.filter((wo) => wo.equipmentId === equipment.id), [workOrders, equipment.id]);
  const eqPMs = useMemo(() => preventivePlans.filter((pm) => pm.equipmentId === equipment.id), [preventivePlans, equipment.id]);



  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col h-full overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Cog className="w-5 h-5 text-accent-teal" />
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary truncate">{equipment.name}</h1>
          </div>
          <p className="text-sm text-text-secondary">
            {equipment.manufacturer ?? '—'} · {equipment.model ?? '—'}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className={cn(
              'inline-flex items-center h-[22px] px-2.5 rounded-[11px] text-[11px] font-semibold uppercase tracking-wide border',
              equipment.criticality === 'critique' ? 'bg-status-critical/15 text-status-critical border-status-critical/30' :
              equipment.criticality === 'elevee' ? 'bg-status-warning/15 text-status-warning border-status-warning/30' :
              equipment.criticality === 'moyenne' ? 'bg-status-info/15 text-status-info border-status-info/30' :
              'bg-status-neutral/15 text-status-neutral border-status-neutral/30'
            )}>
              {CRITICALITY_LABELS[equipment.criticality]}
            </span>
            <StatusBadge status={STATUS_VARIANTS[equipment.status]} label={STATUS_LABELS[equipment.status]} />

          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => onShowQR(equipment)}
            className="p-2 rounded-md hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors"
            title="QR Code"
          >
            <QRCodeSVG value={equipment.qrCode ?? equipment.code} size={20} level="H" />
          </button>
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-md hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.97 }}
                  className="absolute right-0 mt-1 w-44 bg-bg-tooltip border border-[rgba(90,94,117,0.3)] rounded-lg shadow-card-hover z-[60] overflow-hidden"
                >
                  <button onClick={() => { setMenuOpen(false); onEdit?.(equipment); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-bg-hover transition-colors">
                    <Pencil className="w-4 h-4" /> Modifier
                  </button>
                  <button onClick={() => { setMenuOpen(false); onShowHistory?.(equipment); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-bg-hover transition-colors">
                    <History className="w-4 h-4" /> Historique
                  </button>
                  <button onClick={() => { setMenuOpen(false); onDelete?.(equipment); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-status-critical hover:bg-status-critical/10 transition-colors">
                    <Trash2 className="w-4 h-4" /> Supprimer
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-2 mb-5">
        <button onClick={() => onNewBT(equipment)} className="btn-primary h-9 px-4 text-sm flex items-center gap-1.5">
          <ClipboardList className="w-4 h-4" />
          Nouveau BT
        </button>
        <button onClick={() => onEdit?.(equipment)} className="btn-secondary h-9 px-4 text-sm flex items-center gap-1.5">
          <Pencil className="w-4 h-4" />
          Modifier
        </button>
        <a
          href={`${import.meta.env.VITE_API_URL}/equipments/${equipment.id}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary h-9 px-4 text-sm flex items-center gap-1.5"
        >
          <FileDown className="w-4 h-4" />
          Exporter PDF
        </a>
        <button
          onClick={async () => {
            try {
              const res = await fetch(`${import.meta.env.VITE_API_URL}/equipments/${equipment.id}/duplicate`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
              });
              const json = await res.json();
              if (json.success) {
                window.location.reload();
              }
            } catch (e) {
              console.error(e);
            }
          }}
          className="btn-secondary h-9 px-4 text-sm flex items-center gap-1.5"
        >
          <CopyIcon className="w-4 h-4" />
          Dupliquer
        </button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-bg-elevated rounded-xl border border-[rgba(90,94,117,0.2)] p-4"
        >
          <h3 className="text-sm font-semibold text-text-primary mb-3">Identification</h3>
          <div className="flex flex-col">
            <InfoRow label="Code" value={equipment.code} mono copyable={equipment.code} />
            <InfoRow label="Fabricant" value={equipment.manufacturer ?? '—'} />
            <InfoRow label="Modèle" value={equipment.model ?? '—'} />
            <InfoRow label="N° série" value={equipment.serialNumber ?? '—'} mono />
            <InfoRow label="Année" value={equipment.commissioningDate ? new Date(equipment.commissioningDate).getFullYear() : '—'} />
            <InfoRow label="Localisation" value={`${equipment.line}`} />
            <div className="flex items-center gap-3 pt-2 mt-1 border-t border-[rgba(90,94,117,0.1)]">
              <button onClick={() => onShowQR(equipment)} className="hover:opacity-80 transition-opacity">
                <QRCodeSVG value={equipment.qrCode ?? equipment.code} size={32} level="H" />
              </button>
              <span className="text-xs text-text-muted">Cliquez pour agrandir</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-bg-elevated rounded-xl border border-[rgba(90,94,117,0.2)] p-4"
        >
          <h3 className="text-sm font-semibold text-text-primary mb-3">Caractéristiques</h3>
          <div className="flex flex-col">
            <InfoRow label="Type" value={equipment.type} />
            <InfoRow label="Capacité" value="—" />
            <InfoRow label="Alimentation" value="400V / 250kW" />
            <InfoRow label="Dimensions" value="4.2m x 2.1m x 3.5m" />
            <InfoRow label="Poids" value="12,400 kg" />

          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-bg-elevated rounded-xl border border-[rgba(90,94,117,0.2)] p-4"
        >
          <h3 className="text-sm font-semibold text-text-primary mb-3">Maintenance</h3>
          <div className="flex flex-col">
            <InfoRow label="Statut" value={STATUS_LABELS[equipment.status]} />
            <InfoRow label="Taux dispo. (30j)" value={`${equipment.availability ?? 0}%`} />
            <InfoRow label="MTTR moyen" value={`${equipment.mttr ?? 0} h`} />
            <InfoRow label="Dernière panne" value="12/01/2025 (BT #4432)" />
            <InfoRow
              label="Prochaine MP"
              value={
                <span className="flex items-center gap-1.5">
                  {equipment.nextMaintenanceDate ?? '—'}
                  {equipment.nextMaintenanceDate && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-status-warning/15 text-status-warning">
                      3 jours
                    </span>
                  )}
                </span>
              }
            />
            <InfoRow label="Compteur horaire" value="14,732 h" />
            <InfoRow label="Coût arrêt/h" value="3,500 €" />
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="mb-4">
        <div className="flex items-center gap-1 border-b border-[rgba(90,94,117,0.2)]">
          {TAB_ITEMS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
                  isActive
                    ? 'text-accent-teal border-accent-teal'
                    : 'text-text-secondary border-transparent hover:text-text-primary'
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="min-h-[200px]"
        >
          {activeTab === 'bt' && (
            <div className="flex flex-col rounded-xl border border-[rgba(90,94,117,0.2)] overflow-hidden bg-bg-elevated">
              <div className="grid grid-cols-[100px_100px_80px_1fr_80px_100px_100px] gap-3 px-4 py-2.5 bg-bg-primary text-text-secondary text-[11px] font-medium uppercase tracking-wider border-b border-[rgba(90,94,117,0.15)]">
                <span>N° BT</span>
                <span>Date</span>
                <span>Type</span>
                <span>Description</span>
                <span>Durée</span>
                <span>Technicien</span>
                <span>Statut</span>
              </div>
              {eqWOs.map((wo) => (
                <div
                  key={wo.id}
                  className="grid grid-cols-[100px_100px_80px_1fr_80px_100px_100px] gap-3 px-4 py-3 items-center border-b border-[rgba(90,94,117,0.1)] hover:bg-bg-hover transition-colors"
                >
                  <span className="text-xs font-mono text-accent-teal">{wo.number}</span>
                  <span className="text-xs text-text-secondary">{wo.createdAt.slice(0, 10)}</span>
                  <span className="text-xs text-text-secondary capitalize">{wo.type}</span>
                  <span className="text-xs text-text-primary truncate">{wo.title}</span>
                  <span className="text-xs text-text-secondary tabular-nums">{wo.duration ?? '—'}h</span>
                  <span className="text-xs text-text-secondary">{wo.assignedTo ?? '—'}</span>
                  <BTStatusBadge status={wo.status} />
                </div>
              ))}
              {eqWOs.length === 0 && (
                <div className="py-8 text-center text-text-muted text-sm">Aucun bon de travail pour cet équipement</div>
              )}
            </div>
          )}

          {activeTab === 'mp' && (
            <div className="flex flex-col gap-3">
              {eqPMs.map((pm) => (
                <div key={pm.id} className="bg-bg-elevated rounded-xl border border-[rgba(90,94,117,0.2)] p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary">{pm.title}</h4>
                      <p className="text-xs text-text-secondary mt-0.5">{pm.description}</p>
                    </div>
                    <button className="btn-secondary h-8 px-3 text-xs flex-shrink-0">
                      Générer BT
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                    <div>
                      <p className="text-[11px] text-text-secondary uppercase">Fréquence</p>
                      <p className="text-sm text-text-primary capitalize">{pm.frequency}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-text-secondary uppercase">Dernière</p>
                      <p className="text-sm text-text-primary">{pm.lastDoneDate ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-text-secondary uppercase">Prochaine</p>
                      <p className="text-sm text-text-primary">{pm.nextDueDate}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-text-secondary uppercase">Durée estimée</p>
                      <p className="text-sm text-text-primary">{pm.estimatedDuration}h</p>
                    </div>
                  </div>
                  <PMProgressBar lastDone={pm.lastDoneDate} nextDue={pm.nextDueDate} />
                </div>
              ))}
              {eqPMs.length === 0 && (
                <div className="py-8 text-center text-text-muted text-sm">Aucune maintenance préventive planifiée</div>
              )}
            </div>
          )}

          {activeTab === 'docs' && (
            <DocumentPanel equipmentId={equipment.id} />
          )}

          {activeTab === 'sub' && (
            <SousEnsemblePanel equipmentId={equipment.id} />
          )}

          {activeTab === 'compteur' && (
            <CompteurPanel
              equipmentId={equipment.id}
              compteurActuel={equipment.counterValue ?? null}
              unite={equipment.counterUnit ?? null}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
