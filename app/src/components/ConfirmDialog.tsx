import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'warning',
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps) {
  const variantColors = {
    danger: 'text-status-critical',
    warning: 'text-status-warning',
    info: 'text-status-info',
  };

  const confirmBtnColors = {
    danger: 'bg-status-critical hover:brightness-110',
    warning: 'bg-status-warning hover:brightness-110',
    info: 'bg-accent-teal hover:brightness-110',
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-[rgba(10,11,20,0.75)] backdrop-blur-sm"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-md bg-bg-elevated border border-[rgba(90,94,117,0.3)] rounded-xl shadow-card-hover pointer-events-auto overflow-hidden">
              <div className="flex items-start gap-3 p-5 border-b border-[rgba(90,94,117,0.2)]">
                <AlertTriangle className={cn('w-5 h-5 mt-0.5 flex-shrink-0', variantColors[variant])} />
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-text-primary">{title}</h3>
                  {description && (
                    <p className="mt-1 text-sm text-text-secondary">{description}</p>
                  )}
                </div>
                <button
                  onClick={onCancel}
                  className="p-1 rounded-md hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {children && <div className="p-5">{children}</div>}
              <div className="flex items-center justify-end gap-2 p-4 border-t border-[rgba(90,94,117,0.2)]">
                <button
                  onClick={onCancel}
                  className="btn-ghost text-sm h-9 px-4"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={onConfirm}
                  className={cn('btn-primary text-sm h-9 px-4', confirmBtnColors[variant])}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
