/**
 * =============================================================================
 * PreventiveUpcomingList — Liste des préventifs à venir avec alertes
 * =============================================================================
 */

import { useUpcomingPreventivePlans, usePostponePreventivePlan, useGeneratePreventiveWO } from '@/hooks/usePreventivePlans';
import { Button } from '@/components/ui/button';
import { CalendarClock, AlertTriangle, ArrowRight, Wrench, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export function PreventiveUpcomingList() {
  const { data: plans = [], isLoading } = useUpcomingPreventivePlans(30);
  const postpone = usePostponePreventivePlan();
  const generate = useGeneratePreventiveWO();

  if (isLoading) return <p className="text-sm text-muted-foreground">Chargement...</p>;
  if (plans.length === 0) return <p className="text-sm text-muted-foreground">Aucun préventif à venir dans les 30 jours.</p>;

  return (
    <div className="space-y-3">
      {plans.map((plan) => {
        const alertLevel = plan.alertLevel ?? 'vert';
        const days = plan.daysUntil ?? 0;

        return (
          <div
            key={plan.id}
            className={cn(
              'flex items-start gap-3 p-3 rounded-lg border transition-colors',
              alertLevel === 'rouge' ? 'border-red-200 bg-red-50/50 dark:bg-red-950/20' :
              alertLevel === 'orange' ? 'border-amber-200 bg-amber-50/50 dark:bg-amber-950/20' :
              'border-border bg-card'
            )}
          >
            <div className={cn(
              'mt-0.5 p-1.5 rounded-md',
              alertLevel === 'rouge' ? 'bg-red-500' :
              alertLevel === 'orange' ? 'bg-amber-500' :
              'bg-green-500'
            )}>
              {alertLevel === 'rouge' ? <AlertTriangle className="w-4 h-4 text-white" /> :
               alertLevel === 'orange' ? <Clock className="w-4 h-4 text-white" /> :
               <CalendarClock className="w-4 h-4 text-white" />}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{plan.title}</p>
              <p className="text-xs text-muted-foreground">
                {plan.equipment?.code} — {plan.equipment?.name}
              </p>
              <p className="text-xs mt-0.5">
                {plan.nextExecution && (
                  <span className="text-muted-foreground">
                    {format(parseISO(plan.nextExecution), 'dd MMM yyyy', { locale: fr })}
                  </span>
                )}
                <span className={cn(
                  'ml-2 text-xs font-medium px-1.5 py-0.5 rounded',
                  days < 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  days <= 3 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                )}>
                  {days < 0 ? `Retard ${Math.abs(days)}j` : days === 0 ? "Aujourd'hui" : `J-${days}`}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => postpone.mutate({ id: plan.id, days: 7 })}
                disabled={postpone.isPending}
                className="text-xs h-7 px-2"
              >
                <ArrowRight className="w-3 h-3 mr-1" />
                +7j
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => generate.mutate(plan.id)}
                disabled={generate.isPending}
                className="text-xs h-7 px-2"
              >
                <Wrench className="w-3 h-3 mr-1" />
                BT
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
