import { create } from 'zustand';
import { useAuthStore } from './authStore';
import { isMockMode } from './mockMode';
import { useDataStore } from './dataStore';
import { mapFrequency, isOverdue, parseChecklist } from './mappers';
import type { PreventivePlan } from '@/types';

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

const mapBackendPM = (p: any): PreventivePlan => ({
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

interface PreventiveState {
  preventivePlans: PreventivePlan[];
  loading: boolean;
  error: string | null;
  fetchPlans: (filters?: Record<string, string>) => Promise<void>;
  generateWO: (id: string) => Promise<any>;
}

export const usePreventiveStore = create<PreventiveState>((set) => ({
  preventivePlans: isMockMode() ? useDataStore.getState().preventivePlans : [],
  loading: false,
  error: null,

  fetchPlans: async (filters = {}) => {
    if (isMockMode()) {
      set({ loading: true, error: null });
      await new Promise((r) => setTimeout(r, 200));
      let items = [...useDataStore.getState().preventivePlans];
      if (filters.equipmentId) {
        items = items.filter((p) => p.equipmentId === filters.equipmentId);
      }
      if (filters.status) {
        items = items.filter((p) => p.status === filters.status);
      }
      set({ preventivePlans: items, loading: false });
      return;
    }

    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams({ ...filters, limit: '100' });
      const res = await fetch(`${API_URL}/preventive-plans?${params}`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        const items = (json.data.items ?? []).map(mapBackendPM);
        set({ preventivePlans: items, loading: false });
      } else {
        set({ error: json.error, loading: false });
      }
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  generateWO: async (id) => {
    if (isMockMode()) {
      // In mock mode, just mark the plan as having generated a WO
      return { id: `WO-${Date.now()}`, numero: `BT-${4500 + Math.floor(Math.random() * 100)}` };
    }
    try {
      const res = await fetch(`${API_URL}/preventive-plans/${id}/generate-wo`, {
        method: 'POST',
        headers: getHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        return json.data;
      }
    } catch (err: any) {
      set({ error: err.message });
    }
    return null;
  },
}));
