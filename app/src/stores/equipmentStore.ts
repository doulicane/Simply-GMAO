import { create } from 'zustand';
import { useAuthStore } from './authStore';
import { isMockMode } from './mockMode';
import { useDataStore } from './dataStore';
import type { Equipment, EquipmentStatus, EquipmentType, Criticality } from '@/types';

const API_URL = 'http://localhost:3001/api';

function getHeaders(): Record<string, string> {
  const user = useAuthStore.getState().user;
  const token = useAuthStore.getState().accessToken;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    'x-demo-role': user?.role ?? '',
  };
}

/* ------------------------------------------------------------------ */
//  Mapping helpers
/* ------------------------------------------------------------------ */

const mapStatus = (s: string): EquipmentStatus => {
  switch (s) {
    case 'EN_SERVICE': return 'running';
    case 'EN_MAINTENANCE': return 'maintenance';
    case 'HORS_SERVICE': return 'stopped';
    case 'EN_PANNE': return 'breakdown';
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
//  Store
/* ------------------------------------------------------------------ */

interface EquipmentState {
  equipment: Equipment[];
  loading: boolean;
  error: string | null;
  fetchEquipment: (filters?: Record<string, string>) => Promise<void>;
}

export const useEquipmentStore = create<EquipmentState>((set) => ({
  equipment: isMockMode() ? useDataStore.getState().equipment : [],
  loading: false,
  error: null,

  fetchEquipment: async (filters = {}) => {
    if (isMockMode()) {
      set({ loading: true, error: null });
      // Simulate network delay for realism
      await new Promise((r) => setTimeout(r, 200));
      let items = useDataStore.getState().equipment;
      if (filters.status) {
        items = items.filter((e) => e.status === filters.status);
      }
      if (filters.type) {
        items = items.filter((e) => e.type === filters.type);
      }
      if (filters.criticality) {
        items = items.filter((e) => e.criticality === filters.criticality);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        items = items.filter((e) =>
          e.name.toLowerCase().includes(q) || e.code.toLowerCase().includes(q)
        );
      }
      set({ equipment: items, loading: false });
      return;
    }

    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams({ ...filters, limit: '100' });
      const res = await fetch(`${API_URL}/equipments?${params}`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        const rawItems = Array.isArray(json.data) ? json.data : (json.data.items ?? []);
        const items = rawItems.map(mapBackendEquipment);
        set({ equipment: items, loading: false });
      } else {
        set({ error: json.error, loading: false });
      }
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
}));
