import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ScanQrCode, Search, Check, AlertTriangle,
  AlertOctagon, ShieldAlert, Cog, Droplets, Paintbrush,
  Package, Flame, Wind, ChevronRight, Camera, Clock,
  CheckCircle, X, WifiOff, Wifi, TrendingUp, LogOut,
  Monitor,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useEquipmentStore } from '@/stores/equipmentStore';
import { useWorkOrderStore } from '@/stores/workOrderStore';
import { useTicketStore } from '@/stores/ticketStore';
import { useKioskMode } from '@/hooks/useKioskMode';
import { cn } from '@/lib/utils';
import type { Equipment, EquipmentType, Priority } from '@/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Step = 'scan' | 'zones' | 'machines' | 'declare' | 'success';
type PanneType = 'arret' | 'degradation';

interface OfflineDeclaration {
  id: string;
  equipmentId: string;
  equipmentName: string;
  panneType: PanneType;
  description: string;
  priority: Priority;
  timestamp: number;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const ZONE_CONFIG: { type: EquipmentType; label: string; icon: typeof Cog }[] = [
  { type: 'presse', label: 'Presses', icon: Cog },
  { type: 'laquage', label: 'Laquage', icon: Droplets },
  { type: 'serigraphie', label: 'Sérigraphie', icon: Paintbrush },
  { type: 'emballage', label: 'Emballage', icon: Package },
  { type: 'recuit', label: 'Recuit & Fours', icon: Flame },
  { type: 'compresseur', label: 'Air comprimé', icon: Wind },
  { type: 'four', label: 'Fours', icon: Flame },
  { type: 'decoupe', label: 'Découpe', icon: Cog },
  { type: 'convoyeur', label: 'Convoyeurs', icon: Package },
  { type: 'ventilation', label: 'Ventilation', icon: Wind },
  { type: 'electricite', label: 'Électricité', icon: Cog },
  { type: 'manutention', label: 'Manutention', icon: Package },
  { type: 'traitementEau', label: 'Traitement eau', icon: Droplets },
  { type: 'metrologie', label: 'Métrologie', icon: Cog },
  { type: 'controleQualite', label: 'Contrôle qualité', icon: Cog },
];

const QUICK_TAGS = [
  'Panne électrique', 'Panne mécanique', 'Panne hydraulique',
  'Fuite', 'Bruit anormal', 'Arrêt d\'urgence',
];

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'il y a moins d\'1h';
  if (hours < 24) return `il y a ${hours}h`;
  return `il y a ${Math.floor(hours / 24)}j`;
}

function autoPriority(eq: Equipment, panneType: PanneType): Priority {
  if (eq.criticality === 'critique' && panneType === 'arret') return 'P1';
  if (eq.criticality === 'critique' && panneType === 'degradation') return 'P2';
  if (eq.criticality === 'elevee' && panneType === 'arret') return 'P2';
  return 'P3';
}

function getPanneTypeColor(type: PanneType) {
  switch (type) {
    case 'arret': return { border: 'border-status-critical', bg: 'bg-status-critical/10', text: 'text-status-critical' };
    case 'degradation': return { border: 'border-status-warning', bg: 'bg-status-warning/10', text: 'text-status-warning' };
  }
}

function getPanneTypeLabel(type: PanneType) {
  switch (type) {
    case 'arret': return 'Arrêt production';
    case 'degradation': return 'Dégradation';
  }
}

function getPriorityLabel(p: Priority) {
  const map: Record<string, string> = { P1: 'URGENTE', P2: 'HAUTE', P3: 'MOYENNE', P4: 'BASSE' };
  return map[p] ?? p;
}

