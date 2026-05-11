import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPut } from '@/lib/api';

export interface UserPreferences {
  id?: string;
  dashboardLayout?: Record<string, unknown>;
  theme?: 'light' | 'dark' | 'system';
  language?: string;
}

export function usePreferences() {
  return useQuery({
    queryKey: ['preferences'],
    queryFn: async () => {
      const res = await apiGet('/preferences');
      const json = await res.json();
      return json.data as UserPreferences | null;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdatePreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<UserPreferences>) => {
      const res = await apiPut('/preferences', data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['preferences'] });
    },
  });
}
