import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  Clock, MapPin, User, Wrench, AlertTriangle, LayoutTemplate,
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { useWorkOrders, useUpdateWorkOrderStatus } from '@/hooks/useWorkOrders';
import { cn } from '@/lib/utils';
import type { WorkOrder, PreventivePlan, WorkOrderStatus } from '@/types';

type ViewMode = 'week' | 'month' | 'kanban';

/* ─── Types ─── */
interface CalendarEvent {
  id: string;
  title: string;
  subtitle: string;
  type: 'wo-corrective' | 'wo-preventive' | 'wo-safety' | 'pm';
  date: Date;
  duration: number; // en heures
  assignedTo?: string;
  priority?: string;
  status?: string;
  isAllDay?: boolean;
  data: WorkOrder | PreventivePlan;
}

/* ─── Helpers ─── */
const JOURS_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const JOURS_FULL = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const HEURE_DEBUT = 6;
const HEURE_FIN = 20;
const HEURES = Array.from({ length: HEURE_FIN - HEURE_DEBUT + 1 }, (_, i) => HEURE_DEBUT + i);

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

function getEventColor(type: CalendarEvent['type']): { bg: string; border: string; text: string; hover: string } {
  switch (type) {
    case 'wo-corrective':
      return { bg: 'bg-[#E63946]/20', border: 'border-[#E63946]', text: 'text-[#FF4D5A]', hover: 'hover:bg-[#E63946]/30' };
    case 'wo-preventive':
      return { bg: 'bg-[#3B82F6]/20', border: 'border-[#3B82F6]', text: 'text-[#93C5FD]', hover: 'hover:bg-[#3B82F6]/30' };
    case 'wo-safety':
      return { bg: 'bg-[#FF8500]/20', border: 'border-[#FF8500]', text: 'text-[#FFD60A]', hover: 'hover:bg-[#FF8500]/30' };
    case 'pm':
      return { bg: 'bg-[#10B981]/20', border: 'border-[#10B981]', text: 'text-[#6EE7B7]', hover: 'hover:bg-[#10B981]/30' };
  }
}

/* ═══════════════════════════════════════════
   PLANIFICATION PAGE — Style Google Agenda
   ═══════════════════════════════════════════ */
