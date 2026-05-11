/**
 * =============================================================================
 * PlanningCalendar — Vue calendrier des interventions planifiees
 * =============================================================================
 * Affiche les bons de travail et plans preventifs sur un calendrier mensuel.
 * =============================================================================
 */

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { usePlanning } from '@/hooks/usePlanning';
import { fr } from 'date-fns/locale';
import { format, startOfMonth, parseISO } from 'date-fns';
import { Wrench, ClipboardCheck, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const typeIcon = {
  preventive: ClipboardCheck,
  corrective: Wrench,
  inspection: AlertTriangle,
};

const typeColor: Record<string, string> = {
  preventive: 'bg-blue-500',
  corrective: 'bg-amber-500',
  inspection: 'bg-purple-500',
};

export function PlanningCalendar() {
  const [month, setMonth] = useState<Date>(new Date());
  const monthKey = format(startOfMonth(month), 'yyyy-MM');
  const { data: events = [], isLoading } = usePlanning(monthKey);

  const modifiers = events.reduce((acc, evt) => {
    const date = parseISO(evt.date);
    const key = format(date, 'yyyy-MM-dd');
    if (!acc[key]) acc[key] = [];
    acc[key].push(evt);
    return acc;
  }, {} as Record<string, typeof events>);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Planification des interventions</h2>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500" /> Preventif</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500" /> Correctif</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-purple-500" /> Inspection</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <Calendar
            mode="single"
            month={month}
            onMonthChange={setMonth}
            locale={fr}
            className="rounded-md border"
          />
          {/* Legende rapide des jours avec evenements */}
          <div className="mt-4 grid grid-cols-7 gap-1">
            {Object.entries(modifiers).map(([dateKey, dayEvents]) => {
              const d = parseISO(dateKey);
              return (
                <div key={dateKey} className="flex flex-col items-center p-1 rounded border">
                  <span className="text-xs text-muted-foreground">{format(d, 'dd/MM')}</span>
                  <div className="flex gap-0.5 mt-1">
                    {dayEvents.slice(0, 3).map((evt, i) => (
                      <span key={i} className={cn('w-1.5 h-1.5 rounded-full', typeColor[evt.type])} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Liste des evenements du mois */}
        <div className="w-full lg:w-80 space-y-3">
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            {format(month, 'MMMM yyyy', { locale: fr })}
          </h3>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Chargement...</p>
          ) : events.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune intervention ce mois-ci.</p>
          ) : (
            events.map((evt) => {
              const Icon = typeIcon[evt.type];
              return (
                <div
                  key={evt.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                >
                  <div className={cn('mt-0.5 p-1.5 rounded-md', typeColor[evt.type])}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{evt.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(evt.date), 'dd/MM/yyyy')}
                      {evt.equipmentCode && ` · ${evt.equipmentCode}`}
                    </p>
                    <span className={cn(
                      'inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded font-medium',
                      evt.status === 'termine' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      evt.status === 'en_cours' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    )}>
                      {evt.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
