import { memo } from 'react';
import { motion } from 'framer-motion';
import { Cog, Eye, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/StatusBadge';
import type { Equipment } from '@/types';
import { STATUS_LABELS, STATUS_VARIANTS, CRITICALITY_LABELS } from './types';

interface EquipmentGridProps {
  equipment: Equipment[];
  onSelect: (eq: Equipment) => void;
  onNewBT: (eq: Equipment) => void;
}

const CRITICALITY_BADGE: Record<string, string> = {
  critique: 'bg-status-critical/15 text-status-critical border-status-critical/30',
  elevee: 'bg-status-warning/15 text-status-warning border-status-warning/30',
  moyenne: 'bg-status-info/15 text-status-info border-status-info/30',
  faible: 'bg-status-neutral/15 text-status-neutral border-status-neutral/30',
};

export const EquipmentGrid = memo(function EquipmentGrid({ equipment, onSelect, onNewBT }: EquipmentGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {equipment.map((eq, index) => (
        <motion.div
          key={eq.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05, duration: 0.25 }}
          className={cn(
            'bg-bg-elevated rounded-xl border border-[rgba(90,94,117,0.2)] p-4 transition-all duration-200',
            'hover:-translate-y-0.5 hover:shadow-card-hover hover:border-[rgba(14,165,233,0.4)] cursor-pointer'
          )}
          onClick={() => onSelect(eq)}
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-bg-hover flex items-center justify-center flex-shrink-0">
              <Cog className="w-6 h-6 text-text-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-text-primary truncate">{eq.name}</h3>
              <p className="text-xs text-text-secondary truncate">
                {eq.manufacturer ?? '—'} · {eq.model ?? '—'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className={cn('inline-flex items-center h-[22px] px-2 rounded-[11px] text-[11px] font-semibold uppercase tracking-wide border', CRITICALITY_BADGE[eq.criticality])}>
              {CRITICALITY_LABELS[eq.criticality]}
            </span>
            <StatusBadge status={STATUS_VARIANTS[eq.status]} label={STATUS_LABELS[eq.status]} />

          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <p className="text-[11px] text-text-secondary uppercase tracking-wide">Dispo. 30j</p>
              <p className="text-sm font-medium text-text-primary tabular-nums">{eq.availability ?? 0}%</p>
            </div>
            <div>
              <p className="text-[11px] text-text-secondary uppercase tracking-wide">Dernière MP</p>
              <p className="text-sm font-medium text-text-primary tabular-nums">{eq.lastMaintenanceDate ?? '—'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-[rgba(90,94,117,0.15)]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(eq);
              }}
              className="flex-1 btn-ghost h-8 text-xs flex items-center justify-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              Voir
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNewBT(eq);
              }}
              className="flex-1 btn-primary h-8 text-xs flex items-center justify-center gap-1.5"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              Nouveau BT
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
});
