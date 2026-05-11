/**
 * =============================================================================
 * useChecklists — Hooks TanStack Query pour Checklist Templates
 * =============================================================================
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { toast } from 'sonner';

export interface ChecklistItem {
  label: string;
  type: 'checkbox' | 'text' | 'number' | 'select';
  required?: boolean;
  options?: string[];
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  description?: string;
  category?: string;
  items: ChecklistItem[];
  active: boolean;
  createdAt: string;
}

export function useChecklistTemplates(category?: string) {
  return useQuery<ChecklistTemplate[]>({
    queryKey: ['checklist-templates', category],
    queryFn: async () => {
      const params = category ? `?category=${encodeURIComponent(category)}` : '';
      const res = await apiGet(`/checklist-templates${params}`);
      return res.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateChecklist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ChecklistTemplate>) => apiPost('/checklist-templates', data),
    onSuccess: () => {
      toast.success('Checklist creee');
      qc.invalidateQueries({ queryKey: ['checklist-templates'] });
    },
    onError: (err: any) => toast.error(err.message || 'Erreur'),
  });
}

export function useDuplicateChecklist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiPost(`/checklist-templates/${id}/duplicate`, {}),
    onSuccess: () => {
      toast.success('Checklist dupliquee');
      qc.invalidateQueries({ queryKey: ['checklist-templates'] });
    },
    onError: (err: any) => toast.error(err.message || 'Erreur'),
  });
}
