import { useMemo } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
  type DroppableProvided,
  type DraggableProvided,
  type DraggableStateSnapshot,
  type DroppableStateSnapshot,
} from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';
import type { WorkOrder, WorkOrderStatus } from '@/types';

/* ─────────────────────────────────────────── */
/*  Colonnes Kanban                            */
/* ─────────────────────────────────────────── */

interface KanbanColumnDef {
  id: WorkOrderStatus;
  label: string;
  color: string;
  bg: string;
}

const COLUMNS: KanbanColumnDef[] = [
  { id: 'planned', label: 'Planifié', color: '#3B82F6', bg: 'bg-[#3B82F6]/10' },
  { id: 'in_progress', label: 'En cours', color: '#0EA5E9', bg: 'bg-[#0EA5E9]/10' },
  { id: 'waiting_parts', label: 'Attente pièces', color: '#F59E0B', bg: 'bg-[#F59E0B]/10' },
  { id: 'completed', label: 'Terminé', color: '#22C55E', bg: 'bg-[#22C55E]/10' },
];

/* ─────────────────────────────────────────── */
/*  Props                                      */
/* ─────────────────────────────────────────── */

interface KanbanBoardProps {
  workOrders: WorkOrder[];
  onMove: (id: string, newStatus: WorkOrderStatus) => void;
  onCardClick?: (wo: WorkOrder) => void;
}

/* ─────────────────────────────────────────── */
/*  Board                                      */
/* ─────────────────────────────────────────── */

export function KanbanBoard({ workOrders, onMove, onCardClick }: KanbanBoardProps) {
  const columnsData = useMemo(() => {
    const map: Record<WorkOrderStatus, WorkOrder[]> = {
      planned: [],
      in_progress: [],
      waiting_parts: [],
      completed: [],
      draft: [],
      closed: [],
      cancelled: [],
    };
    workOrders.forEach((wo) => {
      if (map[wo.status]) {
        map[wo.status].push(wo);
      }
    });
    return map;
  }, [workOrders]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const sourceId = result.source.droppableId as WorkOrderStatus;
    const destId = result.destination.droppableId as WorkOrderStatus;
    if (sourceId === destId) return;

    const cardId = result.draggableId;
    onMove(cardId, destId);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex h-full gap-4 px-6 py-4 min-w-[1024px]">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              items={columnsData[col.id] ?? []}
              onCardClick={onCardClick}
            />
          ))}
        </div>
      </div>
    </DragDropContext>
  );
}

/* ─────────────────────────────────────────── */
/*  Column                                     */
/* ─────────────────────────────────────────── */

function KanbanColumn({
  column,
  items,
  onCardClick,
}: {
  column: KanbanColumnDef;
  items: WorkOrder[];
  onCardClick?: (wo: WorkOrder) => void;
}) {
  return (
    <div className="flex-1 flex flex-col min-w-[260px] max-w-[360px] rounded-xl border border-[rgba(90,94,117,0.15)] bg-bg-elevated/50">
      {/* Header */}
      <div className={cn('flex items-center justify-between px-4 py-3 rounded-t-xl border-b border-[rgba(90,94,117,0.1)]', column.bg)}>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: column.color }} />
          <span className="text-sm font-semibold text-text-primary">{column.label}</span>
        </div>
        <span className="text-xs font-medium text-text-secondary bg-white/5 px-2 py-0.5 rounded-full">
          {items.length}
        </span>
      </div>

      {/* Cards */}
      <Droppable droppableId={column.id}>
        {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex-1 overflow-y-auto p-3 space-y-2 transition-colors',
              snapshot.isDraggingOver ? 'bg-white/5' : ''
            )}
          >
            {items.map((wo, index) => (
              <Draggable key={wo.id} draggableId={wo.id} index={index}>
                {(dragProvided: DraggableProvided, dragSnapshot: DraggableStateSnapshot) => (
                  <KanbanCard
                    workOrder={wo}
                    provided={dragProvided}
                    snapshot={dragSnapshot}
                    onClick={() => onCardClick?.(wo)}
                  />
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

/* ─────────────────────────────────────────── */
/*  Card                                       */
/* ─────────────────────────────────────────── */

function KanbanCard({
  workOrder,
  provided,
  snapshot,
  onClick,
}: {
  workOrder: WorkOrder;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  onClick?: () => void;
}) {
  const statusLabel =
    workOrder.status === 'planned'
      ? 'Planifié'
      : workOrder.status === 'in_progress'
      ? 'En cours'
      : workOrder.status === 'waiting_parts'
      ? 'Attente'
      : workOrder.status === 'completed'
      ? 'Terminé'
      : workOrder.status;

  const statusColor =
    workOrder.status === 'completed'
      ? 'ok'
      : workOrder.status === 'in_progress'
      ? 'info'
      : workOrder.status === 'waiting_parts'
      ? 'warning'
      : 'neutral';

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      onClick={onClick}
      className={cn(
        'p-3 rounded-lg border cursor-pointer transition-shadow select-none',
        'bg-bg-hover border-[rgba(90,94,117,0.1)] hover:border-[rgba(14,165,233,0.4)] hover:shadow-card-hover',
        snapshot.isDragging ? 'shadow-lg rotate-1 border-accent-teal/50' : ''
      )}
      style={{
        ...provided.draggableProps.style,
      }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-mono text-text-muted">{workOrder.number}</span>
        <StatusBadge status={statusColor} label={statusLabel} />
      </div>

      <p className="text-sm font-semibold text-text-primary leading-tight mb-1">{workOrder.title}</p>
      <p className="text-xs text-text-secondary mb-2">{workOrder.equipmentName}</p>

      <div className="flex items-center gap-2">
        <PriorityBadge priority={workOrder.priority} />
        {workOrder.assignedTo && (
          <span className="text-[11px] text-text-muted truncate">{workOrder.assignedTo}</span>
        )}
      </div>
    </div>
  );
}
