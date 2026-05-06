import type { WorkOrder, WorkOrderStatus, WorkOrderType, Priority, EquipmentStatus, EquipmentType, Criticality } from '@/types';

/* ── WorkOrder ── */

export const mapWorkOrderStatus = (s: string): WorkOrderStatus => {
  switch (s) {
    case 'CREE': return 'draft';
    case 'PLANIFIE': return 'planned';
    case 'EN_COURS': return 'in_progress';
    case 'TERMINE': return 'completed';
    case 'CLOTURE': return 'closed';
    case 'ANNULE': return 'cancelled';
    default: return 'draft';
  }
};

export const mapPriority = (p: string): Priority => {
  switch (p) {
    case 'URGENTE': return 'P1';
    case 'HAUTE': return 'P2';
    case 'MOYENNE': return 'P3';
    case 'BASSE': return 'P4';
    default: return 'P3';
  }
};

export const mapWorkOrderType = (t: string): WorkOrderType => {
  switch (t) {
    case 'CORRECTIF': return 'corrective';
    case 'PREVENTIF': return 'preventive';
    case 'PREDICTIF': return 'predictive';
    case 'AMELIORATION': return 'improvement';
    case 'SECURITE': return 'safety';
    default: return 'corrective';
  }
};

export const mapBackendWO = (wo: any): WorkOrder => ({
  id: wo.id,
  number: wo.numero,
  title: wo.title,
  description: wo.description ?? '',
  type: mapWorkOrderType(wo.type),
  status: mapWorkOrderStatus(wo.status),
  priority: mapPriority(wo.priority),
  equipmentId: wo.equipmentId,
  equipmentName: wo.equipment?.name ?? '',
  requestedBy: wo.demandeur ? `${wo.demandeur.firstName} ${wo.demandeur.lastName}` : '',
  assignedTo: wo.technicien ? `${wo.technicien.firstName} ${wo.technicien.lastName}` : undefined,
  createdAt: wo.dateCreation,
  plannedStart: wo.datePlanifiee ?? undefined,
  actualStart: wo.dateDebut ?? undefined,
  actualEnd: wo.dateFin ?? undefined,
  duration: wo.dureeMinutes ? wo.dureeMinutes / 60 : undefined,
  cost: wo.coutMainOeuvre ? Number(wo.coutMainOeuvre) : undefined,
  partsUsed: wo.piecesConsommees ?? undefined,
});

/* ── Equipment ── */

export const mapEquipmentStatus = (s: string): EquipmentStatus => {
  switch (s) {
    case 'EN_SERVICE': return 'running';
    case 'EN_MAINTENANCE': return 'maintenance';
    case 'HORS_SERVICE': return 'stopped';
    case 'EN_PANNE': return 'breakdown';
    default: return 'running';
  }
};

export const mapEquipmentType = (t: string): EquipmentType => {
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

/* ── Preventive ── */

export const mapFrequency = (type: string, value: number): 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'biannual' | 'annual' => {
  if (type === 'jours') return value <= 1 ? 'daily' : value <= 7 ? 'weekly' : 'monthly';
  if (type === 'semaines') return 'weekly';
  if (type === 'mois') return 'monthly';
  if (type === 'annees') return 'annual';
  if (type === 'compteur') return 'quarterly';
  return 'monthly';
};

export const isOverdue = (nextExecution: string | null): boolean => {
  if (!nextExecution) return false;
  return new Date(nextExecution) < new Date();
};

export const parseChecklist = (checklist: string | null): string[] => {
  if (!checklist) return [];
  try {
    const parsed = JSON.parse(checklist);
    if (Array.isArray(parsed)) return parsed.map((item: any) => item.description ?? item.label ?? String(item));
  } catch { /* ignore */ }
  return [];
};
