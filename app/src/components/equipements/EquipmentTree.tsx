import { useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, Building2, MapPin, ArrowRight, Cog, Puzzle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TreeNode } from './types';

const NODE_ICONS: Record<TreeNode['type'], typeof Building2> = {
  site: Building2,
  zone: MapPin,
  line: ArrowRight,
  machine: Cog,
  subAssembly: Puzzle,
};

const NODE_INDENT: Record<TreeNode['type'], string> = {
  site: 'pl-0',
  zone: 'pl-4',
  line: 'pl-8',
  machine: 'pl-12',
  subAssembly: 'pl-16',
};

const STATUS_DOT_COLORS: Record<string, string> = {
  running: 'bg-status-ok',
  stopped: 'bg-status-neutral',
  maintenance: 'bg-status-warning',
  breakdown: 'bg-status-critical',

};

const CRITICALITY_COLORS: Record<string, string> = {
  critique: 'bg-status-critical text-white',
  elevee: 'bg-status-warning text-white',
  moyenne: 'bg-status-info text-white',
  faible: 'bg-status-neutral text-white',
};

interface EquipmentTreeProps {
  tree: TreeNode;
  selectedId?: string;
  onSelect: (node: TreeNode) => void;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
}

function TreeNodeItem({
  node,
  selectedId,
  onSelect,
  expandedIds,
  onToggleExpand,
}: {
  node: TreeNode;
  selectedId?: string;
  onSelect: (node: TreeNode) => void;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
}) {
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id && node.type === 'machine';
  const hasChildren = node.children.length > 0;
  const Icon = NODE_ICONS[node.type];

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
    <div className="select-none">
      <div
        className={cn(
          'flex items-center gap-1.5 py-1.5 pr-3 cursor-pointer transition-colors',
          NODE_INDENT[node.type],
          isSelected
            ? 'bg-accent-teal-glow border-l-[3px] border-accent-teal'
            : 'border-l-[3px] border-transparent hover:bg-bg-hover',
          node.type === 'subAssembly' && 'text-text-muted',
          node.type === 'machine' && 'text-text-secondary',
          (node.type === 'site' || node.type === 'zone') && 'text-text-primary font-medium'
        )}
        onClick={handleSelect}
      >
        <button
          onClick={handleToggle}
          className={cn(
            'w-5 h-5 flex items-center justify-center rounded hover:bg-bg-hover text-text-muted',
            !hasChildren && 'invisible'
          )}
        >
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        <Icon className={cn('w-4 h-4 flex-shrink-0', node.type === 'site' && 'text-accent-teal')} />
        <span className="text-sm truncate flex-1">{node.name}</span>
        {node.criticality && node.type !== 'subAssembly' && (
          <span
            className={cn(
              'w-2 h-2 rounded-full flex-shrink-0',
              CRITICALITY_COLORS[node.criticality].replace('text-white', '')
            )}
          />
        )}
        {node.status && (
          <span className={cn('w-2 h-2 rounded-full flex-shrink-0', STATUS_DOT_COLORS[node.status])} />
        )}
      </div>
      <AnimatePresence initial={false}>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {node.children.map((child, index) => (
              <motion.div
                key={child.id}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.15 }}
              >
                <TreeNodeItem
                  node={child}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  expandedIds={expandedIds}
                  onToggleExpand={onToggleExpand}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const TreeNodeItemMemo = memo(TreeNodeItem);

export function EquipmentTree({ tree, selectedId, onSelect, expandedIds, onToggleExpand }: EquipmentTreeProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <TreeNodeItemMemo
          node={tree}
          selectedId={selectedId}
          onSelect={onSelect}
          expandedIds={expandedIds}
          onToggleExpand={onToggleExpand}
        />
      </div>
    </div>
  );
}
