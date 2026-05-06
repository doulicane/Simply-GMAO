import { cn } from '@/lib/utils';

type StatusVariant = 'ok' | 'warning' | 'critical' | 'info' | 'neutral';

interface StatusBadgeProps {
  status: StatusVariant;
  label?: string;
  children?: React.ReactNode;
  className?: string;
}

const STATUS_STYLES: Record<StatusVariant, string> = {
  ok: 'bg-[rgba(34,197,94,0.12)] text-status-ok border-[rgba(34,197,94,0.3)]',
  warning: 'bg-[rgba(245,158,11,0.12)] text-status-warning border-[rgba(245,158,11,0.3)]',
  critical: 'bg-[rgba(239,68,68,0.12)] text-status-critical border-[rgba(239,68,68,0.3)]',
  info: 'bg-[rgba(59,130,246,0.12)] text-status-info border-[rgba(59,130,246,0.3)]',
  neutral: 'bg-[rgba(107,114,128,0.12)] text-status-neutral border-dashed border-[rgba(107,114,128,0.3)]',
};

export function StatusBadge({ status, label, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center h-[22px] px-2.5 rounded-[11px] text-[11px] font-semibold uppercase tracking-wide border',
        STATUS_STYLES[status],
        className
      )}
    >
      {label ?? children}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: 'P1' | 'P2' | 'P3' | 'P4' }) {
  const map: Record<string, StatusVariant> = { P1: 'critical', P2: 'warning', P3: 'info', P4: 'neutral' };
  const labels: Record<string, string> = { P1: 'Urgente', P2: 'Haute', P3: 'Moyenne', P4: 'Basse' };
  return <StatusBadge status={map[priority]} label={labels[priority]} />;
}
