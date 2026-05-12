import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { WorkOrder, WorkOrderStatus } from '@/types';
import { useWorkOrders } from '@/hooks/useWorkOrders';
import { useAuthStore } from '@/stores/authStore';
import { FilterBar, type ViewMode, type FilterState } from '@/components/bons-travail/FilterBar';
import { KanbanBoard } from '@/components/bons-travail/KanbanBoard';
import { ListView } from '@/components/bons-travail/ListView';
import { CalendarView } from '@/components/bons-travail/CalendarView';
import { DetailDrawer } from '@/components/bons-travail/DetailDrawer';
import { CreationModal } from '@/components/bons-travail/CreationModal';
import { Inbox } from 'lucide-react';

export default function BonsDeTravail() {
  const { data: workOrders = [], isLoading: loading } = useWorkOrders();
  const { hasRole } = useAuthStore();
  const isReadOnly = !hasRole(['responsable', 'technicien']);

  // Responsive default view
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024 ? 'kanban' : 'list';
    }
    return 'kanban';
  });

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    statuses: [],
    priorities: [],
    types: [],
  });

  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createInitialStatus, setCreateInitialStatus] = useState<WorkOrderStatus>('draft');

  // Handle responsive view on mount
  useEffect(() => {
    const handleResize = () => {
      // Only auto-switch on first load or if user hasn't manually changed
      // For simplicity, we just track window size
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredWorkOrders = useMemo(() => {
    let result = [...workOrders];

    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(
        (wo) =>
          wo.number.toLowerCase().includes(term) ||
          wo.equipmentName.toLowerCase().includes(term) ||
          wo.title.toLowerCase().includes(term) ||
          wo.assignedTo?.toLowerCase().includes(term) ||
          wo.requestedBy.toLowerCase().includes(term)
      );
    }

    if (filters.statuses.length > 0) {
      result = result.filter((wo) => filters.statuses.includes(wo.status));
    }

    if (filters.priorities.length > 0) {
      result = result.filter((wo) => filters.priorities.includes(wo.priority));
    }

    if (filters.types.length > 0) {
      result = result.filter((wo) => filters.types.includes(wo.type));
    }

    return result;
  }, [workOrders, filters]);

  const handleCreateClick = () => {
    setCreateInitialStatus('draft');
    setCreateModalOpen(true);
  };

  const handleCreateFromColumn = (status: WorkOrderStatus) => {
    setCreateInitialStatus(status);
    setCreateModalOpen(true);
  };

  const handleSelectWorkOrder = (wo: WorkOrder) => {
    setSelectedWorkOrder(wo);
  };

  return (
    <div className="flex flex-col gap-5 p-5 lg:p-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-text-primary tracking-tight leading-tight">
            BONS DE TRAVAIL
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Gestion des interventions de maintenance
          </p>
        </div>
      </div>

      {/* Filters and view controls */}
      <FilterBar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filters={filters}
        onFiltersChange={setFilters}
        onCreateClick={handleCreateClick}
        resultCount={filteredWorkOrders.length}
      />

      {/* Content area */}
      <div className="flex-1 min-h-0">
        <AnimatePresence mode="wait">
          {filteredWorkOrders.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-text-muted"
            >
              <Inbox className="w-12 h-12 mb-4" />
              <p className="text-lg font-medium text-text-primary">Aucun bon de travail trouvé</p>
              <p className="text-sm mt-1">Essayez de modifier vos filtres</p>
            </motion.div>
          ) : (
            <motion.div
              key={viewMode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {viewMode === 'kanban' && (
                <KanbanBoard
                  workOrders={filteredWorkOrders}
                  onSelectWorkOrder={handleSelectWorkOrder}
                  onCreateWorkOrder={handleCreateFromColumn}
                  readOnly={isReadOnly}
                />
              )}
              {viewMode === 'list' && (
                <ListView
                  workOrders={filteredWorkOrders}
                  onSelectWorkOrder={handleSelectWorkOrder}
                />
              )}
              {viewMode === 'calendar' && (
                <CalendarView
                  workOrders={filteredWorkOrders}
                  onSelectWorkOrder={handleSelectWorkOrder}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Detail drawer */}
      <AnimatePresence>
        {selectedWorkOrder && (
          <DetailDrawer
            workOrder={selectedWorkOrder}
            onClose={() => setSelectedWorkOrder(null)}
          />
        )}
      </AnimatePresence>

      {/* Creation modal */}
      <CreationModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        initialStatus={createInitialStatus}
      />
    </div>
  );
}
