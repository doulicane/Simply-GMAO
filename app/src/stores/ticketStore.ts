import { create } from 'zustand';
import { API_URL } from '@/lib/config';
import { getAuthHeaders } from '@/lib/api';

export type TicketStatus = 'CREE' | 'EN_ATTENTE' | 'EN_COURS' | 'RESOLU' | 'REJETE' | 'CONVERTI_EN_BT';
export type Priority = 'URGENTE' | 'HAUTE' | 'MOYENNE' | 'BASSE';

export interface Ticket {
  id: string;
  numero: string;
  title: string;
  description: string | null;
  equipmentId: string | null;
  equipmentName?: string;
  operateurId: string;
  operateurName?: string;
  status: TicketStatus;
  priority: Priority;
  photos: string[];
  workOrderId: string | null;
  workOrderNumero?: string;
  createdAt: string;
  updatedAt: string;
}

interface TicketState {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  fetchTickets: (filters?: Record<string, string>) => Promise<void>;
  createTicket: (data: {
    title: string;
    description?: string;
    equipmentId?: string;
    equipmentCode?: string;
    priority: Priority;
  }) => Promise<Ticket | null>;
  updateTicketStatus: (id: string, status: TicketStatus, commentaire?: string) => Promise<void>;
  convertTicketToBT: (id: string, data: {
    title?: string;
    description?: string;
    priority?: Priority;
    technicienId?: string;
  }) => Promise<void>;
}
export const useTicketStore = create<TicketState>((set, get) => ({
  tickets: [],
  loading: false,
  error: null,

  fetchTickets: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams(filters);
      const res = await fetch(`${API_URL}/tickets?${params}`, {
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        const items = Array.isArray(json.data) ? json.data : (json.data?.items ?? []);
        set({ tickets: items, loading: false });
      } else {
        set({ error: json.error, loading: false });
      }
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createTicket: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/tickets`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        set({ tickets: [json.data, ...get().tickets], loading: false });
        return json.data;
      } else {
        set({ error: json.error, loading: false });
        return null;
      }
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return null;
    }
  },

  updateTicketStatus: async (id, status, commentaire) => {
    try {
      const res = await fetch(`${API_URL}/tickets/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, commentaire }),
      });
      const json = await res.json();
      if (json.success) {
        set({
          tickets: get().tickets.map((t) => (t.id === id ? json.data : t)),
        });
      }
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  convertTicketToBT: async (id, data) => {
    try {
      const res = await fetch(`${API_URL}/tickets/${id}/convert`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        set({
          tickets: get().tickets.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: 'CONVERTI_EN_BT' as TicketStatus,
                  workOrderId: json.data.workOrder.id,
                  workOrderNumero: json.data.workOrder.numero,
                }
              : t
          ),
        });
      }
    } catch (err: any) {
      set({ error: err.message });
    }
  },
}));
