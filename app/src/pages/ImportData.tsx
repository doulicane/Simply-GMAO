import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { API_URL } from '@/lib/config';

interface ImportResult {
  type: string;
  dryRun: boolean;
  totalRows: number;
  imported: number;
  errors: number;
  details: { row: number; message: string }[];
}

export default function ImportData() {
  const [file, setFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<'equipments' | 'stock-items'>('equipments');
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const runImport = async (dryRun: boolean) => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', importType);
    formData.append('dryRun', String(dryRun));

    try {
      const res = await fetch(`${API_URL}/import`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: formData,
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Erreur lors de l\'import');
      }
      setResult(json.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Import de données</h1>
        <p className="text-sm text-text-secondary mt-1">
          Importez vos équipements ou articles de stock depuis un fichier Excel ou CSV.
        </p>
      </div>

      {/* Type selector */}
      <div className="flex gap-3">
        <button
          onClick={() => setImportType('equipments')}
          className={cn(
            'flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all',
            importType === 'equipments'
              ? 'border-accent-teal bg-accent-teal/10 text-accent-teal'
              : 'border-[rgba(90,94,117,0.2)] bg-bg-elevated text-text-secondary hover:text-text-primary'
          )}
        >
          Équipements
        </button>
        <button
          onClick={() => setImportType('stock-items')}
          className={cn(
            'flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all',
            importType === 'stock-items'
              ? 'border-accent-teal bg-accent-teal/10 text-accent-teal'
              : 'border-[rgba(90,94,117,0.2)] bg-bg-elevated text-text-secondary hover:text-text-primary'
          )}
        >
          Articles de stock
        </button>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          'relative rounded-xl border-2 border-dashed p-10 text-center transition-all',
          dragOver
            ? 'border-accent-teal bg-accent-teal/5'
            : 'border-[rgba(90,94,117,0.3)] bg-bg-elevated'
        )}
      >
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <FileSpreadsheet className="w-10 h-10 mx-auto mb-3 text-text-muted" />
        <p className="text-sm font-medium text-text-primary">
          {file ? file.name : 'Glissez un fichier ou cliquez pour parcourir'}
        </p>
        <p className="text-xs text-text-muted mt-1">CSV, XLS ou XLSX · 10 Mo max</p>
      </div>

      {/* Template download */}
      <div className="flex items-center gap-2 text-xs text-text-muted">
        <Download className="w-3.5 h-3.5" />
        <span>Télécharger un modèle :</span>
        <button
          onClick={() => {
            const headers = importType === 'equipments'
              ? 'code,name,type,criticality,localisation,ligne\nEX-001,Example Machine,Type A,CRITIQUE,Zone A,LIGNE-A'
              : 'code,name,famille,quantite,stockMinimum,localisation,unite,prixUnitaire\nART-001,Example Article,Type A,10,5,Zone A,piece,12.50';
            const blob = new Blob([headers], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `modele-${importType}.csv`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="text-accent-teal hover:underline"
        >
          modèle-{importType}.csv
        </button>
      </div>

      {/* Actions */}
      {file && (
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => runImport(true)}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <AlertCircle className="w-4 h-4 mr-1" />}
            Simulation (dry-run)
          </Button>
          <Button
            onClick={() => runImport(false)}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Upload className="w-4 h-4 mr-1" />}
            Importer
          </Button>
        </div>
      )}

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-status-critical/30 bg-status-critical/10 p-4 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-status-critical flex-shrink-0 mt-0.5" />
          <p className="text-sm text-status-critical">{error}</p>
        </motion.div>
      )}

      {/* Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-[rgba(90,94,117,0.2)] bg-bg-elevated p-5 space-y-4"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-status-ok" />
            <h3 className="text-sm font-semibold text-text-primary">
              {result.dryRun ? 'Simulation terminée' : 'Import terminé'}
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-bg-primary border border-[rgba(90,94,117,0.1)] p-3 text-center">
              <p className="text-xl font-bold text-text-primary">{result.totalRows}</p>
              <p className="text-[11px] text-text-secondary uppercase">Lignes lues</p>
            </div>
            <div className="rounded-lg bg-bg-primary border border-[rgba(90,94,117,0.1)] p-3 text-center">
              <p className="text-xl font-bold text-status-ok">{result.imported}</p>
              <p className="text-[11px] text-text-secondary uppercase">Importées</p>
            </div>
            <div className="rounded-lg bg-bg-primary border border-[rgba(90,94,117,0.1)] p-3 text-center">
              <p className="text-xl font-bold text-status-critical">{result.errors}</p>
              <p className="text-[11px] text-text-secondary uppercase">Erreurs</p>
            </div>
          </div>

          {result.details.length > 0 && (
            <div className="max-h-60 overflow-y-auto rounded-lg border border-[rgba(90,94,117,0.1)] bg-bg-primary">
              <table className="w-full text-xs">
                <thead className="bg-bg-elevated sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2 text-text-secondary font-medium">Ligne</th>
                    <th className="text-left px-3 py-2 text-text-secondary font-medium">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {result.details.map((d, i) => (
                    <tr key={i} className="border-t border-[rgba(90,94,117,0.05)]">
                      <td className="px-3 py-2 text-text-primary tabular-nums">{d.row}</td>
                      <td className="px-3 py-2 text-status-critical">{d.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
