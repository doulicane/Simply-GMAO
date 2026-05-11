/**
 * =============================================================================
 * useDashboardAdvanced — Hooks pour KPIs avances, Pareto, comparatifs
 * =============================================================================
 */

import { useQuery } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/api';

export interface ParetoItem {
  cause: string;
  count: number;
  frequencyPct: number;
  totalDuree: number;
  cumulPct: number;
}

export interface PeriodStats {
  start: string;
  end: string;
  workOrders: number;
  pannes: number;
  mttrMinutes: number;
  coutTotal: number;
  clotures: number;
}

export function useDashboardPareto(months = 6) {
  return useQuery<ParetoItem[]>({
    queryKey: ['dashboard', 'pareto', months],
    queryFn: async () => {
      const res = await fetchAPI(`/dashboard/pareto?months=${months}`);
      return res.data ?? [];
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useDashboardCompare(months = 1) {
  return useQuery<{ current: PeriodStats; previous: PeriodStats }>({
    queryKey: ['dashboard', 'compare', months],
    queryFn: async () => {
      const res = await fetchAPI(`/dashboard/compare?months=${months}`);
      return res.data;
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useDashboardExportUrl() {
  return (dateFrom: string, dateTo: string) => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    return `${base}/dashboard/export-work-orders?dateFrom=${encodeURIComponent(dateFrom)}&dateTo=${encodeURIComponent(dateTo)}`;
  };
}
