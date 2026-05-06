import { memo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Equipment } from '@/types';

interface CriticalityMatrixProps {
  equipment: Equipment[];
}

const CRITICALITY_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  critique: { label: 'Critique', color: 'text-status-critical', bg: 'bg-status-critical/10', border: 'border-status-critical/30' },
  elevee: { label: 'Élevée', color: 'text-status-warning', bg: 'bg-status-warning/10', border: 'border-status-warning/30' },
  moyenne: { label: 'Moyenne', color: 'text-status-info', bg: 'bg-status-info/10', border: 'border-status-info/30' },
  faible: { label: 'Faible', color: 'text-status-neutral', bg: 'bg-status-neutral/10', border: 'border-status-neutral/30' },
};

const STATUS_META: Record<string, { label: string; dot: string }> = {
  running: { label: 'En service', dot: 'bg-status-ok' },
  stopped: { label: 'Arrêté', dot: 'bg-status-neutral' },
  maintenance: { label: 'Maintenance', dot: 'bg-status-warning' },
  breakdown: { label: 'En panne', dot: 'bg-status-critical' },
  standby: { label: 'En attente', dot: 'bg-status-info' },
};

export const CriticalityMatrix = memo(function CriticalityMatrix({ equipment }: CriticalityMatrixProps) {
  const counts = {
    critique: { running: 0, stopped: 0, maintenance: 0, breakdown: 0, standby: 0, total: 0 },
    elevee: { running: 0, stopped: 0, maintenance: 0, breakdown: 0, standby: 0, total: 0 },
    moyenne: { running: 0, stopped: 0, maintenance: 0, breakdown: 0, standby: 0, total: 0 },
    faible: { running: 0, stopped: 0, maintenance: 0, breakdown: 0, standby: 0, total: 0 },
  };

  for (const eq of equipment) {
    const c = eq.criticality as 'critique' | 'elevee' | 'moyenne' | 'faible';
    if (counts[c]) {
      counts[c][eq.status]++;
      counts[c].total++;
    }
  }

  const criticalities = ['critique', 'elevee', 'moyenne', 'faible'] as const;
  const statuses = ['running', 'stopped', 'maintenance', 'breakdown', 'standby'] as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="bg-bg-elevated rounded-xl border border-[rgba(90,94,117,0.2)] p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-status-warning" />
        <h2 className="text-lg font-semibold text-text-primary">Matrice de criticité</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[rgba(90,94,117,0.2)]">
              <th className="text-left py-2 pr-3 text-text-secondary text-xs uppercase tracking-wide">Criticité</th>
              {statuses.map((s) => (
                <th key={s} className="text-center py-2 px-2 text-text-secondary text-xs uppercase tracking-wide">
                  <span className="flex items-center justify-center gap-1.5">
                    <span className={cn('w-2 h-2 rounded-full', STATUS_META[s].dot)} />
                    {STATUS_META[s].label}
                  </span>
                </th>
              ))}
              <th className="text-center py-2 pl-2 text-text-secondary text-xs uppercase tracking-wide">Total</th>
            </tr>
          </thead>
          <tbody>
            {criticalities.map((crit) => {
              const meta = CRITICALITY_META[crit];
              return (
                <tr key={crit} className="border-b border-[rgba(90,94,117,0.1)] hover:bg-bg-hover/50 transition-colors">
                  <td className="py-3 pr-3">
                    <span className={cn('inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-semibold border', meta.bg, meta.color, meta.border)}>
                      {meta.label}
                    </span>
                  </td>
                  {statuses.map((s) => (
                    <td key={s} className="text-center py-3 px-2">
                      <span className={cn(
                        'tabular-nums font-medium',
                        counts[crit][s] > 0 ? 'text-text-primary' : 'text-text-muted'
                      )}>
                        {counts[crit][s]}
                      </span>
                    </td>
                  ))}
                  <td className="text-center py-3 pl-2">
                    <span className="text-sm font-bold text-text-primary tabular-nums">{counts[crit].total}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statuses.map((s) => {
          const total = criticalities.reduce((sum, c) => sum + counts[c][s], 0);
          return (
            <div key={s} className="bg-bg-primary rounded-lg p-3 border border-[rgba(90,94,117,0.15)]">
              <div className="flex items-center gap-1.5 mb-1">
                <span className={cn('w-2 h-2 rounded-full', STATUS_META[s].dot)} />
                <span className="text-xs text-text-secondary">{STATUS_META[s].label}</span>
              </div>
              <p className="text-xl font-bold text-text-primary tabular-nums">{total}</p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
});
