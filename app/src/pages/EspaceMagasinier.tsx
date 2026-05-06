import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package, AlertTriangle, ShoppingCart, ArrowLeftRight,
  TrendingDown, TrendingUp, Euro, Boxes, Eye, Plus,
  ChevronRight, Clock, MapPin, Factory,
} from 'lucide-react';
import { useStockStore } from '@/stores/stockStore';
import { useDataStore } from '@/stores/dataStore';
import { StatusBadge } from '@/components/StatusBadge';
import { cn } from '@/lib/utils';
import type { StockItem } from '@/types';

/* ─── KPI Card ─── */
function KPICard({ icon: Icon, label, value, sub, color, onClick }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  onClick?: () => void;
}) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={cn(
        'w-full text-left bg-ramondin-green-dark rounded-xl border border-[#1D3C34]/40 p-5 transition-all',
        onClick && 'hover:border-ramondin-gold/30 hover:shadow-card-hover cursor-pointer',
        !onClick && 'cursor-default'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', color)}>
          <Icon className="w-5 h-5" />
        </div>
        {onClick && <ChevronRight className="w-4 h-4 text-ramondin-warm-gray" />}
      </div>
      <div className="text-2xl font-bold text-ramondin-text font-raleway">{value}</div>
      <div className="text-xs text-ramondin-text-light mt-1">{label}</div>
      {sub && <div className="text-[11px] text-ramondin-warm-gray mt-1">{sub}</div>}
    </motion.button>
  );
}

/* ─── Alert Card ─── */
function AlertCard({ item, onClick }: { item: StockItem; onClick: () => void }) {
  const isRupture = item.status === 'out_of_stock' || item.status === 'critical';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-ramondin-green-dark rounded-xl border p-4 cursor-pointer transition-all hover:shadow-card-hover',
        isRupture ? 'border-status-critical/40 border-l-[3px] border-l-status-critical' : 'border-status-warning/40 border-l-[3px] border-l-status-warning'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="font-mono text-sm text-ramondin-gold">{item.code}</div>
          <div className="text-sm font-medium text-ramondin-text">{item.name}</div>
        </div>
        <StatusBadge status={isRupture ? 'critical' : 'warning'} label={isRupture ? 'RUPTURE' : 'SOUS MIN'} />
      </div>
      <div className="flex items-center gap-4 mt-2 text-xs text-ramondin-text-light">
        <span>Stock: <span className={cn('font-medium', isRupture ? 'text-status-critical' : 'text-status-warning')}>{item.quantity}</span></span>
        <span>Min: {item.minStock}</span>
      </div>
      <div className="text-[11px] text-ramondin-warm-gray mt-1">{item.location} • {item.supplier ?? '—'}</div>
      <div className="mt-3 flex gap-2">
        <button className="btn-primary h-7 px-3 text-[11px] flex-1">Commander</button>
        <button className="btn-ghost h-7 px-3 text-[11px]">Détails</button>
      </div>
    </motion.div>
  );
}

/* ─── Movement Row ─── */
function MovementRow({ date, type, code, name, qty, user }: {
  date: string; type: string; code: string; name: string; qty: number; user: string;
}) {
  const isEntree = type === 'Entrée';
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-[#1D3C34]/20 hover:bg-ramondin-green-light/10 transition-colors">
      <div className="flex items-center gap-3">
        <div className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center',
          isEntree ? 'bg-status-ok/15 text-status-ok' : 'bg-status-critical/15 text-status-critical'
        )}>
          {isEntree ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        </div>
        <div>
          <div className="text-sm text-ramondin-text">{name}</div>
          <div className="text-[11px] text-ramondin-warm-gray">{code} • {user}</div>
        </div>
      </div>
      <div className="text-right">
        <div className={cn('text-sm font-medium tabular-nums', isEntree ? 'text-status-ok' : 'text-status-critical')}>
          {isEntree ? '+' : ''}{qty}
        </div>
        <div className="text-[11px] text-ramondin-warm-gray">{date}</div>
      </div>
    </div>
  );
}

