import { useState, useMemo, useCallback } from 'react';
import { usePreventivePlans, useGeneratePreventiveWO } from '@/hooks/usePreventive';
import { useWorkOrders } from '@/hooks/useWorkOrders';
import { StatusBadge } from '@/components/StatusBadge';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, KanbanSquare, ListChecks, CalendarDays, ClipboardList,
  ChevronLeft, ChevronRight, Eye, Wrench, MoreVertical, CalendarClock,
  CheckCircle2, Clock, AlertTriangle, X, Filter, User, Timer,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import { format, parseISO, addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, getDay, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { PreventivePlan } from '@/types';

type PMView = 'planificateur' | 'taches' | 'calendrier' | 'generes';

const TABS: { key: PMView; label: string; icon: React.ElementType }[] = [
  { key: 'planificateur', label: 'Planificateur', icon: KanbanSquare },
  { key: 'taches', label: 'Tâches', icon: ListChecks },
  { key: 'calendrier', label: 'Calendrier', icon: CalendarDays },
  { key: 'generes', label: 'Générés', icon: ClipboardList },
];

const FREQUENCY_LABELS: Record<string, string> = {
  daily: 'Quotidienne',
  weekly: 'Hebdomadaire',
  monthly: 'Mensuelle',
  quarterly: 'Trimestrielle',
  biannual: 'Semestrielle',
  annual: 'Annuelle',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'À venir',
  suspended: 'Suspendu',
  overdue: 'En retard',
};

function getDaysUntil(dateStr: string): number {
  return differenceInDays(parseISO(dateStr), new Date());
}

function getStatusFromPlan(plan: PreventivePlan): 'ok' | 'warning' | 'critical' | 'info' {
  if (plan.status === 'overdue') return 'critical';
  const days = getDaysUntil(plan.nextDueDate);
  if (days <= 0) return 'critical';
  if (days <= 3) return 'warning';
  return 'ok';
}

/* ─── Sub-components ─── */

function PMFilters({
  search,
  onSearchChange,
  equipmentFilter,
  onEquipmentChange,
  frequencyFilter,
  onFrequencyChange,
  statusFilter,
  onStatusChange,
  equipmentList,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  equipmentFilter: string;
  onEquipmentChange: (v: string) => void;
  frequencyFilter: string;
  onFrequencyChange: (v: string) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
  equipmentList: string[];
}) {
  return (
    <div className="flex flex-col gap-3 mb-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher une tâche..."
            className="input-industrial w-full pl-9"
          />
        </div>
        <select
          value={equipmentFilter}
          onChange={(e) => onEquipmentChange(e.target.value)}
          className="input-industrial h-9 text-sm min-w-[160px]"
        >
          <option value="">Tous équipements</option>
          {equipmentList.map((eq) => (
            <option key={eq} value={eq}>{eq}</option>
          ))}
        </select>
        <select
          value={frequencyFilter}
          onChange={(e) => onFrequencyChange(e.target.value)}
          className="input-industrial h-9 text-sm min-w-[140px]"
        >
          <option value="">Toutes fréquences</option>
          {Object.entries(FREQUENCY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="input-industrial h-9 text-sm min-w-[120px]"
        >
          <option value="">Tous statuts</option>
          <option value="active">À venir</option>
          <option value="overdue">En retard</option>
          <option value="suspended">Suspendu</option>
        </select>
        <button className="btn-ghost h-9 px-3 text-xs gap-1.5 inline-flex items-center">
          <Filter className="w-3.5 h-3.5" />
          Filtres
        </button>
      </div>
    </div>
  );
}

function PMCalendarView({ plans, onTaskClick }: { plans: PreventivePlan[]; onTaskClick: (p: PreventivePlan) => void }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const tasksByDay = useMemo(() => {
    const map = new Map<string, PreventivePlan[]>();
    plans.forEach((p) => {
      const d = parseISO(p.nextDueDate);
      const key = format(d, 'yyyy-MM-dd');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    });
    return map;
  }, [plans]);

  return (
    <div className="bg-bg-elevated rounded-xl border border-[rgba(90,94,117,0.2)] p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary">
          {format(currentDate, 'MMMM yyyy', { locale: fr })}
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="btn-ghost h-8 w-8 p-0 flex items-center justify-center">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="btn-ghost h-8 px-3 text-xs">Aujourd'hui</button>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="btn-ghost h-8 w-8 p-0 flex items-center justify-center">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-px bg-[rgba(90,94,117,0.2)] rounded-lg overflow-hidden">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d) => (
          <div key={d} className="bg-bg-elevated py-2 text-center text-[11px] font-medium uppercase tracking-wide text-text-secondary">
            {d}
          </div>
        ))}
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const dayTasks = tasksByDay.get(key) ?? [];
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isTodayDate = isToday(day);
          return (
            <div
              key={key}
              className={cn(
                'bg-bg-elevated min-h-[100px] p-2 transition-colors cursor-pointer hover:bg-bg-hover',
                !isCurrentMonth && 'opacity-40',
                isTodayDate && 'ring-1 ring-accent-teal'
              )}
              onClick={() => dayTasks.length > 0 && onTaskClick(dayTasks[0])}
            >
              <div className={cn('text-sm font-medium mb-1', isTodayDate ? 'text-accent-teal' : 'text-text-primary')}>{format(day, 'd')}</div>
              <div className="flex flex-col gap-1">
                {dayTasks.slice(0, 3).map((t) => (
                  <div
                    key={t.id}
                    className={cn(
                      'text-[10px] truncate px-1.5 py-0.5 rounded',
                      t.status === 'overdue' && 'bg-[rgba(239,68,68,0.12)] text-status-critical border-l-2 border-status-critical',
                      t.status !== 'overdue' && 'bg-[rgba(14,165,233,0.12)] text-accent-teal'
                    )}
                  >
                    {t.title}
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <div className="text-[10px] text-text-muted pl-1">+{dayTasks.length - 3} autres</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PMTaskTable({
  plans,
  onView,
  onGenerateBT,
}: {
  plans: PreventivePlan[];
  onView: (p: PreventivePlan) => void;
  onGenerateBT: (p: PreventivePlan) => void;
}) {
  const [sortKey, setSortKey] = useState<string>('nextDueDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...plans].sort((a, b) => {
      if (sortKey === 'nextDueDate') return dir * (parseISO(a.nextDueDate).getTime() - parseISO(b.nextDueDate).getTime());
      if (sortKey === 'title') return dir * a.title.localeCompare(b.title);
      if (sortKey === 'equipmentName') return dir * a.equipmentName.localeCompare(b.equipmentName);
      return 0;
    });
  }, [plans, sortKey, sortDir]);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  return (
    <div className="bg-bg-elevated rounded-xl border border-[rgba(90,94,117,0.2)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-bg-primary border-b border-[rgba(90,94,117,0.2)]">
              {[
                { key: 'title', label: 'Tâche' },
                { key: 'equipmentName', label: 'Équipement' },
                { key: 'frequency', label: 'Fréquence' },
                { key: 'lastDoneDate', label: 'Dernière exécution' },
                { key: 'nextDueDate', label: 'Prochaine échéance' },
                { key: 'assignedTo', label: 'Technicien' },
                { key: 'status', label: 'Statut' },
                { key: 'actions', label: 'Actions' },
              ].map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.key !== 'actions' && toggleSort(col.key)}
                  className={cn(
                    'text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wide text-text-secondary whitespace-nowrap',
                    col.key !== 'actions' && 'cursor-pointer hover:text-text-primary'
                  )}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && (
                      sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {sorted.map((plan, idx) => {
                const days = getDaysUntil(plan.nextDueDate);
                const rowStatus = getStatusFromPlan(plan);
                return (
                  <motion.tr
                    key={plan.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.03, duration: 0.2 }}
                    className={cn(
                      'border-b border-[rgba(90,94,117,0.1)] hover:bg-bg-hover cursor-pointer transition-colors',
                      rowStatus === 'critical' && 'border-l-[3px] border-l-status-critical bg-[rgba(239,68,68,0.05)]',
                      rowStatus === 'warning' && 'border-l-[3px] border-l-status-warning',
                      rowStatus === 'ok' && 'border-l-[3px] border-l-status-ok'
                    )}
                    onClick={() => onView(plan)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-text-primary text-sm">{plan.title}</div>
                      <div className="text-xs text-text-muted">{plan.code}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{plan.equipmentName}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status="info" label={FREQUENCY_LABELS[plan.frequency] ?? plan.frequency} />
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">
                      {plan.lastDoneDate ? format(parseISO(plan.lastDoneDate), 'dd/MM/yyyy') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-text-primary">{format(parseISO(plan.nextDueDate), 'dd/MM/yyyy')}</span>
                        {plan.status === 'overdue' ? (
                          <StatusBadge status="critical" label="RETARD" />
                        ) : days <= 3 ? (
                          <StatusBadge status="warning" label={`${days}j`} />
                        ) : (
                          <StatusBadge status="ok" label={`${days}j`} />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-accent-teal/20 text-accent-teal flex items-center justify-center text-[10px] font-bold">
                          {plan.assignedTo?.split(' ').map((n) => n[0]).join('') ?? '?'}
                        </div>
                        {plan.assignedTo}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={plan.status === 'overdue' ? 'critical' : plan.status === 'active' ? 'ok' : 'neutral'}
                        label={STATUS_LABELS[plan.status] ?? plan.status}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); onView(plan); }}
                          className="p-1.5 rounded-md hover:bg-bg-hover text-text-secondary hover:text-text-primary"
                          title="Voir"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onGenerateBT(plan); }}
                          className="p-1.5 rounded-md hover:bg-accent-teal-glow text-accent-teal"
                          title="Générer BT"
                        >
                          <Wrench className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); }}
                          className="p-1.5 rounded-md hover:bg-bg-hover text-text-secondary hover:text-text-primary"
                          title="Plus"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-text-secondary">
                  <CalendarClock className="w-8 h-8 mx-auto mb-3 text-text-muted" />
                  <p className="text-sm font-medium">Aucune tâche de maintenance préventive</p>
                  <p className="text-xs text-text-muted mt-1">Créer votre première tâche</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PMPlannerView({ plans, onTaskClick }: { plans: PreventivePlan[]; onTaskClick: (p: PreventivePlan) => void }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const today = new Date();
  const start = addDays(startOfWeek(today, { weekStartsOn: 1 }), weekOffset * 7);
  const end = endOfWeek(start, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });

  return (
    <div className="bg-bg-elevated rounded-xl border border-[rgba(90,94,117,0.2)] p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary">Planificateur hebdomadaire</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekOffset((w) => w - 1)} className="btn-ghost h-8 px-3 text-xs flex items-center gap-1">
            <ChevronLeft className="w-3.5 h-3.5" />
            Sem. précédente
          </button>
          <button onClick={() => setWeekOffset(0)} className="btn-ghost h-8 px-3 text-xs">Aujourd'hui</button>
          <button onClick={() => setWeekOffset((w) => w + 1)} className="btn-ghost h-8 px-3 text-xs flex items-center gap-1">
            Sem. suivante
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-px bg-[rgba(90,94,117,0.2)] rounded-lg overflow-hidden">
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const dayPlans = plans.filter((p) => p.nextDueDate === key);
          const isTodayDate = isToday(day);
          return (
            <div key={key} className={cn('bg-bg-elevated min-h-[180px] p-2', isTodayDate && 'ring-1 ring-accent-teal')}> 
              <div className={cn('text-center text-sm font-semibold mb-2 pb-2 border-b border-[rgba(90,94,117,0.15)]', isTodayDate ? 'text-accent-teal' : 'text-text-primary')}>
                <div className="text-[11px] text-text-muted uppercase">{format(day, 'EEE', { locale: fr })}</div>
                <div>{format(day, 'd')}</div>
              </div>
              <div className="flex flex-col gap-1.5">
                {dayPlans.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => onTaskClick(p)}
                    className={cn(
                      'text-[11px] px-2 py-1.5 rounded cursor-pointer hover:brightness-110',
                      p.status === 'overdue' && 'bg-[rgba(239,68,68,0.15)] text-status-critical border-l-2 border-status-critical',
                      p.status !== 'overdue' && 'bg-[rgba(14,165,233,0.12)] text-accent-teal border-l-2 border-accent-teal'
                    )}
                  >
                    <div className="font-medium truncate">{p.title}</div>
                    <div className="text-[10px] opacity-80 truncate">{p.equipmentName}</div>
                  </motion.div>
                ))}
                {dayPlans.length === 0 && (
                  <div className="text-[11px] text-text-muted text-center py-4">—</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-4 text-[11px] text-text-secondary">
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[rgba(14,165,233,0.25)] border-l-2 border-accent-teal" /> À venir</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[rgba(239,68,68,0.15)] border-l-2 border-status-critical" /> En retard</div>
      </div>
    </div>
  );
}

function PMGeneratedView({ plans, onView }: { plans: PreventivePlan[]; onView: (p: PreventivePlan) => void }) {
  const generated = useMemo(() => plans.filter((p) => p.status === 'overdue'), [plans]);
  return (
    <div className="bg-bg-elevated rounded-xl border border-[rgba(90,94,117,0.2)] overflow-hidden">
      <div className="px-5 py-4 border-b border-[rgba(90,94,117,0.2)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-accent-teal" />
          <h2 className="text-base font-semibold text-text-primary">BT auto-générés</h2>
        </div>
        <StatusBadge status="warning" label={`${generated.length} en attente`} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-bg-primary border-b border-[rgba(90,94,117,0.2)]">
              {['Tâche source', 'Équipement', 'Échéance', 'Généré le', 'État', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wide text-text-secondary">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {generated.map((plan) => (
              <tr
                key={plan.id}
                onClick={() => onView(plan)}
                className="border-b border-[rgba(90,94,117,0.1)] hover:bg-bg-hover cursor-pointer border-l-[3px] border-l-status-critical"
              >
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-text-primary">{plan.title}</div>
                  <div className="text-xs text-accent-teal">{plan.code}</div>
                </td>
                <td className="px-4 py-3 text-sm text-text-secondary">{plan.equipmentName}</td>
                <td className="px-4 py-3 text-sm text-status-critical">{format(parseISO(plan.nextDueDate), 'dd/MM/yyyy')}</td>
                <td className="px-4 py-3 text-sm text-text-secondary">{format(parseISO(plan.nextDueDate), 'dd/MM/yyyy')}</td>
                <td className="px-4 py-3"><StatusBadge status="warning" label="En attente" /></td>
                <td className="px-4 py-3">
                  <button onClick={(e) => { e.stopPropagation(); onView(plan); }} className="p-1.5 rounded-md hover:bg-bg-hover text-text-secondary hover:text-text-primary">
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {generated.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-text-secondary">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-3 text-status-ok" />
                  <p className="text-sm font-medium">Toutes les maintenances sont à jour</p>
                  <p className="text-xs text-text-muted mt-1">Aucun BT auto-généré en attente</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PMTaskDrawer({
  plan,
  open,
  onClose,
  onGenerateBT,
}: {
  plan: PreventivePlan | null;
  open: boolean;
  onClose: () => void;
  onGenerateBT: (p: PreventivePlan) => void;
}) {
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({});

  if (!plan) return null;

  const completedCount = plan.checklist.filter((_, i) => checklistState[i] || false).length;
  const progress = plan.checklist.length > 0 ? Math.round((completedCount / plan.checklist.length) * 100) : 0;
  const days = getDaysUntil(plan.nextDueDate);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-[rgba(10,11,20,0.75)] backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
            className="fixed right-0 top-0 bottom-0 z-[200] w-full max-w-[480px] bg-bg-elevated border-l border-[rgba(90,94,117,0.3)] shadow-card-hover overflow-y-auto"
          >
            <div className="sticky top-0 z-10 bg-bg-elevated border-b border-[rgba(90,94,117,0.2)] px-6 py-4 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-semibold text-text-primary">{plan.title}</h2>
                  <StatusBadge
                    status={plan.status === 'overdue' ? 'critical' : plan.status === 'active' ? 'ok' : 'neutral'}
                    label={STATUS_LABELS[plan.status] ?? plan.status}
                  />
                </div>
                <p className="text-sm text-accent-teal">{plan.equipmentName}</p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-md hover:bg-bg-hover text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-6">
              {/* Info block */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-bg-primary rounded-lg p-3">
                  <div className="text-[11px] text-text-muted uppercase tracking-wide mb-1">Fréquence</div>
                  <div className="text-sm font-medium text-text-primary">{FREQUENCY_LABELS[plan.frequency]}</div>
                </div>
                <div className="bg-bg-primary rounded-lg p-3">
                  <div className="text-[11px] text-text-muted uppercase tracking-wide mb-1">Durée estimée</div>
                  <div className="text-sm font-medium text-text-primary">{plan.estimatedDuration}h</div>
                </div>
                <div className="bg-bg-primary rounded-lg p-3">
                  <div className="text-[11px] text-text-muted uppercase tracking-wide mb-1">Dernière exécution</div>
                  <div className="text-sm font-medium text-text-primary">
                    {plan.lastDoneDate ? format(parseISO(plan.lastDoneDate), 'dd/MM/yyyy') : '—'}
                  </div>
                </div>
                <div className="bg-bg-primary rounded-lg p-3">
                  <div className="text-[11px] text-text-muted uppercase tracking-wide mb-1">Prochaine échéance</div>
                  <div className="text-sm font-medium text-text-primary">
                    {format(parseISO(plan.nextDueDate), 'dd/MM/yyyy')}
                    <span className={cn('ml-2 text-xs', days <= 0 ? 'text-status-critical' : days <= 3 ? 'text-status-warning' : 'text-status-ok')}>
                      ({days <= 0 ? 'RETARD' : `${days}j`})
                    </span>
                  </div>
                </div>
              </div>

              {/* Assigned */}
              <div className="flex items-center gap-3 bg-bg-primary rounded-lg p-3">
                <div className="w-8 h-8 rounded-full bg-accent-teal/20 text-accent-teal flex items-center justify-center text-xs font-bold">
                  {plan.assignedTo?.split(' ').map((n) => n[0]).join('') ?? '?'}
                </div>
                <div>
                  <div className="text-sm font-medium text-text-primary">{plan.assignedTo ?? 'Non assigné'}</div>
                  <div className="text-xs text-text-muted">Technicien assigné</div>
                </div>
              </div>

              {/* Checklist */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-accent-teal" />
                    Checklist
                  </h3>
                  <div className="text-xs text-text-secondary">{completedCount}/{plan.checklist.length} ({progress}%)</div>
                </div>
                <div className="w-full h-1.5 bg-bg-primary rounded-full overflow-hidden mb-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className={cn('h-full rounded-full', progress === 100 ? 'bg-status-ok' : 'bg-accent-teal')}
                  />
                </div>
                <div className="space-y-2">
                  {plan.checklist.map((item, idx) => {
                    const checked = checklistState[idx] || false;
                    return (
                      <div
                        key={idx}
                        onClick={() => setChecklistState((s) => ({ ...s, [idx]: !checked }))}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors border',
                          checked
                            ? 'bg-[rgba(34,197,94,0.08)] border-[rgba(34,197,94,0.2)]'
                            : 'bg-bg-primary border-[rgba(90,94,117,0.15)] hover:border-[rgba(90,94,117,0.3)]'
                        )}
                      >
                        <div className={cn(
                          'w-5 h-5 rounded border flex items-center justify-center transition-colors',
                          checked ? 'bg-status-ok border-status-ok' : 'border-text-muted'
                        )}>
                          {checked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className={cn('text-sm', checked ? 'text-text-secondary line-through' : 'text-text-primary')}>{item}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Spare parts */}
              {plan.sparePartsNeeded && plan.sparePartsNeeded.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-accent-teal" />
                    Pièces nécessaires
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {plan.sparePartsNeeded.map((sp) => (
                      <span key={sp} className="px-2.5 py-1 rounded-md bg-bg-primary text-xs text-text-secondary border border-[rgba(90,94,117,0.2)]">
                        {sp}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="sticky bottom-0 bg-bg-elevated border-t border-[rgba(90,94,117,0.2)] px-6 py-4 flex items-center gap-2">
              <button onClick={() => onGenerateBT(plan)} className="btn-primary flex-1 text-sm h-10">
                Générer un BT
              </button>
              <button className="btn-secondary text-sm h-10 px-3">Modifier</button>
              <button className="btn-ghost text-sm h-10 px-3 text-status-critical hover:bg-status-critical/10">Archiver</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Main Page ─── */

export default function MaintenancePreventive() {
  const { data: preventivePlans = [] } = usePreventivePlans();
  const generateMutation = useGeneratePreventiveWO();
  const { data: workOrders = [] } = useWorkOrders();
  const [activeTab, setActiveTab] = useState<PMView>('planificateur');
  const [search, setSearch] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState('');
  const [frequencyFilter, setFrequencyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<PreventivePlan | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmPlan, setConfirmPlan] = useState<PreventivePlan | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const equipmentList = useMemo(
    () => Array.from(new Set(preventivePlans.map((p) => p.equipmentName))).sort(),
    [preventivePlans]
  );

  const filteredPlans = useMemo(() => {
    return preventivePlans.filter((p) => {
      const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase()) || p.equipmentName.toLowerCase().includes(search.toLowerCase());
      const matchEquipment = !equipmentFilter || p.equipmentName === equipmentFilter;
      const matchFreq = !frequencyFilter || p.frequency === frequencyFilter;
      const matchStatus = !statusFilter || p.status === statusFilter;
      return matchSearch && matchEquipment && matchFreq && matchStatus;
    });
  }, [preventivePlans, search, equipmentFilter, frequencyFilter, statusFilter]);

  const handleView = useCallback((plan: PreventivePlan) => {
    setSelectedPlan(plan);
    setDrawerOpen(true);
  }, []);

  const handleGenerateBT = useCallback((plan: PreventivePlan) => {
    setConfirmPlan(plan);
    setConfirmOpen(true);
  }, []);

  const confirmGenerateBT = useCallback(() => {
    if (!confirmPlan) return;
    generateMutation.mutateAsync(confirmPlan.id).then(() => {
      setConfirmOpen(false);
      setConfirmPlan(null);
      setDrawerOpen(false);
      setToast(`BT généré pour ${confirmPlan.title}`);
      setTimeout(() => setToast(null), 4000);
    });
  }, [confirmPlan, generateMutation]);

  return (
    <div className="min-h-[100dvh] p-5 lg:p-8">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-[300] bg-bg-elevated border-l-[3px] border-status-ok px-4 py-3 rounded-lg shadow-card flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-status-ok" />
            <span className="text-sm text-text-primary">{toast}</span>
            <button onClick={() => setToast(null)} className="text-text-muted hover:text-text-primary">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[1.75rem] font-bold text-text-primary tracking-tight">MAINTENANCE PRÉVENTIVE</h1>
          <p className="text-sm text-text-secondary mt-1">Planification et suivi des interventions programmées</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une tâche..."
              className="input-industrial w-[240px] pl-9 hidden md:block"
            />
          </div>
          <button className="btn-primary flex items-center gap-2 text-sm h-10">
            <Plus className="w-4 h-4" />
            Nouvelle tâche
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 p-1 bg-bg-primary rounded-lg w-fit">
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all',
                active ? 'bg-accent-teal text-white' : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <PMFilters
        search={search}
        onSearchChange={setSearch}
        equipmentFilter={equipmentFilter}
        onEquipmentChange={setEquipmentFilter}
        frequencyFilter={frequencyFilter}
        onFrequencyChange={setFrequencyFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        equipmentList={equipmentList}
      />

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'planificateur' && (
            <PMPlannerView plans={filteredPlans} onTaskClick={handleView} />
          )}
          {activeTab === 'taches' && (
            <PMTaskTable plans={filteredPlans} onView={handleView} onGenerateBT={handleGenerateBT} />
          )}
          {activeTab === 'calendrier' && (
            <PMCalendarView plans={filteredPlans} onTaskClick={handleView} />
          )}
          {activeTab === 'generes' && (
            <PMGeneratedView plans={filteredPlans} onView={handleView} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Drawer */}
      <PMTaskDrawer
        plan={selectedPlan}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onGenerateBT={handleGenerateBT}
      />

      {/* Confirm dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title="Générer un BT ?"
        description={confirmPlan ? `Créer un bon de travail pour "${confirmPlan.title}" à partir de cette tâche de maintenance préventive.` : ''}
        confirmLabel="Générer"
        cancelLabel="Annuler"
        variant="info"
        onConfirm={confirmGenerateBT}
        onCancel={() => { setConfirmOpen(false); setConfirmPlan(null); }}
      />
    </div>
  );
}
