/**
 * =============================================================================
 * InventoryScanner — Inventaire mobile (scan QR + saisie quantite reelle)
 * =============================================================================
 */

import { useState } from 'react';
import { ScanLine, Plus, X, Package, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QRScanner } from '@/components/qr/QRScanner';
import { useStockInventory } from '@/hooks/useStockInventory';
import { apiGet } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function InventoryScanner() {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const { lines, addLine, updateQuantity, removeLine, submitInventory } = useStockInventory();

  const handleScan = async (decoded: string) => {
    setScannerOpen(false);
    // decoded peut etre une URL ou un code brut
    const idMatch = decoded.match(/stock-items\/([a-f0-9-]+)/i);
    const id = idMatch ? idMatch[1] : decoded;
    await fetchItem(id);
  };

  const fetchItem = async (idOrCode: string) => {
    try {
      // Essayer par ID puis par code
      let res = await apiGet(`/stock-items/${idOrCode}`).catch(() => null);
      if (!res) {
        const listRes = await apiGet(`/stock-items?search=${encodeURIComponent(idOrCode)}&limit=1`);
        if (listRes.data?.length > 0) {
          res = { data: listRes.data[0] };
        }
      }
      if (!res?.data) {
        toast.error('Article introuvable');
        return;
      }
      const item = res.data;
      addLine({
        stockItemId: item.id,
        code: item.code,
        name: item.name,
        quantiteTheorique: Number(item.quantite),
      });
      toast.success(`${item.code} ajoute`);
    } catch {
      toast.error('Erreur recherche article');
    }
  };

  const handleManual = () => {
    if (!manualCode.trim()) return;
    fetchItem(manualCode.trim());
    setManualCode('');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={() => setScannerOpen(true)} className="flex-1">
          <ScanLine className="w-4 h-4 mr-2" />
          Scanner QR article
        </Button>
        <div className="flex gap-2 flex-1">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleManual()}
            placeholder="Code article manuel"
            className="flex-1 px-3 py-2 rounded-md border bg-background text-sm"
          />
          <Button variant="secondary" onClick={handleManual}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {lines.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
          <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Scannez un QR code ou saisissez un code article</p>
        </div>
      ) : (
        <div className="space-y-2">
          {lines.map((line) => (
            <div
              key={line.stockItemId}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border bg-card',
                line.quantiteReelle !== undefined && line.quantiteReelle !== line.quantiteTheorique
                  ? 'border-amber-300 bg-amber-50/50 dark:bg-amber-950/20'
                  : 'border-border'
              )}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{line.name}</p>
                <p className="text-xs text-muted-foreground">
                  {line.code} — Theorique : {line.quantiteTheorique}
                </p>
              </div>
              <input
                type="number"
                value={line.quantiteReelle ?? ''}
                onChange={(e) => updateQuantity(line.stockItemId, Number(e.target.value))}
                placeholder="Reel"
                className="w-20 px-2 py-1.5 rounded-md border bg-background text-sm text-center"
              />
              <button
                onClick={() => removeLine(line.stockItemId)}
                className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          <Button
            onClick={() => submitInventory.mutate({ lines })}
            disabled={submitInventory.isPending || lines.length === 0}
            className="w-full"
          >
            <Save className="w-4 h-4 mr-2" />
            Soumettre l'inventaire ({lines.length} ligne{lines.length > 1 ? 's' : ''})
          </Button>
        </div>
      )}

      {scannerOpen && <QRScanner onScan={handleScan} onClose={() => setScannerOpen(false)} />}
    </div>
  );
}
