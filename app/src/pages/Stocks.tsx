import { useState, useMemo, useCallback, useEffect } from 'react';
import { useStockStore } from '@/stores/stockStore';
import { StatusBadge } from '@/components/StatusBadge';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Package, ArrowLeftRight, ShoppingCart, AlertTriangle,
  Eye, MoreVertical, X, Filter, ChevronDown, ChevronUp,
  TrendingDown, TrendingUp, History, MapPin, Factory, DollarSign,
  CheckCircle2, Clock, CalendarClock,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { StockItem } from '@/types';

type StockView = 'stock' | 'mouvements' | 'commandes' | 'alertes';

const TABS: { key: StockView; label: string; icon: React.ElementType }[] = [
  { key: 'stock', label: 'Vue Stock', icon: Package },
  { key: 'mouvements', label: 'Mouvements', icon: ArrowLeftRight },
  { key: 'commandes', label: 'Commandes', icon: ShoppingCart },
  { key: 'alertes', label: 'Alertes', icon: AlertTriangle },
];

const STATUS_LABELS: Record<string, string> = {
  ok: 'Normal',
  low: 'Sous minimum',
  critical: 'Rupture',
  out_of_stock: 'Rupture',
};

const CATEGORY_COLORS: Record<string, string> = {
  'Matrices': 'bg-[rgba(59,130,246,0.12)] text-status-info border-[rgba(59,130,246,0.3)]',
  'Filtres': 'bg-[rgba(14,165,233,0.12)] text-accent-teal border-[rgba(14,165,233,0.3)]',
  'Joints': 'bg-[rgba(107,114,128,0.12)] text-status-neutral border-[rgba(107,114,128,0.3)]',
  'Fluides': 'bg-[rgba(34,197,94,0.12)] text-status-ok border-[rgba(34,197,94,0.3)]',
  'Pompes': 'bg-[rgba(245,158,11,0.12)] text-status-warning border-[rgba(245,158,11,0.3)]',
  'Buses': 'bg-[rgba(239,68,68,0.12)] text-status-critical border-[rgba(239,68,68,0.3)]',
  'Instrumentation': 'bg-[rgba(59,130,246,0.12)] text-status-info border-[rgba(59,130,246,0.3)]',
  'Mécanique': 'bg-[rgba(107,114,128,0.12)] text-status-neutral border-[rgba(107,114,128,0.3)]',
  'Transmission': 'bg-[rgba(14,165,233,0.12)] text-accent-teal border-[rgba(14,165,233,0.3)]',
  'Manutention': 'bg-[rgba(245,158,11,0.12)] text-status-warning border-[rgba(245,158,11,0.3)]',
  'Électrique': 'bg-[rgba(59,130,246,0.12)] text-status-info border-[rgba(59,130,246,0.3)]',
  'Laquage': 'bg-[rgba(34,197,94,0.12)] text-status-ok border-[rgba(34,197,94,0.3)]',
  'Pneumatique': 'bg-[rgba(14,165,233,0.12)] text-accent-teal border-[rgba(14,165,233,0.3)]',
  'Hydraulique': 'bg-[rgba(107,114,128,0.12)] text-status-neutral border-[rgba(107,114,128,0.3)]',

  'Consommable': 'bg-[rgba(245,158,11,0.12)] text-status-warning border-[rgba(245,158,11,0.3)]',
};

function getStockStatusColor(status: StockItem['status']): string {
  switch (status) {
    case 'ok': return 'text-status-ok';
    case 'low': return 'text-status-warning';
    case 'critical':
    case 'out_of_stock': return 'text-status-critical';
    default: return 'text-text-primary';
  }
}

function getStockBorderColor(status: StockItem['status']): string {
  switch (status) {
    case 'ok': return 'border-l-status-ok';
    case 'low': return 'border-l-status-warning';
    case 'critical':
    case 'out_of_stock': return 'border-l-status-critical';
    default: return 'border-l-transparent';
  }
}

