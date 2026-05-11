import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, FileText, Download, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_URL;

const DOCS = [
  { label: 'Fiche technicien (PDF)', url: `${API_URL}/documents/fiches/technicien`, icon: FileText },
  { label: 'Fiche opérateur (PDF)', url: `${API_URL}/documents/fiches/operateur`, icon: FileText },
  { label: 'Documentation admin (PDF)', url: `${API_URL}/documents/fiches/admin`, icon: BookOpen },
];

export function HelpButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn('p-2 rounded-md hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors', className)}
        title="Aide"
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[600] bg-black/50 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="fixed inset-0 z-[601] flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="bg-bg-elevated border border-[rgba(90,94,117,0.2)] rounded-2xl shadow-xl w-full max-w-md pointer-events-auto overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-[rgba(90,94,117,0.1)]">
                  <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-accent-teal" />
                    Centre d'aide
                  </h3>
                  <button onClick={() => setOpen(false)} className="p-1 rounded-md hover:bg-bg-hover text-text-muted">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 space-y-3">
                  <p className="text-sm text-text-secondary">Téléchargez les fiches procédures et la documentation :</p>
                  {DOCS.map((doc) => (
                    <a
                      key={doc.label}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl bg-bg-primary border border-[rgba(90,94,117,0.1)] hover:bg-bg-hover transition-colors group"
                    >
                      <doc.icon className="w-5 h-5 text-accent-teal" />
                      <span className="flex-1 text-sm text-text-primary">{doc.label}</span>
                      <Download className="w-4 h-4 text-text-muted group-hover:text-text-primary transition-colors" />
                    </a>
                  ))}
                </div>

                <div className="p-4 border-t border-[rgba(90,94,117,0.1)] bg-bg-primary/50">
                  <p className="text-xs text-text-muted">
                    Version 1.0.0 — Support : admin@simply-gmao.local
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
