import { create } from 'zustand';
import type { Equipment, EquipmentStatus, EquipmentType, Criticality } from '@/types';

import { API_URL } from '@/lib/config';
import { getAuthHeaders } from '@/lib/api';

/* ------------------------------------------------------------------ */
//  Mapping helpers
/* ------------------------------------------------------------------ */

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
//  Store
/* ------------------------------------------------------------------ */

interface EquipmentState {
  equipment: Equipment[];
  loading: boolean;
  error: string | null;
  fetchEquipment: (filters?: Record<string, string>) => Promise<void>;
  createEquipment: (data: Record<string, any>) => Promise<Equipment | null>;
  updateEquipment: (id: string, data: Record<string, any>) => Promise<Equipment | null>;
  deleteEquipment: (id: string) => Promise<boolean>;
}

export const useEquipmentStore = create<EquipmentState>((set, get) => ({
  equipment: [],
  loading: false,
  error: null,

  fetchEquipment: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams({ ...filters, limit: '100' });
      const res = await fetch(`${API_URL}/equipments?${params}`, {
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        const rawItems = Array.isArray(json.data) ? json.data : (json.data?.items ?? []);
        const items = rawItems.map(mapBackendEquipment);
        set({ equipment: items, loading: false });
      } else {
        set({ error: json.error, loading: false });
      }
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createEquipment: async (data) => {
    try {
      const res = await fetch(`${API_URL}/equipments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        const eq = mapBackendEquipment(json.data);
        set({ equipment: [eq, ...get().equipment] });
        return eq;
      } else {
        set({ error: json.error });
      }
    } catch (err: any) {
      set({ error: err.message });
    }
    return null;
  },

  updateEquipment: async (id, data) => {
    try {
      const res = await fetch(`${API_URL}/equipments/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        const updated = mapBackendEquipment(json.data);
        set({
          equipment: get().equipment.map((e) => (e.id === id ? updated : e)),
        });
        return updated;
      } else {
        set({ error: json.error });
      }
    } catch (err: any) {
      set({ error: err.message });
    }
    return null;
  },

  deleteEquipment: async (id) => {
    try {
      const res = await fetch(`${API_URL}/equipments/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        set({
          equipment: get().equipment.filter((e) => e.id !== id),
        });
        return true;
      } else {
        set({ error: json.error });
      }
    } catch (err: any) {
      set({ error: err.message });
    }
    return false;
  },
}));
