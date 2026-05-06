import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, Plus } from 'lucide-react';
import type { WorkOrder, WorkOrderStatus } from '@/types';
import { useWorkOrderStore } from '@/stores/workOrderStore';
import { KanbanCard } from './KanbanCard';
import {
  KANBAN_COLUMNS,
  getColumnForStatus,
} from './utils';

interface KanbanBoardProps {
  workOrders: WorkOrder[];
  onSelectWorkOrder: (wo: WorkOrder) => void;
  onCreateWorkOrder?: (status: WorkOrderStatus) => void;
  readOnly?: boolean;
}

export function KanbanBoard({ workOrders, onSelectWorkOrder, onCreateWorkOrder, readOnly = false }: KanbanBoardProps) {
  const { updateWorkOrderStatus } = useWorkOrderStore();
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDragStart = useCallback((wo: WorkOrder) => {
    setDraggedId(wo.id);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, columnId: string) => {
      e.preventDefault();
      setDragOverColumn(null);
      const id = e.dataTransfer.getData('text/plain') || draggedId;
      if (!id) return;

      const column = KANBAN_COLUMNS.find((c) => c.id === columnId);
      if (!column) return;

      const wo = workOrders.find((w) => w.id === id);
      if (!wo) return;

      const currentColumn = getColumnForStatus(wo.status);
      if (currentColumn?.id === columnId) return;

      const newStatus = column.statuses[0];
      updateWorkOrderStatus(id, newStatus);
      setDraggedId(null);
    },
    [draggedId, workOrders, updateWorkOrderStatus]
  );

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100dvh-14rem)]">
      {KANBAN_COLUMNS.map((column) => {
        const columnOrders = workOrders.filter((wo) =>
          column.statuses.includes(wo.status)
        );
        const isDragOver = dragOverColumn === column.id;

        return (
          <div
            key={column.id}
            className="flex-shrink-0 w-[300px] min-w-[280px] flex flex-col rounded-xl border border-[rgba(90,94,117,0.15)] overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)',
            }}
            onDragOver={(e) => !readOnly && handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => !readOnly && handleDrop(e, column.id)}
          >
            {/* Column header */}
            <div
              className="flex items-center justify-between h-12 px-4 py-3 sticky top-0 z-10 border-b border-[rgba(90,94,117,0.15)] transition-colors duration-300"
              style={{
                backgroundColor: isDragOver ? 'rgba(14,165,233,0.08)' : undefined,
                borderStyle: isDragOver ? 'dashed' : undefined,
                borderColor: isDragOver ? '#0EA5E9' : undefined,
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: column.color }}
                />
                <span className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                  {column.label}
                </span>
              </div>
              <span className="inline-flex items-center h-6 px-2.5 rounded-full text-xs font-medium bg-bg-hover text-text-primary">
                {columnOrders.length}
              </span>
            </div>

            {/* Cards area */}
            <div
              className="flex-1 p-3 overflow-y-auto min-h-[200px] transition-colors duration-300"
              style={{
                backgroundColor: isDragOver ? 'rgba(14,165,233,0.04)' : undefined,
              }}
            >
              <AnimatePresence mode="popLayout">
                {columnOrders.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-12 text-text-muted"
                  >
                    <Inbox className="w-8 h-8 mb-3" />
                    <p className="text-sm">Aucun BT dans ce statut</p>
                  </motion.div>
                ) : (
                  columnOrders.map((wo) => (
                    <KanbanCard
                      key={wo.id}
                      workOrder={wo}
                      onClick={onSelectWorkOrder}
                      onDragStart={handleDragStart}
                      draggable={!readOnly}
                    />
                  ))
                )}
              </AnimatePresence>

              {/* Add button at bottom */}
              {!readOnly && (
                <button
                  onClick={() => onCreateWorkOrder?.(column.statuses[0])}
                  className="w-full flex items-center justify-center gap-1.5 py-2 mt-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter un BT</span>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
