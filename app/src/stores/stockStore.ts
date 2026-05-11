import { create } from 'zustand';
import type { StockItem } from '@/types';

import { API_URL } from '@/lib/config';
import { getAuthHeaders } from '@/lib/api';

const mapBackendStock = (item: any): StockItem => ({
  id: item.id,
  code: item.code,
  name: item.name,
  category: item.famille ?? '',
  description: item.designation ?? item.sousFamille ?? '',
  quantity: Number(item.quantite ?? 0),
  minStock: Number(item.stockMinimum ?? 0),
  maxStock: item.stockMaximum ? Number(item.stockMaximum) : 0,
  unit: item.unite ?? 'pc',
  location: item.localisation ?? '',
  status: Number(item.quantite ?? 0) <= Number(item.stockMinimum ?? 0)
    ? (Number(item.quantite ?? 0) === 0 ? 'out_of_stock' : 'low')
    : 'ok',
  unitCost: item.prixUnitaire ? Number(item.prixUnitaire) : 0,
  supplier: item.fournisseur ?? undefined,
  lastRestockDate: undefined,
  reorderPoint: Number(item.stockMinimum ?? 0),
});

export interface StockMovement {
  id: string;
  type: 'ENTREE' | 'SORTIE' | 'AJUSTEMENT' | 'RETOUR' | 'RESERVATION' | 'TRANSFERT';
  quantite: number;
  date: string;
  commentaire?: string;
  utilisateur?: { id: string; firstName: string; lastName: string };
  workOrder?: { id: string; numero: string };
}

export interface StockItemDetail extends StockItem {
  movements: StockMovement[];
}

interface StockState {
  stockItems: StockItem[];
  loading: boolean;
  error: string | null;
  fetchItems: (filters?: Record<string, string>) => Promise<void>;
  createItem: (data: Record<string, any>) => Promise<StockItem | null>;
  updateItem: (id: string, data: Record<string, any>) => Promise<StockItem | null>;
  createMovement: (data: Record<string, any>) => Promise<boolean>;
  fetchItemDetail: (id: string) => Promise<StockItemDetail | null>;
  fetchMovements: () => Promise<StockMovement[]>;
  deleteItem: (id: string) => Promise<boolean>;
}

export const useStockStore = create<StockState>((set, get) => ({
  stockItems: [],
  loading: false,
  error: null,

  fetchItems: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams({ ...filters, limit: '100' });
      const res = await fetch(`${API_URL}/stock?${params}`, {
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        const rawItems = Array.isArray(json.data) ? json.data : (json.data?.items ?? []);
        const items = rawItems.map(mapBackendStock);
        set({ stockItems: items, loading: false });
      } else {
        set({ error: json.error, loading: false });
      }
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createItem: async (data) => {
    try {
      const res = await fetch(`${API_URL}/stock`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        const item = mapBackendStock(json.data);
        set({ stockItems: [item, ...get().stockItems] });
        return item;
      } else {
        set({ error: json.error });
      }
    } catch (err: any) {
      set({ error: err.message });
    }
    return null;
  },

  updateItem: async (id, data) => {
    try {
      const res = await fetch(`${API_URL}/stock/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        const updated = mapBackendStock(json.data);
        set({
          stockItems: get().stockItems.map((i) => (i.id === id ? updated : i)),
        });
        return updated;
      } else {
        set({ error: json.error });
      }
    } catch (err: any) {
      set({ error: err.message });
    }
    return null;
  },

  createMovement: async (data) => {
    try {
      const res = await fetch(`${API_URL}/stock/movements`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        // Recharge la liste pour mettre à jour les quantités
        await get().fetchItems();
        return true;
      } else {
        set({ error: json.error });
      }
    } catch (err: any) {
      set({ error: err.message });
    }
    return false;
  },

  fetchItemDetail: async (id) => {
    try {
      const res = await fetch(`${API_URL}/stock/${id}`, {
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        const item = mapBackendStock(json.data);
        const movements: StockMovement[] = (json.data.stockMovements ?? []).map((m: any) => ({
          id: m.id,
          type: m.type,
          quantite: Number(m.quantite),
          date: m.date,
          commentaire: m.commentaire,
          utilisateur: m.utilisateur,
          workOrder: m.workOrder,
        }));
        return { ...item, movements };
      }
    } catch (err: any) {
      set({ error: err.message });
    }
    return null;
  },

  fetchMovements: async () => {
    try {
      const res = await fetch(`${API_URL}/stock/movements?limit=100`, {
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        const raw = Array.isArray(json.data) ? json.data : (json.data?.items ?? []);
        return raw.map((m: any) => ({
          id: m.id,
          type: m.type,
          quantite: Number(m.quantite),
          date: m.date,
          commentaire: m.commentaire,
          utilisateur: m.utilisateur,
          workOrder: m.workOrder,
          stockItem: m.stockItem,
        }));
      }
    } catch (err: any) {
      set({ error: err.message });
    }
    return [];
  },

  deleteItem: async (id) => {
    try {
      const res = await fetch(`${API_URL}/stock/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        set({ stockItems: get().stockItems.filter((i) => i.id !== id) });
        return true;
      } else {
        set({ error: json.error });
      }
    } catch (err: any) {
      set({ error: err.message });
    }
    return false;
  },
}));
