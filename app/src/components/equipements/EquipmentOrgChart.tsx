import { useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, MapPin, Factory, Cog, Puzzle,
  ChevronRight, ChevronDown, AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TreeNode } from './types';

const NODE_ICONS: Record<TreeNode['type'], typeof Building2> = {
  site: Building2,
  zone: MapPin,
  line: Factory,
  machine: Cog,
  subAssembly: Puzzle,
};

const NODE_COLORS: Record<TreeNode['type'], string> = {
  site: 'border-accent-teal bg-accent-teal/5 text-accent-teal',
  zone: 'border-status-info bg-status-info/5 text-status-info',
  line: 'border-status-warning bg-status-warning/5 text-status-warning',
  machine: 'border-text-secondary bg-bg-hover text-text-primary',
  subAssembly: 'border-text-muted bg-bg-primary text-text-muted',
};

const STATUS_DOT_COLORS: Record<string, string> = {
  running: 'bg-status-ok',
  stopped: 'bg-status-neutral',
  maintenance: 'bg-status-warning',
  breakdown: 'bg-status-critical',
};

const CRITICALITY_LABELS: Record<string, string> = {
  critique: 'Critique',
  elevee: 'Élevée',
  moyenne: 'Moyenne',
  faible: 'Faible',
};

/* ------------------------------------------------------------------ */
//  Single node card
/* ------------------------------------------------------------------ */
function OrgNodeCard({
  node,
  isSelected,
  isExpanded,
  hasChildren,
  onSelect,
  onToggle,
}: {
  node: TreeNode;
  isSelected: boolean;
  isExpanded: boolean;
  hasChildren: boolean;
  onSelect: () => void;
  onToggle: (e: React.MouseEvent) => void;
}) {
  const Icon = NODE_ICONS[node.type];
  const colorClass = NODE_COLORS[node.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'relative flex flex-col items-center gap-1 px-3 py-2 sm:px-4 sm:py-3 rounded-xl border-2 min-w-[100px] max-w-[160px] sm:min-w-[140px] sm:max-w-[220px] cursor-pointer transition-shadow hover:shadow-card-hover',
        colorClass,
        isSelected && 'ring-2 ring-accent-teal shadow-glow'
      )}
      onClick={onSelect}
    >
      {/* Expand toggle */}
      {hasChildren && (
        <button
          onClick={onToggle}
          className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-bg-elevated border border-[rgba(90,94,117,0.3)] flex items-center justify-center text-text-muted hover:text-text-primary hover:border-accent-teal transition-colors z-10"
        >
          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>
      )}

      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />

      <span className="text-[11px] sm:text-xs font-semibold text-center leading-tight" title={node.name}>
        {node.name}
      </span>

      {/* Meta row: criticality + status dots */}
      <div className="flex items-center gap-1.5 mt-0.5">
        {node.criticality && node.type !== 'subAssembly' && (
          <span
            title={`Criticité: ${CRITICALITY_LABELS[node.criticality]}`}
            className={cn(
              'w-2.5 h-2.5 rounded-full',
              node.criticality === 'critique' && 'bg-status-critical',
              node.criticality === 'elevee' && 'bg-status-warning',
              node.criticality === 'moyenne' && 'bg-status-info',
              node.criticality === 'faible' && 'bg-status-neutral',
            )}
          />
        )}
        {node.status && (
          <span
            title={`Statut: ${node.status.replace(/_/g, ' ')}`}
            className={cn('w-2.5 h-2.5 rounded-full', STATUS_DOT_COLORS[node.status])}
          />
        )}
        {node.equipment && node.type === 'machine' && node.equipment.code && (
          <span className="text-[9px] sm:text-[10px] font-mono text-text-muted">{node.equipment.code}</span>
        )}
      </div>

      {/* Alert badge */}
      {node.status === 'breakdown' && (
        <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-status-critical flex items-center justify-center">
          <AlertTriangle className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />
        </span>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
//  Recursive branch (node + its children)
/* ------------------------------------------------------------------ */
function OrgBranch({
  node,
  selectedId,
  expandedIds,
  onSelect,
  onToggleExpand,
}: {
  node: TreeNode;
  selectedId?: string;
  expandedIds: Set<string>;
  onSelect: (node: TreeNode) => void;
  onToggleExpand: (id: string) => void;
}) {
  const isSelected = selectedId === node.id && node.type === 'machine';
  const isExpanded = expandedIds.has(node.id);
  const hasChildren = node.children.length > 0;

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleExpand(node.id);
    },
    [node.id, onToggleExpand]
  );

  const handleSelect = useCallback(() => {
    onSelect(node);
  }, [node, onSelect]);

  return (
    <div className="flex flex-col items-center">
      {/* Card */}
      <OrgNodeCard
        node={node}
        isSelected={isSelected}
        isExpanded={isExpanded}
        hasChildren={hasChildren}
        onSelect={handleSelect}
        onToggle={handleToggle}
      />

      {/* Connector to children */}
      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 24, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-px bg-[rgba(90,94,117,0.3)]"
          />
        )}
      </AnimatePresence>

      {/* Children row */}
      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, staggerChildren: 0.05 }}
            className="flex flex-col sm:flex-row items-start gap-3 sm:gap-6 pt-1 w-full sm:w-auto"
          >
            {node.children.map((child) => (
              <div key={child.id} className="flex flex-col items-center w-full sm:w-auto">
                {/* Up connector */}
                <div className="w-px h-4 sm:h-6 bg-[rgba(90,94,117,0.3)]" />
                <OrgBranchMemo
                  node={child}
                  selectedId={selectedId}
                  expandedIds={expandedIds}
                  onSelect={onSelect}
                  onToggleExpand={onToggleExpand}
                />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const OrgBranchMemo = memo(OrgBranch);

/* ------------------------------------------------------------------ */
//  Horizontal rule between siblings (visual link)
/* ------------------------------------------------------------------ */
function SiblingConnector({ count }: { count: number }) {
  if (count <= 1) return null;
  return (
    <div className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none">
      <div className="h-px bg-[rgba(90,94,117,0.3)]" style={{ width: `${(count - 1) * 100}%` }} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
//  Main exported component
/* ------------------------------------------------------------------ */
interface EquipmentOrgChartProps {
  tree: TreeNode;
  selectedId?: string;
  onSelect: (node: TreeNode) => void;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
}

export function EquipmentOrgChart({
  tree,
  selectedId,
  onSelect,
  expandedIds,
  onToggleExpand,
}: EquipmentOrgChartProps) {
  return (
    <div className="w-full overflow-x-auto sm:overflow-auto py-4 sm:py-6 px-2 sm:px-4">
      <div className="min-w-max sm:min-w-max mx-auto flex justify-center">
        <OrgBranchMemo
          node={tree}
          selectedId={selectedId}
          expandedIds={expandedIds}
          onSelect={onSelect}
          onToggleExpand={onToggleExpand}
        />
      </div>
    </div>
  );
}
