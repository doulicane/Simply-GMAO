import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ScanLine, Plus, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDataStore } from '@/stores/dataStore';
import { useEquipmentStore } from '@/stores/equipmentStore';
import type { Equipment } from '@/types';
import type { TreeNode, ViewMode, EquipmentFilters } from '@/components/equipements/types';
import { EquipmentTree } from '@/components/equipements/EquipmentTree';
import { EquipmentDetail } from '@/components/equipements/EquipmentDetail';
import { EquipmentGrid } from '@/components/equipements/EquipmentGrid';
import { EquipmentList } from '@/components/equipements/EquipmentList';
import { FilterBar } from '@/components/equipements/FilterBar';
import { QRCodeModal } from '@/components/equipements/QRCodeModal';
import { CriticalityMatrix } from '@/components/equipements/CriticalityMatrix';
import { buildEquipmentTree, filterTree, flattenTreeToMachines, countMachinesAndSubAssemblies } from '@/components/equipements/treeUtils';

function QRScannerModal({ open, onClose, onScan }: { open: boolean; onClose: () => void; onScan: (code: string) => void }) {
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (open) {
      setScanning(true);
      setResult(null);
      setError(false);
      // Simulate scan after 3 seconds for demo
      const timer = setTimeout(() => {
        setScanning(false);
        const mockCodes = ['PR-001', 'PR-002', 'LQ-001', 'EQ-003'];
        const code = mockCodes[Math.floor(Math.random() * mockCodes.length)];
        setResult(code);
        onScan(code);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [open, onScan]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[500] bg-[rgba(10,11,20,0.9)] backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
            className="fixed inset-0 z-[500] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-bg-elevated border border-[rgba(90,94,117,0.3)] rounded-xl shadow-card-hover pointer-events-auto w-full max-w-md overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-[rgba(90,94,117,0.2)]">
                <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
                  <ScanLine className="w-5 h-5 text-accent-teal" />
                  Scanner un QR Code
                </h3>
                <button onClick={onClose} className="p-1 rounded-md hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors">
                  <Plus className="w-4 h-4 rotate-45" />
                </button>
              </div>

              <div className="p-6 flex flex-col items-center gap-4">
                {/* Scanner viewport */}
                <div className="relative w-72 h-72 rounded-xl border-2 border-accent-teal overflow-hidden bg-black">
                  {/* Corner brackets */}
                  <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-accent-teal" />
                  <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-accent-teal" />
                  <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-accent-teal" />
                  <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-accent-teal" />

                  {/* Scanning line */}
                  {scanning && (
                    <motion.div
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="absolute left-0 right-0 h-0.5 bg-accent-teal shadow-[0_0_8px_rgba(14,165,233,0.8)]"
                    />
                  )}

                  {/* Result overlay */}
                  <AnimatePresence>
                    {result && !error && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-status-ok/20 flex flex-col items-center justify-center gap-2"
                      >
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                          <div className="w-12 h-12 rounded-full bg-status-ok flex items-center justify-center">
                            <ChevronRight className="w-6 h-6 text-white rotate-[-45deg]" />
                          </div>
                        </motion.div>
                        <p className="text-sm font-semibold text-white">{result}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <p className="text-sm text-text-secondary text-center">
                  {scanning ? 'Placez le QR code dans le cadre' : result ? 'QR code reconnu' : 'Scan terminé'}
                </p>

                {result && (
                  <div className="flex items-center gap-2 w-full">
                    <button onClick={onClose} className="flex-1 btn-primary h-9 text-sm">
                      Voir la fiche
                    </button>
                    <button
                      onClick={() => {
                        setScanning(true);
                        setResult(null);
                      }}
                      className="flex-1 btn-ghost h-9 text-sm"
                    >
                      Réessayer
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function Equipements() {
  const { workOrders, preventivePlans } = useDataStore();
  const { equipment, fetchEquipment } = useEquipmentStore();

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  const [viewMode, setViewMode] = useState<ViewMode>('tree');
  const [filters, setFilters] = useState<EquipmentFilters>({
    search: '',
    level: 'all',
    zone: 'all',
    criticality: 'all',
    status: 'all',
  });

  const [selectedEq, setSelectedEq] = useState<Equipment | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrModalEq, setQrModalEq] = useState<Equipment | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [treeExpandedIds, setTreeExpandedIds] = useState<Set<string>>(new Set(['site-1']));
  const [treePaneExpanded, setTreePaneExpanded] = useState(true);

  const fullTree = useMemo(() => buildEquipmentTree(equipment), [equipment]);
  const filteredTree = useMemo(() => filterTree(fullTree, filters) ?? fullTree, [fullTree, filters]);
  const flatMachines = useMemo(() => flattenTreeToMachines(filteredTree), [filteredTree]);
  const { machines: machineCount, subAssemblies: subCount } = useMemo(() => countMachinesAndSubAssemblies(filteredTree), [filteredTree]);

  const handleSelectNode = useCallback((node: TreeNode) => {
    if (node.type === 'machine' && node.equipment) {
      setSelectedEq(node.equipment);
      setDetailOpen(true);
    }
  }, []);

  const handleSelectEquipment = useCallback((eq: Equipment) => {
    setSelectedEq(eq);
    setDetailOpen(true);
  }, []);

  const handleShowQR = useCallback((eq: Equipment) => {
    setQrModalEq(eq);
    setQrModalOpen(true);
  }, []);

  const handleNewBT = useCallback((eq: Equipment) => {
    // In real app, would open a modal or navigate to BT creation
    alert(`Créer un BT pour ${(eq as Equipment).name} (placeholder)`);
  }, []);

  const handleScanResult = useCallback((code: string) => {
    const eq = equipment.find((e) => e.qrCode === code || e.code === code);
    if (eq) {
      setSelectedEq(eq);
      setDetailOpen(true);
    }
  }, [equipment]);

  const handleToggleExpand = useCallback((id: string) => {
    setTreeExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    const ids = new Set<string>();
    function collect(n: TreeNode) {
      ids.add(n.id);
      n.children.forEach(collect);
    }
    collect(filteredTree);
    setTreeExpandedIds(ids);
  }, [filteredTree]);

  const collapseAll = useCallback(() => {
    setTreeExpandedIds(new Set(['site-1']));
  }, []);

  const resultCount = flatMachines.length;

  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-5"
      >
        <h1 className="text-[28px] font-bold text-text-primary tracking-tight">ÉQUIPEMENTS</h1>
        <p className="text-sm text-text-secondary">Répertoire complet des actifs de production</p>
      </motion.div>

      {/* Filter Bar */}
      <div className="mb-4">
        <FilterBar
          filters={filters}
          onChange={setFilters}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onNewEquipment={() => alert('Nouvel équipement (placeholder)')}
          onScanQR={() => setScannerOpen(true)}
          resultCount={resultCount}
        />
      </div>

      {/* Criticality Matrix */}
      <div className="mb-5">
        <CriticalityMatrix equipment={flatMachines} />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 gap-4 min-h-0">
        {/* Tree / List Pane */}
        <AnimatePresence initial={false}>
          {(viewMode === 'tree' || treePaneExpanded) && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: viewMode === 'tree' ? 360 : 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                'flex flex-col border border-[rgba(90,94,117,0.2)] rounded-xl bg-bg-elevated overflow-hidden flex-shrink-0',
                viewMode !== 'tree' && 'hidden lg:flex'
              )}
            >
              {/* Tree header */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-[rgba(90,94,117,0.15)] bg-bg-primary">
                <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">Arborescence</span>
                <div className="flex items-center gap-1">
                  <button onClick={expandAll} className="px-2 py-1 rounded text-[11px] text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors">
                    Développer
                  </button>
                  <button onClick={collapseAll} className="px-2 py-1 rounded text-[11px] text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors">
                    Réduire
                  </button>
                  {viewMode !== 'tree' && (
                    <button
                      onClick={() => setTreePaneExpanded(false)}
                      className="p-1 rounded hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors"
                    >
                      <Minimize2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Tree */}
              <div className="flex-1 overflow-y-auto min-h-0 p-1">
                {viewMode === 'tree' ? (
                  <EquipmentTree
                    tree={filteredTree}
                    selectedId={selectedEq?.id}
                    onSelect={handleSelectNode}
                    expandedIds={treeExpandedIds}
                    onToggleExpand={handleToggleExpand}
                  />
                ) : (
                  <div className="flex flex-col">
                    {flatMachines.map((eq) => (
                      <button
                        key={eq.id}
                        onClick={() => handleSelectEquipment(eq)}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors',
                          selectedEq?.id === eq.id
                            ? 'bg-accent-teal-glow border-l-[3px] border-accent-teal text-accent-teal'
                            : 'border-l-[3px] border-transparent text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                        )}
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
                        <span className="truncate">{eq.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Tree footer */}
              <div className="px-3 py-2 border-t border-[rgba(90,94,117,0.15)] bg-bg-primary text-[11px] text-text-muted">
                {machineCount} machine{machineCount !== 1 ? 's' : ''}, {subCount} sous-ensemble{subCount !== 1 ? 's' : ''}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Show tree toggle when collapsed in non-tree mode */}
        {viewMode !== 'tree' && !treePaneExpanded && (
          <button
            onClick={() => setTreePaneExpanded(true)}
            className="flex-shrink-0 w-8 h-12 rounded-r-xl bg-bg-elevated border border-l-0 border-[rgba(90,94,117,0.2)] flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        )}

        {/* Detail / Content Pane */}
        <div className="flex-1 min-w-0 flex flex-col">
          <AnimatePresence mode="wait">
            {detailOpen && selectedEq ? (
              <motion.div
                key={selectedEq.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                className="flex-1 overflow-y-auto"
              >
                <EquipmentDetail
                  equipment={selectedEq}
                  workOrders={workOrders}
                  preventivePlans={preventivePlans}
                  onClose={() => {
                    setDetailOpen(false);
                    setSelectedEq(null);
                  }}
                  onShowQR={handleShowQR}
                  onNewBT={handleNewBT}
                />
              </motion.div>
            ) : viewMode === 'grid' ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 overflow-y-auto"
              >
                <EquipmentGrid
                  equipment={flatMachines}
                  onSelect={handleSelectEquipment}
                  onNewBT={handleNewBT}
                />
              </motion.div>
            ) : viewMode === 'list' ? (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 overflow-y-auto"
              >
                <EquipmentList
                  equipment={flatMachines}
                  onSelect={handleSelectEquipment}
                  onNewBT={handleNewBT}
                />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full text-text-muted"
              >
                <Search className="w-12 h-12 mb-3" />
                <p className="text-sm">Sélectionnez un équipement dans l'arborescence</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* QR Code Modal */}
      <QRCodeModal
        open={qrModalOpen}
        code={qrModalEq?.qrCode ?? qrModalEq?.code}
        name={qrModalEq?.name}
        onClose={() => setQrModalOpen(false)}
      />

      {/* QR Scanner Modal */}
      <QRScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleScanResult}
      />
    </div>
  );
}
