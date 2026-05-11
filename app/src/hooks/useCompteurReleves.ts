import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/api';

export interface CompteurReleve {
  id: string;
  equipmentId: string;
  valeur: number;
  dateReleve: string;
  utilisateurId: string;
  commentaire?: string;
  utilisateur?: { id: string; firstName: string; lastName: string };
}

export function useCompteurReleves(equipmentId?: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['compteur-releves', equipmentId, page, limit],
    queryFn: async () => {
      if (!equipmentId) return { data: [], pagination: null };
      const res = await fetchAPI(`/compteur-releves/equipment/${equipmentId}?page=${page}&limit=${limit}`);
      return res;
    },
    enabled: !!equipmentId,
  });
}

export function useCreateCompteurReleve() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { equipmentId: string; valeur: number; dateReleve?: string; commentaire?: string }) => {
      const res = await fetchAPI('/compteur-releves', { method: 'POST', body: JSON.stringify(data) });
      return res.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['compteur-releves', variables.equipmentId] });
      qc.invalidateQueries({ queryKey: ['equipment', variables.equipmentId] });
    },
  });
}

export function useDeleteCompteurReleve() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, equipmentId }: { id: string; equipmentId: string }) => {
      await fetchAPI(`/compteur-releves/${id}`, { method: 'DELETE' });
      return equipmentId;
    },
    onSuccess: (equipmentId) => {
      qc.invalidateQueries({ queryKey: ['compteur-releves', equipmentId] });
      qc.invalidateQueries({ queryKey: ['equipment', equipmentId] });
    },
  });
}
