import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Eye, Download, Trash2, Plus, Loader2, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useDocuments, useDeleteDocument, useUploadDocument } from '@/hooks/useDocuments';
import { Button } from '@/components/ui/button';
import { API_URL } from '@/lib/config';
import { getAuthHeaders } from '@/lib/api';

interface Props {
  equipmentId: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function getFileCategory(originalName: string): 'pdf' | 'image' | 'other' {
  const ext = originalName.split('.').pop()?.toLowerCase() || '';
  if (ext === 'pdf') return 'pdf';
  if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) return 'image';
  return 'other';
}

export function DocumentPanel({ equipmentId }: Props) {
  const { data, isLoading } = useDocuments(equipmentId);
  const remove = useDeleteDocument();
  const upload = useUploadDocument();
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const docs = data?.data ?? [];

  /* Viewer integre */
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerName, setViewerName] = useState('');
  const [viewerType, setViewerType] = useState<'pdf' | 'image' | 'other'>('other');
  const [viewerLoading, setViewerLoading] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) upload.mutate({ file, equipmentId });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload.mutate({ file, equipmentId });
  };

  const openViewer = async (doc: any) => {
    setViewerLoading(true);
    setViewerOpen(true);
    setViewerName(doc.originalName);
    setViewerType(getFileCategory(doc.originalName));
    try {
      const res = await fetch(`${API_URL}/documents/${doc.id}/download`, {
        headers: { Authorization: getAuthHeaders().Authorization },
      });
      if (!res.ok) throw new Error('Erreur lors du chargement');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      setViewerUrl(url);
    } catch {
      toast.error("Impossible d'ouvrir le document");
      setViewerOpen(false);
    } finally {
      setViewerLoading(false);
    }
  };

  const closeViewer = () => {
    if (viewerUrl) {
      window.URL.revokeObjectURL(viewerUrl);
      setViewerUrl(null);
    }
    setViewerOpen(false);
  };

  const handleDownloadFromViewer = () => {
    if (!viewerUrl) return;
    const a = document.createElement('a');
    a.href = viewerUrl;
    a.download = viewerName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-accent-teal" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          'relative rounded-xl border-2 border-dashed p-6 text-center transition-all cursor-pointer',
          dragOver
            ? 'border-accent-teal bg-accent-teal/5'
            : 'border-[rgba(90,94,117,0.3)] bg-bg-elevated hover:border-[rgba(90,94,117,0.5)]'
        )}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp"
          className="hidden"
          onChange={handleFileChange}
        />
        <Plus className="w-6 h-6 mx-auto mb-2 text-text-muted" />
        <p className="text-sm font-medium text-text-primary">
          {upload.isPending ? 'Upload en cours...' : 'Glissez un document ou cliquez pour ajouter'}
        </p>
        <p className="text-xs text-text-muted mt-1">PDF, Word, Excel, images · 50 Mo max</p>
      </div>

      {upload.isError && (
        <div className="flex items-center gap-2 text-xs text-status-critical">
          <AlertCircle className="w-4 h-4" />
          <span>{(upload.error as Error)?.message || 'Erreur lors de l\'upload'}</span>
        </div>
      )}

      {/* Document list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {docs.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center gap-3 bg-bg-elevated rounded-xl border border-[rgba(90,94,117,0.2)] p-3 hover:bg-bg-hover transition-colors group"
          >
            <div className="w-10 h-10 rounded-lg bg-bg-primary flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-accent-teal" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate" title={doc.originalName}>
                {doc.originalName}
              </p>
              <p className="text-xs text-text-muted">
                {new Date(doc.uploadedAt).toLocaleDateString('fr-FR')} · {doc.uploader?.firstName} {doc.uploader?.lastName}
              </p>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                className="p-1.5 rounded-md hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors"
                title="Consulter"
                onClick={(e) => {
                  e.stopPropagation();
                  openViewer(doc);
                }}
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                className="p-1.5 rounded-md hover:bg-bg-hover text-text-muted hover:text-status-critical transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  remove.mutate({ id: doc.id, equipmentId });
                }}
                disabled={remove.isPending}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {docs.length === 0 && !upload.isPending && (
        <p className="text-sm text-text-muted text-center py-6">Aucun document pour cet équipement</p>
      )}

      {/* Viewer integre */}
      <AnimatePresence>
        {viewerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-[rgba(10,11,20,0.9)] backdrop-blur-sm flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(90,94,117,0.2)]">
              <p className="text-sm font-medium text-text-primary truncate max-w-[70%]">
                {viewerName}
              </p>
              <div className="flex items-center gap-2">
                {viewerType !== 'other' && (
                  <button
                    onClick={handleDownloadFromViewer}
                    className="p-2 rounded-md hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors"
                    title="Telecharger"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={closeViewer}
                  className="p-2 rounded-md hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
              {viewerLoading && (
                <div className="flex items-center gap-3 text-text-muted">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-sm">Chargement du document...</span>
                </div>
              )}

              {!viewerLoading && viewerType === 'pdf' && viewerUrl && (
                <iframe
                  src={viewerUrl}
                  className="w-full h-full rounded-lg border border-[rgba(90,94,117,0.2)]"
                  title={viewerName}
                />
              )}

              {!viewerLoading && viewerType === 'image' && viewerUrl && (
                <img
                  src={viewerUrl}
                  alt={viewerName}
                  className="max-w-full max-h-full object-contain rounded-lg border border-[rgba(90,94,117,0.2)]"
                />
              )}

              {!viewerLoading && viewerType === 'other' && (
                <div className="text-center space-y-4">
                  <FileText className="w-12 h-12 text-text-muted mx-auto" />
                  <p className="text-sm text-text-secondary">
                    Ce type de fichier ne peut pas etre affiche directement.
                  </p>
                  {viewerUrl && (
                    <Button onClick={handleDownloadFromViewer} className="btn-primary">
                      <Download className="w-4 h-4 mr-2" />
                      Telecharger le fichier
                    </Button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
