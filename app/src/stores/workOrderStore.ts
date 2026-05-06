import { create } from 'zustand';
import { useAuthStore } from './authStore';
import { isMockMode } from './mockMode';
import { useDataStore } from './dataStore';
import { mapBackendWO } from './mappers';
import type { WorkOrder, WorkOrderStatus } from '@/types';

const API_URL = 'http://localhost:3001/api';

function getHeaders(): Record<string, string> {
  const user = useAuthStore.getState().user;
  const token = useAuthStore.getState().accessToken;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    'x-demo-role': user?.role ?? '',
  };
}

interface WorkOrderState {
  workOrders: WorkOrder[];
  loading: boolean;
  error: string | null;
  fetchWorkOrders: (filters?: Record<string, string>) => Promise<void>;
  createWorkOrder: (data: any) => Promise<WorkOrder | null>;
  updateWorkOrderStatus: (id: string, status: WorkOrderStatus, commentaire?: string) => Promise<void>;
}

export const useWorkOrderStore = create<WorkOrderState>((set, get) => ({
  workOrders: isMockMode() ? useDataStore.getState().workOrders : [],
  loading: false,
  error: null,

  fetchWorkOrders: async (filters = {}) => {
    if (isMockMode()) {
      set({ loading: true, error: null });
      await new Promise((r) => setTimeout(r, 200));
      let items = [...useDataStore.getState().workOrders];
      if (filters.status) {
        items = items.filter((w) => w.status === filters.status);
      }
      if (filters.type) {
        items = items.filter((w) => w.type === filters.type);
      }
      if (filters.priority) {
        items = items.filter((w) => w.priority === filters.priority);
      }
      if (filters.equipmentId) {
        items = items.filter((w) => w.equipmentId === filters.equipmentId);
      }
      set({ workOrders: items, loading: false });
      return;
    }

    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams({ ...filters, limit: '100' });
      const res = await fetch(`${API_URL}/work-orders?${params}`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        const items = (json.data.items ?? []).map(mapBackendWO);
        set({ workOrders: items, loading: false });
      } else {
        set({ error: json.error, loading: false });
      }
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createWorkOrder: async (data) => {
    if (isMockMode()) {
      const wo: WorkOrder = {
        id: `WO-${Date.now()}`,
        number: `BT-${4500 + get().workOrders.length + 1}`,
        title: data.title ?? 'Nouveau BT',
        description: data.description ?? '',
        type: data.type ?? 'corrective',
        status: 'draft',
        priority: data.priority ?? 'P3',
        equipmentId: data.equipmentId,
        equipmentName: data.equipmentName ?? '',
        requestedBy: data.requestedBy ?? 'Utilisateur',
        assignedTo: data.assignedTo,
        createdAt: new Date().toISOString(),
        duration: data.duration,
        partsUsed: [],
        cost: 0,
      };
      set({ workOrders: [wo, ...get().workOrders] });
      useDataStore.getState().addWorkOrder(wo);
      return wo;
    }

    try {
      const res = await fetch(`${API_URL}/work-orders`, {
        method: 'POST',
        headers: getHeaders(),
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
    if (isMockMode()) {
      const updated = get().workOrders.map((wo) =>
        wo.id === id ? { ...wo, status } : wo
      );
      set({ workOrders: updated });
      useDataStore.getState().updateWorkOrderStatus(id, status);
      return;
    }

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
        headers: getHeaders(),
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
