import { create } from 'zustand';
import { mapBackendWO } from './mappers';
import type { WorkOrder, WorkOrderStatus } from '@/types';

import { API_URL } from '@/lib/config';
import { getAuthHeaders } from '@/lib/api';

interface WorkOrderState {
  workOrders: WorkOrder[];
  loading: boolean;
  error: string | null;
  fetchWorkOrders: (filters?: Record<string, string>) => Promise<void>;
  createWorkOrder: (data: any) => Promise<WorkOrder | null>;
  updateWorkOrderStatus: (id: string, status: WorkOrderStatus, commentaire?: string) => Promise<void>;
}

export const useWorkOrderStore = create<WorkOrderState>((set, get) => ({
  workOrders: [],
  loading: false,
  error: null,

  fetchWorkOrders: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams({ ...filters, limit: '100' });
      const res = await fetch(`${API_URL}/work-orders?${params}`, {
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        const rawItems = Array.isArray(json.data) ? json.data : (json.data?.items ?? []);
        const items = rawItems.map(mapBackendWO);
        set({ workOrders: items, loading: false });
      } else {
        set({ error: json.error, loading: false });
      }
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createWorkOrder: async (data) => {
    try {
      const res = await fetch(`${API_URL}/work-orders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        const wo = mapBackendWO(json.data);
        set({ workOrders: [wo, ...get().workOrders] });
        return wo;
      }
    } catch (err: any) {
      set({ error: err.message });
    }
    return null;
  },

  updateWorkOrderStatus: async (id, status, commentaire) => {
    const statusMap: Record<WorkOrderStatus, string> = {
      draft: 'CREE',
      planned: 'PLANIFIE',
      in_progress: 'EN_COURS',
      waiting_parts: 'EN_COURS',
      completed: 'TERMINE',
      closed: 'CLOTURE',
      cancelled: 'ANNULE',
    };
    try {
      const res = await fetch(`${API_URL}/work-orders/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: statusMap[status], commentaire }),
      });
      const json = await res.json();
      if (json.success) {
        const updated = mapBackendWO(json.data);
        set({
          workOrders: get().workOrders.map((wo) => (wo.id === id ? updated : wo)),
        });
      }
    } catch (err: any) {
      set({ error: err.message });
    }
  },
}));
