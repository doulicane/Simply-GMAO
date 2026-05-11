/**
 * =============================================================================
 * DashboardDirection — Dashboard direction avec KPIs avances
 * =============================================================================
 */

import { useState } from 'react';
import { DashboardKPIs } from './DashboardKPIs';
import { ParetoChart } from './ParetoChart';
import { PeriodCompare } from './PeriodCompare';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet } from 'lucide-react';
import { useDashboardExportUrl } from '@/hooks/useDashboardAdvanced';
import { exportToExcel } from '@/lib/export';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

export function DashboardDirection() {
  const getExportUrl = useDashboardExportUrl();
  const [dateFrom, setDateFrom] = useState(format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  const handleExportBT = () => {
    window.open(getExportUrl(dateFrom, dateTo), '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Tableau de bord direction</h1>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-2 py-1.5 rounded-md border bg-background text-sm"
          />
          <span className="text-muted-foreground">→</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-2 py-1.5 rounded-md border bg-background text-sm"
          />
          <Button variant="outline" size="sm" onClick={handleExportBT}>
            <FileSpreadsheet className="w-4 h-4 mr-1" />
            Excel
          </Button>
        </div>
      </div>

      <DashboardKPIs />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ParetoChart />
        <PeriodCompare />
      </div>
    </div>
  );
}