function getPriorityColor(p: Priority) {
  const map: Record<string, string> = { P1: 'text-status-critical', P2: 'text-status-warning', P3: 'text-accent-teal', P4: 'text-status-neutral' };
  return map[p] ?? 'text-text-secondary';
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function MinimalHeader({ onBack, title, onLogout, showBack, onKiosk, kiosk }: { onBack: () => void; title: string; onLogout: () => void; showBack: boolean; onKiosk?: () => void; kiosk?: boolean }) {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 z-50 bg-bg-elevated/95 backdrop-blur-md border-b border-[rgba(90,94,117,0.2)]">
      <div className="flex items-center justify-between h-full px-4">
        <div className="w-20">
          {showBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:inline">Retour</span>
            </button>
          )}
        </div>
        <h1 className="text-base font-semibold text-text-primary tracking-tight">
          {title}
        </h1>
        <div className="w-20 flex justify-end gap-1">
          {onKiosk && (
            <button
              onClick={onKiosk}
              className={cn('p-2 rounded-md transition-colors', kiosk ? 'bg-accent-teal/20 text-accent-teal' : 'hover:bg-bg-hover text-text-muted hover:text-text-primary')}
              title={kiosk ? 'Quitter le mode kiosque' : 'Mode kiosque'}
            >
              <Monitor className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onLogout}
            className="p-2 rounded-md hover:bg-bg-hover text-status-critical hover:text-status-critical transition-colors"
            title="Déconnexion"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

function OfflineBanner({ queueCount }: { queueCount: number }) {
  const [isOnline] = useState(() => navigator.onLine);
  if (isOnline && queueCount === 0) return null;
  return (
    <div className={cn(
      'flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium',
      isOnline ? 'bg-status-warning/10 text-status-warning' : 'bg-status-neutral/10 text-status-neutral'
    )}>
      {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
      {isOnline
        ? `${queueCount} déclaration(s) en attente de synchronisation`
        : 'Mode hors-ligne — Les déclarations seront synchronisées automatiquement'}
    </div>
  );
}

function QRScannerOverlay({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: (eq: Equipment) => void;
}) {
  const { equipment } = useEquipmentStore();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(false);

  const simulateScan = useCallback(() => {
    setScanning(true);
    setError(false);
    setTimeout(() => {
      setError(true);
      setScanning(false);
    }, 2000);
  }, []);

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[500] bg-bg-primary flex flex-col"
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-base font-semibold text-text-primary">Scanner un QR Code</span>
            <button onClick={onClose} className="p-2 rounded-md hover:bg-bg-hover text-text-primary">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Camera viewport */}
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="relative w-[80vw] max-w-[400px] aspect-square rounded-2xl overflow-hidden border-2 border-accent-teal/50">
              {/* Simulated camera bg */}
              <div className="absolute inset-0 bg-bg-input flex items-center justify-center">
                {!scanning && !error && (
                  <div className="text-center">
                    <ScanQrCode className="w-16 h-16 text-text-muted mx-auto mb-3" />
                    <p className="text-sm text-text-secondary">Simuler un scan</p>
                  </div>
                )}
                {scanning && (
                  <motion.div
                    animate={{ y: [0, 320, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                    className="absolute left-0 right-0 h-0.5 bg-accent-teal shadow-[0_0_12px_rgba(14,165,233,0.8)] z-10"
                  />
                )}
                {error && (
                  <div className="text-center animate-shake">
                    <AlertTriangle className="w-16 h-16 text-status-critical mx-auto mb-3" />
                    <p className="text-sm text-status-critical">QR non reconnu</p>
                  </div>
                )}
              </div>

              {/* Corner brackets */}
              <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-accent-teal rounded-tl-sm" />
              <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-accent-teal rounded-tr-sm" />
              <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-accent-teal rounded-bl-sm" />
              <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-accent-teal rounded-br-sm" />
            </div>
          </div>

          {/* Bottom bar */}
          <div className="px-6 pb-8 pt-4 text-center">
            <p className="text-sm text-text-secondary mb-4">
              Placez le QR code dans le cadre
            </p>
            {!scanning && (
              <div className="flex flex-col gap-3 max-w-xs mx-auto">
                <button
                  onClick={simulateScan}
                  className="btn-primary h-14 text-base w-full"
                >
                  Simuler scan (démo)
                </button>
                <button
                  onClick={onClose}
                  className="text-sm text-accent-teal hover:underline"
                >
                  Problèmes avec le scan ? Sélection manuelle
                </button>
              </div>
            )}
            {scanning && (
              <p className="text-sm text-accent-teal animate-pulse">Scan en cours...</p>
            )}
            {error && (
              <div className="flex gap-3 justify-center">
                <button onClick={simulateScan} className="btn-primary h-10 px-6">Réessayer</button>
                <button onClick={onClose} className="btn-secondary h-10 px-6">Saisie manuelle</button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SuccessScreen({
  ticketNumber,
  equipmentName,
  panneType,
  priority,
  onClose,
}: {
  ticketNumber: string;
  equipmentName: string;
  panneType: PanneType;
  priority: Priority;
  onClose: () => void;
}) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number] }}
      className="flex-1 flex flex-col items-center justify-center px-6 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.15, duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number] }}
      >
        <CheckCircle className="w-20 h-20 text-status-ok mb-6" />
      </motion.div>
      <h2 className="text-xl font-bold text-text-primary mb-2">Panne déclarée avec succès</h2>
      <p className="text-2xl font-mono font-bold text-accent-teal mb-4">{ticketNumber}</p>
      <div className="bg-bg-elevated rounded-xl p-4 w-full max-w-sm mb-8 text-left space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-text-secondary">Machine</span>
          <span className="text-sm font-medium text-text-primary">{equipmentName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-text-secondary">Type</span>
          <span className="text-sm font-medium text-text-primary">{getPanneTypeLabel(panneType)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-text-secondary">Priorité</span>
          <span className={cn('text-sm font-bold', getPriorityColor(priority))}>{getPriorityLabel(priority)}</span>
        </div>
      </div>
      <button
        onClick={() => { onClose(); navigate('/'); }}
        className="btn-primary h-14 px-8 text-base w-full max-w-sm"
      >
        Retour au tableau de bord
      </button>
      <p className="text-xs text-text-muted mt-3">Redirection automatique dans 5 secondes...</p>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function PortailOperateur() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { equipment, fetchEquipment } = useEquipmentStore();
  const { workOrders, fetchWorkOrders } = useWorkOrderStore();
  const { createTicket } = useTicketStore();
  const { kiosk, enterKiosk, exitKiosk } = useKioskMode();

  useEffect(() => {
    fetchEquipment();
    fetchWorkOrders();
  }, [fetchEquipment, fetchWorkOrders]);

  useEffect(() => {
    const handler = () => {
      setStep('scan');
      setSelectedZone(null);
      setSelectedEquipment(null);
      setPanneType(null);
      setDescription('');
      setPhotos([]);
    };
    window.addEventListener('kiosk:reset' as any, handler);
    return () => window.removeEventListener('kiosk:reset' as any, handler);
  }, []);

  const [step, setStep] = useState<Step>('scan');
  const [selectedZone, setSelectedZone] = useState<EquipmentType | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [panneType, setPanneType] = useState<PanneType | null>(null);
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [qrOpen, setQrOpen] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<OfflineDeclaration[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const zoneEquipment = selectedZone
    ? equipment.filter((e) => e.type === selectedZone)
    : [];

  const recentDeclarations = workOrders
    .filter((wo) => wo.requestedBy === user?.name)
    .slice(0, 5);

  const openWoForEquipment = selectedEquipment
    ? workOrders.find((wo) => wo.equipmentId === selectedEquipment.id && ['draft', 'planned', 'in_progress', 'waiting_parts'].includes(wo.status))
    : undefined;

  const handleQrSuccess = useCallback((eq: Equipment) => {
    setQrOpen(false);
    setSelectedEquipment(eq);
    setStep('declare');
  }, []);

  const handleZoneSelect = (zone: EquipmentType) => {
    setSelectedZone(zone);
    setStep('machines');
  };

  const handleMachineSelect = (eq: Equipment) => {
    setSelectedEquipment(eq);
    setStep('declare');
  };

  const handleBack = () => {
    if (step === 'declare') { setStep('scan'); setSelectedEquipment(null); setPanneType(null); setDescription(''); setPhotos([]); }
    else if (step === 'success') { setStep('scan'); setSelectedEquipment(null); setPanneType(null); setDescription(''); setPhotos([]); }
    // Au step 'scan', le bouton Retour déclenche la déconnexion
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleTagClick = (tag: string) => {
    setDescription((prev) => {
      const trimmed = prev.trim();
      if (trimmed.includes(tag)) return prev;
      return trimmed ? `${trimmed}, ${tag}` : tag;
    });
  };

  const handlePhotoAdd = () => {
    // Simulate photo attachment
    setPhotos((prev) => [...prev, `photo_${Date.now()}`]);
  };

  const handleSubmit = async () => {
    if (!selectedEquipment || !panneType) return;
    setIsSubmitting(true);

    const priority = autoPriority(selectedEquipment, panneType);
    const priorityMap: Record<Priority, string> = { P1: 'URGENTE', P2: 'HAUTE', P3: 'MOYENNE', P4: 'BASSE' };

    const ticket = await createTicket({
      title: `${getPanneTypeLabel(panneType)} — ${selectedEquipment.name}`,
      description: [getPanneTypeLabel(panneType), description].filter(Boolean).join(' | '),
      equipmentCode: selectedEquipment.code,
      priority: priorityMap[priority] as any,
    });

    if (ticket) {
      setTicketNumber(ticket.numero);
      setIsSubmitting(false);
      setStep('success');
    } else {
      setIsSubmitting(false);
    }
  };

  const priority = selectedEquipment && panneType
    ? autoPriority(selectedEquipment, panneType)
    : null;

  const submitBtnColor = priority === 'P1' ? 'bg-status-critical' : priority === 'P2' ? 'bg-status-warning' : 'bg-accent-teal';

  return (
    <div className="h-[100dvh] flex flex-col bg-bg-primary overflow-hidden">
      <MinimalHeader onBack={handleBack} title="PORTAIL OPÉRATEUR" onLogout={handleLogout} showBack={step !== 'scan'} onKiosk={kiosk ? exitKiosk : enterKiosk} kiosk={kiosk} />

      <main className="flex-1 pt-14 overflow-y-auto">
        <OfflineBanner queueCount={offlineQueue.length} />

        <AnimatePresence mode="wait">
          {/* ========== SCAN STEP ========== */}
          {step === 'scan' && (
            <motion.div
              key="scan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center px-5 py-8 max-w-md mx-auto"
            >
              {/* QR Scan Button */}
              <button
                onClick={() => setQrOpen(true)}
                className={cn(
                  'relative flex flex-col items-center justify-center w-[280px] h-[280px] sm:w-[240px] sm:h-[240px]',
                  'rounded-3xl border-2 border-dashed border-accent-teal/50',
                  'bg-bg-elevated',
                  'transition-all duration-200',
                  'hover:border-accent-teal hover:bg-accent-teal-glow hover:scale-[1.02]',
                  'active:scale-[0.97]'
                )}
                style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.08) 0%, transparent 100%)' }}
              >
                <ScanQrCode className="w-16 h-16 text-accent-teal mb-4" />
                <span className="text-base font-bold text-accent-teal uppercase tracking-wide text-center leading-tight">
                  Scanner le<br />QR Code
                </span>
                <span className="text-[13px] text-text-secondary mt-2">Appuyez pour scanner</span>
              </button>

              <div className="flex items-center gap-4 my-8 w-full max-w-[320px]">
                <div className="flex-1 h-px bg-[rgba(90,94,117,0.3)]" />
                <span className="text-xs text-text-muted uppercase tracking-wider">ou</span>
                <div className="flex-1 h-px bg-[rgba(90,94,117,0.3)]" />
              </div>

              {/* Accordion — Sélectionner une machine */}
              <div className="w-full max-w-[320px]">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="select-machine" className="border-0">
                    <AccordionTrigger className="flex items-center justify-center h-14 px-6 bg-bg-elevated border border-[rgba(90,94,117,0.3)] rounded-xl text-text-primary font-medium hover:bg-bg-hover hover:border-accent-teal/40 transition-all hover:no-underline">
                      <span>Sélectionner une machine</span>
                    </AccordionTrigger>
                    <AccordionContent className="mt-2 space-y-2">
                      {ZONE_CONFIG.map((zone) => {
                        const Icon = zone.icon;
                        const zoneEqs = equipment.filter((e) => e.type === zone.type);
                        return (
                          <div key={zone.type} className="rounded-xl border border-[rgba(90,94,117,0.2)] overflow-hidden">
                            <div className="flex items-center gap-2 px-3 py-2 bg-bg-elevated">
                              <Icon className="w-4 h-4 text-accent-teal" />
                              <span className="text-xs font-semibold text-text-primary">{zone.label}</span>
                              <span className="text-[10px] text-text-muted ml-auto">{zoneEqs.length} machines</span>
                            </div>
                            <div className="divide-y divide-[rgba(90,94,117,0.1)]">
                              {zoneEqs.map((eq) => {
                                const statusColor = eq.status === 'running' ? 'bg-status-ok' : eq.status === 'breakdown' ? 'bg-status-critical' : 'bg-status-warning';
                                return (
                                  <button
                                    key={eq.id}
                                    onClick={() => handleMachineSelect(eq)}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-bg-hover transition-colors"
                                  >
                                    <span className={cn('w-2 h-2 rounded-full flex-shrink-0', statusColor)} />
                                    <span className="text-xs text-text-primary truncate">{eq.name}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              {/* Historique supprimé */}
            </motion.div>
          )}

          {/* ========== ZONES STEP ========== */}
          {step === 'zones' && (
            <motion.div
              key="zones"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="px-5 py-6 max-w-lg mx-auto"
            >
              <h2 className="text-lg font-semibold text-text-primary mb-5">Choisir une zone</h2>
              <div className="grid grid-cols-2 gap-3">
                {ZONE_CONFIG.map((zone) => {
                  const Icon = zone.icon;
                  const count = equipment.filter((e) => e.type === zone.type).length;
                  return (
                    <button
                      key={zone.type}
                      onClick={() => handleZoneSelect(zone.type)}
                      className={cn(
                        'flex flex-col items-center justify-center gap-2 min-h-[80px] p-4',
                        'rounded-xl bg-bg-elevated border border-[rgba(90,94,117,0.2)]',
                        'hover:border-accent-teal/40 hover:bg-accent-teal-glow transition-all active:scale-[0.98]'
                      )}
                    >
                      <Icon className="w-6 h-6 text-accent-teal" />
                      <span className="text-sm font-semibold text-text-primary">{zone.label}</span>
                      <span className="text-[11px] text-text-muted">{count} machines</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ========== MACHINES STEP ========== */}
          {step === 'machines' && selectedZone && (
            <motion.div
              key="machines"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="px-5 py-6 max-w-lg mx-auto"
            >
              <h2 className="text-lg font-semibold text-text-primary mb-2">
                {ZONE_CONFIG.find((z) => z.type === selectedZone)?.label}
              </h2>
              <p className="text-sm text-text-secondary mb-5">Choisir une machine</p>
              <div className="space-y-2">
                {zoneEquipment.map((eq) => {
                  const statusColor = eq.status === 'running' ? 'bg-status-ok' : eq.status === 'breakdown' ? 'bg-status-critical' : 'bg-status-warning';
                  const lastBreakdown = workOrders
                    .filter((wo) => wo.equipmentId === eq.id && wo.type === 'corrective')
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
                  return (
                    <button
                      key={eq.id}
                      onClick={() => handleMachineSelect(eq)}
                      className={cn(
                        'flex items-center gap-3 w-full p-4 min-h-[72px]',
                        'rounded-xl bg-bg-elevated border border-[rgba(90,94,117,0.2)]',
                        'hover:border-accent-teal/40 hover:bg-bg-hover transition-all active:scale-[0.99] text-left'
                      )}
                    >
                      <span className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', statusColor)} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text-primary truncate">{eq.name}</p>
                        <p className="text-xs text-text-secondary">{eq.line} — {eq.location}</p>
                        {lastBreakdown && (
                          <p className="text-[11px] text-status-warning mt-0.5">
                            Dernière panne : {formatTimeAgo(lastBreakdown.createdAt)}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-text-muted flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ========== DECLARE STEP ========== */}
          {step === 'declare' && selectedEquipment && (
            <motion.div
              key="declare"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="px-5 py-6 max-w-lg mx-auto pb-28"
            >
              {/* Machine info */}
              <div className="bg-bg-elevated rounded-xl p-4 border border-[rgba(90,94,117,0.2)] mb-6">
                <div className="flex items-start gap-3">
                  <span className={cn(
                    'w-3 h-3 rounded-full mt-1 flex-shrink-0',
                    selectedEquipment.status === 'running' ? 'bg-status-ok' : selectedEquipment.status === 'breakdown' ? 'bg-status-critical' : 'bg-status-warning'
                  )} />
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-text-primary">{selectedEquipment.name}</h3>
                    <p className="text-xs text-text-secondary">{selectedEquipment.manufacturer} / {selectedEquipment.line} / {selectedEquipment.location}</p>
                    <span className={cn(
                      'inline-flex items-center mt-1.5 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide',
                      selectedEquipment.status === 'running' ? 'bg-[rgba(34,197,94,0.12)] text-status-ok border border-[rgba(34,197,94,0.3)]' :
                      selectedEquipment.status === 'breakdown' ? 'bg-[rgba(239,68,68,0.12)] text-status-critical border border-[rgba(239,68,68,0.3)]' :
                      'bg-[rgba(245,158,11,0.12)] text-status-warning border border-[rgba(245,158,11,0.3)]'
                    )}>
                      {selectedEquipment.status === 'running' ? 'En service' : selectedEquipment.status === 'breakdown' ? 'En panne' : 'En maintenance'}
                    </span>
                  </div>
                </div>
                {openWoForEquipment && (
                  <div className="mt-3 p-3 rounded-lg bg-status-warning/10 border border-status-warning/20">
                    <p className="text-xs text-status-warning flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Un BT est déjà ouvert pour cette machine — <span className="font-mono font-semibold">{openWoForEquipment.number}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Panne type cards */}
              <label className="block text-xs font-medium text-text-secondary uppercase tracking-wide mb-3">
                Type de panne
              </label>
              <div className="grid grid-cols-3 gap-2 mb-6">
                {(['arret', 'degradation'] as PanneType[]).map((type) => {
                  const colors = getPanneTypeColor(type);
                  const Icon = type === 'arret' ? AlertOctagon : type === 'degradation' ? AlertTriangle : ShieldAlert;
                  const selected = panneType === type;
                  return (
                    <button
                      key={type}
                      onClick={() => setPanneType(type)}
                      className={cn(
                        'flex flex-col items-center justify-center gap-2 p-3 rounded-xl min-h-[100px]',
                        'border-2 transition-all duration-150',
                        selected
                          ? cn(colors.border, colors.bg)
                          : 'border-[rgba(90,94,117,0.2)] bg-bg-elevated hover:bg-bg-hover',
                        'active:scale-[0.98]'
                      )}
                    >
                      <Icon className={cn('w-7 h-7', selected ? colors.text : 'text-text-muted')} />
                      <span className={cn('text-xs font-semibold text-center leading-tight', selected ? colors.text : 'text-text-secondary')}>
                        {getPanneTypeLabel(type)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Description */}
              <label className="block text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">
                Description <span className="normal-case text-text-muted">(optionnel)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 280))}
                placeholder="Décrivez brièvement la panne..."
                className="w-full min-h-[100px] p-3 bg-bg-input border border-[rgba(90,94,117,0.3)] rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-teal focus:shadow-glow resize-none mb-2"
              />
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] text-text-muted">{description.length}/280</span>
              </div>

              {/* Quick tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {QUICK_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={cn(
                      'px-3 py-1.5 rounded-2xl text-xs font-medium',
                      'bg-bg-hover text-text-secondary border border-[rgba(90,94,117,0.2)]',
                      'hover:text-text-primary hover:border-accent-teal/30 transition-colors'
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Photo attachment */}
              <label className="block text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">
                Photos
              </label>
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={handlePhotoAdd}
                  className="flex items-center gap-2 h-12 px-4 bg-bg-hover border border-dashed border-[rgba(90,94,117,0.3)] rounded-xl text-text-secondary hover:text-text-primary hover:border-accent-teal/40 transition-colors"
                >
                  <Camera className="w-5 h-5" />
                  <span className="text-sm">Ajouter une photo</span>
                </button>
                {photos.length > 0 && (
                  <span className="text-xs text-accent-teal font-medium">{photos.length} photo(s)</span>
                )}
              </div>

              {/* Auto priority */}
              {priority && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-bg-elevated border border-[rgba(90,94,117,0.2)] mb-8">
                  <span className="text-sm text-text-secondary">Priorité auto</span>
                  <span className={cn('text-sm font-bold', getPriorityColor(priority))}>
                    {getPriorityLabel(priority)}
                  </span>
                </div>
              )}

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={!panneType || isSubmitting}
                className={cn(
                  'w-full h-16 rounded-xl text-base font-bold uppercase tracking-wide text-white',
                  'transition-all duration-150 active:scale-[0.98]',
                  panneType ? submitBtnColor : 'bg-bg-hover text-text-muted cursor-not-allowed'
                )}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Clock className="w-5 h-5 animate-spin" />
                    Traitement...
                  </span>
                ) : (
                  <span>Déclarer la panne</span>
                )}
              </button>
            </motion.div>
          )}

          {/* ========== SUCCESS STEP ========== */}
          {step === 'success' && selectedEquipment && panneType && priority && (
            <SuccessScreen
              ticketNumber={ticketNumber}
              equipmentName={selectedEquipment.name}
              panneType={panneType}
              priority={priority}
              onClose={handleBack}
            />
          )}
        </AnimatePresence>
      </main>

      {/* QR Scanner Overlay */}
      <QRScannerOverlay
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        onSuccess={handleQrSuccess}
      />
    </div>
  );
}
