import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/api';
import type { StockItem } from '@/types';

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

interface BackendStockItem {
  id: string;
  code: string;
  name: string;
  famille?: string;
  sousFamille?: string;
  designation?: string;
  quantite?: number;
  stockMinimum?: number;
  stockMaximum?: number;
  unite?: string;
  localisation?: string;
  prixUnitaire?: number;
  fournisseur?: string;
}

const mapBackendStock = (item: BackendStockItem): StockItem => ({
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

/* ------------------------------------------------------------------ */
//  Hooks
/* ------------------------------------------------------------------ */

export function useStockItems(filters?: Record<string, string>) {
  const params = new URLSearchParams({ ...filters, limit: '100' });
  return useQuery({
    queryKey: ['stockItems', filters],
    queryFn: async () => {
      const json = await fetchAPI(`/stock?${params}`);
      const rawItems = Array.isArray(json.data) ? json.data : (json.data?.items ?? []);
      return rawItems.map(mapBackendStock) as StockItem[];
    },
  });
}

export function useStockItem(id: string) {
  return useQuery({
    queryKey: ['stockItem', id],
    queryFn: async () => {
      const json = await fetchAPI(`/stock/${id}`);
      const item = mapBackendStock(json.data);
      interface BackendMovement {
        id: string;
        type: StockMovement['type'];
        quantite: number;
        date: string;
        commentaire?: string;
        utilisateur?: { id: string; firstName: string; lastName: string };
        workOrder?: { id: string; numero: string };
      }
      const movements: StockMovement[] = (json.data.stockMovements ?? []).map((m: BackendMovement) => ({
        id: m.id,
        type: m.type,
        quantite: Number(m.quantite),
        date: m.date,
        commentaire: m.commentaire,
        utilisateur: m.utilisateur,
        workOrder: m.workOrder,
      }));
      return { ...item, movements } as StockItemDetail;
    },
    enabled: !!id,
  });
}

export function useCreateStockItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const json = await fetchAPI('/stock', { method: 'POST', body: JSON.stringify(data) });
      return mapBackendStock(json.data) as StockItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockItems'] });
    },
  });
}

export function useUpdateStockItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const json = await fetchAPI(`/stock/${id}`, { method: 'PUT', body: JSON.stringify(data) });
      return mapBackendStock(json.data) as StockItem;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['stockItems'] });
      queryClient.invalidateQueries({ queryKey: ['stockItem', id] });
    },
  });
}

export function useDeleteStockItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await fetchAPI(`/stock/${id}`, { method: 'DELETE' });
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockItems'] });
    },
  });
}

export function useCreateStockMovement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const json = await fetchAPI('/stock/movements', { method: 'POST', body: JSON.stringify(data) });
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockItems'] });
      queryClient.invalidateQueries({ queryKey: ['stockItem'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useStockMovements() {
  return useQuery({
    queryKey: ['stockMovements'],
    queryFn: async () => {
      const json = await fetchAPI('/stock/movements?limit=100');
      const raw = Array.isArray(json.data) ? json.data : (json.data?.items ?? []);
      return raw.map((m: BackendMovement) => ({
        id: m.id,
        type: m.type,
        quantite: Number(m.quantite),
        date: m.date,
        commentaire: m.commentaire,
        utilisateur: m.utilisateur,
        workOrder: m.workOrder,
        stockItem: m.stockItem,
      })) as StockMovement[];
    },
  });
}
