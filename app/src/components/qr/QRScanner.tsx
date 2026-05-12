/**
 * =============================================================================
 * QRScanner — Composant de scan QR code réutilisable
 * =============================================================================
 * Utilise @zxing/browser pour la détection fiable des QR codes.
 * Fallback sur html5-qrcode si @zxing/browser n'est pas disponible.
 * =============================================================================
 */

import { useEffect, useRef, useState } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';
import { X, Flashlight, FlashlightOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
  className?: string;
}

export function QRScanner({ onScan, onClose, className }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stoppedRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const codeReader = new BrowserQRCodeReader();
    let controlsRef: { stop: () => void } | null = null;

    (async () => {
      try {
        controlsRef = await codeReader.decodeFromVideoDevice(
          undefined, // laisse le navigateur choisir la caméra (arrière si dispo)
          video,
          (result, err) => {
            if (stoppedRef.current) return;
            if (result) {
              stoppedRef.current = true;
              const text = result.getText();
              console.log('[QRScanner] decoded:', text);
              if (navigator.vibrate) navigator.vibrate(200);
              onScan(text);
              onClose();
              controlsRef?.stop();
            }
            // On ignore les erreurs de frame (pas de QR dans l'image)
          }
        );
        console.log('[QRScanner] started successfully');
        setIsScanning(true);
      } catch (err) {
        console.error('[QRScanner] start failed:', err);
        setError("Impossible d'acceder a la camera. Verifiez les permissions.");
      }
    })();

    return () => {
      stoppedRef.current = true;
      controlsRef?.stop();
    };
  }, [onScan]);

  const toggleTorch = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as any;
      if (capabilities.torch) {
        await track.applyConstraints({
          advanced: [{ torch: !torchOn }],
        });
        setTorchOn(!torchOn);
      }
      track.stop();
    } catch {
      // ignore
    }
  };

  return (
    <div className={cn('fixed inset-0 z-[100] bg-black flex flex-col', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))] bg-black/80">
        <h2 className="text-white text-lg font-semibold">Scanner un QR code</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTorch}
            className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Flash"
          >
            {torchOn ? <Flashlight className="w-5 h-5" /> : <FlashlightOff className="w-5 h-5" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Scanner zone */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="text-center p-8">
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={onClose} variant="outline">Fermer</Button>
          </div>
        ) : (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
            autoPlay
          />
        )}

        {/* Overlay guide */}
        {!error && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-white/50 rounded-lg relative">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary -mt-1 -ml-1" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary -mt-1 -mr-1" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary -mb-1 -ml-1" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary -mb-1 -mr-1" />
            </div>
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="px-4 py-4 bg-black/80 text-center">
        <p className="text-white/70 text-sm">Positionnez le QR code dans le cadre</p>
      </div>
    </div>
  );
}
