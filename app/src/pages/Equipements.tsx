import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Search, ScanLine, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEquipments, useDeleteEquipment } from '@/hooks/useEquipments';
import type { Equipment } from '@/types';
import type { TreeNode, ViewMode, EquipmentFilters } from '@/components/equipements/types';
import { EquipmentDetail } from '@/components/equipements/EquipmentDetail';
import { EquipmentGrid } from '@/components/equipements/EquipmentGrid';
import { EquipmentList } from '@/components/equipements/EquipmentList';
import { FilterBar } from '@/components/equipements/FilterBar';
import { QRCodeModal } from '@/components/equipements/QRCodeModal';
import { EquipmentCreationModal } from '@/components/equipements/EquipmentCreationModal';
import { EquipmentEditModal } from '@/components/equipements/EquipmentEditModal';
import { QRScanner } from '@/components/qr/QRScanner';
import { CriticalityMatrix } from '@/components/equipements/CriticalityMatrix';
import { EquipmentOrgChart } from '@/components/equipements/EquipmentOrgChart';
import { buildEquipmentTree, filterTree, flattenTreeToMachines, countMachinesAndSubAssemblies } from '@/components/equipements/treeUtils';



export default function Equipements() {
  const workOrders: any[] = [];
  const preventivePlans: any[] = [];
  const { data: equipment = [] } = useEquipments();
  const deleteEquipment = useDeleteEquipment();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
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
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editEq, setEditEq] = useState<Equipment | null>(null);
  const [treeExpandedIds, setTreeExpandedIds] = useState<Set<string>>(new Set(['site-1']));
  const [matrixCollapsed, setMatrixCollapsed] = useState(false);

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
    console.log(`Créer un BT pour ${(eq as Equipment).name}`);
  }, []);

  const handleEdit = useCallback((eq: Equipment) => {
    setEditEq(eq);
    setEditModalOpen(true);
  }, []);

  const handleDelete = useCallback(async (eq: Equipment) => {
    if (window.confirm(`Supprimer l'équipement « ${eq.name} » (${eq.code}) ? Cette action est irréversible.`)) {
      try {
        await deleteEquipment.mutateAsync(eq.id);
        toast.success(`Équipement « ${eq.code} » supprimé`);
        setDetailOpen(false);
        setSelectedEq(null);
      } catch {
        toast.error('Erreur lors de la suppression');
      }
    }
  }, [deleteEquipment]);

  const handleScanResult = useCallback((code: string) => {
    setScannerOpen(false);
    const eq = equipment.find((e) => e.qrCode === code || e.code === code);
    if (eq) {
      setSelectedEq(eq);
      setDetailOpen(true);
      toast.success(`Équipement trouvé : ${eq.code}`, { description: eq.name });
    } else {
      toast.error(`Aucun équipement trouvé pour la référence « ${code} »`);
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
          onNewEquipment={() => setCreateModalOpen(true)}
          onScanQR={() => setScannerOpen(true)}
          resultCount={resultCount}
        />
      </div>

      {/* Criticality Matrix — collapsible */}
      <div className="mb-3">
        <button
          onClick={() => setMatrixCollapsed(!matrixCollapsed)}
          className="flex items-center gap-2 text-xs font-medium text-text-secondary uppercase tracking-wide mb-2 hover:text-text-primary transition-colors"
        >
          {matrixCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          Matrice de criticité
        </button>
        <AnimatePresence initial={false}>
          {!matrixCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <CriticalityMatrix equipment={flatMachines} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 gap-4 min-h-0">
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
                  onEdit={handleEdit}
                  onDelete={handleDelete}
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
            ) : viewMode === 'org' ? (
              <motion.div
                key="org"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 overflow-y-auto"
              >
                <EquipmentOrgChart
                  tree={filteredTree}
                  selectedId={selectedEq?.id}
                  onSelect={handleSelectNode}
                  expandedIds={treeExpandedIds}
                  onToggleExpand={handleToggleExpand}
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

      {/* QR Scanner */}
      {scannerOpen && (
        <QRScanner
          onScan={handleScanResult}
          onClose={() => setScannerOpen(false)}
        />
      )}

      <EquipmentCreationModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
      <EquipmentEditModal
        open={editModalOpen}
        equipment={editEq}
        onClose={() => {
          setEditModalOpen(false);
          setEditEq(null);
        }}
      />
    </div>
  );
}
