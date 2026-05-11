import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/api';

export interface Document {
  id: string;
  equipmentId: string;
  filename: string;
  originalName: string;
  type: string;
  path: string;
  uploadedBy: string;
  uploadedAt: string;
  uploader?: { id: string; firstName: string; lastName: string };
}

export function useDocuments(equipmentId?: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['documents', equipmentId, page, limit],
    queryFn: async () => {
      if (!equipmentId) return { data: [], pagination: null };
      const res = await fetchAPI(`/documents?equipmentId=${equipmentId}&page=${page}&limit=${limit}`);
      return res;
    },
    enabled: !!equipmentId,
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, equipmentId }: { id: string; equipmentId: string }) => {
      await fetchAPI(`/documents/${id}`, { method: 'DELETE' });
      return equipmentId;
    },
    onSuccess: (equipmentId) => {
      qc.invalidateQueries({ queryKey: ['documents', equipmentId] });
    },
  });
}

export function useUploadDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, equipmentId, type = 'document' }: { file: File; equipmentId: string; type?: string }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('equipmentId', equipmentId);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: formData,
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Upload échoué');
      return json.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['documents', variables.equipmentId] });
    },
  });
}
