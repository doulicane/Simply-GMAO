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

export const SUB_ASSEMBLIES: SubAssembly[] = [];
