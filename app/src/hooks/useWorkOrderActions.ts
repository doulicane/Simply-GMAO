/**
 * =============================================================================
 * useWorkOrderActions — Hooks TanStack Query pour actions BT
 * =============================================================================
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPost } from '@/lib/api';
import { toast } from 'sonner';

export function useStartWorkOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiPost(`/work-orders/${id}/start`, {}),
    onSuccess: (_res, id) => {
      toast.success('Intervention demarree');
      qc.invalidateQueries({ queryKey: ['work-orders'] });
      qc.invalidateQueries({ queryKey: ['work-order', id] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Erreur au demarrage');
    },
  });
}

export function useCompleteWorkOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiPost(`/work-orders/${id}/complete`, data),
    onSuccess: (_res, { id }) => {
      toast.success('Intervention terminee');
      qc.invalidateQueries({ queryKey: ['work-orders'] });
      qc.invalidateQueries({ queryKey: ['work-order', id] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Erreur a la cloture');
    },
  });
}

export function useValidateWorkOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiPost(`/work-orders/${id}/validate`, {}),
    onSuccess: (_res, id) => {
      toast.success('Bon de travail valide et cloture');
      qc.invalidateQueries({ queryKey: ['work-orders'] });
      qc.invalidateQueries({ queryKey: ['work-order', id] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Erreur de validation');
    },
  });
}

export function useReopenWorkOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      apiPost(`/work-orders/${id}/reopen`, { reason }),
    onSuccess: (_res, { id }) => {
      toast.success('Bon de travail rouvert');
      qc.invalidateQueries({ queryKey: ['work-orders'] });
      qc.invalidateQueries({ queryKey: ['work-order', id] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Erreur lors de la reouverture');
    },
  });
}

export function useAddPhotosToWorkOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, urls }: { id: string; urls: string[] }) =>
      apiPost(`/work-orders/${id}/photos`, { urls }),
    onSuccess: (_res, { id }) => {
      toast.success('Photos ajoutees');
      qc.invalidateQueries({ queryKey: ['work-order', id] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Erreur ajout photos');
    },
  });
}

export function useConsumeParts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiPost(`/work-orders/${id}/consume-parts`, data),
    onSuccess: (_res, { id }) => {
      toast.success('Pieces consommees');
      qc.invalidateQueries({ queryKey: ['work-order', id] });
      qc.invalidateQueries({ queryKey: ['stock-items'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Erreur consommation pieces');
    },
  });
}
