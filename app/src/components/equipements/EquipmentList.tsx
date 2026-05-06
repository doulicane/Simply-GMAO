import { memo } from 'react';
import { motion } from 'framer-motion';
import { Cog, ClipboardList, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/StatusBadge';
import type { Equipment } from '@/types';
import { STATUS_LABELS, STATUS_VARIANTS } from './types';

interface EquipmentListProps {
  equipment: Equipment[];
  onSelect: (eq: Equipment) => void;
  onNewBT: (eq: Equipment) => void;
}

const CRITICALITY_DOT: Record<string, string> = {
  critique: 'bg-status-critical',
  elevee: 'bg-status-warning',
  moyenne: 'bg-status-info',
  faible: 'bg-status-neutral',
};

export const EquipmentList = memo(function EquipmentList({ equipment, onSelect, onNewBT }: EquipmentListProps) {
  return (
    <div className="flex flex-col rounded-xl border border-[rgba(90,94,117,0.2)] overflow-hidden bg-bg-elevated">
      {/* Header */}
      <div className="grid grid-cols-[1fr_120px_100px_48px] sm:grid-cols-[1fr_140px_120px_100px_48px] gap-3 px-4 py-2.5 bg-bg-primary text-text-secondary text-[11px] font-medium uppercase tracking-wider border-b border-[rgba(90,94,117,0.15)]">
        <span>Équipement</span>
        <span className="hidden sm:block">Code</span>
        <span>Localisation</span>
        <span>Statut</span>
        <span />
      </div>

      {equipment.map((eq, index) => (
        <motion.div
          key={eq.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.03 }}
          className="grid grid-cols-[1fr_120px_100px_48px] sm:grid-cols-[1fr_140px_120px_100px_48px] gap-3 px-4 py-3 items-center border-b border-[rgba(90,94,117,0.1)] hover:bg-bg-hover transition-colors cursor-pointer"
          onClick={() => onSelect(eq)}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className={cn('w-2 h-2 rounded-full flex-shrink-0', CRITICALITY_DOT[eq.criticality])} />
            <Cog className="w-4 h-4 text-text-muted flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{eq.name}</p>
              <p className="text-xs text-text-muted truncate">{eq.manufacturer ?? '—'} · {eq.model ?? '—'}</p>
            </div>
          </div>

          <span className="hidden sm:block text-xs font-mono text-text-secondary truncate">{eq.code}</span>

          <span className="text-xs text-text-secondary truncate">{eq.line}</span>

          <StatusBadge status={STATUS_VARIANTS[eq.status]} label={STATUS_LABELS[eq.status]} />

          <div className="flex items-center justify-end gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNewBT(eq);
              }}
              className="p-1.5 rounded-md hover:bg-bg-hover text-text-muted hover:text-accent-teal transition-colors"
              title="Nouveau BT"
            >
              <ClipboardList className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(eq);
              }}
              className="p-1.5 rounded-md hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
});
