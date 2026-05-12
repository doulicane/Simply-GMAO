import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell,
} from 'recharts';
import { cn } from '@/lib/utils';

export interface KPICardProps {
  title: string;
  value: string;
  unit?: string;
  subtitle: string;
  trend?: string;
  trendUp?: boolean;
  trendGood?: boolean;
  borderColor: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

export function KPICard({
  title,
  value,
  unit,
  subtitle,
  trend,
  trendUp,
  trendGood,
  borderColor,
  children,
  onClick,
}: KPICardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={cn(
        'card-elevated p-5 cursor-pointer transition-shadow hover:shadow-card-hover',
        'border-l-[3px]',
        onClick && 'hover:translate-y-[-2px]'
      )}
      style={{ borderLeftColor: borderColor }}
    >
      <p className="text-xs font-medium text-text-secondary uppercase tracking-[0.04em]">{title}</p>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-[42px] font-bold tabular-nums leading-none" style={{ color: borderColor }}>
          {value}
        </span>
        {unit && <span className="text-lg font-semibold text-text-secondary">{unit}</span>}
      </div>
      <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
      {trend && (
        <div className="mt-2 flex items-center gap-1 text-xs text-text-secondary">
          {trendUp ? (
            <TrendingUp className={cn('w-3.5 h-3.5', trendGood ? 'text-status-ok' : 'text-status-critical')} />
          ) : (
            <TrendingDown className={cn('w-3.5 h-3.5', trendGood ? 'text-status-ok' : 'text-status-critical')} />
          )}
          <span>{trend}</span>
        </div>
      )}
      {children && <div className="mt-3">{children}</div>}
    </motion.div>
  );
}

export function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const chartData = data.map((v, i) => ({ v, i }));
  return (
    <div className="h-8 w-full max-w-[120px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MiniBarChart({ data, color }: { data: number[]; color: string }) {
  const chartData = data.map((v, i) => ({ v, i }));
  return (
    <div className="h-8 w-full max-w-[120px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <Bar dataKey="v" fill={color} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MiniDonut({ data }: { data: { value: number; color: string }[] }) {
  return (
    <div className="h-12 w-12">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={14}
            outerRadius={24}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
