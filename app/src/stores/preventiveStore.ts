import { create } from 'zustand';
import { mapFrequency, isOverdue, parseChecklist } from './mappers';
import type { PreventivePlan } from '@/types';

import { API_URL } from '@/lib/config';
import { getAuthHeaders } from '@/lib/api';

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
  preventivePlans: [],
  loading: false,
  error: null,

  fetchPlans: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams({ ...filters, limit: '100' });
      const res = await fetch(`${API_URL}/preventive-plans?${params}`, {
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        const rawItems = Array.isArray(json.data) ? json.data : (json.data?.items ?? []);
        const items = rawItems.map(mapBackendPM);
        set({ preventivePlans: items, loading: false });
      } else {
        set({ error: json.error, loading: false });
      }
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  generateWO: async (id) => {
    try {
      const res = await fetch(`${API_URL}/preventive-plans/${id}/generate-wo`, {
        method: 'POST',
        headers: getAuthHeaders(),
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
