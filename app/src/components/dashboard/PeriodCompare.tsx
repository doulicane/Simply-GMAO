/**
 * =============================================================================
 * PeriodCompare — Comparaison periode N vs N-1
 * =============================================================================
 */

import { useDashboardCompare } from '@/hooks/useDashboardAdvanced';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompareRowProps {
  label: string;
  current: number;
  previous: number;
  unit?: string;
  inverse?: boolean; // true = moins c'est mieux
}

function CompareRow({ label, current, previous, unit, inverse }: CompareRowProps) {
  const diff = previous > 0 ? ((current - previous) / previous) * 100 : 0;
  const isBetter = inverse ? diff < 0 : diff > 0;
  const isNeutral = diff === 0;

  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground w-16 text-right">
          {previous} {unit}
        </span>
        <span className="text-sm font-medium w-16 text-right">
          {current} {unit}
        </span>
        <span
          className={cn(
            'flex items-center gap-1 text-xs font-medium w-20 justify-end',
            isNeutral ? 'text-muted-foreground' : isBetter ? 'text-green-600' : 'text-red-600'
          )}
        >
          {isNeutral ? <Minus className="w-3 h-3" /> : isBetter ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(diff).toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

export function PeriodCompare() {
  const { data, isLoading } = useDashboardCompare(1);

  if (isLoading) return <Card className="h-80 animate-pulse" />;
  if (!data) return null;

  const { current, previous } = data;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Comparaison N vs N-1 (mois)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2 px-1">
          <span>Indicateur</span>
          <div className="flex gap-4">
            <span className="w-16 text-right">Precedent</span>
            <span className="w-16 text-right font-medium text-foreground">Actuel</span>
            <span className="w-20 text-right">Variation</span>
          </div>
        </div>

        <CompareRow label="BT crees" current={current.workOrders} previous={previous.workOrders} />
        <CompareRow label="Pannes" current={current.pannes} previous={previous.pannes} inverse />
        <CompareRow label="Clotures" current={current.clotures} previous={previous.clotures} />
        <CompareRow label="MTTR (min)" current={current.mttrMinutes} previous={previous.mttrMinutes} inverse />
        <CompareRow label="Cout total" current={current.coutTotal} previous={previous.coutTotal} inverse unit="€" />
      </CardContent>
    </Card>
  );
}
