/**
 * =============================================================================
 * usePlanning — Hook pour recuperer les evenements de planification
 * =============================================================================
 */

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';

export interface PlanningEvent {
  id: string;
  title: string;
  date: string;
  type: 'preventive' | 'corrective' | 'inspection';
  status: string;
  equipmentId?: string;
  equipmentCode?: string;
}

export function usePlanning(month: string) {
  return useQuery<PlanningEvent[]>({
    queryKey: ['planning', month],
    queryFn: async () => {
      const res = await apiGet(`/planning?month=${month}`);
      return res.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}