function getStockRowBg(status: StockItem['status']): string {
  if (status === 'out_of_stock' || status === 'critical') return 'bg-[rgba(239,68,68,0.05)]';
  return '';
}

function QuantityMiniBar({ qty, min, max }: { qty: number; min: number; max: number }) {
  const ratio = Math.min(Math.max(qty / max, 0), 1);
  const color = qty === 0 ? 'bg-status-critical' : qty <= min ? 'bg-status-warning' : 'bg-status-ok';
  return (
    <div className="w-10 h-1.5 bg-bg-primary rounded-full overflow-hidden">
      <div className={cn('h-full rounded-full', color)} style={{ width: `${ratio * 100}%` }} />
    </div>
  );
}

/* ─── Sub-components ─── */

function StockFilters({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  zoneFilter,
  onZoneChange,
  statusFilter,
  onStatusChange,
  categories,
  zones,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  categoryFilter: string;
  onCategoryChange: (v: string) => void;
  zoneFilter: string;
  onZoneChange: (v: string) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
  categories: string[];
  zones: string[];
}) {
  return (
    <div className="flex flex-col gap-3 mb-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Code, désignation, fabricant..."
            className="input-industrial w-full pl-9"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="input-industrial h-9 text-sm min-w-[140px]"
        >
          <option value="">Toutes catégories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={zoneFilter}
          onChange={(e) => onZoneChange(e.target.value)}
          className="input-industrial h-9 text-sm min-w-[160px]"
        >
          <option value="">Toutes zones</option>
          {zones.map((z) => (
            <option key={z} value={z}>{z}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="input-industrial h-9 text-sm min-w-[120px]"
        >
          <option value="">Tous statuts</option>
          <option value="ok">Normal</option>
          <option value="low">Sous minimum</option>
          <option value="critical">Rupture</option>
          <option value="out_of_stock">Rupture</option>
        </select>
        <button className="btn-ghost h-9 px-3 text-xs gap-1.5 inline-flex items-center">
          <Filter className="w-3.5 h-3.5" />
          Filtres
        </button>
      </div>
    </div>
  );
}

function StockTable({
  items,
  onView,
}: {
  items: StockItem[];
  onView: (item: StockItem) => void;
}) {
  const [sortKey, setSortKey] = useState<string>('code');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...items].sort((a, b) => {
      if (sortKey === 'code') return dir * a.code.localeCompare(b.code);
      if (sortKey === 'name') return dir * a.name.localeCompare(b.name);
      if (sortKey === 'category') return dir * a.category.localeCompare(b.category);
      if (sortKey === 'quantity') return dir * (a.quantity - b.quantity);
      if (sortKey === 'minStock') return dir * (a.minStock - b.minStock);
      if (sortKey === 'location') return dir * a.location.localeCompare(b.location);
      if (sortKey === 'lastRestockDate') {
        const da = a.lastRestockDate ? parseISO(a.lastRestockDate).getTime() : 0;
        const db = b.lastRestockDate ? parseISO(b.lastRestockDate).getTime() : 0;
        return dir * (da - db);
      }
      return 0;
    });
  }, [items, sortKey, sortDir]);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const totalValue = useMemo(() => items.reduce((sum, i) => sum + i.quantity * i.unitCost, 0), [items]);
  const lowCount = items.filter((i) => i.status === 'low').length;
  const criticalCount = items.filter((i) => i.status === 'critical' || i.status === 'out_of_stock').length;
  const reservedCount = items.reduce((sum, i) => sum + (i.quantity > i.minStock ? 0 : 0), 0); // placeholder

  const cols = [
    { key: 'code', label: 'Code', width: '110px' },
    { key: 'name', label: 'Désignation', width: '250px' },
    { key: 'category', label: 'Catégorie', width: '120px' },
    { key: 'quantity', label: 'Quantité', width: '90px' },
    { key: 'minStock', label: 'Min.', width: '70px' },
    { key: 'location', label: 'Zone', width: '150px' },
    { key: 'lastRestockDate', label: 'Dernier mouv.', width: '110px' },
    { key: 'actions', label: 'Actions', width: '80px' },
  ];

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-bg-elevated rounded-xl border border-[rgba(90,94,117,0.2)] p-4">
          <div className="text-[11px] text-text-muted uppercase tracking-wide mb-1">Références</div>
          <div className="text-2xl font-bold text-text-primary tabular-nums">{items.length}</div>
        </div>
        <div className="bg-bg-elevated rounded-xl border border-[rgba(90,94,117,0.2)] p-4">
          <div className="text-[11px] text-text-muted uppercase tracking-wide mb-1">Valeur stock</div>
          <div className="text-2xl font-bold text-text-primary tabular-nums">{totalValue.toLocaleString('fr-FR')} €</div>
        </div>
        <div className="bg-bg-elevated rounded-xl border border-[rgba(90,94,117,0.2)] p-4">
          <div className="text-[11px] text-text-muted uppercase tracking-wide mb-1">Alertes</div>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && <StatusBadge status="critical" label={`${criticalCount} rupture${criticalCount > 1 ? 's' : ''}`} />}
            {lowCount > 0 && <StatusBadge status="warning" label={`${lowCount} sous min.`} />}
            {criticalCount === 0 && lowCount === 0 && <span className="text-sm text-status-ok">Aucune alerte</span>}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-bg-elevated rounded-xl border border-[rgba(90,94,117,0.2)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-primary border-b border-[rgba(90,94,117,0.2)]">
                {cols.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.key !== 'actions' && toggleSort(col.key)}
                    className={cn(
                      'text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wide text-text-secondary whitespace-nowrap',
                      col.key !== 'actions' && 'cursor-pointer hover:text-text-primary'
                    )}
                    style={{ width: col.width }}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {sortKey === col.key && (
                        sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {sorted.map((item, idx) => {
                  const available = item.quantity;
                  const status = item.status;
                  return (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.02, duration: 0.2 }}
                      onClick={() => onView(item)}
                      className={cn(
                        'border-b border-[rgba(90,94,117,0.1)] hover:bg-bg-hover cursor-pointer transition-colors',
                        'border-l-[3px]',
                        getStockBorderColor(status),
                        getStockRowBg(status)
                      )}
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm text-accent-teal">{item.code}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-text-primary">{item.name}</div>
                        <div className="text-xs text-text-muted">{item.supplier ?? '—'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('badge-status', CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS['Consommable'])}>
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={cn('text-sm font-medium tabular-nums', getStockStatusColor(status))}>{item.quantity}</span>
                          <QuantityMiniBar qty={item.quantity} min={item.minStock} max={item.maxStock} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary tabular-nums">{item.minStock}</td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{item.location}</td>
                      <td className="px-4 py-3 text-sm text-text-secondary">
                        {item.lastRestockDate ? format(parseISO(item.lastRestockDate), 'dd/MM/yy') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); onView(item); }}
                            className="p-1.5 rounded-md hover:bg-bg-hover text-text-secondary hover:text-text-primary"
                            title="Voir"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-md hover:bg-bg-hover text-text-secondary hover:text-text-primary"
                            title="Plus"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-text-secondary">
                    <Package className="w-8 h-8 mx-auto mb-3 text-text-muted" />
                    <p className="text-sm font-medium">Aucune pièce en stock</p>
                    <p className="text-xs text-text-muted mt-1">Ajouter votre première pièce</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StockMovementsView({ items }: { items: StockItem[] }) {
  // Simulated movement data based on stock items
  const movements = useMemo(() => {
    const types = ['Entrée', 'Sortie', 'Ajustement'] as const;
    const reasons = ['BT-4521', 'Inventaire', 'Commande', 'Retour', 'Autre'];
    const users = ['Jean Martin', 'Sophie Moreau', 'Marie Lefebvre'];
    const data: { date: string; type: typeof types[number]; item: StockItem; qty: number; reason: string; user: string }[] = [];
    items.forEach((item) => {
      if (item.lastRestockDate) {
        data.push({
          date: item.lastRestockDate,
          type: 'Entrée',
          item,
          qty: Math.max(1, Math.floor(item.quantity * 0.3)),
          reason: 'Commande',
          user: users[Math.floor(Math.random() * users.length)],
        });
      }
      if (item.quantity < item.maxStock) {
        data.push({
          date: format(new Date(Date.now() - Math.random() * 30 * 86400000), 'yyyy-MM-dd'),
          type: 'Sortie',
          item,
          qty: -Math.max(1, Math.floor(Math.random() * 3)),
          reason: reasons[Math.floor(Math.random() * reasons.length)],
          user: users[Math.floor(Math.random() * users.length)],
        });
      }
    });
    return data.sort((a, b) => b.date.localeCompare(a.date));
  }, [items]);

  return (
    <div className="bg-bg-elevated rounded-xl border border-[rgba(90,94,117,0.2)] overflow-hidden">
      <div className="px-5 py-4 border-b border-[rgba(90,94,117,0.2)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5 text-accent-teal" />
          <h2 className="text-base font-semibold text-text-primary">Historique des mouvements</h2>
        </div>
        <span className="text-xs text-text-muted">{movements.length} mouvements</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-bg-primary border-b border-[rgba(90,94,117,0.2)]">
              {['Date/Heure', 'Type', 'Code', 'Désignation', 'Quantité', 'Motif/BT', 'Utilisateur'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wide text-text-secondary">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {movements.map((m, idx) => (
              <motion.tr
                key={`${m.item.id}-${idx}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.02 }}
                className="border-b border-[rgba(90,94,117,0.1)] hover:bg-bg-hover"
              >
                <td className="px-4 py-3 text-sm font-mono text-text-secondary">{format(parseISO(m.date), 'dd/MM/yyyy')}</td>
                <td className="px-4 py-3">
                  <StatusBadge
                    status={m.type === 'Entrée' ? 'ok' : m.type === 'Sortie' ? 'info' : 'warning'}
                    label={m.type}
                  />
                </td>
                <td className="px-4 py-3 text-sm font-mono text-accent-teal">{m.item.code}</td>
                <td className="px-4 py-3 text-sm text-text-primary">{m.item.name}</td>
                <td className="px-4 py-3">
                  <span className={cn('text-sm font-medium tabular-nums', m.qty > 0 ? 'text-status-ok' : 'text-status-critical')}>
                    {m.qty > 0 ? '+' : ''}{m.qty}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-text-secondary">{m.reason}</td>
                <td className="px-4 py-3 text-sm text-text-secondary">{m.user}</td>
              </motion.tr>
            ))}
            {movements.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-text-secondary">
                  <History className="w-8 h-8 mx-auto mb-3 text-text-muted" />
                  <p className="text-sm font-medium">Aucun mouvement enregistré</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StockCommandesView() {
  const commandes = [
    { id: 'CMD-2025-001', fournisseur: 'SKF', date: '2025-04-15', prevue: '2025-05-10', articles: 3, statut: 'en_attente' as const },
    { id: 'CMD-2025-002', fournisseur: 'Atlas Copco', date: '2025-04-20', prevue: '2025-05-15', articles: 2, statut: 'partielle' as const },
    { id: 'CMD-2025-003', fournisseur: 'Siemens', date: '2025-04-25', prevue: '2025-05-20', articles: 1, statut: 'en_attente' as const },
    { id: 'CMD-2025-004', fournisseur: 'Festo', date: '2025-03-10', prevue: '2025-04-05', articles: 4, statut: 'recue' as const },
  ];

  const statusMap: Record<string, { status: 'ok' | 'warning' | 'critical' | 'info' | 'neutral'; label: string }> = {
    en_attente: { status: 'info', label: 'En attente' },
    partielle: { status: 'warning', label: 'Partielle' },
    recue: { status: 'ok', label: 'Reçue' },
    annulee: { status: 'neutral', label: 'Annulée' },
  };

  return (
    <div className="bg-bg-elevated rounded-xl border border-[rgba(90,94,117,0.2)] overflow-hidden">
      <div className="px-5 py-4 border-b border-[rgba(90,94,117,0.2)] flex items-center gap-2">
        <ShoppingCart className="w-5 h-5 text-accent-teal" />
        <h2 className="text-base font-semibold text-text-primary">Commandes en cours</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-bg-primary border-b border-[rgba(90,94,117,0.2)]">
              {['N° Commande', 'Fournisseur', 'Date', 'Prévue', 'Articles', 'Statut', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wide text-text-secondary">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {commandes.map((c) => {
              const sm = statusMap[c.statut];
              return (
                <tr key={c.id} className="border-b border-[rgba(90,94,117,0.1)] hover:bg-bg-hover">
                  <td className="px-4 py-3 text-sm font-mono text-accent-teal">{c.id}</td>
                  <td className="px-4 py-3 text-sm text-text-primary">{c.fournisseur}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{format(parseISO(c.date), 'dd/MM/yyyy')}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{format(parseISO(c.prevue), 'dd/MM/yyyy')}</td>
                  <td className="px-4 py-3 text-sm text-text-primary">{c.articles}</td>
                  <td className="px-4 py-3"><StatusBadge status={sm.status} label={sm.label} /></td>
                  <td className="px-4 py-3">
                    <button className="btn-secondary h-8 px-3 text-xs">{c.statut === 'en_attente' ? 'Réceptionner' : 'Voir'}</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StockAlertesView({ items }: { items: StockItem[] }) {
  const ruptures = items.filter((i) => i.status === 'out_of_stock' || i.status === 'critical');
  const sousMin = items.filter((i) => i.status === 'low');

  return (
    <div className="space-y-5">
      {/* Ruptures critiques */}
      {ruptures.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-status-critical mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Ruptures critiques ({ruptures.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ruptures.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-bg-elevated rounded-xl border border-[rgba(239,68,68,0.3)] border-l-[3px] border-l-status-critical p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-mono text-sm text-accent-teal">{item.code}</div>
                    <div className="text-sm font-medium text-text-primary">{item.name}</div>
                  </div>
                  <StatusBadge status="critical" label="RUPTURE" />
                </div>
                <div className="text-xs text-text-muted mb-3">{item.location} • {item.supplier ?? '—'}</div>
                <button className="btn-primary h-8 px-3 text-xs w-full">Créer commande</button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Sous minimum */}
      {sousMin.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-status-warning mb-3 flex items-center gap-2">
            <TrendingDown className="w-4 h-4" />
            Sous minimum ({sousMin.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sousMin.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-bg-elevated rounded-xl border border-[rgba(245,158,11,0.3)] border-l-[3px] border-l-status-warning p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-mono text-sm text-accent-teal">{item.code}</div>
                    <div className="text-sm font-medium text-text-primary">{item.name}</div>
                  </div>
                  <StatusBadge status="warning" label="SOUS MINIMUM" />
                </div>
                <div className="flex items-center gap-4 text-xs text-text-muted mb-3">
                  <span>Stock: <span className="text-status-warning font-medium">{item.quantity}</span></span>
                  <span>Min: {item.minStock}</span>
                </div>
                <div className="flex gap-2">
                  <button className="btn-primary h-8 px-3 text-xs flex-1">Commander</button>
                  <button className="btn-ghost h-8 px-3 text-xs">Ajuster min.</button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {ruptures.length === 0 && sousMin.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-status-ok" />
          <p className="text-sm font-medium text-text-primary">Aucune alerte — Stock en bonne santé</p>
        </div>
      )}
    </div>
  );
}

function StockPartDrawer({
  item,
  open,
  onClose,
}: {
  item: StockItem | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!item) return null;

  const available = item.quantity;
  const progressOk = Math.min((available / item.maxStock) * 100, 100);
  const isUnderMin = available <= item.minStock;

  // Simulated movements
  const movements = [
    { date: item.lastRestockDate ?? '2025-03-15', type: 'Entrée', qty: Math.max(1, Math.floor(item.quantity * 0.4)), user: 'Jean Martin' },
    { date: format(new Date(Date.now() - 15 * 86400000), 'yyyy-MM-dd'), type: 'Sortie', qty: -2, user: 'Sophie Moreau' },
    { date: format(new Date(Date.now() - 45 * 86400000), 'yyyy-MM-dd'), type: 'Entrée', qty: Math.max(1, Math.floor(item.quantity * 0.3)), user: 'Marie Lefebvre' },
  ].filter((m) => m.date);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-[rgba(10,11,20,0.75)] backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
            className="fixed right-0 top-0 bottom-0 z-[200] w-full max-w-[480px] bg-bg-elevated border-l border-[rgba(90,94,117,0.3)] shadow-card-hover overflow-y-auto"
          >
            <div className="sticky top-0 z-10 bg-bg-elevated border-b border-[rgba(90,94,117,0.2)] px-6 py-4 flex items-start justify-between">
              <div>
                <div className="font-mono text-base text-accent-teal mb-1">{item.code}</div>
                <h2 className="text-lg font-semibold text-text-primary">{item.name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className={cn('badge-status', CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS['Consommable'])}>{item.category}</span>
                  <StatusBadge status={item.status === 'ok' ? 'ok' : item.status === 'low' ? 'warning' : 'critical'} label={STATUS_LABELS[item.status] ?? item.status} />
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-md hover:bg-bg-hover text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-6">
              {/* Stock card */}
              <div className="bg-bg-primary rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">En stock</span>
                  <span className="text-[2rem] font-bold text-text-primary tabular-nums">{item.quantity}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Minimum</span>
                  <span className="text-sm font-medium text-text-primary">{item.minStock}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Maximum</span>
                  <span className="text-sm font-medium text-text-primary">{item.maxStock}</span>
                </div>
                <div className="w-full h-2 bg-bg-elevated rounded-full overflow-hidden">
                  <div className="flex h-full rounded-full">
                    <div className="h-full bg-status-ok rounded-l-full" style={{ width: `${progressOk}%` }} />
                    {isUnderMin && (
                      <div className="h-full bg-status-critical rounded-r-full" style={{ width: `${Math.max(0, ((item.minStock - available) / item.maxStock) * 100)}%` }} />
                    )}
                  </div>
                </div>
                {isUnderMin && (
                  <div className="flex items-center gap-2 text-status-warning text-xs font-medium">
                    <AlertTriangle className="w-4 h-4" />
                    SOUS MINIMUM — Stock inférieur au seuil défini
                  </div>
                )}
                {item.status === 'out_of_stock' && (
                  <div className="flex items-center gap-2 text-status-critical text-xs font-medium">
                    <AlertTriangle className="w-4 h-4" />
                    RUPTURE — Stock épuisé
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <Factory className="w-4 h-4 text-accent-teal" />
                  Informations
                </h3>
                <div className="bg-bg-primary rounded-lg p-4 space-y-2.5 text-sm">
                  <div className="flex justify-between"><span className="text-text-secondary">Fabricant</span><span className="text-text-primary">{item.supplier ?? '—'}</span></div>
                  <div className="flex justify-between"><span className="text-text-secondary">Prix unitaire</span><span className="text-text-primary">{item.unitCost.toLocaleString('fr-FR')} €</span></div>
                  <div className="flex justify-between"><span className="text-text-secondary">Unité</span><span className="text-text-primary">{item.unit}</span></div>
                  <div className="flex justify-between"><span className="text-text-secondary">Localisation</span><span className="text-text-primary">{item.location}</span></div>
                </div>
              </div>

              {/* History */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <History className="w-4 h-4 text-accent-teal" />
                  Historique mouvements
                </h3>
                <div className="bg-bg-primary rounded-lg overflow-hidden">
                  {movements.map((m, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'flex items-center justify-between px-4 py-3',
                        idx < movements.length - 1 && 'border-b border-[rgba(90,94,117,0.1)]'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center',
                          m.type === 'Entrée' ? 'bg-[rgba(34,197,94,0.12)] text-status-ok' : 'bg-[rgba(239,68,68,0.12)] text-status-critical'
                        )}>
                          {m.type === 'Entrée' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="text-sm text-text-primary">{m.type}</div>
                          <div className="text-xs text-text-muted">{m.user}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={cn('text-sm font-medium tabular-nums', m.qty > 0 ? 'text-status-ok' : 'text-status-critical')}>
                          {m.qty > 0 ? '+' : ''}{m.qty}
                        </div>
                        <div className="text-xs text-text-muted">{m.date ? format(parseISO(m.date), 'dd/MM/yyyy') : '—'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-bg-elevated border-t border-[rgba(90,94,117,0.2)] px-6 py-4 flex items-center gap-2">
              <button className="btn-primary flex-1 text-sm h-10">Nouveau mouvement</button>
              <button className="btn-secondary text-sm h-10 px-3">Modifier</button>
              <button className="btn-secondary text-sm h-10 px-3">Commander</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Main Page ─── */

export default function Stocks() {
  const { stockItems, fetchItems } = useStockStore();

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);
  const [activeTab, setActiveTab] = useState<StockView>('stock');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [zoneFilter, setZoneFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const categories = useMemo(() => Array.from(new Set(stockItems.map((i) => i.category))).sort(), [stockItems]);
  const zones = useMemo(() => Array.from(new Set(stockItems.map((i) => i.location))).sort(), [stockItems]);

  const filteredItems = useMemo(() => {
    return stockItems.filter((item) => {
      const matchSearch = !search ||
        item.code.toLowerCase().includes(search.toLowerCase()) ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.supplier && item.supplier.toLowerCase().includes(search.toLowerCase()));
      const matchCategory = !categoryFilter || item.category === categoryFilter;
      const matchZone = !zoneFilter || item.location === zoneFilter;
      const matchStatus = !statusFilter || item.status === statusFilter;
      return matchSearch && matchCategory && matchZone && matchStatus;
    });
  }, [stockItems, search, categoryFilter, zoneFilter, statusFilter]);

  const handleView = useCallback((item: StockItem) => {
    setSelectedItem(item);
    setDrawerOpen(true);
  }, []);

  return (
    <div className="min-h-[100dvh] p-5 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[1.75rem] font-bold text-text-primary tracking-tight">STOCKS & PIÈCES DE RECHANGE</h1>
          <p className="text-sm text-text-secondary mt-1">Inventaire et gestion des pièces de rechange</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Code, désignation, fabricant..."
              className="input-industrial w-[240px] pl-9 hidden md:block"
            />
          </div>
          <button className="btn-secondary h-10 px-3 text-xs flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5" />
            Entrée
          </button>
          <button className="btn-secondary h-10 px-3 text-xs flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            Sortie
          </button>
          <button className="btn-primary flex items-center gap-2 text-sm h-10">
            <Plus className="w-4 h-4" />
            Nouvelle pièce
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 p-1 bg-bg-primary rounded-lg w-fit">
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all',
                active ? 'bg-accent-teal text-white' : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      {activeTab === 'stock' && (
        <StockFilters
          search={search}
          onSearchChange={setSearch}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          zoneFilter={zoneFilter}
          onZoneChange={setZoneFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          categories={categories}
          zones={zones}
        />
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'stock' && (
            <StockTable items={filteredItems} onView={handleView} />
          )}
          {activeTab === 'mouvements' && (
            <StockMovementsView items={filteredItems} />
          )}
          {activeTab === 'commandes' && (
            <StockCommandesView />
          )}
          {activeTab === 'alertes' && (
            <StockAlertesView items={stockItems} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Drawer */}
      <StockPartDrawer
        item={selectedItem}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
