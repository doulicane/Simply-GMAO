import { create } from 'zustand';
import { useAuthStore } from './authStore';
import { isMockMode } from './mockMode';

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

const API_URL = 'http://localhost:3001/api';

function getHeaders(): Record<string, string> {
  const user = useAuthStore.getState().user;
  return {
    'Content-Type': 'application/json',
    'x-demo-role': user?.role ?? '',
  };
}

const MOCK_TICKETS: Ticket[] = [
  { id: 'TK-001', numero: 'TK-2025-00001', title: 'Anomalie vibration Presse #1', description: 'Vibrations anormales détectées sur la presse #1 depuis ce matin.', equipmentId: 'EQ-001', equipmentName: 'Presse #1 — Haulick', operateurId: 'USR-003', operateurName: 'Marie Lefebvre', status: 'EN_COURS', priority: 'HAUTE', photos: [], workOrderId: 'WO-001', workOrderNumero: 'BT-4521', createdAt: '2025-05-05T08:00:00Z', updatedAt: '2025-05-05T10:00:00Z' },
  { id: 'TK-002', numero: 'TK-2025-00002', title: 'Fuite huile laquage #2', description: 'Petite fuite d\'huile de chauffage sous la ligne de laquage #2.', equipmentId: 'EQ-006', equipmentName: 'Ligne de laquage #2', operateurId: 'USR-003', operateurName: 'Marie Lefebvre', status: 'CREE', priority: 'MOYENNE', photos: [], workOrderId: null, createdAt: '2025-05-05T14:00:00Z', updatedAt: '2025-05-05T14:00:00Z' },
  { id: 'TK-003', numero: 'TK-2025-00003', title: 'Bouton d\'arrêt d\'urgence bloqué', description: 'Le bouton d\'arrêt d\'urgence du poste sérigraphie est bloqué en position enfoncée.', equipmentId: 'EQ-009', equipmentName: 'Machine sérigraphie #2', operateurId: 'USR-003', operateurName: 'Marie Lefebvre', status: 'RESOLU', priority: 'URGENTE', photos: [], workOrderId: null, createdAt: '2025-05-04T09:00:00Z', updatedAt: '2025-05-04T11:30:00Z' },
];

export const useTicketStore = create<TicketState>((set, get) => ({
  tickets: isMockMode() ? MOCK_TICKETS : [],
  loading: false,
  error: null,

  fetchTickets: async (filters = {}) => {
    if (isMockMode()) {
      set({ loading: true, error: null });
      await new Promise((r) => setTimeout(r, 200));
      let items = [...get().tickets];
      if (filters.status) {
        items = items.filter((t) => t.status === filters.status);
      }
      if (filters.priority) {
        items = items.filter((t) => t.priority === filters.priority);
      }
      set({ tickets: items, loading: false });
      return;
    }

    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams(filters);
      const res = await fetch(`${API_URL}/tickets?${params}`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        set({ tickets: json.data.items, loading: false });
      } else {
        set({ error: json.error, loading: false });
      }
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createTicket: async (data) => {
    if (isMockMode()) {
      const ticket: Ticket = {
        id: `TK-${Date.now()}`,
        numero: `TK-2025-${String(get().tickets.length + 1).padStart(5, '0')}`,
        title: data.title,
        description: data.description ?? null,
        equipmentId: data.equipmentId ?? null,
        equipmentName: data.equipmentCode,
        operateurId: 'USR-003',
        operateurName: 'Marie Lefebvre',
        status: 'CREE',
        priority: data.priority,
        photos: [],
        workOrderId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      set({ tickets: [ticket, ...get().tickets] });
      return ticket;
    }

    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/tickets`, {
        method: 'POST',
        headers: getHeaders(),
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
    if (isMockMode()) {
      set({
        tickets: get().tickets.map((t) =>
          t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t
        ),
      });
      return;
    }

    try {
      const res = await fetch(`${API_URL}/tickets/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
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
    if (isMockMode()) {
      set({
        tickets: get().tickets.map((t) =>
          t.id === id
            ? {
                ...t,
                status: 'CONVERTI_EN_BT' as TicketStatus,
                workOrderId: `WO-${Date.now()}`,
                workOrderNumero: `BT-${4500 + get().tickets.length}`,
              }
            : t
        ),
      });
      return;
    }

    try {
      const res = await fetch(`${API_URL}/tickets/${id}/convert`, {
        method: 'POST',
        headers: getHeaders(),
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