/* ─── Commande Row ─── */
function CommandeRow({ id, fournisseur, date, prevue, articles, statut }: {
  id: string; fournisseur: string; date: string; prevue: string; articles: number; statut: string;
}) {
  const statusMap: Record<string, { color: string; label: string }> = {
    en_attente: { color: 'text-status-info bg-status-info/10 border-status-info/30', label: 'En attente' },
    partielle: { color: 'text-status-warning bg-status-warning/10 border-status-warning/30', label: 'Partielle' },
    recue: { color: 'text-status-ok bg-status-ok/10 border-status-ok/30', label: 'Reçue' },
  };
  const st = statusMap[statut] || statusMap.en_attente;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-[#1D3C34]/20 hover:bg-ramondin-green-light/10 transition-colors">
      <div>
        <div className="text-sm text-ramondin-gold font-mono">{id}</div>
        <div className="text-sm text-ramondin-text">{fournisseur}</div>
      </div>
      <div className="text-right">
        <span className={cn('badge-status border', st.color)}>{st.label}</span>
        <div className="text-[11px] text-ramondin-warm-gray mt-1">{articles} article{articles > 1 ? 's' : ''} • Prévue {prevue}</div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function EspaceMagasinier() {
  const navigate = useNavigate();
  const { stockItems, fetchItems } = useStockStore();
  const { alerts } = useDataStore();

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const ruptures = stockItems.filter((i) => i.status === 'out_of_stock' || i.status === 'critical');
  const sousMin = stockItems.filter((i) => i.status === 'low');
  const totalValue = stockItems.reduce((sum, i) => sum + i.quantity * i.unitCost, 0);

  const stockAlerts = alerts.filter((a) => a.type === 'low_stock');

  const movements = useMemo(() => [
    { date: '05/05/25', type: 'Sortie', code: 'SP-003', name: 'Joint torique 120x5 NBR', qty: -4, user: 'Jean Martin' },
    { date: '05/05/25', type: 'Entrée', code: 'SP-008', name: 'Filtre cartouche', qty: 2, user: 'Luc Bernard' },
    { date: '04/05/25', type: 'Sortie', code: 'SP-011', name: 'Thermocouple type K', qty: -1, user: 'Jean Martin' },
    { date: '04/05/25', type: 'Entrée', code: 'SP-021', name: 'Lampe UV 8kW', qty: 1, user: 'Luc Bernard' },
    { date: '03/05/25', type: 'Sortie', code: 'SP-002', name: 'Filtre hydraulique MP Filtri', qty: -1, user: 'Sophie Moreau' },
  ], []);

  const commandes = [
    { id: 'CMD-2025-001', fournisseur: 'SKF', date: '15/04/25', prevue: '10/05', articles: 3, statut: 'en_attente' },
    { id: 'CMD-2025-002', fournisseur: 'Atlas Copco', date: '20/04/25', prevue: '15/05', articles: 2, statut: 'partielle' },
    { id: 'CMD-2025-003', fournisseur: 'Siemens', date: '25/04/25', prevue: '20/05', articles: 1, statut: 'en_attente' },
  ];

  return (
    <div className="min-h-[100dvh] p-5 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[1.75rem] font-bold text-ramondin-text tracking-tight font-raleway">ESPACE MAGASINIER</h1>
          <p className="text-sm text-ramondin-text-light mt-1">Vue d'ensemble et gestion du stock de pièces de rechange</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/stocks')}
            className="btn-secondary h-10 px-4 text-sm flex items-center gap-2"
          >
            <Boxes className="w-4 h-4" />
            Inventaire complet
          </button>
          <button className="btn-primary h-10 px-4 text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Entrée stock
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard
          icon={Package}
          label="Références en stock"
          value={stockItems.length}
          color="bg-ramondin-gold/15 text-ramondin-gold"
          onClick={() => navigate('/stocks')}
        />
        <KPICard
          icon={Euro}
          label="Valeur totale"
          value={`${totalValue.toLocaleString('fr-FR')} €`}
          color="bg-status-ok/15 text-status-ok"
        />
        <KPICard
          icon={AlertTriangle}
          label="Alertes stock"
          value={ruptures.length + sousMin.length}
          sub={`${ruptures.length} rupture${ruptures.length > 1 ? 's' : ''}, ${sousMin.length} sous min.`}
          color="bg-status-critical/15 text-status-critical"
          onClick={() => navigate('/stocks')}
        />
        <KPICard
          icon={ShoppingCart}
          label="Commandes en cours"
          value={commandes.length}
          sub="2 en attente, 1 partielle"
          color="bg-status-info/15 text-status-info"
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Alertes stock */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-ramondin-green-dark rounded-xl border border-[#1D3C34]/40 overflow-hidden">
            <div className="px-5 py-4 border-b border-[#1D3C34]/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-status-critical" />
                <h2 className="text-base font-semibold text-ramondin-text">Alertes stock</h2>
              </div>
              <button
                onClick={() => navigate('/stocks')}
                className="text-xs text-ramondin-gold hover:text-ramondin-gold-light flex items-center gap-1"
              >
                Voir tout <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {ruptures.slice(0, 2).map((item) => (
                <AlertCard key={item.id} item={item} onClick={() => navigate('/stocks')} />
              ))}
              {sousMin.slice(0, 2).map((item) => (
                <AlertCard key={item.id} item={item} onClick={() => navigate('/stocks')} />
              ))}
              {ruptures.length === 0 && sousMin.length === 0 && (
                <div className="col-span-2 text-center py-8">
                  <Package className="w-8 h-8 mx-auto mb-2 text-status-ok" />
                  <p className="text-sm text-ramondin-text-light">Aucune alerte — Stock en bonne santé</p>
                </div>
              )}
            </div>
          </div>

          {/* Derniers mouvements */}
          <div className="bg-ramondin-green-dark rounded-xl border border-[#1D3C34]/40 overflow-hidden">
            <div className="px-5 py-4 border-b border-[#1D3C34]/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-ramondin-gold" />
                <h2 className="text-base font-semibold text-ramondin-text">Derniers mouvements</h2>
              </div>
              <span className="text-xs text-ramondin-warm-gray">5 derniers</span>
            </div>
            <div>
              {movements.map((m, idx) => (
                <MovementRow key={idx} {...m} />
              ))}
            </div>
          </div>
        </div>

        {/* Right: Commandes + Accès rapide */}
        <div className="space-y-6">
          {/* Commandes */}
          <div className="bg-ramondin-green-dark rounded-xl border border-[#1D3C34]/40 overflow-hidden">
            <div className="px-5 py-4 border-b border-[#1D3C34]/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-status-info" />
                <h2 className="text-base font-semibold text-ramondin-text">Commandes</h2>
              </div>
              <span className="text-xs text-ramondin-warm-gray">{commandes.length} en cours</span>
            </div>
            <div>
              {commandes.map((c) => (
                <CommandeRow key={c.id} {...c} />
              ))}
            </div>
          </div>

          {/* Accès rapide */}
          <div className="bg-ramondin-green-dark rounded-xl border border-[#1D3C34]/40 p-5">
            <h2 className="text-sm font-semibold text-ramondin-text mb-4">Accès rapide</h2>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/stocks')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-ramondin-green-light/20 hover:bg-ramondin-green-light/30 text-ramondin-text transition-colors text-left"
              >
                <Boxes className="w-5 h-5 text-ramondin-gold" />
                <div>
                  <div className="text-sm font-medium">Inventaire complet</div>
                  <div className="text-[11px] text-ramondin-text-light">Vue stock, filtres, détails</div>
                </div>
                <ChevronRight className="w-4 h-4 ml-auto text-ramondin-warm-gray" />
              </button>
              <button
                onClick={() => navigate('/bons-de-travail')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-ramondin-green-light/20 hover:bg-ramondin-green-light/30 text-ramondin-text transition-colors text-left"
              >
                <Factory className="w-5 h-5 text-ramondin-gold" />
                <div>
                  <div className="text-sm font-medium">Bons de travail</div>
                  <div className="text-[11px] text-ramondin-text-light">Pièces consommées sur les BT</div>
                </div>
                <ChevronRight className="w-4 h-4 ml-auto text-ramondin-warm-gray" />
              </button>
              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-ramondin-green-light/20 hover:bg-ramondin-green-light/30 text-ramondin-text transition-colors text-left"
              >
                <MapPin className="w-5 h-5 text-ramondin-gold" />
                <div>
                  <div className="text-sm font-medium">Localisations</div>
                  <div className="text-[11px] text-ramondin-text-light">Plan du magasin par zone</div>
                </div>
                <ChevronRight className="w-4 h-4 ml-auto text-ramondin-warm-gray" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
