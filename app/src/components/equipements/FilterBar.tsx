import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, ScanQrCode, List, LayoutGrid, Network, X, ChevronDown, Filter, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ViewMode, EquipmentFilters, LevelFilter, CriticalityFilter, StatusFilter } from './types';
import type { Criticality } from '@/types';
import { CRITICALITY_LABELS, STATUS_LABELS } from './types';

interface FilterBarProps {
  filters: EquipmentFilters;
  onChange: (filters: EquipmentFilters) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onNewEquipment: () => void;
  onScanQR: () => void;
  resultCount: number;
}

const LEVEL_OPTIONS: { value: LevelFilter; label: string }[] = [
  { value: 'all', label: 'Tous les niveaux' },
  { value: 'site', label: 'Sites' },
  { value: 'zone', label: 'Zones' },
  { value: 'line', label: 'Lignes' },
  { value: 'machine', label: 'Machines' },
  { value: 'subAssembly', label: 'Sous-ensembles' },
];

const CRITICALITY_OPTIONS: { value: CriticalityFilter; label: string }[] = [
  { value: 'all', label: 'Toutes criticités' },
  { value: 'critique', label: 'Critique' },
  { value: 'elevee', label: 'Élevée' },
  { value: 'moyenne', label: 'Moyenne' },
  { value: 'faible', label: 'Faible' },
];

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Tous statuts' },
  { value: 'running', label: 'En service' },
  { value: 'stopped', label: 'Arrêté' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'breakdown', label: 'En panne' },

];

const ZONE_OPTIONS = [
  { value: 'all', label: 'Toutes zones' },
  { value: 'Zone A — Production', label: 'Zone A — Production' },
  { value: 'Zone B — Finition', label: 'Zone B — Finition' },
  { value: 'Zone C — Utilités', label: 'Zone C — Utilités' },
  { value: 'Zone D — Stockage & Expédition', label: 'Zone D — Stockage & Expédition' },
  { value: 'Autre', label: 'Autre' },
];

function FilterDropdown<T extends string>({
  value,
  options,
  onChange,
  icon: Icon,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (val: T) => void;
  icon: typeof Filter;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 h-9 px-3 rounded-md text-sm border transition-colors',
          open || value !== options[0].value
            ? 'border-accent-teal/40 bg-accent-teal/10 text-accent-teal'
            : 'border-[rgba(90,94,117,0.3)] bg-bg-input text-text-primary hover:border-[rgba(90,94,117,0.5)]'
        )}
      >
        <Icon className="w-4 h-4" />
        <span className="hidden sm:inline">{selected?.label}</span>
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-1 w-56 bg-bg-tooltip border border-[rgba(90,94,117,0.3)] rounded-lg shadow-card-hover z-[70] overflow-hidden"
            >
              {options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={cn(
                    'w-full text-left px-3 py-2 text-sm transition-colors',
                    opt.value === value
                      ? 'bg-accent-teal-glow text-accent-teal'
                      : 'text-text-primary hover:bg-bg-hover'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FilterBar({
  filters,
  onChange,
  viewMode,
  onViewModeChange,
  onNewEquipment,
  onScanQR,
  resultCount,
}: FilterBarProps) {
  const [searchFocused, setSearchFocused] = useState(false);

  const activeFilters = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];
    if (filters.level !== 'all')
      chips.push({ key: 'level', label: LEVEL_OPTIONS.find((o) => o.value === filters.level)?.label ?? '', onRemove: () => onChange({ ...filters, level: 'all' }) });
    if (filters.zone !== 'all' && filters.zone)
      chips.push({ key: 'zone', label: filters.zone, onRemove: () => onChange({ ...filters, zone: 'all' }) });
    if (filters.criticality !== 'all')
      chips.push({ key: 'crit', label: CRITICALITY_LABELS[filters.criticality as Criticality] ?? '', onRemove: () => onChange({ ...filters, criticality: 'all' }) });
    if (filters.status !== 'all')
      chips.push({ key: 'status', label: STATUS_LABELS[filters.status as keyof typeof STATUS_LABELS] ?? '', onRemove: () => onChange({ ...filters, status: 'all' }) });
    return chips;
  }, [filters, onChange]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.1 }}
      className="flex flex-col gap-3"
    >
      <div className="flex flex-col gap-2">
        {/* Top row: search + actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div
            className={cn(
              'flex items-center gap-2 h-9 px-3 rounded-md border bg-bg-input transition-colors flex-1 min-w-0',
              searchFocused ? 'border-accent-teal shadow-glow' : 'border-[rgba(90,94,117,0.3)]'
            )}
          >
            <Search className="w-4 h-4 text-text-muted flex-shrink-0" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={filters.search}
              onChange={(e) => onChange({ ...filters, search: e.target.value })}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none min-w-0"
            />
            {filters.search && (
              <button onClick={() => onChange({ ...filters, search: '' })} className="text-text-muted hover:text-text-primary flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* View toggle */}
          <div className="flex items-center bg-bg-input rounded-md border border-[rgba(90,94,117,0.3)] p-0.5">
            {([
              { mode: 'list' as ViewMode, icon: List },
              { mode: 'grid' as ViewMode, icon: LayoutGrid },
              { mode: 'org' as ViewMode, icon: Network },
            ]).map(({ mode, icon: Icon }) => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                className={cn(
                  'p-1.5 rounded transition-colors flex items-center justify-center',
                  viewMode === mode ? 'bg-accent-teal text-white' : 'text-text-muted hover:text-text-primary'
                )}
                aria-label={mode}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          <button onClick={onScanQR} className="btn-secondary h-9 w-9 sm:w-auto sm:px-3 text-sm flex items-center justify-center gap-1.5">
            <ScanQrCode className="w-4 h-4" />
            <span className="hidden sm:inline">Scanner QR</span>
          </button>
          <button onClick={onNewEquipment} className="btn-primary h-9 w-9 sm:w-auto sm:px-3 text-sm flex items-center justify-center gap-1.5">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nouveau</span>
          </button>
        </div>

        {/* Bottom row: filters */}
        <div className="flex flex-wrap items-center gap-2">
          <FilterDropdown value={filters.level} options={LEVEL_OPTIONS} onChange={(v) => onChange({ ...filters, level: v as LevelFilter })} icon={Filter} />
          <FilterDropdown value={filters.zone} options={ZONE_OPTIONS} onChange={(v) => onChange({ ...filters, zone: v })} icon={MapPin} />
          <FilterDropdown value={filters.criticality} options={CRITICALITY_OPTIONS} onChange={(v) => onChange({ ...filters, criticality: v })} icon={Filter} />
          <FilterDropdown value={filters.status} options={STATUS_OPTIONS} onChange={(v) => onChange({ ...filters, status: v })} icon={Filter} />
        </div>
      </div>

      {/* Filter chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-text-muted">{resultCount} résultat{resultCount !== 1 ? 's' : ''}</span>
          {activeFilters.map((chip) => (
            <span key={chip.key} className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-bg-hover text-text-secondary text-xs border border-[rgba(90,94,117,0.2)]">
              {chip.label}
              <button onClick={chip.onRemove} className="hover:text-text-primary">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            onClick={() =>
              onChange({ search: '', level: 'all', zone: 'all', criticality: 'all', status: 'all' })
            }
            className="text-xs text-accent-teal hover:underline"
          >
            Tout effacer
          </button>
        </div>
      )}
    </motion.div>
  );
}
