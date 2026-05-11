import { create } from 'zustand';
import type { DashboardKPI, AlertItem, WorkOrder, PreventivePlan, AvailabilityByLine } from '@/types';

import { API_URL } from '@/lib/config';
import { getAuthHeaders } from '@/lib/api';

/* ------------------------------------------------------------------ */
//  Mapping helpers : backend → frontend types
/* ------------------------------------------------------------------ */

const mapWorkOrderStatus = (s: string): WorkOrder['status'] => {
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

const mapPriority = (p: string): WorkOrder['priority'] => {
  switch (p) {
    case 'URGENTE': return 'P1';
    case 'HAUTE': return 'P2';
    case 'MOYENNE': return 'P3';
    case 'BASSE': return 'P4';
    default: return 'P3';
  }
};

const mapWorkOrderType = (t: string): WorkOrder['type'] => {
  switch (t) {
    case 'CORRECTIF': return 'corrective';
    case 'PREVENTIF': return 'preventive';
    case 'PREDICTIF': return 'predictive';
    case 'AMELIORATION': return 'improvement';
    case 'SECURITE': return 'safety';
    default: return 'corrective';
  }
};

const mapBackendWO = (wo: any): WorkOrder => ({
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

const mapBackendPM = (p: any): PreventivePlan => ({
  id: p.id,
  code: `${p.frequencyType}-${p.frequencyValue}`,
  title: p.title,
  description: p.description ?? '',
  equipmentId: p.equipmentId,
  equipmentName: p.equipment?.name ?? '',
  frequency: mapFrequency(p.frequencyType, p.frequencyValue),
  estimatedDuration: p.frequencyValue,
  nextDueDate: p.nextExecution?.slice(0, 10),
  lastDoneDate: p.lastExecution?.slice(0, 10),
  assignedTo: '',
  status: p.active ? (isOverdue(p.nextExecution) ? 'overdue' : 'active') : 'suspended',
  checklist: parseChecklist(p.checklist),
  sparePartsNeeded: [],
});

function mapFrequency(type: string, value: number): PreventivePlan['frequency'] {
  if (type === 'jours') return value <= 1 ? 'daily' : value <= 7 ? 'weekly' : 'monthly';
  if (type === 'semaines') return 'weekly';
  if (type === 'mois') return 'monthly';
  if (type === 'annees') return 'annual';
  if (type === 'compteur') return 'quarterly';
  return 'monthly';
}

function isOverdue(nextExecution: string | null): boolean {
  if (!nextExecution) return false;
  return new Date(nextExecution) < new Date();
}

function parseChecklist(checklist: string | null): string[] {
  if (!checklist) return [];
  try {
    const parsed = JSON.parse(checklist);
    if (Array.isArray(parsed)) return parsed.map((item: any) => item.description ?? item.label ?? String(item));
  } catch { /* ignore */ }
  return [];
}

/* ------------------------------------------------------------------ */
//  Store
/* ------------------------------------------------------------------ */

interface DashboardState {
  kpi: DashboardKPI;
  alerts: AlertItem[];
  workOrders: WorkOrder[];
  preventivePlans: PreventivePlan[];
  availabilityByLine: AvailabilityByLine[];
  loading: boolean;
  error: string | null;
  fetchDashboard: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  kpi: {
    availability: 0,
    availabilityTrend: 0,
    mttr: 0,
    mttrTrend: 0,
    mtbf: 0,
    mtbfTrend: 0,
    openWorkOrders: 0,
    urgentWorkOrders: 0,
    highWorkOrders: 0,
    mediumWorkOrders: 0,
    lowWorkOrders: 0,
    overdueWorkOrders: 0,
  },
  alerts: [],
  workOrders: [],
  preventivePlans: [],
  availabilityByLine: [],
  loading: false,
  error: null,

  fetchDashboard: async () => {
    set({ loading: true, error: null });
    try {
      const [kpisRes, alertsRes, recentRes, upcomingRes] = await Promise.all([
        fetch(`${API_URL}/dashboard/kpis`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/dashboard/alerts`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/dashboard/recent-work-orders?limit=15`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/dashboard/upcoming-preventive?days=30`, { headers: getAuthHeaders() }),
      ]);

      const [kpisJson, alertsJson, recentJson, upcomingJson] = await Promise.all([
        kpisRes.json(),
        alertsRes.json(),
        recentRes.json(),
        upcomingRes.json(),
      ]);

      // ── Build KPIs from backend aggregation ──
      const kpiData = kpisJson.success ? kpisJson.data : null;
      const woStats = kpiData?.workOrders;
      const eqStats = kpiData?.equipements;

      const totalWO = woStats?.total ?? 0;
      const byStatus = woStats?.byStatus ?? {};
      const closedWO = (byStatus.CLOTURE ?? 0) + (byStatus.ANNULE ?? 0);
      const openWO = totalWO - closedWO;

      // Count priorities from recent WOs
      const recentWOs: WorkOrder[] = (recentJson.success ? recentJson.data : []).map(mapBackendWO);
      const urgent = recentWOs.filter((w) => w.priority === 'P1').length;
      const high = recentWOs.filter((w) => w.priority === 'P2').length;
      const medium = recentWOs.filter((w) => w.priority === 'P3').length;
      const low = recentWOs.filter((w) => w.priority === 'P4').length;

      const kpi: DashboardKPI = {
        availability: eqStats?.total ? Math.round(((eqStats.byStatus?.EN_SERVICE ?? 0) / eqStats.total) * 1000) / 10 : 94.2,
        availabilityTrend: 0,
        mttr: woStats?.mttrMinutes ? Math.round((woStats.mttrMinutes / 60) * 10) / 10 : 0,
        mttrTrend: 0,
        mtbf: 156, // not provided by backend, keep static for now
        mtbfTrend: 0,
        openWorkOrders: openWO,
        urgentWorkOrders: urgent,
        highWorkOrders: high,
        mediumWorkOrders: medium,
        lowWorkOrders: low,
        overdueWorkOrders: (alertsJson.success ? alertsJson.data.overdueWorkOrders : []).length,
      };

      // ── Alerts ──
      const alertData = alertsJson.success ? alertsJson.data : {};
      const mappedAlerts: AlertItem[] = [
        ...(alertData.urgentWorkOrders ?? []).map((wo: any) => ({
          id: `urg-${wo.id}`,
          type: 'breakdown' as const,
          title: `${wo.equipment?.name ?? 'Équipement'} — Urgent`,
          description: wo.title,
          equipmentId: wo.equipmentId,
          workOrderId: wo.id,
          priority: 'P1' as const,
          createdAt: wo.dateCreation,
          acknowledged: false,
        })),
        ...(alertData.overdueWorkOrders ?? []).map((wo: any) => ({
          id: `ovd-${wo.id}`,
          type: 'overdue_pm' as const,
          title: `BT en retard — ${wo.equipment?.name ?? ''}`,
          description: wo.title,
          equipmentId: wo.equipmentId,
          workOrderId: wo.id,
          priority: 'P2' as const,
          createdAt: wo.dateCreation,
          acknowledged: false,
        })),
        ...(alertData.lowStockItems ?? []).map((item: any) => ({
          id: `stk-${item.id}`,
          type: 'low_stock' as const,
          title: `Stock bas — ${item.name}`,
          description: `${item.name} : ${item.quantite} restants (min: ${item.stockMinimum})`,
          stockItemId: item.id,
          priority: 'P3' as const,
          createdAt: new Date().toISOString(),
          acknowledged: false,
        })),
      ];

      // ── Preventive plans ──
      const mappedPMs: PreventivePlan[] = (upcomingJson.success ? upcomingJson.data : []).map(mapBackendPM);

      // ── Availability by line (static fallback) ──
      const availabilityByLine: AvailabilityByLine[] = [
        { line: 'Presses', availability: 91.8, target: 95 },
        { line: 'Laquage', availability: 93.0, target: 95 },
        { line: 'Sérigraphie', availability: 91.2, target: 92 },
        { line: 'Emballage', availability: 94.7, target: 95 },
        { line: 'Recuit', availability: 92.8, target: 95 },
        { line: 'Air comprimé', availability: 98.8, target: 98 },
      ];

      set({
        kpi,
        alerts: mappedAlerts,
        workOrders: recentWOs,
        preventivePlans: mappedPMs,
        availabilityByLine,
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
}));
