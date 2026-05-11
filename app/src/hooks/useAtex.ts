/**
 * =============================================================================
 * useAtex — Hooks TanStack Query pour ATEX & Contact Alimentaire
 * =============================================================================
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPatch, apiPost } from '@/lib/api';
import { toast } from 'sonner';

export interface AtexData {
  consignationEffectuee: boolean;
  permisDeFeu: boolean;
  outillageEx: boolean;
  nettoyageRealise: boolean;
  depressionRealise: boolean;
  inspecteurAtexId?: string;
  inspecteurAtexSigneAt?: string;
  commentaireAtex?: string;
}

export interface ContactAlimData {
  nettoyageRealise: boolean;
  produitsUtilises?: string;
  rincageRealise: boolean;
  commentaire?: string;
}

export function useAtexBlock(workOrderId: string) {
  return useQuery<AtexData>({
    queryKey: ['work-order', workOrderId, 'atex'],
    queryFn: async () => {
      const res = await apiGet(`/work-orders/${workOrderId}/atex`);
      return res.data;
    },
    enabled: !!workOrderId,
  });
}

export function useUpdateAtex() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AtexData> }) =>
      apiPatch(`/work-orders/${id}/atex`, data),
    onSuccess: (_res, { id }) => {
      qc.invalidateQueries({ queryKey: ['work-order', id, 'atex'] });
    },
    onError: (err: any) => toast.error(err.message || 'Erreur ATEX'),
  });
}

export function useSignAtex() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      apiPost(`/work-orders/${id}/atex/sign`, { password }),
    onSuccess: (_res, { id }) => {
      toast.success('Signe ATEX valide');
      qc.invalidateQueries({ queryKey: ['work-order', id, 'atex'] });
    },
    onError: (err: any) => toast.error(err.message || 'Signature invalide'),
  });
}

export function useContactAlimBlock(workOrderId: string) {
  return useQuery<ContactAlimData>({
    queryKey: ['work-order', workOrderId, 'contact-alimentaire'],
    queryFn: async () => {
      const res = await apiGet(`/work-orders/${workOrderId}/contact-alimentaire`);
      return res.data;
    },
    enabled: !!workOrderId,
  });
}

export function useUpdateContactAlim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ContactAlimData> }) =>
      apiPatch(`/work-orders/${id}/contact-alimentaire`, data),
    onSuccess: (_res, { id }) => {
      qc.invalidateQueries({ queryKey: ['work-order', id, 'contact-alimentaire'] });
    },
    onError: (err: any) => toast.error(err.message || 'Erreur contact alimentaire'),
  });
}
