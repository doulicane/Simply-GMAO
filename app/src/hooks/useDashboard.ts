/**
 * =============================================================================
 * useDashboard — Hooks TanStack Query pour KPIs et alertes
 * =============================================================================
 */

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';

export interface DashboardKPIs {
  totalEquipments: number;
  equipmentByStatus: Record<string, number>;
  totalWO: number;
  woByStatus: Record<string, number>;
  woByType: Record<string, number>;
  woThisMonth: number;
  prevMonth: number;
  avgDuration: number;
  totalPreventivePlans: number;
  upcomingPreventive: number;
  lowStockItems: number;
  mttr: number;
  mtbfHours: number;
  disponibilitePct: number;
  coutMois: number;
  tempsReponseHeures: number;
  tauxPreventifPct: number;
  respectPreventifPct: number;
}

export function useDashboardKPIs() {
  return useQuery<DashboardKPIs>({
    queryKey: ['dashboard', 'kpis'],
    queryFn: async () => {
      const res = await apiGet('/dashboard/kpis');
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useDashboardAlerts() {
  return useQuery<any[]>({
    queryKey: ['dashboard', 'alerts'],
    queryFn: async () => {
      const res = await apiGet('/dashboard/alerts');
      return res.data ?? [];
    },
    staleTime: 2 * 60 * 1000,
  });
}
