import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutGrid, List, CalendarDays, Filter, X, Search, Download, Plus, Archive,
} from 'lucide-react';
import type { WorkOrderStatus, WorkOrderType, Priority } from '@/types';
import {
  STATUS_LABELS,
  TYPE_LABELS,
  PRIORITY_LABELS,
} from './utils';

export type ViewMode = 'kanban' | 'list' | 'calendar';

export interface FilterState {
  search: string;
  statuses: WorkOrderStatus[];
  priorities: Priority[];
  types: WorkOrderType[];
  showArchived: boolean;
}

interface FilterBarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onCreateClick: () => void;
  resultCount: number;
}

export function FilterBar({
  viewMode,
  onViewModeChange,
  filters,
  onFiltersChange,
  onCreateClick,
  resultCount,
}: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  const views: { id: ViewMode; label: string; icon: typeof LayoutGrid }[] = [
    { id: 'kanban', label: 'Kanban', icon: LayoutGrid },
    { id: 'list', label: 'Liste', icon: List },
    { id: 'calendar', label: 'Calendrier', icon: CalendarDays },
  ];

  const toggleFilter = <T extends string>(
    key: 'statuses' | 'priorities' | 'types',
    value: T
  ) => {
    const current = filters[key] as T[];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFiltersChange({ ...filters, [key]: next });
  };

  const clearFilters = () => {
    onFiltersChange({ search: '', statuses: [], priorities: [], types: [], showArchived: false });
  };

  const hasActiveFilters =
    filters.statuses.length > 0 ||
    filters.priorities.length > 0 ||
    filters.types.length > 0 ||
    filters.search.length > 0 ||
    filters.showArchived;

  const statusOptions: WorkOrderStatus[] = ['draft', 'planned', 'in_progress', 'waiting_parts', 'completed', 'closed'];
  const priorityOptions: Priority[] = ['P1', 'P2', 'P3', 'P4'];
  const typeOptions: WorkOrderType[] = ['corrective', 'preventive', 'improvement', 'safety'];

  return (
    <div className="space-y-3">
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* View switcher */}
        <div className="flex items-center bg-bg-primary rounded-lg p-1 border border-[rgba(90,94,117,0.2)]">
          {views.map((v) => (
            <button
              key={v.id}
              onClick={() => onViewModeChange(v.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === v.id
                  ? 'bg-accent-teal text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <v.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{v.label}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="w-full h-9 pl-10 pr-4 bg-bg-input border border-[rgba(90,94,117,0.3)] rounded-md text-text-primary text-sm focus:outline-none focus:border-accent-teal focus:shadow-glow placeholder:text-text-muted"
          />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Toggle archived */}
          <button
            onClick={() => onFiltersChange({ ...filters, showArchived: !filters.showArchived })}
            className={`h-9 px-3 rounded-md text-sm font-medium border transition-all flex items-center gap-1.5 ${
              filters.showArchived
                ? 'bg-accent-teal/10 border-accent-teal text-accent-teal'
                : 'bg-transparent border-[rgba(90,94,117,0.3)] text-text-secondary hover:text-text-primary hover:bg-bg-hover'
            }`}
            title="Afficher les BT clôturés"
          >
            <Archive className="w-4 h-4" />
            <span className="hidden sm:inline">Archivés</span>
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`h-9 px-3 rounded-md text-sm font-medium border transition-all flex items-center gap-1.5 ${
              showFilters
                ? 'bg-accent-teal/10 border-accent-teal text-accent-teal'
                : 'bg-transparent border-[rgba(90,94,117,0.3)] text-text-secondary hover:text-text-primary hover:bg-bg-hover'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filtres</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-accent-teal" />
            )}
          </button>
          <button className="h-9 px-3 rounded-md text-sm font-medium border border-[rgba(90,94,117,0.3)] text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-all flex items-center gap-1.5">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exporter</span>
          </button>
          <button
            onClick={onCreateClick}
            className="btn-primary h-9 px-4 text-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nouveau BT</span>
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <motion.div
        initial={false}
        animate={{
          height: showFilters ? 'auto' : 0,
          opacity: showFilters ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="p-4 rounded-xl bg-bg-primary border border-[rgba(90,94,117,0.2)] space-y-4">
          {/* Status filters */}
          <div>
            <label className="text-[11px] font-medium text-text-secondary uppercase tracking-wide mb-2 block">
              Statut
            </label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleFilter('statuses', s)}
                  className={`h-7 px-3 rounded-full text-[11px] font-semibold uppercase tracking-wide border transition-all ${
                    filters.statuses.includes(s)
                      ? 'bg-accent-teal/15 text-accent-teal border-accent-teal/40'
                      : 'bg-[rgba(90,94,117,0.1)] text-text-secondary border-[rgba(90,94,117,0.2)] hover:text-text-primary'
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Priority filters */}
          <div>
            <label className="text-[11px] font-medium text-text-secondary uppercase tracking-wide mb-2 block">
              Priorité
            </label>
            <div className="flex flex-wrap gap-2">
              {priorityOptions.map((p) => (
                <button
                  key={p}
                  onClick={() => toggleFilter('priorities', p)}
                  className={`h-7 px-3 rounded-full text-[11px] font-semibold uppercase tracking-wide border transition-all ${
                    filters.priorities.includes(p)
                      ? 'bg-accent-teal/15 text-accent-teal border-accent-teal/40'
                      : 'bg-[rgba(90,94,117,0.1)] text-text-secondary border-[rgba(90,94,117,0.2)] hover:text-text-primary'
                  }`}
                >
                  {PRIORITY_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          {/* Type filters */}
          <div>
            <label className="text-[11px] font-medium text-text-secondary uppercase tracking-wide mb-2 block">
              Type
            </label>
            <div className="flex flex-wrap gap-2">
              {typeOptions.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleFilter('types', t)}
                  className={`h-7 px-3 rounded-full text-[11px] font-semibold uppercase tracking-wide border transition-all ${
                    filters.types.includes(t)
                      ? 'bg-accent-teal/15 text-accent-teal border-accent-teal/40'
                      : 'bg-[rgba(90,94,117,0.1)] text-text-secondary border-[rgba(90,94,117,0.2)] hover:text-text-primary'
                  }`}
                >
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Active filter chips + clear */}
          {hasActiveFilters && (
            <div className="flex items-center flex-wrap gap-2 pt-2 border-t border-[rgba(90,94,117,0.15)]">
              <span className="text-[11px] text-text-muted">Actifs:</span>
              {filters.statuses.map((s) => (
                <FilterChip key={s} label={STATUS_LABELS[s]} onRemove={() => toggleFilter('statuses', s)} />
              ))}
              {filters.priorities.map((p) => (
                <FilterChip key={p} label={PRIORITY_LABELS[p]} onRemove={() => toggleFilter('priorities', p)} />
              ))}
              {filters.types.map((t) => (
                <FilterChip key={t} label={TYPE_LABELS[t]} onRemove={() => toggleFilter('types', t)} />
              ))}
              {filters.search && (
                <FilterChip label={`"${filters.search}"`} onRemove={() => onFiltersChange({ ...filters, search: '' })} />
              )}
              <button
                onClick={clearFilters}
                className="text-[11px] text-accent-teal hover:underline ml-auto"
              >
                Tout effacer
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Result count */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-muted">
          {resultCount} bon{resultCount > 1 ? 's' : ''} de travail
        </span>
      </div>
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 h-6 px-2 rounded-full bg-accent-teal/10 text-accent-teal text-[11px] font-medium border border-accent-teal/20">
      {label}
      <button onClick={onRemove} className="hover:text-text-primary transition-colors">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
