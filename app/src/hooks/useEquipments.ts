import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/api';
import { cacheEquipments, db } from '@/lib/db';
import { useOfflineMutation } from './useOfflineMutation';
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

interface BackendEquipment {
  id: string;
  code: string;
  name: string;
  type: string;
  statut: string;
  criticality: string;
  ligne?: { id: string; name: string; zone?: { name: string } };
  localisation?: string;
  constructeur?: string;
  model?: string;
  capacite?: string;
  alimentation?: string;
  dimensions?: string;
  poids?: string;
  coutArretHeure?: number | string;
  numSerie?: string;
  dateMiseService?: string;
  dateDerniereInspectionAtex?: string;
  dateProchaineInspectionAtex?: string;
  isAtex?: boolean;
  contactAlimentaire?: boolean;
  compteurActuel?: number | string;
  compteurUnite?: string;
  qrCode?: string;
}

const mapBackendEquipment = (eq: BackendEquipment): Equipment => ({
  id: eq.id,
  code: eq.code,
  name: eq.name,
  type: mapType(eq.type),
  status: mapStatus(eq.statut),
  criticality: mapCriticality(eq.criticality),
  line: eq.ligne?.name ?? '',
  location: eq.ligne?.zone?.name ?? eq.localisation ?? '',
  ligneId: eq.ligne?.id,
  manufacturer: eq.constructeur ?? undefined,
  model: eq.model ?? undefined,
  serialNumber: eq.numSerie ?? undefined,
  commissioningDate: eq.dateMiseService ? eq.dateMiseService.slice(0, 10) : undefined,
  lastMaintenanceDate: undefined,
  nextMaintenanceDate: undefined,
  mttr: undefined,
  mtbf: undefined,
  availability: undefined,
  qrCode: eq.qrCode ?? undefined,
  notes: undefined,
  isAtex: eq.isAtex ?? false,
  contactAlimentaire: eq.contactAlimentaire ?? false,
  dateDerniereInspectionAtex: eq.dateDerniereInspectionAtex ? eq.dateDerniereInspectionAtex.slice(0, 10) : undefined,
  dateProchaineInspectionAtex: eq.dateProchaineInspectionAtex ? eq.dateProchaineInspectionAtex.slice(0, 10) : undefined,
  counterValue: eq.compteurActuel !== undefined ? Number(eq.compteurActuel) : undefined,
  counterUnit: eq.compteurUnite ?? undefined,
  capacite: eq.capacite ?? undefined,
  alimentation: eq.alimentation ?? undefined,
  dimensions: eq.dimensions ?? undefined,
  poids: eq.poids ?? undefined,
  coutArretHeure: eq.coutArretHeure !== undefined ? Number(eq.coutArretHeure) : undefined,
});

/* ------------------------------------------------------------------ */
//  Hooks
/* ------------------------------------------------------------------ */

export function useEquipments(filters?: Record<string, string>, enabled = true) {
  const params = new URLSearchParams({ ...filters, limit: '100' });
  return useQuery({
    queryKey: ['equipments', filters],
    enabled,
    queryFn: async () => {
      if (!navigator.onLine) {
        const cached = await db.equipments.toArray();
        if (cached.length > 0) return cached.map(mapBackendEquipment) as Equipment[];
      }
      const json = await fetchAPI(`/equipments?${params}`);
      const rawItems = Array.isArray(json.data) ? json.data : (json.data?.items ?? []);
      const mapped = rawItems.map(mapBackendEquipment) as Equipment[];
      await cacheEquipments(rawItems);
      return mapped;
    },
  });
}

export function useEquipment(id: string) {
  return useQuery({
    queryKey: ['equipment', id],
    queryFn: async () => {
      if (!navigator.onLine) {
        const cached = await db.equipments.get(id);
        if (cached) return mapBackendEquipment(cached) as Equipment;
      }
      const json = await fetchAPI(`/equipments/${id}`);
      return mapBackendEquipment(json.data) as Equipment;
    },
    enabled: !!id,
  });
}

export function useCreateEquipment() {
  const queryClient = useQueryClient();
  return useOfflineMutation(
    { endpoint: '/equipments', method: 'POST', entityType: 'equipment' },
    {
      mutationFn: async (data: Record<string, unknown>) => {
        const json = await fetchAPI('/equipments', { method: 'POST', body: JSON.stringify(data) });
        return mapBackendEquipment(json.data) as Equipment;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['equipments'] });
      },
    }
  );
}

export function useUpdateEquipment() {
  const queryClient = useQueryClient();
  return useOfflineMutation(
    { endpoint: '/equipments/{id}', method: 'PUT', entityType: 'equipment' },
    {
      mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
        const json = await fetchAPI(`/equipments/${id}`, { method: 'PUT', body: JSON.stringify(data) });
        return mapBackendEquipment(json.data) as Equipment;
      },
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: ['equipments'] });
        queryClient.invalidateQueries({ queryKey: ['equipment', id] });
      },
    }
  );
}

export function useDeleteEquipment() {
  const queryClient = useQueryClient();
  return useOfflineMutation(
    { endpoint: '/equipments/{id}', method: 'DELETE', entityType: 'equipment' },
    {
      mutationFn: async (id: string) => {
        await fetchAPI(`/equipments/${id}`, { method: 'DELETE' });
        return id;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['equipments'] });
      },
    }
  );
}
