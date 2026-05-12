import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bell, ClipboardList, RefreshCw, Inbox,
  FileDown,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import {
  useDashboardKPIs, useDashboardAlerts, useDashboardRecentWOs,
  useDashboardUpcomingPMs, useDashboardAvailabilityByLine,
} from '@/hooks/useDashboardData';
import { PriorityBadge } from '@/components/StatusBadge';
import { TicketsWidget } from '@/components/TicketsWidget';
import { useCountUp } from '@/hooks/useCountUp';
import { KPICard, MiniSparkline, MiniBarChart, MiniDonut } from './KPICard';
import { AlertRow } from './AlertRow';
import { KanbanMiniColumn } from './KanbanMiniColumn';
import { PMItem } from './PMItem';

export function ResponsableDashboard() {
  const navigate = useNavigate();
  const { data: kpiData } = useDashboardKPIs();
  const { data: alerts = [] } = useDashboardAlerts();
  const { data: workOrders = [] } = useDashboardRecentWOs();
  const { data: preventivePlans = [] } = useDashboardUpcomingPMs();
  const { data: availabilityByLine = [] } = useDashboardAvailabilityByLine();

  const kpi = kpiData ?? {
    availability: 0,
    availabilityTrend: 0,
    mttr: 0,
    mttrTrend: 0,
    mtbf: 0,
    mtbfTrend: 0,
    openWorkOrders: 0,
    urgentWorkOrders: 0,
    highWorkOrders: 0,
    mediumWorkOrders: 0,
    lowWorkOrders: 0,
    overdueWorkOrders: 0,
  };

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
