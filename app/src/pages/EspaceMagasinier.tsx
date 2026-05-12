import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package, AlertTriangle, ShoppingCart, ArrowLeftRight,
  TrendingDown, TrendingUp, Euro, Boxes, Eye, Plus,
  ChevronRight, Clock, MapPin, Factory,
} from 'lucide-react';
import { useStockItems } from '@/hooks/useStock';
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
        'w-full text-left bg-simply-gmao-green-dark rounded-xl border border-[#0A0A0A]/40 p-5 transition-all',
        onClick && 'hover:border-simply-gmao-gold/30 hover:shadow-card-hover cursor-pointer',
        !onClick && 'cursor-default'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', color)}>
          <Icon className="w-5 h-5" />
        </div>
        {onClick && <ChevronRight className="w-4 h-4 text-simply-gmao-warm-gray" />}
      </div>
      <div className="text-2xl font-bold text-simply-gmao-text font-raleway">{value}</div>
      <div className="text-xs text-simply-gmao-text-light mt-1">{label}</div>
      {sub && <div className="text-[11px] text-simply-gmao-warm-gray mt-1">{sub}</div>}
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
        'bg-simply-gmao-green-dark rounded-xl border p-4 cursor-pointer transition-all hover:shadow-card-hover',
        isRupture ? 'border-status-critical/40 border-l-[3px] border-l-status-critical' : 'border-status-warning/40 border-l-[3px] border-l-status-warning'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="font-mono text-sm text-simply-gmao-gold">{item.code}</div>
          <div className="text-sm font-medium text-simply-gmao-text">{item.name}</div>
        </div>
        <StatusBadge status={isRupture ? 'critical' : 'warning'} label={isRupture ? 'RUPTURE' : 'SOUS MIN'} />
      </div>
      <div className="flex items-center gap-4 mt-2 text-xs text-simply-gmao-text-light">
        <span>Stock: <span className={cn('font-medium', isRupture ? 'text-status-critical' : 'text-status-warning')}>{item.quantity}</span></span>
        <span>Min: {item.minStock}</span>
      </div>
      <div className="text-[11px] text-simply-gmao-warm-gray mt-1">{item.location} • {item.supplier ?? '—'}</div>
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
    <div className="flex items-center justify-between px-4 py-3 border-b border-[#0A0A0A]/20 hover:bg-simply-gmao-green-light/10 transition-colors">
      <div className="flex items-center gap-3">
        <div className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center',
          isEntree ? 'bg-status-ok/15 text-status-ok' : 'bg-status-critical/15 text-status-critical'
        )}>
          {isEntree ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        </div>
        <div>
          <div className="text-sm text-simply-gmao-text">{name}</div>
          <div className="text-[11px] text-simply-gmao-warm-gray">{code} • {user}</div>
        </div>
      </div>
      <div className="text-right">
        <div className={cn('text-sm font-medium tabular-nums', isEntree ? 'text-status-ok' : 'text-status-critical')}>
          {isEntree ? '+' : ''}{qty}
        </div>
        <div className="text-[11px] text-simply-gmao-warm-gray">{date}</div>
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
    <div className="flex items-center justify-between px-4 py-3 border-b border-[#0A0A0A]/20 hover:bg-simply-gmao-green-light/10 transition-colors">
      <div>
        <div className="text-sm text-simply-gmao-gold font-mono">{id}</div>
        <div className="text-sm text-simply-gmao-text">{fournisseur}</div>
      </div>
      <div className="text-right">
        <span className={cn('badge-status border', st.color)}>{st.label}</span>
        <div className="text-[11px] text-simply-gmao-warm-gray mt-1">{articles} article{articles > 1 ? 's' : ''} • Prévue {prevue}</div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function EspaceMagasinier() {
  const navigate = useNavigate();
  const { data: stockItems = [] } = useStockItems();

  const ruptures = stockItems.filter((i) => i.status === 'out_of_stock' || i.status === 'critical');
  const sousMin = stockItems.filter((i) => i.status === 'low');
  const totalValue = stockItems.reduce((sum, i) => sum + i.quantity * i.unitCost, 0);

  const movements: { date: string; type: string; code: string; name: string; qty: number; user: string }[] = [];
  const commandes: { id: string; fournisseur: string; date: string; prevue: string; articles: number; statut: string }[] = [];

  return (
    <div className="min-h-[100dvh] p-5 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[1.75rem] font-bold text-simply-gmao-text tracking-tight font-raleway">ESPACE MAGASINIER</h1>
          <p className="text-sm text-simply-gmao-text-light mt-1">Vue d'ensemble et gestion du stock de pièces de rechange</p>
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
          color="bg-simply-gmao-gold/15 text-simply-gmao-gold"
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
          sub="Aucune commande en cours"
          color="bg-status-info/15 text-status-info"
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Alertes stock */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-simply-gmao-green-dark rounded-xl border border-[#0A0A0A]/40 overflow-hidden">
            <div className="px-5 py-4 border-b border-[#0A0A0A]/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-status-critical" />
                <h2 className="text-base font-semibold text-simply-gmao-text">Alertes stock</h2>
              </div>
              <button
                onClick={() => navigate('/stocks')}
                className="text-xs text-simply-gmao-gold hover:text-simply-gmao-gold-light flex items-center gap-1"
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
                  <p className="text-sm text-simply-gmao-text-light">Aucune alerte — Stock en bonne santé</p>
                </div>
              )}
            </div>
          </div>

          {/* Derniers mouvements */}
          <div className="bg-simply-gmao-green-dark rounded-xl border border-[#0A0A0A]/40 overflow-hidden">
            <div className="px-5 py-4 border-b border-[#0A0A0A]/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-simply-gmao-gold" />
                <h2 className="text-base font-semibold text-simply-gmao-text">Derniers mouvements</h2>
              </div>
              <span className="text-xs text-simply-gmao-warm-gray">5 derniers</span>
            </div>
            <div>
              {movements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-simply-gmao-warm-gray">
                  <ArrowLeftRight className="w-8 h-8 mb-2" />
                  <p className="text-sm">Aucun mouvement</p>
                </div>
              ) : (
                movements.map((m, idx) => (
                  <MovementRow key={idx} {...m} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Commandes + Accès rapide */}
        <div className="space-y-6">
          {/* Commandes */}
          <div className="bg-simply-gmao-green-dark rounded-xl border border-[#0A0A0A]/40 overflow-hidden">
            <div className="px-5 py-4 border-b border-[#0A0A0A]/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-status-info" />
                <h2 className="text-base font-semibold text-simply-gmao-text">Commandes</h2>
              </div>
              <span className="text-xs text-simply-gmao-warm-gray">{commandes.length} en cours</span>
            </div>
            <div>
              {commandes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-simply-gmao-warm-gray">
                  <ShoppingCart className="w-8 h-8 mb-2" />
                  <p className="text-sm">Aucune commande</p>
                </div>
              ) : (
                commandes.map((c) => (
                  <CommandeRow key={c.id} {...c} />
                ))
              )}
            </div>
          </div>

          {/* Accès rapide */}
          <div className="bg-simply-gmao-green-dark rounded-xl border border-[#0A0A0A]/40 p-5">
            <h2 className="text-sm font-semibold text-simply-gmao-text mb-4">Accès rapide</h2>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/stocks')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-simply-gmao-green-light/20 hover:bg-simply-gmao-green-light/30 text-simply-gmao-text transition-colors text-left"
              >
                <Boxes className="w-5 h-5 text-simply-gmao-gold" />
                <div>
                  <div className="text-sm font-medium">Inventaire complet</div>
                  <div className="text-[11px] text-simply-gmao-text-light">Vue stock, filtres, détails</div>
                </div>
                <ChevronRight className="w-4 h-4 ml-auto text-simply-gmao-warm-gray" />
              </button>
              <button
                onClick={() => navigate('/bons-de-travail')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-simply-gmao-green-light/20 hover:bg-simply-gmao-green-light/30 text-simply-gmao-text transition-colors text-left"
              >
                <Factory className="w-5 h-5 text-simply-gmao-gold" />
                <div>
                  <div className="text-sm font-medium">Bons de travail</div>
                  <div className="text-[11px] text-simply-gmao-text-light">Pièces consommées sur les BT</div>
                </div>
                <ChevronRight className="w-4 h-4 ml-auto text-simply-gmao-warm-gray" />
              </button>
              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-simply-gmao-green-light/20 hover:bg-simply-gmao-green-light/30 text-simply-gmao-text transition-colors text-left"
              >
                <MapPin className="w-5 h-5 text-simply-gmao-gold" />
                <div>
                  <div className="text-sm font-medium">Localisations</div>
                  <div className="text-[11px] text-simply-gmao-text-light">Plan du magasin par zone</div>
                </div>
                <ChevronRight className="w-4 h-4 ml-auto text-simply-gmao-warm-gray" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
