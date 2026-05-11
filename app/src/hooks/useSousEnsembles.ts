import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/api';

export interface SousEnsemble {
  id: string;
  equipmentId: string;
  code: string;
  name: string;
  description?: string;
  statut: string;
  dateAchat?: string;
  dateMiseService?: string;
  active: boolean;
  createdAt: string;
  deletedAt?: string | null;
}

export function useSousEnsembles(equipmentId?: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['sous-ensembles', equipmentId, page, limit],
    queryFn: async () => {
      if (!equipmentId) return { data: [], pagination: null };
      const res = await fetchAPI(`/sous-ensembles/equipment/${equipmentId}?page=${page}&limit=${limit}`);
      return res;
    },
    enabled: !!equipmentId,
  });
}

export function useCreateSousEnsemble() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<SousEnsemble, 'id' | 'createdAt' | 'deletedAt'>) => {
      const res = await fetchAPI('/sous-ensembles', { method: 'POST', body: JSON.stringify(data) });
      return res.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['sous-ensembles', variables.equipmentId] });
    },
  });
}

export function useUpdateSousEnsemble() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<SousEnsemble> & { id: string }) => {
      const res = await fetchAPI(`/sous-ensembles/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
      return res.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['sous-ensembles'] });
      qc.invalidateQueries({ queryKey: ['sous-ensembles', variables.equipmentId] });
    },
  });
}

export function useDeleteSousEnsemble() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, equipmentId }: { id: string; equipmentId: string }) => {
      await fetchAPI(`/sous-ensembles/${id}`, { method: 'DELETE' });
      return equipmentId;
    },
    onSuccess: (equipmentId) => {
      qc.invalidateQueries({ queryKey: ['sous-ensembles', equipmentId] });
    },
  });
}
