/**
 * =============================================================================
 * DashboardKPIs — Widgets KPIs avec Recharts
 * =============================================================================
 */

import { useDashboardKPIs } from '@/hooks/useDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, Wrench, CalendarClock, PackageAlert, Timer, TrendingUp, ShieldCheck, Banknote, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  CREE: '#94a3b8',
  PLANIFIE: '#3b82f6',
  EN_COURS: '#f59e0b',
  TERMINE: '#10b981',
  CLOTURE: '#059669',
  ANNULE: '#ef4444',
};

const TYPE_COLORS: Record<string, string> = {
  CORRECTIF: '#ef4444',
  PREVENTIF: '#3b82f6',
  CONDITIONNEL: '#8b5cf6',
  AMELIORATION: '#10b981',
};

export function DashboardKPIs() {
  const { data: kpis, isLoading } = useDashboardKPIs();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse h-32" />
        ))}
      </div>
    );
  }

  if (!kpis) return null;

  const woStatusData = kpis.woByStatus.map((s) => ({
    name: s.status,
    count: s._count.id,
    fill: STATUS_COLORS[s.status] ?? '#94a3b8',
  }));

  const woTypeData = kpis.woByType.map((t) => ({
    name: t.type,
    count: t._count.id,
    fill: TYPE_COLORS[t.type] ?? '#94a3b8',
  }));

  const statCards = [
    {
      title: 'Equipements',
      value: kpis.totalEquipments,
      icon: Activity,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      title: 'BT ce mois',
      value: kpis.woThisMonth,
      icon: Wrench,
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
    },
    {
      title: 'Preventifs a venir',
      value: kpis.upcomingPreventive,
      icon: CalendarClock,
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-950/30',
    },
    {
      title: 'Stock bas',
      value: kpis.lowStockItems,
      icon: PackageAlert,
      color: 'text-red-500',
      bg: 'bg-red-50 dark:bg-red-950/30',
    },
  ];

  const advancedCards = [
    {
      title: 'Disponibilite',
      value: `${kpis.disponibilitePct}%`,
      icon: ShieldCheck,
      color: 'text-green-500',
      bg: 'bg-green-50 dark:bg-green-950/30',
    },
    {
      title: 'MTBF',
      value: `${kpis.mtbfHours}h`,
      icon: TrendingUp,
      color: 'text-cyan-500',
      bg: 'bg-cyan-50 dark:bg-cyan-950/30',
    },
    {
      title: 'Cout maintenance',
      value: `${Math.round(kpis.coutMois)}€`,
      icon: Banknote,
      color: 'text-orange-500',
      bg: 'bg-orange-50 dark:bg-orange-950/30',
    },
    {
      title: 'Temps reponse',
      value: `${kpis.tempsReponseHeures}h`,
      icon: Clock,
      color: 'text-indigo-500',
      bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-3xl font-bold mt-1">{card.value}</p>
                </div>
                <div className={cn('p-2.5 rounded-lg', card.bg)}>
                  <card.icon className={cn('w-5 h-5', card.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* MTTR + Respect plan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-primary" />
              <p className="text-sm text-muted-foreground">MTTR moyen (correctifs du mois)</p>
            </div>
            <p className="text-3xl font-bold mt-1">
              {Math.round(kpis.mttr)} <span className="text-sm font-normal text-muted-foreground">min</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <p className="text-sm text-muted-foreground">Respect plan preventif</p>
            </div>
            <p className="text-3xl font-bold mt-1">
              {Math.round(kpis.respectPreventifPct)} <span className="text-sm font-normal text-muted-foreground">%</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Advanced KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {advancedCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                </div>
                <div className={cn('p-2.5 rounded-lg', card.bg)}>
                  <card.icon className={cn('w-5 h-5', card.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">BT par statut</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={woStatusData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {woStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">BT par type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={woTypeData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {woTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
