import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeModalProps {
  open: boolean;
  code?: string;
  name?: string;
  onClose: () => void;
}

export const QRCodeModal = memo(function QRCodeModal({ open, code, name, onClose }: QRCodeModalProps) {
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
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-bg-elevated border border-[rgba(90,94,117,0.3)] rounded-xl shadow-card-hover pointer-events-auto w-full max-w-sm overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-[rgba(90,94,117,0.2)]">
                <h3 className="text-base font-semibold text-text-primary">QR Code</h3>
                <button onClick={onClose} className="p-1 rounded-md hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 flex flex-col items-center gap-4">
                {name && <p className="text-sm font-medium text-text-primary text-center">{name}</p>}
                {code && (
                  <div className="p-4 bg-white rounded-lg">
                    <QRCodeSVG value={code} size={200} level="H" />
                  </div>
                )}
                <p className="text-xs font-mono text-text-secondary">{code}</p>

                <div className="flex items-center gap-2 w-full">
                  <button className="flex-1 btn-ghost h-9 text-sm flex items-center justify-center gap-1.5">
                    <Printer className="w-4 h-4" />
                    Imprimer
                  </button>
                  <button className="flex-1 btn-secondary h-9 text-sm flex items-center justify-center gap-1.5">
                    <Download className="w-4 h-4" />
                    Télécharger
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
