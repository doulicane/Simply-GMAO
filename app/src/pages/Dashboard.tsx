import { useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bell, ClipboardList, CalendarClock, RefreshCw, TrendingUp,
  TrendingDown, Inbox, ScanQrCode, Package, Wrench, Ticket,
  AlertTriangle,
  FileDown,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import { useDashboardStore } from '@/stores/dashboardStore';
import { useAuthStore } from '@/stores/authStore';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';
import { TicketsWidget } from '@/components/TicketsWidget';
import { useCountUp } from '@/hooks/useCountUp';
import { cn } from '@/lib/utils';
import type { WorkOrder, PreventivePlan, AlertItem } from '@/types';

/* ─── KPI Card ─── */
function KPICard({
  title,
  value,
  unit,
  subtitle,
  trend,
  trendUp,
  trendGood,
  borderColor,
  children,
  onClick,
}: {
  title: string;
  value: string;
  unit?: string;
  subtitle: string;
  trend?: string;
  trendUp?: boolean;
  trendGood?: boolean;
  borderColor: string;
  children?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={cn(
        'card-elevated p-5 cursor-pointer transition-shadow hover:shadow-card-hover',
        'border-l-[3px]',
        onClick && 'hover:translate-y-[-2px]'
      )}
      style={{ borderLeftColor: borderColor }}
    >
      <p className="text-xs font-medium text-text-secondary uppercase tracking-[0.04em]">{title}</p>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-[42px] font-bold tabular-nums leading-none" style={{ color: borderColor }}>
          {value}
        </span>
        {unit && <span className="text-lg font-semibold text-text-secondary">{unit}</span>}
      </div>
      <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
      {trend && (
        <div className="mt-2 flex items-center gap-1 text-xs text-text-secondary">
          {trendUp ? (
            <TrendingUp className={cn('w-3.5 h-3.5', trendGood ? 'text-status-ok' : 'text-status-critical')} />
          ) : (
            <TrendingDown className={cn('w-3.5 h-3.5', trendGood ? 'text-status-ok' : 'text-status-critical')} />
          )}
          <span>{trend}</span>
        </div>
      )}
      {children && <div className="mt-3">{children}</div>}
    </motion.div>
  );
}

/* ─── Mini sparkline ─── */
function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const chartData = data.map((v, i) => ({ v, i }));
  return (
    <div className="h-8 w-full max-w-[120px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function MiniBarChart({ data, color }: { data: number[]; color: string }) {
  const chartData = data.map((v, i) => ({ v, i }));
  return (
    <div className="h-8 w-full max-w-[120px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <Bar dataKey="v" fill={color} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function MiniDonut({ data }: { data: { value: number; color: string }[] }) {
  return (
    <div className="h-12 w-12">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={14}
            outerRadius={24}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─── Alert Row ─── */
function AlertRow({ alert }: { alert: AlertItem }) {
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

/* ─── Kanban Mini Column ─── */
function KanbanMiniColumn({
  status,
  count,
  color,
  orders,
}: {
  status: string;
  count: number;
  color: string;
  orders: WorkOrder[];
}) {
  const navigate = useNavigate();
  return (
    <div className="bg-bg-elevated rounded-lg p-3 border border-[rgba(90,94,117,0.15)]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">{status}</span>
        <span
          className="min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold text-white flex items-center justify-center"
          style={{ backgroundColor: color }}
        >
          {count}
        </span>
      </div>
      <div className="space-y-2">
        {orders.slice(0, 3).map((wo) => (
          <button
            key={wo.id}
            onClick={() => navigate('/bons-de-travail')}
            className="w-full text-left text-xs hover:bg-bg-hover rounded-md p-1.5 -mx-1.5 transition-colors"
          >
            <p className="font-semibold text-text-primary truncate">{wo.equipmentName}</p>
            <p className="text-text-muted truncate">{wo.title}</p>
            <div className="mt-1 flex items-center gap-1">
              <div className="w-5 h-5 rounded-full bg-accent-teal/20 text-accent-teal flex items-center justify-center text-[9px] font-bold">
                {wo.assignedTo?.split(' ').map((n) => n[0]).join('') ?? '?'}
              </div>
              <span className="text-[10px] text-text-muted">{wo.assignedTo}</span>
            </div>
          </button>
        ))}
        {orders.length > 3 && (
          <button
            onClick={() => navigate('/bons-de-travail')}
            className="text-xs text-accent-teal hover:underline cursor-pointer w-full text-left"
          >
            +{orders.length - 3} plus
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── PM Item ─── */
function PMItem({ plan }: { plan: PreventivePlan }) {
  const daysUntil = Math.ceil(
    (new Date(plan.nextDueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  const badgeColor = daysUntil <= 0 ? 'status-critical' : daysUntil <= 3 ? 'status-warning' : 'status-ok';
  const badgeLabel = daysUntil <= 0 ? 'En retard' : `${daysUntil}j`;

  return (
    <motion.div
      whileHover={{ x: 2 }}
      className="flex items-center gap-3 p-3 rounded-lg bg-bg-elevated border border-[rgba(90,94,117,0.1)] hover:bg-bg-hover transition-colors"
    >
      <CalendarClock className="w-5 h-5 text-accent-teal flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary truncate">{plan.title}</p>
        <p className="text-[11px] text-text-secondary">
          Fréquence: {plan.frequency} · Technicien: {plan.assignedTo ?? 'Non assigné'}
        </p>
      </div>
      <StatusBadge status={badgeColor === 'status-ok' ? 'ok' : badgeColor === 'status-warning' ? 'warning' : 'critical'} label={badgeLabel} />
    </motion.div>
  );
}

/* ─── Quick Access Tile ─── */
function QuickTile({
  icon: Icon,
  label,
  to,
}: {
  icon: React.ElementType;
  label: string;
  to: string;
}) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Link
        to={to}
        className="flex flex-col items-center justify-center gap-2 min-h-[80px] bg-bg-elevated border border-[rgba(90,94,117,0.2)] rounded-[10px] p-4 hover:border-[rgba(14,165,233,0.5)] hover:bg-accent-teal-glow transition-all duration-200"
      >
        <Icon className="w-6 h-6 text-accent-teal" />
        <span className="text-sm font-medium text-text-primary text-center">{label}</span>
      </Link>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   DASHBOARD PAGE
   ═══════════════════════════════════════════ */
/* ─── Dashboard Technicien ─── */
function TechnicienDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { workOrders, preventivePlans, fetchDashboard } = useDashboardStore();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const myWorkOrders = useMemo(() => {
    return workOrders.filter((wo) => wo.assignedTo === user?.name);
  }, [workOrders, user]);

  const myPreventivePlans = useMemo(() => {
    return preventivePlans
      .filter((p) => p.assignedTo === user?.name)
      .filter((p) => p.status === 'active' || p.status === 'overdue')
      .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
  }, [preventivePlans, user]);

  const btByStatus = useMemo(() => {
    const planned = myWorkOrders.filter((wo) => wo.status === 'planned');
    const inProgress = myWorkOrders.filter((wo) => wo.status === 'in_progress');
    const waiting = myWorkOrders.filter((wo) => wo.status === 'waiting_parts');
    const completed = myWorkOrders.filter((wo) => wo.status === 'completed');
    return { planned, inProgress, waiting, completed };
  }, [myWorkOrders]);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0, 0, 0.2, 1] as [number, number, number, number] } },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">MES INTERVENTIONS</h1>
          <p className="text-xs text-text-secondary mt-0.5">Bons de travail et maintenance préventive assignés</p>
        </div>
        <button
          onClick={() => fetchDashboard()}
          className="p-2 rounded-md hover:bg-bg-hover text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Actualiser"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* KPIs Technicien */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={itemVariants}>
          <KPICard
            title="À PLANIFIER"
            value={String(btByStatus.planned.length)}
            subtitle="Bons de travail planifiés"
            borderColor="#3B82F6"
            onClick={() => navigate('/bons-de-travail')}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KPICard
            title="EN COURS"
            value={String(btByStatus.inProgress.length)}
            subtitle="Interventions en cours"
            borderColor="#0EA5E9"
            onClick={() => navigate('/bons-de-travail')}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KPICard
            title="EN ATTENTE PIÈCES"
            value={String(btByStatus.waiting.length)}
            subtitle="En attente de pièces"
            borderColor="#F59E0B"
            onClick={() => navigate('/bons-de-travail')}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KPICard
            title="TERMINÉS"
            value={String(btByStatus.completed.length)}
            subtitle="Interventions terminées"
            borderColor="#22C55E"
            onClick={() => navigate('/bons-de-travail')}
          />
        </motion.div>
      </motion.div>

      {/* Mes BT + Ma MP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Mes Bons de Travail */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="bg-bg-elevated rounded-xl border border-[rgba(90,94,117,0.2)] p-5"
        >
          <div className="flex items-center gap-2 mb-1">
            <Wrench className="w-4 h-4 text-text-secondary" />
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">MES BONS DE TRAVAIL</h2>
          </div>
          <p className="text-xs text-text-secondary mb-3">Interventions qui vous sont assignées</p>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {myWorkOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-text-muted">
                <Inbox className="w-8 h-8 mb-2" />
                <p className="text-sm">Aucun bon de travail assigné</p>
              </div>
            ) : (
              myWorkOrders.map((wo) => (
                <button
                  key={wo.id}
                  onClick={() => navigate('/bons-de-travail')}
                  className="w-full text-left p-3 rounded-lg bg-bg-hover border border-[rgba(90,94,117,0.1)] hover:border-[rgba(14,165,233,0.4)] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-text-muted">{wo.number}</span>
                    <StatusBadge
                      status={wo.status === 'completed' ? 'ok' : wo.status === 'in_progress' ? 'info' : wo.status === 'waiting_parts' ? 'warning' : 'neutral'}
                      label={wo.status === 'planned' ? 'Planifié' : wo.status === 'in_progress' ? 'En cours' : wo.status === 'waiting_parts' ? 'Attente' : 'Terminé'}
                    />
                  </div>
                  <p className="text-sm font-semibold text-text-primary mt-1">{wo.title}</p>
                  <p className="text-xs text-text-secondary">{wo.equipmentName}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <PriorityBadge priority={wo.priority} />
                    <span className="text-[11px] text-text-muted">
                      {wo.plannedStart ? new Date(wo.plannedStart).toLocaleDateString('fr-FR') : 'Non planifié'}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
          {/* Lien retiré — le technicien n'a pas accès à /bons-de-travail */}
        </motion.div>

        {/* Ma Maintenance Préventive */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="bg-bg-elevated rounded-xl border border-[rgba(90,94,117,0.2)] p-5"
        >
          <div className="flex items-center gap-2 mb-1">
            <CalendarClock className="w-4 h-4 text-text-secondary" />
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">MA MAINTENANCE PRÉVENTIVE</h2>
          </div>
          <p className="text-xs text-text-secondary mb-3">Planifications à venir</p>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {myPreventivePlans.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-text-muted">
                <Inbox className="w-8 h-8 mb-2" />
                <p className="text-sm">Aucune maintenance préventive assignée</p>
              </div>
            ) : (
              myPreventivePlans.map((plan) => <PMItem key={plan.id} plan={plan} />)
            )}
          </div>
          {/* Lien retiré — page maintenance préventive supprimée */}
        </motion.div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   DASHBOARD PAGE
   ═══════════════════════════════════════════ */
export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { kpi, alerts, workOrders, preventivePlans, availabilityByLine, fetchDashboard, loading } = useDashboardStore();

  if (user?.role === 'technicien') {
    return <TechnicienDashboard />;
  }

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const availabilityVal = useCountUp(kpi.availability, 800, 1);
  function formatHeuresMin(val: number): string {
    const h = Math.floor(val);
    const min = Math.round((val - h) * 60);
    return `${h}h${min.toString().padStart(2, '0')}min`;
  }
  const mttrVal = formatHeuresMin(kpi.mttr);
  const mtbfVal = formatHeuresMin(kpi.mtbf);
  const btOpenVal = useCountUp(kpi.openWorkOrders, 800, 0);

  const activeAlerts = useMemo(() => alerts.filter((a) => !a.acknowledged), [alerts]);

  const btByStatus = useMemo(() => {
    const planned = workOrders.filter((wo) => wo.status === 'planned');
    const inProgress = workOrders.filter((wo) => wo.status === 'in_progress');
    const waiting = workOrders.filter((wo) => wo.status === 'waiting_parts');
    return { planned, inProgress, waiting };
  }, [workOrders]);

  const upcomingPM = useMemo(() => {
    return preventivePlans
      .filter((p) => p.status === 'active' || p.status === 'overdue')
      .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())
      .slice(0, 5);
  }, [preventivePlans]);

  const donutData = [
    { value: kpi.urgentWorkOrders, color: '#EF4444' },
    { value: kpi.highWorkOrders, color: '#F59E0B' },
    { value: kpi.mediumWorkOrders, color: '#3B82F6' },
    { value: kpi.lowWorkOrders, color: '#6B7280' },
  ];

  const sparkData: number[] = [];
  const mttrBars: number[] = [];
  const mtbfLine: number[] = [];

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0, 0, 0.2, 1] as [number, number, number, number] } },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">DASHBOARD</h1>
          <p className="text-xs text-text-secondary mt-0.5">Vue d'ensemble de la maintenance</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`${import.meta.env.VITE_API_URL}/dashboard/monthly-report/pdf?month=${new Date().getMonth() + 1}&year=${new Date().getFullYear()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary h-8 px-3 text-xs flex items-center gap-1.5"
          >
            <FileDown className="w-3.5 h-3.5" />
            Rapport mensuel
          </a>
          <a
            href={`${import.meta.env.VITE_API_URL}/atex/compliance/pdf?year=${new Date().getFullYear()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary h-8 px-3 text-xs flex items-center gap-1.5"
          >
            <FileDown className="w-3.5 h-3.5" />
            Conformité ATEX
          </a>
          <button className="p-2 rounded-md hover:bg-bg-hover text-text-secondary hover:text-text-primary transition-colors" aria-label="Actualiser">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        <motion.div variants={itemVariants}>
          <KPICard
            title="DISPONIBILITÉ"
            value={availabilityVal}
            unit="%"
            subtitle="Objectif: 95%"
            borderColor={kpi.availability >= 90 ? '#22C55E' : kpi.availability >= 80 ? '#F59E0B' : '#EF4444'}
            onClick={() => navigate('/equipements')}
          >
            {sparkData.length > 0 ? <MiniSparkline data={sparkData} color="#22C55E" /> : null}
          </KPICard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <KPICard
            title="TEMPS MOYEN DE RÉPARATION"
            value={mttrVal}
            subtitle="Moyenne 30 jours"
            borderColor="#0EA5E9"
            onClick={() => navigate('/bons-de-travail')}
          >
            {mttrBars.length > 0 ? <MiniBarChart data={mttrBars} color="#0EA5E9" /> : null}
          </KPICard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <KPICard
            title="TEMPS MOYEN ENTRE PANNES"
            value={mtbfVal}
            subtitle="Moyenne 30 jours"
            borderColor="#0EA5E9"
            onClick={() => navigate('/equipements')}
          >
            {mtbfLine.length > 0 ? <MiniSparkline data={mtbfLine} color="#0EA5E9" /> : null}
          </KPICard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <KPICard
            title="BONS DE TRAVAIL OUVERTS"
            value={btOpenVal}
            subtitle={`Dont ${kpi.overdueWorkOrders} en retard`}
            borderColor={kpi.urgentWorkOrders > 0 ? '#F59E0B' : '#22C55E'}
            onClick={() => navigate('/bons-de-travail')}
          >
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5 flex-wrap">
                {kpi.urgentWorkOrders > 0 && <PriorityBadge priority="P1" />}
                {kpi.highWorkOrders > 0 && <PriorityBadge priority="P2" />}
                {kpi.mediumWorkOrders > 0 && <PriorityBadge priority="P3" />}
              </div>
              <MiniDonut data={donutData} />
            </div>
          </KPICard>
        </motion.div>
      </motion.div>

      {/* ── Tickets Widget (manager only) ── */}
      <TicketsWidget />

      {/* ── Alerts + BT Kanban ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Alerts */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="lg:col-span-3 bg-bg-elevated rounded-xl border border-[rgba(90,94,117,0.2)] p-5"
        >
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-4 h-4 text-text-secondary" />
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">Alertes</h2>
            {activeAlerts.length > 0 && (
              <span className="h-5 px-1.5 rounded-full bg-status-critical text-white text-[11px] font-bold flex items-center justify-center">
                {activeAlerts.length}
              </span>
            )}
          </div>
          <p className="text-xs text-text-secondary mb-3">Pannes et actions requises</p>
          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {activeAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-text-muted">
                <Inbox className="w-8 h-8 mb-2" />
                <p className="text-sm">Aucune alerte active</p>
                <p className="text-xs text-text-secondary">Tout va bien !</p>
              </div>
            ) : (
              activeAlerts.map((alert) => <AlertRow key={alert.id} alert={alert} />)
            )}
          </div>
        </motion.div>

        {/* BT Kanban Mini */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="lg:col-span-2 bg-bg-elevated rounded-xl border border-[rgba(90,94,117,0.2)] p-5"
        >
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList className="w-4 h-4 text-text-secondary" />
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">BONS DE TRAVAIL EN COURS</h2>
          </div>
          <p className="text-xs text-text-secondary mb-3">Vue d'ensemble des interventions</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <KanbanMiniColumn status="Planifié" count={btByStatus.planned.length} color="#3B82F6" orders={btByStatus.planned} />
            <KanbanMiniColumn status="En cours" count={btByStatus.inProgress.length} color="#0EA5E9" orders={btByStatus.inProgress} />
            <KanbanMiniColumn status="Attente" count={btByStatus.waiting.length} color="#F59E0B" orders={btByStatus.waiting} />
          </div>
          <Link
            to="/bons-de-travail"
            className="mt-3 inline-flex items-center text-xs font-medium text-accent-teal hover:underline"
          >
            Voir tous les bons de travail →
          </Link>
        </motion.div>
      </div>

      {/* ── Availability Chart + Upcoming PM ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="bg-bg-elevated rounded-xl border border-[rgba(90,94,117,0.2)] p-5"
        >
          <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">Disponibilité par ligne</h2>
          <p className="text-xs text-text-secondary mb-4">Taux de disponibilité des 7 derniers jours</p>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={availabilityByLine} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(90,94,117,0.15)" vertical={false} />
                <XAxis
                  dataKey="line"
                  tick={{ fill: '#8B8FA3', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(90,94,117,0.2)' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: '#8B8FA3', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  unit="%"
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#252836',
                    border: '1px solid rgba(90,94,117,0.3)',
                    borderRadius: '8px',
                    color: '#E8E8ED',
                    fontSize: '13px',
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Disponibilité']}
                />
                <Bar dataKey="availability" radius={[4, 4, 0, 0]}>
                  {availabilityByLine.map((entry, index) => {
                    const fill = entry.availability >= 95 ? '#22C55E' : entry.availability < 85 ? '#EF4444' : '#0EA5E9';
                    return <Cell key={`cell-${index}`} fill={fill} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="bg-bg-elevated rounded-xl border border-[rgba(90,94,117,0.2)] p-5"
        >
          <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">MAINTENANCE PRÉVENTIVE À VENIR (7 JOURS)</h2>
          <p className="text-xs text-text-secondary mb-4">Interventions planifiées à ne pas manquer</p>
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {upcomingPM.map((plan) => (
              <PMItem key={plan.id} plan={plan} />
            ))}
          </div>
          <Link
            to="/maintenance-preventive"
            className="mt-3 inline-flex items-center text-xs font-medium text-accent-teal hover:underline"
          >
            Voir le planning complet →
          </Link>
        </motion.div>
      </div>

    </div>
  );
}
