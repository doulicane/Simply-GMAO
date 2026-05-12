import { useNavigate } from 'react-router-dom';
import type { WorkOrder } from '@/types';

export interface KanbanMiniColumnProps {
  status: string;
  count: number;
  color: string;
  orders: WorkOrder[];
}

export function KanbanMiniColumn({ status, count, color, orders }: KanbanMiniColumnProps) {
  const navigate = useNavigate();
  return (
    <div className="bg-bg-elevated rounded-lg p-3 border border-[rgba(90,94,117,0.15)]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">{status}</span>
        <span
          className="min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold text-white flex items-center justify-center"
          style={{ backgroundColor: color }}
        >
          {count}
        </span>
      </div>
      <div className="space-y-2">
        {orders.slice(0, 3).map((wo) => (
          <button
            key={wo.id}
            onClick={() => navigate('/bons-de-travail')}
            className="w-full text-left text-xs hover:bg-bg-hover rounded-md p-1.5 -mx-1.5 transition-colors"
          >
            <p className="font-semibold text-text-primary truncate">{wo.equipmentName}</p>
            <p className="text-text-muted truncate">{wo.title}</p>
            <div className="mt-1 flex items-center gap-1">
              <div className="w-5 h-5 rounded-full bg-accent-teal/20 text-accent-teal flex items-center justify-center text-[9px] font-bold">
                {wo.assignedTo?.split(' ').map((n) => n[0]).join('') ?? '?'}
              </div>
              <span className="text-[10px] text-text-muted">{wo.assignedTo}</span>
            </div>
          </button>
        ))}
        {orders.length > 3 && (
          <button
            onClick={() => navigate('/bons-de-travail')}
            className="text-xs text-accent-teal hover:underline cursor-pointer w-full text-left"
          >
            +{orders.length - 3} plus
          </button>
        )}
      </div>
    </div>
  );
}