export default function Planification() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const { data: workOrdersData = [] } = useWorkOrders();
  const preventivePlans: any[] = [];
  const updateStatus = useUpdateWorkOrderStatus();

  const workOrders = workOrdersData as WorkOrder[];

  /* ── Build events ── */
  const events = useMemo<CalendarEvent[]>(() => {
    const list: CalendarEvent[] = [];

    workOrders.forEach((wo) => {
      if (wo.plannedStart) {
        const date = new Date(wo.plannedStart);
        list.push({
          id: wo.id,
          title: wo.title,
          subtitle: wo.equipmentName,
          type: wo.type === 'preventive' ? 'wo-preventive' : wo.type === 'safety' ? 'wo-safety' : 'wo-corrective',
          date,
          duration: wo.duration ?? 1,
          assignedTo: wo.assignedTo,
          priority: wo.priority,
          status: wo.status,
          isAllDay: false,
          data: wo,
        });
      }
    });

    preventivePlans.forEach((pp) => {
      const date = new Date(pp.nextDueDate);
      date.setHours(8, 0, 0, 0);
      list.push({
        id: pp.id,
        title: pp.title,
        subtitle: pp.equipmentName,
        type: 'pm',
        date,
        duration: pp.estimatedDuration ?? 2,
        assignedTo: pp.assignedTo,
        isAllDay: true,
        data: pp,
      });
    });

    return list;
  }, [workOrders, preventivePlans]);

  const weekStart = getStartOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const goPrev = () => {
    if (viewMode === 'week') setCurrentDate(addDays(currentDate, -7));
    else setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const goNext = () => {
    if (viewMode === 'week') setCurrentDate(addDays(currentDate, 7));
    else setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  const goToday = () => setCurrentDate(new Date());

  /* ── Events for a specific day ── */
  const getDayEvents = (day: Date) => events.filter((e) => isSameDay(e.date, day));

  /* ── Position calculation for week view ── */
  const getEventStyle = (event: CalendarEvent) => {
    const hour = event.date.getHours() + event.date.getMinutes() / 60;
    const top = ((hour - HEURE_DEBUT) / (HEURE_FIN - HEURE_DEBUT)) * 100;
    const height = (event.duration / (HEURE_FIN - HEURE_DEBUT)) * 100;
    return { top: `${Math.max(0, top)}%`, height: `${Math.min(100 - top, height)}%` };
  };

  return (
    <div className="h-[calc(100dvh-64px)] flex flex-col">
      {/* ═══ HEADER ═══ */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-simply-gmao-green/10 bg-bg-elevated">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <button onClick={goPrev} className="p-1.5 rounded hover:bg-simply-gmao-green/10 transition-colors">
              <ChevronLeft className="w-5 h-5 text-simply-gmao-text" />
            </button>
            <button onClick={goNext} className="p-1.5 rounded hover:bg-simply-gmao-green/10 transition-colors">
              <ChevronRight className="w-5 h-5 text-simply-gmao-text" />
            </button>
          </div>
          <button
            onClick={goToday}
            className="h-8 px-3 border border-simply-gmao-green/20 rounded text-sm font-medium text-simply-gmao-text hover:bg-simply-gmao-green/5 transition-colors"
          >
            Aujourd'hui
          </button>
          <h1 className="text-lg font-semibold text-simply-gmao-text min-w-[200px]">
            {viewMode === 'week'
              ? `${weekDays[0].getDate()} ${MOIS[weekDays[0].getMonth()]} — ${weekDays[6].getDate()} ${MOIS[weekDays[6].getMonth()]} ${weekDays[6].getFullYear()}`
              : `${MOIS[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
          </h1>
        </div>

        <div className="flex items-center gap-1 bg-simply-gmao-green/10 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('week')}
            className={cn(
              'h-7 px-3 rounded text-sm font-medium transition-colors',
              viewMode === 'week' ? 'bg-simply-gmao-green text-white shadow-sm' : 'text-simply-gmao-text-light hover:text-simply-gmao-text'
            )}
          >
            Semaine
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={cn(
              'h-7 px-3 rounded text-sm font-medium transition-colors',
              viewMode === 'month' ? 'bg-simply-gmao-green text-white shadow-sm' : 'text-simply-gmao-text-light hover:text-simply-gmao-text'
            )}
          >
            Mois
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={cn(
              'h-7 px-3 rounded text-sm font-medium transition-colors flex items-center gap-1',
              viewMode === 'kanban' ? 'bg-simply-gmao-green text-white shadow-sm' : 'text-simply-gmao-text-light hover:text-simply-gmao-text'
            )}
          >
            <LayoutTemplate className="w-3.5 h-3.5" />
            Kanban
          </button>
        </div>
      </div>

      {/* ═══ LEGEND ═══ */}
      <div className="flex items-center gap-4 px-6 py-2 bg-bg-elevated border-b border-simply-gmao-green/10 text-xs text-text-secondary">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#E63946]/30 border border-[#E63946]" />BT Correctif</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#3B82F6]/30 border border-[#3B82F6]" />BT Préventif</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#FF8500]/30 border border-[#FF8500]" />BT Sécurité</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#10B981]/30 border border-[#10B981]" />Maint. Préventive</span>
      </div>

      {/* ═══ CALENDAR BODY ═══ */}
      {viewMode === 'week' ? (
        <WeekView
          weekDays={weekDays}
          getDayEvents={getDayEvents}
          getEventStyle={getEventStyle}
          onEventClick={setSelectedEvent}
        />
      ) : viewMode === 'month' ? (
        <MonthView
          currentDate={currentDate}
          events={events}
          onEventClick={setSelectedEvent}
        />
      ) : (
        <KanbanBoard
          workOrders={workOrders}
          onMove={(id, status) => updateStatus.mutate({ id, status })}
          onCardClick={(wo) => setSelectedEvent({
            id: wo.id,
            title: wo.title,
            subtitle: wo.equipmentName,
            type: wo.type === 'preventive' ? 'wo-preventive' : wo.type === 'safety' ? 'wo-safety' : 'wo-corrective',
            date: wo.plannedStart ? new Date(wo.plannedStart) : new Date(),
            duration: wo.duration ?? 1,
            assignedTo: wo.assignedTo,
            priority: wo.priority,
            status: wo.status,
            isAllDay: false,
            data: wo,
          })}
        />
      )}

      {/* ═══ EVENT DETAIL MODAL ═══ */}
      <AnimatePresence>
        {selectedEvent && (
          <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════
   WEEK VIEW (style Google Agenda)
   ═══════════════════════════════════════════ */
function WeekView({
  weekDays,
  getDayEvents,
  getEventStyle,
  onEventClick,
}: {
  weekDays: Date[];
  getDayEvents: (day: Date) => CalendarEvent[];
  getEventStyle: (event: CalendarEvent) => { top: string; height: string };
  onEventClick: (event: CalendarEvent) => void;
}) {
  const now = new Date();
  const currentHourPercent = ((now.getHours() + now.getMinutes() / 60 - HEURE_DEBUT) / (HEURE_FIN - HEURE_DEBUT)) * 100;

  return (
    <div className="flex-1 overflow-auto flex">
      {/* Axe des heures */}
      <div className="w-14 flex-shrink-0 bg-bg-elevated border-r border-simply-gmao-green/10">
        <div className="h-14 border-b border-simply-gmao-green/10" />
        {HEURES.map((h) => (
          <div key={h} className="h-16 relative">
            <span className="absolute -top-2 right-2 text-[11px] text-text-secondary font-medium">
              {h}h
            </span>
          </div>
        ))}
      </div>

      {/* Colonnes des jours */}
      <div className="flex-1 flex">
        {weekDays.map((day, idx) => {
          const dayEvents = getDayEvents(day);
          const today = isToday(day);

          return (
            <div key={idx} className={cn('flex-1 min-w-[140px] border-r border-simply-gmao-green/10 relative', today && 'bg-simply-gmao-gold/5')}>
              {/* Header jour */}
              <div className={cn('h-14 flex flex-col items-center justify-center border-b border-simply-gmao-green/10', today && 'bg-simply-gmao-gold text-simply-gmao-dark')}>
                <span className="text-[11px] font-medium uppercase">{JOURS_SHORT[idx]}</span>
                <span className={cn('text-xl font-semibold', today ? 'text-simply-gmao-dark' : 'text-text-primary')}>
                  {day.getDate()}
                </span>
              </div>

              {/* Grille horaire */}
              <div className="relative">
                {HEURES.map((h) => (
                  <div key={h} className="h-16 border-b border-simply-gmao-green/10" />
                ))}

                {/* Ligne "maintenant" */}
                {today && currentHourPercent >= 0 && currentHourPercent <= 100 && (
                  <div
                    className="absolute left-0 right-0 border-t-2 border-simply-gmao-danger z-10 pointer-events-none"
                    style={{ top: `${currentHourPercent}%` }}
                  >
                    <div className="absolute -left-1.5 -top-1.5 w-3 h-3 rounded-full bg-simply-gmao-danger" />
                  </div>
                )}

                {/* Événements */}
                {dayEvents.map((event) => {
                  const colors = getEventColor(event.type);
                  const style = event.isAllDay
                    ? { top: '0%', height: '24px' }
                    : getEventStyle(event);

                  return (
                    <motion.button
                      key={event.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => onEventClick(event)}
                      className={cn(
                        'absolute left-1 right-1 rounded px-2 py-1 text-left text-xs border-l-[3px] overflow-hidden cursor-pointer transition-colors',
                        colors.bg, colors.border, colors.text, colors.hover
                      )}
                      style={style}
                    >
                      <p className="font-semibold truncate leading-tight">{event.title}</p>
                      {!event.isAllDay && (
                        <p className="text-[10px] opacity-80 truncate">
                          {event.date.getHours()}h{event.date.getMinutes().toString().padStart(2, '0')} — {event.duration}h
                        </p>
                      )}
                      {event.isAllDay && <span className="text-[10px] opacity-80">Toute la journée</span>}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MONTH VIEW (grille classique)
   ═══════════════════════════════════════════ */
function MonthView({
  currentDate,
  events,
  onEventClick,
}: {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const list: Date[] = [];
    let startDay = firstDay.getDay() - 1;
    if (startDay === -1) startDay = 6;
    for (let i = startDay - 1; i >= 0; i--) list.push(new Date(year, month, -i));
    for (let i = 1; i <= lastDay.getDate(); i++) list.push(new Date(year, month, i));
    const remaining = 7 - (list.length % 7);
    if (remaining < 7) for (let i = 1; i <= remaining; i++) list.push(new Date(year, month + 1, i));
    return list;
  }, [year, month]);

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="grid grid-cols-7 gap-px bg-simply-gmao-green/10 rounded-lg overflow-hidden border border-simply-gmao-green/10">
        {JOURS_SHORT.map((j) => (
          <div key={j} className="bg-white text-center text-xs font-medium text-simply-gmao-text-light py-2">{j}</div>
        ))}
        {days.map((day, idx) => {
          const dayEvents = events.filter((e) => isSameDay(e.date, day));
          const isCurrentMonth = day.getMonth() === month;
          const today = isToday(day);

          return (
            <div
              key={idx}
              className={cn(
                'bg-bg-elevated min-h-[100px] p-1.5 transition-colors',
                !isCurrentMonth && 'opacity-40',
                today && 'bg-simply-gmao-gold/5'
              )}
            >
              <span className={cn('text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full', today ? 'bg-simply-gmao-gold text-simply-gmao-dark' : 'text-text-primary')}>
                {day.getDate()}
              </span>
              <div className="mt-1 space-y-0.5">
                {dayEvents.slice(0, 4).map((e) => {
                  const colors = getEventColor(e.type);
                  return (
                    <button
                      key={e.id}
                      onClick={() => onEventClick(e)}
                      className={cn('w-full text-left text-[10px] px-1.5 py-0.5 rounded border-l-[2px] truncate', colors.bg, colors.border, colors.text)}
                    >
                      {e.isAllDay ? e.title : `${e.date.getHours()}h${e.date.getMinutes().toString().padStart(2, '0')} ${e.title}`}
                    </button>
                  );
                })}
                {dayEvents.length > 4 && (
                  <span className="text-[10px] text-simply-gmao-text-light pl-1">+{dayEvents.length - 4} de plus</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   EVENT DETAIL MODAL
   ═══════════════════════════════════════════ */
function EventDetailModal({ event, onClose }: { event: CalendarEvent; onClose: () => void }) {
  const isWO = 'number' in event.data;
  const wo = isWO ? event.data as WorkOrder : null;
  const pm = !isWO ? event.data as PreventivePlan : null;
  const colors = getEventColor(event.type);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 z-40"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-bg-elevated rounded-xl shadow-2xl z-50 overflow-hidden border border-simply-gmao-green/20"
      >
        {/* Header coloré */}
        <div className={cn('h-2', colors.border.replace('border-', 'bg-'))} />

        <div className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <span className={cn('inline-block px-2 py-0.5 rounded text-[11px] font-semibold mb-2', colors.bg, colors.text)}>
                {event.type === 'wo-corrective' ? 'BT Correctif' : event.type === 'wo-preventive' ? 'BT Préventif' : event.type === 'wo-safety' ? 'BT Sécurité' : 'Maint. Préventive'}
              </span>
              <h2 className="text-lg font-bold text-text-primary">{event.title}</h2>
              <p className="text-sm text-text-secondary">{event.subtitle}</p>
            </div>
            <button onClick={onClose} className="p-1 rounded hover:bg-white/10 text-text-secondary">
              ✕
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3 text-sm text-text-primary">
              <Clock className="w-4 h-4 text-text-secondary flex-shrink-0" />
              <span>
                {event.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                {!event.isAllDay && (
                  <>, {event.date.getHours()}h{event.date.getMinutes().toString().padStart(2, '0')} — {event.duration}h</>
                )}
                {event.isAllDay && ' (toute la journée)'}
              </span>
            </div>

            {event.assignedTo && (
              <div className="flex items-center gap-3 text-sm text-text-primary">
                <User className="w-4 h-4 text-text-secondary flex-shrink-0" />
                <span>Assigné à : <strong>{event.assignedTo}</strong></span>
              </div>
            )}

            {wo && (
              <>
                <div className="flex items-center gap-3 text-sm text-text-primary">
                  <AlertTriangle className="w-4 h-4 text-text-secondary flex-shrink-0" />
                  <PriorityBadge priority={wo.priority} />
                </div>
                <div className="flex items-center gap-3 text-sm text-text-primary">
                  <Wrench className="w-4 h-4 text-text-secondary flex-shrink-0" />
                  <StatusBadge
                    status={wo.status === 'completed' ? 'ok' : wo.status === 'in_progress' ? 'info' : wo.status === 'waiting_parts' ? 'warning' : 'neutral'}
                    label={wo.status === 'planned' ? 'Planifié' : wo.status === 'in_progress' ? 'En cours' : wo.status === 'waiting_parts' ? 'Attente pièces' : wo.status === 'completed' ? 'Terminé' : wo.status}
                  />
                </div>
              </>
            )}

            {pm && (
              <div className="flex items-center gap-3 text-sm text-text-primary">
                <MapPin className="w-4 h-4 text-text-secondary flex-shrink-0" />
                <span>Fréquence : <strong>{pm.frequency}</strong> — Durée estimée : <strong>{pm.estimatedDuration}h</strong></span>
              </div>
            )}

            {wo?.description && (
              <div className="mt-3 p-3 bg-white/5 rounded-lg text-sm text-text-primary border border-white/10">
                <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">Description</p>
                {wo.description}
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-3 bg-white/5 flex justify-end border-t border-white/10">
          <button
            onClick={onClose}
            className="h-9 px-4 bg-simply-gmao-gold text-simply-gmao-dark rounded-lg text-sm font-medium hover:bg-simply-gmao-gold/80 transition-colors"
          >
            Fermer
          </button>
        </div>
      </motion.div>
    </>
  );
}
