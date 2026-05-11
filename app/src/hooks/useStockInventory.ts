/**
 * =============================================================================
 * useStockInventory — Hooks pour inventaire physique mobile
 * =============================================================================
 */

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPost } from '@/lib/api';
import { toast } from 'sonner';

export interface InventoryLine {
  stockItemId: string;
  code: string;
  name: string;
  quantiteTheorique: number;
  quantiteReelle?: number;
  commentaire?: string;
}

export function useStockInventory() {
  const [lines, setLines] = useState<InventoryLine[]>([]);
  const qc = useQueryClient();

  const addLine = useCallback((line: InventoryLine) => {
    setLines((prev) => {
      const existing = prev.findIndex((l) => l.stockItemId === line.stockItemId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], ...line };
        return updated;
      }
      return [...prev, line];
    });
  }, []);

  const removeLine = useCallback((stockItemId: string) => {
    setLines((prev) => prev.filter((l) => l.stockItemId !== stockItemId));
  }, []);

  const updateQuantity = useCallback((stockItemId: string, quantiteReelle: number) => {
    setLines((prev) =>
      prev.map((l) => (l.stockItemId === stockItemId ? { ...l, quantiteReelle } : l))
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const variance = lines.filter((l) => l.quantiteReelle !== undefined && l.quantiteReelle !== l.quantiteTheorique);

  const submitInventory = useMutation({
    mutationFn: async (data: { lines: InventoryLine[] }) => {
      // Creer des mouvements AJUSTEMENT pour chaque ecart
      for (const line of data.lines) {
        if (line.quantiteReelle === undefined) continue;
        await apiPost('/stock/movements', {
          stockItemId: line.stockItemId,
          type: 'AJUSTEMENT',
          quantite: line.quantiteReelle,
          commentaire: line.commentaire || `Inventaire : ajustement ${line.quantiteTheorique} -> ${line.quantiteReelle}`,
        });
      }
    },
    onSuccess: () => {
      toast.success('Inventaire soumis avec succes');
      qc.invalidateQueries({ queryKey: ['stock-items'] });
      clear();
    },
    onError: (err: any) => toast.error(err.message || 'Erreur inventaire'),
  });

  return {
    lines,
    variance,
    addLine,
    removeLine,
    updateQuantity,
    clear,
    submitInventory,
  };
}
