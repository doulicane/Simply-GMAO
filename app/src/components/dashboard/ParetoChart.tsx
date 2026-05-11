/**
 * =============================================================================
 * ParetoChart — Graphique Pareto des pannes
 * =============================================================================
 */

import { useDashboardPareto } from '@/hooks/useDashboardAdvanced';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart } from 'recharts';
import { AlertTriangle } from 'lucide-react';

export function ParetoChart() {
  const { data: pareto = [], isLoading } = useDashboardPareto(6);

  if (isLoading) return <Card className="h-80 animate-pulse" />;
  if (pareto.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Aucune donnee Pareto disponible.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Pareto des pannes (6 mois)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={pareto}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="cause" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={80} />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} domain={[0, 100]} />
            <Tooltip
              formatter={(value: any, name: string) => {
                if (name === 'cumulPct') return [`${value}%`, 'Cumul %'];
                return [value, 'Nombre'];
              }}
            />
            <Bar yAxisId="left" dataKey="count" fill="#B71C1C" radius={[4, 4, 0, 0]} name="count" />
            <Line yAxisId="right" type="monotone" dataKey="cumulPct" stroke="#37474F" strokeWidth={2} dot={false} name="cumulPct" />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
