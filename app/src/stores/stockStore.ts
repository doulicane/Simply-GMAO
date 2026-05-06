import { create } from 'zustand';
import { useAuthStore } from './authStore';
import { isMockMode } from './mockMode';
import { useDataStore } from './dataStore';
import type { StockItem } from '@/types';

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

interface StockState {
  stockItems: StockItem[];
  loading: boolean;
  error: string | null;
  fetchItems: (filters?: Record<string, string>) => Promise<void>;
}

export const useStockStore = create<StockState>((set) => ({
  stockItems: isMockMode() ? useDataStore.getState().stockItems : [],
  loading: false,
  error: null,

  fetchItems: async (filters = {}) => {
    if (isMockMode()) {
      set({ loading: true, error: null });
      await new Promise((r) => setTimeout(r, 200));
      let items = [...useDataStore.getState().stockItems];
      if (filters.status) {
        items = items.filter((i) => i.status === filters.status);
      }
      if (filters.category) {
        items = items.filter((i) => i.category === filters.category);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        items = items.filter((i) =>
          i.name.toLowerCase().includes(q) || i.code.toLowerCase().includes(q)
        );
      }
      set({ stockItems: items, loading: false });
      return;
    }

    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams({ ...filters, limit: '100' });
      const res = await fetch(`${API_URL}/stock?${params}`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        const items = (json.data.items ?? []).map(mapBackendStock);
        set({ stockItems: items, loading: false });
      } else {
        set({ error: json.error, loading: false });
      }
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
}));
