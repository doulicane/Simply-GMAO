import { motion } from 'framer-motion';
import type { WorkOrderStatus } from '@/types';
import { STATUS_LABELS } from './utils';

const TIMELINE_STATUSES: WorkOrderStatus[] = ['draft', 'planned', 'in_progress', 'completed', 'closed'];

interface StatusTimelineProps {
  currentStatus: WorkOrderStatus;
}

export function StatusTimeline({ currentStatus }: StatusTimelineProps) {
  const currentIndex = TIMELINE_STATUSES.indexOf(currentStatus);

  return (
    <div className="py-4">
      <div className="flex items-center justify-between relative">
        {/* Connecting line background */}
        <div className="absolute top-3 left-0 right-0 h-[2px] bg-[rgba(90,94,117,0.2)]" />

        {/* Connecting line active */}
        <div
          className="absolute top-3 left-0 h-[2px] bg-accent-teal transition-all duration-500"
          style={{
            width: currentIndex >= 0 ? `${(currentIndex / (TIMELINE_STATUSES.length - 1)) * 100}%` : '0%',
          }}
        />

        {TIMELINE_STATUSES.map((status, idx) => {
          const isCompleted = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={status} className="flex flex-col items-center gap-2 z-10">
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? [1, 1.15, 1] : 1,
                }}
                transition={{
                  duration: 1.5,
                  repeat: isCurrent ? Infinity : 0,
                  ease: 'easeInOut',
                }}
                className="w-6 h-6 rounded-full flex items-center justify-center border-2"
                style={{
                  backgroundColor: isCompleted ? '#0EA5E9' : 'transparent',
                  borderColor: isCompleted ? '#0EA5E9' : '#5A5E75',
                }}
              >
                {isCompleted && (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </motion.div>
              <div className="flex flex-col items-center">
                <span
                  className={`text-[11px] font-medium uppercase tracking-wide ${
                    isCompleted ? 'text-accent-teal' : 'text-text-muted'
                  }`}
                >
                  {STATUS_LABELS[status]}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
