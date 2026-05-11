/**
 * =============================================================================
 * InventoryVarianceList — Validation des ecarts d'inventaire (desktop)
 * =============================================================================
 */

import { AlertTriangle, CheckCircle2, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VarianceLine {
  stockItemId: string;
  code: string;
  name: string;
  quantiteTheorique: number;
  quantiteReelle: number;
  commentaire?: string;
}

interface InventoryVarianceListProps {
  lines: VarianceLine[];
}

export function InventoryVarianceList({ lines }: InventoryVarianceListProps) {
  if (lines.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Aucun ecart detecte.</p>
      </div>
    );
  }

  const totalEcart = lines.reduce((sum, l) => sum + (l.quantiteReelle - l.quantiteTheorique), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Ecarts d'inventaire
        </h3>
        <span className="text-sm text-muted-foreground">
          {lines.length} article(s) — Ecart total : {totalEcart > 0 ? '+' : ''}{totalEcart}
        </span>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Article</th>
              <th className="text-right px-4 py-2 font-medium">Theorique</th>
              <th className="text-right px-4 py-2 font-medium">Reel</th>
              <th className="text-right px-4 py-2 font-medium">Ecart</th>
              <th className="text-left px-4 py-2 font-medium">Commentaire</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {lines.map((line) => {
              const ecart = line.quantiteReelle - line.quantiteTheorique;
              return (
                <tr key={line.stockItemId} className="hover:bg-accent/50">
                  <td className="px-4 py-2.5">
                    <p className="font-medium">{line.name}</p>
                    <p className="text-xs text-muted-foreground">{line.code}</p>
                  </td>
                  <td className="px-4 py-2.5 text-right">{line.quantiteTheorique}</td>
                  <td className="px-4 py-2.5 text-right font-semibold">{line.quantiteReelle}</td>
                  <td className="px-4 py-2.5 text-right">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 font-medium',
                        ecart > 0 ? 'text-green-600' : ecart < 0 ? 'text-red-600' : 'text-muted-foreground'
                      )}
                    >
                      {ecart > 0 ? <TrendingUp className="w-3 h-3" /> : ecart < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                      {ecart > 0 ? '+' : ''}{ecart}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{line.commentaire || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
