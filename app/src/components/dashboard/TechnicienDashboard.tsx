import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RefreshCw, Inbox, Wrench, CalendarClock } from 'lucide-react';
import { useDashboardRecentWOs, useDashboardUpcomingPMs } from '@/hooks/useDashboardData';
import { useAuthStore } from '@/stores/authStore';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';
import { KPICard } from './KPICard';
import { PMItem } from './PMItem';

export function TechnicienDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: workOrders = [] } = useDashboardRecentWOs();
  const { data: preventivePlans = [] } = useDashboardUpcomingPMs();

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
        </motion.div>
      </div>
    </div>
  );
}
