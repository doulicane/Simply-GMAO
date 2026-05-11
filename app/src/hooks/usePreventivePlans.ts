/**
 * =============================================================================
 * usePreventivePlans — Hooks TanStack Query pour Maintenance Preventive
 * =============================================================================
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import { toast } from 'sonner';

export interface PreventivePlan {
  id: string;
  title: string;
  description?: string;
  equipmentId: string;
  equipment?: { id: string; code: string; name: string; statut: string };
  frequencyType: string;
  frequencyValue: number;
  nextExecution?: string;
  lastExecution?: string;
  alerteAvantJours: number;
  active: boolean;
  daysUntil?: number;
  alertLevel?: 'vert' | 'orange' | 'rouge';
}

export function usePreventivePlans() {
  return useQuery<PreventivePlan[]>({
    queryKey: ['preventive-plans'],
    queryFn: async () => {
      const res = await apiGet('/preventive-plans');
      return res.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpcomingPreventivePlans(days = 30) {
  return useQuery<PreventivePlan[]>({
    queryKey: ['preventive-plans', 'upcoming', days],
    queryFn: async () => {
      const res = await apiGet(`/preventive-plans/upcoming?days=${days}`);
      return res.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePostponePreventivePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, days }: { id: string; days: number }) =>
      apiPost(`/preventive-plans/${id}/postpone`, { days }),
    onSuccess: () => {
      toast.success('Plan reporte');
      qc.invalidateQueries({ queryKey: ['preventive-plans'] });
    },
    onError: (err: any) => toast.error(err.message || 'Erreur'),
  });
}

export function useGeneratePreventiveWO() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiPost(`/preventive-plans/${id}/generate-wo`, {}),
    onSuccess: () => {
      toast.success('BT preventif genere');
      qc.invalidateQueries({ queryKey: ['preventive-plans'] });
      qc.invalidateQueries({ queryKey: ['work-orders'] });
    },
    onError: (err: any) => toast.error(err.message || 'Erreur'),
  });
}
