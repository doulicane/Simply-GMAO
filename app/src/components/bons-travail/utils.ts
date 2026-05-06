import type { WorkOrderStatus, WorkOrderType, Priority } from '@/types';

export interface KanbanColumn {
  id: string;
  label: string;
  statuses: WorkOrderStatus[];
  color: string;
}

export const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: 'draft', label: 'Cr\u00e9\u00e9', statuses: ['draft'], color: '#3B82F6' },
  { id: 'planned', label: 'Planifi\u00e9', statuses: ['planned'], color: '#3B82F6' },
  { id: 'in_progress', label: 'En cours', statuses: ['in_progress', 'waiting_parts'], color: '#F59E0B' },
  { id: 'completed', label: 'Termin\u00e9', statuses: ['completed'], color: '#22C55E' },
  { id: 'closed', label: 'Cl\u00f4tur\u00e9', statuses: ['closed'], color: '#22C55E' },
];

export const STATUS_LABELS: Record<WorkOrderStatus, string> = {
  draft: 'Cr\u00e9\u00e9',
  planned: 'Planifi\u00e9',
  in_progress: 'En cours',
  waiting_parts: 'Attente pi\u00e8ces',
  completed: 'Termin\u00e9',
  closed: 'Cl\u00f4tur\u00e9',
  cancelled: 'Annul\u00e9',
};

export const STATUS_VARIANTS: Record<WorkOrderStatus, 'ok' | 'warning' | 'critical' | 'info' | 'neutral'> = {
  draft: 'info',
  planned: 'info',
  in_progress: 'warning',
  waiting_parts: 'warning',
  completed: 'ok',
  closed: 'ok',
  cancelled: 'neutral',
};

export const TYPE_LABELS: Record<WorkOrderType, string> = {
  corrective: 'Corrective',
  preventive: 'Pr\u00e9ventive',
  predictive: 'Pr\u00e9dictive',
  improvement: 'Am\u00e9lioration',
  safety: 'S\u00e9curit\u00e9',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  P1: 'Urgente',
  P2: 'Haute',
  P3: 'Moyenne',
  P4: 'Basse',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  P1: '#EF4444',
  P2: '#F59E0B',
  P3: '#3B82F6',
  P4: '#6B7280',
};

export function getColumnForStatus(status: WorkOrderStatus): KanbanColumn | undefined {
  return KANBAN_COLUMNS.find((col) => col.statuses.includes(status));
}

export function formatDuration(hours?: number): string {
  if (hours === undefined || hours === null) return '-';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatDateTime(iso?: string): string {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(iso?: string): string {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatRelativeTime(iso: string): string {
  const now = new Date();
  const d = new Date(iso);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '\u00e0 l\u0027instant';
  if (diffMins < 60) return `il y a ${diffMins} min`;
  if (diffHours < 24) return `il y a ${diffHours}h`;
  if (diffDays < 7) return `il y a ${diffDays}j`;
  return formatDate(iso);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
