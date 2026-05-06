export type UserRole = 'responsable' | 'technicien' | 'operateur' | 'magasinier' | 'hse';

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  avatar?: string;
  email: string;
}

export type EquipmentStatus = 'running' | 'stopped' | 'maintenance' | 'breakdown' | 'standby';
export type EquipmentType = 'presse' | 'laquage' | 'serigraphie' | 'recuit' | 'compresseur' | 'depoussiereur' | 'emballage' | 'four' | 'decoupe' | 'convoyeur' | 'ventilation' | 'ecluse' | 'electricite' | 'manutention' | 'traitementEau' | 'metrologie' | 'controleQualite' | 'autre';
export type Criticality = 'critique' | 'elevee' | 'moyenne' | 'faible';

export interface Equipment {
  id: string;
  code: string;
  name: string;
  type: EquipmentType;
  status: EquipmentStatus;
  criticality: Criticality;
  line: string;
  location: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  commissioningDate?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  mttr?: number;
  mtbf?: number;
  availability?: number;
  qrCode?: string;
  notes?: string;
}

export type WorkOrderStatus = 'draft' | 'planned' | 'in_progress' | 'waiting_parts' | 'completed' | 'closed' | 'cancelled';
export type WorkOrderType = 'corrective' | 'preventive' | 'predictive' | 'improvement' | 'safety';
export type Priority = 'P1' | 'P2' | 'P3' | 'P4';

export interface WorkOrder {
  id: string;
  number: string;
  title: string;
  description: string;
  type: WorkOrderType;
  status: WorkOrderStatus;
  priority: Priority;
  equipmentId: string;
  equipmentName: string;
  requestedBy: string;
  assignedTo?: string;
  createdAt: string;
  plannedStart?: string;
  plannedEnd?: string;
  actualStart?: string;
  actualEnd?: string;
  duration?: number;
  partsUsed?: SparePartUsage[];
  checklist?: ChecklistItem[];
  notes?: string;
  cost?: number;
}

export interface SparePartUsage {
  partId: string;
  partName: string;
  quantity: number;
  unitCost: number;
}

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  required: boolean;
}

export type PreventivePlanFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'biannual' | 'annual';

export interface PreventivePlan {
  id: string;
  code: string;
  title: string;
  description: string;
  equipmentId: string;
  equipmentName: string;
  frequency: PreventivePlanFrequency;
  estimatedDuration: number;
  nextDueDate: string;
  lastDoneDate?: string;
  assignedTo?: string;
  status: 'active' | 'suspended' | 'overdue';
  checklist: string[];
  sparePartsNeeded?: string[];
}

export type StockStatus = 'ok' | 'low' | 'critical' | 'out_of_stock';

export interface StockItem {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  unit: string;
  location: string;
  status: StockStatus;
  unitCost: number;
  supplier?: string;
  lastRestockDate?: string;
  reorderPoint: number;
}

export interface AlertItem {
  id: string;
  type: 'breakdown' | 'overdue_pm' | 'low_stock' | 'safety' | 'info';
  title: string;
  description: string;
  equipmentId?: string;
  workOrderId?: string;
  stockItemId?: string;
  priority: Priority;
  createdAt: string;
  acknowledged: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface DashboardKPI {
  availability: number;
  availabilityTrend: number;
  mttr: number;
  mttrTrend: number;
  mtbf: number;
  mtbfTrend: number;
  openWorkOrders: number;
  urgentWorkOrders: number;
  highWorkOrders: number;
  mediumWorkOrders: number;
  lowWorkOrders: number;
  overdueWorkOrders: number;
}

export interface AvailabilityByLine {
  line: string;
  availability: number;
  target: number;
}
