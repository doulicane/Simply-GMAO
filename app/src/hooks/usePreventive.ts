import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/api';
import type { PreventivePlan } from '@/types';
import { mapFrequency, isOverdue, parseChecklist } from '@/stores/mappers';

interface BackendPreventivePlan {
  id: string;
  frequencyType: string;
  frequencyValue: number;
  title: string;
  description?: string;
  equipmentId: string;
  equipment?: { name: string };
  nextExecution?: string;
  lastExecution?: string;
  active: boolean;
  checklist?: string;
}

const mapBackendPM = (p: BackendPreventivePlan): PreventivePlan => ({
  id: p.id,
  code: `${p.frequencyType}-${p.frequencyValue}`,
  title: p.title,
  description: p.description ?? '',
  equipmentId: p.equipmentId,
  equipmentName: p.equipment?.name ?? '',
  frequency: mapFrequency(p.frequencyType, p.frequencyValue),
  estimatedDuration: p.frequencyValue,
  nextDueDate: p.nextExecution?.slice(0, 10),
  lastDoneDate: p.lastExecution?.slice(0, 10),
  assignedTo: '',
  status: p.active ? (isOverdue(p.nextExecution) ? 'overdue' : 'active') : 'suspended',
  checklist: parseChecklist(p.checklist),
  sparePartsNeeded: [],
});

/* ------------------------------------------------------------------ */
//  Hooks
/* ------------------------------------------------------------------ */

export function usePreventivePlans(filters?: Record<string, string>) {
  const params = new URLSearchParams({ ...filters, limit: '100' });
  return useQuery({
    queryKey: ['preventivePlans', filters],
    queryFn: async () => {
      const json = await fetchAPI(`/preventive-plans?${params}`);
      const rawItems = Array.isArray(json.data) ? json.data : (json.data?.items ?? []);
      return rawItems.map(mapBackendPM) as PreventivePlan[];
    },
  });
}

export function useGeneratePreventiveWO() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const json = await fetchAPI(`/preventive-plans/${id}/generate-wo`, { method: 'POST' });
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preventivePlans'] });
      queryClient.invalidateQueries({ queryKey: ['workOrders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
