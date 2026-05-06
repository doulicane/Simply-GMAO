import type { Equipment, EquipmentStatus, Criticality, WorkOrder, PreventivePlan } from '@/types';

export type TreeNodeType = 'site' | 'zone' | 'line' | 'machine' | 'subAssembly';

export interface SubAssembly {
  id: string;
  name: string;
  criticality: Criticality;
  cost?: number;
  equipmentId: string;
}

export interface TreeNode {
  id: string;
  name: string;
  type: TreeNodeType;
  status?: EquipmentStatus;
  criticality?: Criticality;
  equipment?: Equipment;
  children: TreeNode[];
  expanded?: boolean;
  parentId?: string;
}

export type ViewMode = 'tree' | 'grid' | 'list';

export type LevelFilter = 'all' | 'site' | 'zone' | 'line' | 'machine' | 'subAssembly';
export type CriticalityFilter = 'all' | 'critique' | 'elevee' | 'moyenne' | 'faible';
export type StatusFilter = 'all' | 'running' | 'stopped' | 'maintenance' | 'breakdown' | 'standby';

export interface EquipmentFilters {
  search: string;
  level: LevelFilter;
  zone: string;
  criticality: CriticalityFilter;
  status: StatusFilter;
}

export interface EquipmentDetailData {
  equipment: Equipment;
  workOrders: WorkOrder[];
  preventivePlans: PreventivePlan[];
  subAssemblies: SubAssembly[];
}

export const ZONES = [
  'Zone A — Production',
  'Zone B — Finition',
  'Zone C — Utilités',
  'Zone D — Stockage & Expédition',
  'Autre',
];

export const CRITICALITY_LABELS: Record<Criticality, string> = {
  critique: 'Critique',
  elevee: 'Élevée',
  moyenne: 'Moyenne',
  faible: 'Faible',
};

export const STATUS_LABELS: Record<EquipmentStatus, string> = {
  running: 'En service',
  stopped: 'Arrêté',
  maintenance: 'Maintenance',
  breakdown: 'En panne',
  standby: 'En attente',
};

export const STATUS_VARIANTS: Record<EquipmentStatus, 'ok' | 'warning' | 'critical' | 'info' | 'neutral'> = {
  running: 'ok',
  stopped: 'neutral',
  maintenance: 'warning',
  breakdown: 'critical',
  standby: 'info',
};

export const SUB_ASSEMBLIES: SubAssembly[] = [
  { id: 'SA-001', name: 'Vérin principal', criticality: 'critique', cost: 4200, equipmentId: 'EQ-001' },
  { id: 'SA-002', name: 'Pompe hydraulique', criticality: 'critique', cost: 1850, equipmentId: 'EQ-001' },
  { id: 'SA-003', name: 'Matrice #45 (15K€)', criticality: 'critique', cost: 15000, equipmentId: 'EQ-002' },
  { id: 'SA-004', name: 'Vérin principal', criticality: 'critique', cost: 3800, equipmentId: 'EQ-003' },
  { id: 'SA-005', name: 'Buses de laquage', criticality: 'elevee', cost: 1200, equipmentId: 'EQ-005' },
  { id: 'SA-006', name: 'Pompe à vide', criticality: 'critique', cost: 3200, equipmentId: 'EQ-005' },
  { id: 'SA-007', name: 'Lampe UV 8kW', criticality: 'critique', cost: 1250, equipmentId: 'EQ-006' },
  { id: 'SA-008', name: 'Capteur fin de course', criticality: 'elevee', cost: 89, equipmentId: 'EQ-008' },
  { id: 'SA-009', name: 'Thermocouple zone 3', criticality: 'critique', cost: 75, equipmentId: 'EQ-010' },
  { id: 'SA-010', name: 'Filtre cartouche', criticality: 'critique', cost: 145, equipmentId: 'EQ-013' },
  { id: 'SA-011', name: 'Moteur principal', criticality: 'elevee', cost: 2400, equipmentId: 'EQ-015' },
  { id: 'SA-012', name: 'Courroie synchrone', criticality: 'moyenne', cost: 45, equipmentId: 'EQ-015' },
];
