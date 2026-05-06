import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import type { WorkOrder } from '@/types';
import { PriorityBadge } from '@/components/StatusBadge';
import {
  TYPE_LABELS,
  PRIORITY_COLORS,
  formatRelativeTime,
  getInitials,
} from './utils';

interface KanbanCardProps {
  workOrder: WorkOrder;
  onClick: (wo: WorkOrder) => void;
  onDragStart: (wo: WorkOrder) => void;
  draggable?: boolean;
}

export function KanbanCard({ workOrder, onClick, onDragStart, draggable = true }: KanbanCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const priorityColor = PRIORITY_COLORS[workOrder.priority];

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', workOrder.id);
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(workOrder);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="mb-2"
    >
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: isDragging ? 0.9 : 1,
          y: 0,
          scale: isDragging ? 1.03 : 1,
          rotate: isDragging ? 2 : 0,
          boxShadow: isDragging
            ? '0 20px 40px rgba(0,0,0,0.5)'
            : '0 4px 20px rgba(0,0,0,0.3)',
        }}
        transition={{ duration: 0.2, ease: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number] }}
        onClick={() => onClick(workOrder)}
        className="cursor-pointer rounded-[10px] bg-bg-elevated border border-[rgba(90,94,117,0.2)] p-3.5 hover:bg-bg-hover hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-200"
        style={{ borderLeft: `3px solid ${priorityColor}` }}
      >
        {/* Header: BT number + priority */}
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-[13px] font-medium text-accent-teal">
            {workOrder.number}
          </span>
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: priorityColor }}
            title={workOrder.priority}
          />
        </div>

        {/* Equipment */}
        <p className="text-sm font-semibold text-text-primary truncate mb-1">
          {workOrder.equipmentName}
        </p>

        {/* Description */}
        <p className="text-[13px] text-text-secondary line-clamp-2 mb-2.5 leading-relaxed">
          {workOrder.description}
        </p>

        {/* Badges */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <span className="inline-flex items-center h-[18px] px-2 rounded-[9px] text-[10px] font-semibold uppercase tracking-wide bg-[rgba(90,94,117,0.15)] text-text-secondary border border-[rgba(90,94,117,0.25)]">
            {TYPE_LABELS[workOrder.type]}
          </span>
          <PriorityBadge priority={workOrder.priority} />
        </div>

        {/* Footer: assignee + time */}
        <div className="flex items-center justify-between pt-2 border-t border-[rgba(90,94,117,0.15)]">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-accent-teal/20 text-accent-teal flex items-center justify-center text-[10px] font-bold">
              {workOrder.assignedTo ? getInitials(workOrder.assignedTo) : '?'}
            </div>
            <span className="text-[12px] text-text-secondary truncate max-w-[120px]">
              {workOrder.assignedTo ?? 'Non assign\u00e9'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-text-muted">
            <Clock className="w-3 h-3" />
            <span>{formatRelativeTime(workOrder.createdAt)}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
