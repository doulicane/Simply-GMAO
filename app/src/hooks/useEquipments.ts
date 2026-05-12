import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/api';
import type { Equipment, EquipmentStatus, EquipmentType, Criticality } from '@/types';

const mapStatus = (s: string): EquipmentStatus => {
  switch (s) {
    case 'EN_SERVICE': return 'running';
    case 'EN_ARRET': return 'stopped';
    case 'EN_MAINTENANCE': return 'maintenance';
    case 'HORS_SERVICE': return 'stopped';
    default: return 'running';
  }
};

const mapType = (t: string): EquipmentType => {
  const map: Record<string, EquipmentType> = {
    presse: 'presse',
    laquage: 'laquage',
    serigraphie: 'serigraphie',
    recuit: 'recuit',
    compresseur: 'compresseur',
    depoussiereur: 'depoussiereur',
    emballage: 'emballage',
    four: 'four',
    decoupe: 'decoupe',
    convoyeur: 'convoyeur',
    ventilation: 'ventilation',
    ecluse: 'ecluse',
    electricite: 'electricite',
    manutention: 'manutention',
    traitementeau: 'traitementEau',
    metrologie: 'metrologie',
    controlequalite: 'controleQualite',
  };
  return map[t.toLowerCase().replace(/\s/g, '')] ?? 'autre';
};

const mapCriticality = (c: string): Criticality => {
  switch (c) {
    case 'CRITIQUE': return 'critique';
    case 'ELEVEE': return 'elevee';
    case 'MOYENNE': return 'moyenne';
    case 'FAIBLE': return 'faible';
    default: return 'moyenne';
  }
};

const mapBackendEquipment = (eq: any): Equipment => ({
  id: eq.id,
  code: eq.code,
  name: eq.name,
  type: mapType(eq.type),
  status: mapStatus(eq.statut),
  criticality: mapCriticality(eq.criticality),
  line: eq.ligne?.name ?? '',
  location: eq.ligne?.zone?.name ?? eq.localisation ?? '',
  manufacturer: eq.constructeur ?? undefined,
  model: undefined,
  serialNumber: eq.numSerie ?? undefined,
  commissioningDate: eq.dateMiseService ? eq.dateMiseService.slice(0, 10) : undefined,
  lastMaintenanceDate: undefined,
  nextMaintenanceDate: undefined,
  mttr: undefined,
  mtbf: undefined,
  availability: undefined,
  qrCode: eq.qrCode ?? undefined,
  notes: undefined,
});

/* ------------------------------------------------------------------ */
//  Hooks
/* ------------------------------------------------------------------ */

export function useEquipments(filters?: Record<string, string>) {
  const params = new URLSearchParams({ ...filters, limit: '100' });
  return useQuery({
    queryKey: ['equipments', filters],
    queryFn: async () => {
      const json = await fetchAPI(`/equipments?${params}`);
      const rawItems = Array.isArray(json.data) ? json.data : (json.data?.items ?? []);
      return rawItems.map(mapBackendEquipment) as Equipment[];
    },
  });
}

export function useEquipment(id: string) {
  return useQuery({
    queryKey: ['equipment', id],
    queryFn: async () => {
      const json = await fetchAPI(`/equipments/${id}`);
      return mapBackendEquipment(json.data) as Equipment;
    },
    enabled: !!id,
  });
}

export function useCreateEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const json = await fetchAPI('/equipments', { method: 'POST', body: JSON.stringify(data) });
      return mapBackendEquipment(json.data) as Equipment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipments'] });
    },
  });
}

export function useUpdateEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const json = await fetchAPI(`/equipments/${id}`, { method: 'PUT', body: JSON.stringify(data) });
      return mapBackendEquipment(json.data) as Equipment;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['equipments'] });
      queryClient.invalidateQueries({ queryKey: ['equipment', id] });
    },
  });
}

export function useDeleteEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await fetchAPI(`/equipments/${id}`, { method: 'DELETE' });
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipments'] });
    },
  });
}
