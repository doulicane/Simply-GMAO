import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import type { AlertItem } from '@/types';

export interface AlertRowProps {
  alert: AlertItem;
}

export function AlertRow({ alert }: AlertRowProps) {
  const borderColor =
    alert.priority === 'P1' ? '#EF4444' : alert.priority === 'P2' ? '#F59E0B' : '#3B82F6';

  return (
    <motion.div
      whileHover={{ x: 2 }}
      className="flex items-start gap-3 p-3 rounded-lg bg-bg-elevated border-l-[3px] border-b border-[rgba(90,94,117,0.1)] hover:bg-bg-hover transition-colors"
      style={{ borderLeftColor: borderColor }}
    >
      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: borderColor }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary truncate">{alert.title}</p>
        <p className="text-[13px] text-text-secondary truncate">{alert.description}</p>
        <div className="mt-2 flex items-center gap-2">
          <button className="h-7 px-2 text-xs font-medium text-accent-teal bg-accent-teal/10 rounded hover:bg-accent-teal/20 transition-colors">
            Voir
          </button>
          <button className="h-7 px-2 text-xs font-medium text-text-secondary bg-bg-hover rounded hover:text-text-primary transition-colors">
            Prendre
          </button>
        </div>
      </div>
      <span className="text-xs font-mono text-text-muted whitespace-nowrap">
        {new Date(alert.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
      </span>
    </motion.div>
  );
}
