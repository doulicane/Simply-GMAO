import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Trash2, Plus, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDocuments, useDeleteDocument, useUploadDocument } from '@/hooks/useDocuments';
import { Button } from '@/components/ui/button';

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

export function DocumentPanel({ equipmentId }: Props) {
  const { data, isLoading } = useDocuments(equipmentId);
  const remove = useDeleteDocument();
  const upload = useUploadDocument();
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const docs = data?.data ?? [];

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
              <a
                href={`${import.meta.env.VITE_API_URL}/uploads/${doc.path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-md hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Download className="w-4 h-4" />
              </a>
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
    </div>
  );
}
