import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/api';
import type { WorkOrder, WorkOrderStatus } from '@/types';
import { mapBackendWO } from '@/stores/mappers';

interface BackendWorkOrder {
  id: string;
  numero: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  priority: string;
  equipmentId: string;
  equipment?: { name: string };
  demandeur?: { firstName: string; lastName: string };
  technicien?: { firstName: string; lastName: string };
  dateCreation: string;
  datePlanifiee?: string;
  dateDebut?: string;
  dateFin?: string;
  dureeMinutes?: number;
  coutMainOeuvre?: number;
  piecesConsommees?: unknown;
}

/* ------------------------------------------------------------------ */
//  Hooks
/* ------------------------------------------------------------------ */

export function useWorkOrders(filters?: Record<string, string>) {
  const params = new URLSearchParams({ ...filters, limit: '100' });
  return useQuery({
    queryKey: ['workOrders', filters],
    queryFn: async () => {
      const json = await fetchAPI(`/work-orders?${params}`);
      const rawItems = Array.isArray(json.data) ? json.data : (json.data?.items ?? []);
      return rawItems.map(mapBackendWO) as WorkOrder[];
    },
  });
}

export function useWorkOrder(id: string) {
  return useQuery({
    queryKey: ['workOrder', id],
    queryFn: async () => {
      const json = await fetchAPI(`/work-orders/${id}`);
      return mapBackendWO(json.data) as WorkOrder;
    },
    enabled: !!id,
  });
}

export function useCreateWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const json = await fetchAPI('/work-orders', { method: 'POST', body: JSON.stringify(data) });
      return mapBackendWO(json.data) as WorkOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workOrders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateWorkOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, commentaire }: { id: string; status: WorkOrderStatus; commentaire?: string }) => {
      const statusMap: Record<WorkOrderStatus, string> = {
        draft: 'CREE',
        planned: 'PLANIFIE',
        in_progress: 'EN_COURS',
        waiting_parts: 'EN_COURS',
        completed: 'TERMINE',
        closed: 'CLOTURE',
        cancelled: 'ANNULE',
      };
      const json = await fetchAPI(`/work-orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: statusMap[status], commentaire }),
      });
      return mapBackendWO(json.data) as WorkOrder;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['workOrders'] });
      queryClient.invalidateQueries({ queryKey: ['workOrder', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
