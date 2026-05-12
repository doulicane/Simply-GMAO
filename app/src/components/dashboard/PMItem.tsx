import { motion } from 'framer-motion';
import { CalendarClock } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import type { PreventivePlan } from '@/types';

export interface PMItemProps {
  plan: PreventivePlan;
}

export function PMItem({ plan }: PMItemProps) {
  const daysUntil = Math.ceil(
    (new Date(plan.nextDueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  const badgeColor = daysUntil <= 0 ? 'status-critical' : daysUntil <= 3 ? 'status-warning' : 'status-ok';
  const badgeLabel = daysUntil <= 0 ? 'En retard' : `${daysUntil}j`;

  return (
    <motion.div
      whileHover={{ x: 2 }}
      className="flex items-center gap-3 p-3 rounded-lg bg-bg-elevated border border-[rgba(90,94,117,0.1)] hover:bg-bg-hover transition-colors"
    >
      <CalendarClock className="w-5 h-5 text-accent-teal flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary truncate">{plan.title}</p>
        <p className="text-[11px] text-text-secondary">
          Fréquence: {plan.frequency} · Technicien: {plan.assignedTo ?? 'Non assigné'}
        </p>
      </div>
      <StatusBadge status={badgeColor === 'status-ok' ? 'ok' : badgeColor === 'status-warning' ? 'warning' : 'critical'} label={badgeLabel} />
    </motion.div>
  );
}
