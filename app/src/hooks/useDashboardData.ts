import { useQuery } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/api';
import type { DashboardKPI, AlertItem, WorkOrder, PreventivePlan, AvailabilityByLine } from '@/types';
import { mapBackendWO, mapFrequency, isOverdue, parseChecklist } from '@/stores/mappers';

/* ------------------------------------------------------------------ */
//  Hooks
/* ------------------------------------------------------------------ */

export function useDashboardKPIs() {
  return useQuery({
    queryKey: ['dashboard', 'kpis'],
    queryFn: async () => {
      const json = await fetchAPI('/dashboard/kpis');
      const kpiData = json.success ? json.data : null;
      const woStats = kpiData?.workOrders;
      const eqStats = kpiData?.equipements;

      const totalWO = woStats?.total ?? 0;
      const byStatus = woStats?.byStatus ?? {};
      const closedWO = (byStatus.CLOTURE ?? 0) + (byStatus.ANNULE ?? 0);
      const openWO = totalWO - closedWO;

      return {
        availability: eqStats?.total ? Math.round(((eqStats.byStatus?.EN_SERVICE ?? 0) / eqStats.total) * 1000) / 10 : 94.2,
        availabilityTrend: 0,
        mttr: woStats?.mttrMinutes ? Math.round((woStats.mttrMinutes / 60) * 10) / 10 : 0,
        mttrTrend: 0,
        mtbf: 156,
        mtbfTrend: 0,
        openWorkOrders: openWO,
        urgentWorkOrders: 0,
        highWorkOrders: 0,
        mediumWorkOrders: 0,
        lowWorkOrders: 0,
        overdueWorkOrders: 0,
      } as DashboardKPI;
    },
  });
}

export function useDashboardAlerts() {
  return useQuery({
    queryKey: ['dashboard', 'alerts'],
    queryFn: async () => {
      const json = await fetchAPI('/dashboard/alerts');
      const alertData = json.success ? json.data : {};

      const mappedAlerts: AlertItem[] = [
        ...(alertData.urgentWorkOrders ?? []).map((wo: { id: string; equipment?: { name: string }; equipmentId: string; title: string; dateCreation: string }) => ({
          id: `urg-${wo.id}`,
          type: 'breakdown' as const,
          title: `${wo.equipment?.name ?? 'Equipement'} — Urgent`,
          description: wo.title,
          equipmentId: wo.equipmentId,
          workOrderId: wo.id,
          priority: 'P1' as const,
          createdAt: wo.dateCreation,
          acknowledged: false,
        })),
        ...(alertData.overdueWorkOrders ?? []).map((wo: { id: string; equipment?: { name: string }; equipmentId: string; title: string; dateCreation: string }) => ({
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
        ...(alertData.lowStockItems ?? []).map((item: { id: string; name: string; quantite: number; stockMinimum: number }) => ({
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

      return mappedAlerts;
    },
  });
}

export function useDashboardRecentWOs() {
  return useQuery({
    queryKey: ['dashboard', 'recentWOs'],
    queryFn: async () => {
      const json = await fetchAPI('/dashboard/recent-work-orders?limit=15');
      const raw = json.success ? json.data : [];
      return raw.map(mapBackendWO) as WorkOrder[];
    },
  });
}

export function useDashboardUpcomingPMs() {
  return useQuery({
    queryKey: ['dashboard', 'upcomingPMs'],
    queryFn: async () => {
      const json = await fetchAPI('/dashboard/upcoming-preventive?days=30');
      const raw = json.success ? json.data : [];
      interface BackendPreventivePlan {
        id: string;
        frequencyType: string;
        frequencyValue: number;
        title: string;
        description?: string;
        equipmentId: string;
        equipment?: { name: string };
        nextExecution?: string;
        lastExecution?: string;
        active: boolean;
        checklist?: string;
      }
      return raw.map((p: BackendPreventivePlan) => ({
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
      })) as PreventivePlan[];
    },
  });
}

export function useDashboardAvailabilityByLine() {
  return useQuery({
    queryKey: ['dashboard', 'availabilityByLine'],
    queryFn: async () => {
      // Donnees statiques en attendant un endpoint dedie
      return [
        { line: 'Presses', availability: 91.8, target: 95 },
        { line: 'Laquage', availability: 93.0, target: 95 },
        { line: 'Serigraphie', availability: 91.2, target: 92 },
        { line: 'Emballage', availability: 94.7, target: 95 },
        { line: 'Recuit', availability: 92.8, target: 95 },
        { line: 'Air comprime', availability: 98.8, target: 98 },
      ] as AvailabilityByLine[];
    },
  });
}
