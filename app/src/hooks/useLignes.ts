import { useQuery } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/api';

export interface Ligne {
  id: string;
  name: string;
  code?: string;
  zone?: {
    id: string;
    name: string;
    site?: { id: string; name: string };
  };
}

export function useLignes() {
  return useQuery({
    queryKey: ['lignes'],
    queryFn: async () => {
      const json = await fetchAPI('/lignes');
      return (json.data ?? []) as Ligne[];
    },
  });
}
