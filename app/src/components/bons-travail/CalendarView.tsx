import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon,
} from 'lucide-react';
import type { WorkOrder } from '@/types';
import { PRIORITY_COLORS } from './utils';

interface CalendarViewProps {
  workOrders: WorkOrder[];
  onSelectWorkOrder: (wo: WorkOrder) => void;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function CalendarView({ workOrders, onSelectWorkOrder }: CalendarViewProps) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');

  const monthNames = [
    'Janvier', 'F\u00e9vrier', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Ao\u00fbt', 'Septembre', 'Octobre', 'Novembre', 'D\u00e9cembre',
  ];
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const prevMonthDays = getDaysInMonth(currentYear, currentMonth - 1);

  const goToPrevMonth = () => {
    setSlideDirection('right');
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    setSlideDirection('left');
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const goToToday = () => {
    setSlideDirection(currentMonth < today.getMonth() ? 'left' : 'right');
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  const calendarDays = useMemo(() => {
    const days: { day: number; isCurrentMonth: boolean; dateStr: string }[] = [];
    // Previous month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        dateStr: '',
      });
    }
    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ day: i, isCurrentMonth: true, dateStr });
    }
    // Next month padding to fill 6 rows (42 cells)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, isCurrentMonth: false, dateStr: '' });
    }
    return days;
  }, [currentYear, currentMonth, daysInMonth, firstDay, prevMonthDays]);

  const isToday = (day: number) =>
    day === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear();

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-text-primary min-w-[180px]">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={goToPrevMonth}
              className="p-1.5 rounded-md hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-1.5 rounded-md hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <button
          onClick={goToToday}
          className="btn-ghost text-sm h-9 px-3 flex items-center gap-1.5"
        >
          <CalendarIcon className="w-4 h-4" />
          Aujourd\u0027hui
        </button>
      </div>

      {/* Calendar grid */}
      <div className="overflow-hidden rounded-xl border border-[rgba(90,94,117,0.2)]">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-[rgba(90,94,117,0.2)]">
          {dayNames.map((d) => (
            <div
              key={d}
              className="h-10 flex items-center justify-center text-[11px] font-medium uppercase tracking-wide text-text-secondary"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentYear}-${currentMonth}`}
            initial={{ opacity: 0, x: slideDirection === 'left' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: slideDirection === 'left' ? -20 : 20 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-7 auto-rows-fr"
          >
            {calendarDays.map((cell, idx) => {
              const cellDate = cell.isCurrentMonth
                ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`
                : '';

              const dayOrders = cellDate
                ? workOrders.filter((wo) => {
                    const date = wo.plannedStart ?? wo.createdAt;
                    return date.startsWith(cellDate);
                  })
                : [];

              const dayOfWeek = idx % 7;
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

              return (
                <div
                  key={cellDate || `pad-${idx}`}
                  className="min-h-[100px] p-2 border-r border-b border-[rgba(90,94,117,0.1)] flex flex-col gap-1"
                  style={{
                    backgroundColor: isToday(cell.day) && cell.isCurrentMonth
                      ? 'rgba(14,165,233,0.08)'
                      : isWeekend
                        ? 'rgba(26,29,42,0.6)'
                        : undefined,
                  }}
                >
                  <span
                    className={`text-sm font-medium ${
                      isToday(cell.day) && cell.isCurrentMonth
                        ? 'text-accent-teal'
                        : cell.isCurrentMonth
                          ? 'text-text-primary'
                          : 'text-text-muted'
                    }`}
                  >
                    {cell.day}
                  </span>

                  {dayOrders.slice(0, 3).map((wo) => (
                    <button
                      key={wo.id}
                      onClick={() => onSelectWorkOrder(wo)}
                      className="text-left text-[11px] leading-tight truncate px-1.5 py-0.5 rounded bg-[rgba(90,94,117,0.12)] hover:bg-bg-hover transition-colors"
                      style={{
                        borderLeft: `2px solid ${PRIORITY_COLORS[wo.priority]}`,
                      }}
                    >
                      <span className="font-mono text-[10px] text-accent-teal">
                        {wo.number}
                      </span>{' '}
                      <span className="text-text-secondary truncate">
                        {wo.title.slice(0, 25)}
                      </span>
                    </button>
                  ))}

                  {dayOrders.length > 3 && (
                    <span className="text-[10px] text-text-muted pl-1.5">
                      +{dayOrders.length - 3} de plus
                    </span>
                  )}
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
