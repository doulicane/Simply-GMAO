import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  type SortingState,
  type ColumnDef,
} from '@tanstack/react-table';
import { motion } from 'framer-motion';
import {
  ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Eye, MoreVertical, Search, Inbox,
} from 'lucide-react';
import type { WorkOrder } from '@/types';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';
import {
  STATUS_LABELS,
  STATUS_VARIANTS,
  TYPE_LABELS,
  formatDuration,
  formatRelativeTime,
  getInitials,
} from './utils';

interface ListViewProps {
  workOrders: WorkOrder[];
  onSelectWorkOrder: (wo: WorkOrder) => void;
}

export function ListView({ workOrders, onSelectWorkOrder }: ListViewProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }]);
  const [globalFilter, setGlobalFilter] = useState('');

  const filteredData = useMemo(() => {
    if (!globalFilter) return workOrders;
    const term = globalFilter.toLowerCase();
    return workOrders.filter(
      (wo) =>
        wo.number.toLowerCase().includes(term) ||
        wo.equipmentName.toLowerCase().includes(term) ||
        wo.title.toLowerCase().includes(term) ||
        wo.assignedTo?.toLowerCase().includes(term) ||
        wo.requestedBy.toLowerCase().includes(term)
    );
  }, [workOrders, globalFilter]);

  const columns = useMemo<ColumnDef<WorkOrder>[]>(
    () => [
      {
        accessorKey: 'number',
        header: 'N\u00b0 BT',
        size: 100,
        cell: ({ row }) => (
          <span className="font-mono text-[13px] font-medium text-accent-teal">
            {row.original.number}
          </span>
        ),
      },
      {
        accessorKey: 'equipmentName',
        header: '\u00c9quipement',
        size: 200,
        cell: ({ row }) => (
          <div>
            <p className="text-sm font-medium text-text-primary truncate">
              {row.original.equipmentName}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        size: 300,
        enableSorting: false,
        cell: ({ row }) => (
          <p className="text-[13px] text-text-secondary truncate max-w-[280px]">
            {row.original.description}
          </p>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Type',
        size: 120,
        cell: ({ row }) => (
          <span className="inline-flex items-center h-[18px] px-2 rounded-[9px] text-[10px] font-semibold uppercase tracking-wide bg-[rgba(90,94,117,0.15)] text-text-secondary border border-[rgba(90,94,117,0.25)]">
            {TYPE_LABELS[row.original.type]}
          </span>
        ),
      },
      {
        accessorKey: 'priority',
        header: 'Priorit\u00e9',
        size: 100,
        cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
      },
      {
        accessorKey: 'status',
        header: 'Statut',
        size: 120,
        cell: ({ row }) => (
          <StatusBadge
            status={STATUS_VARIANTS[row.original.status]}
            label={STATUS_LABELS[row.original.status]}
          />
        ),
      },
      {
        accessorKey: 'assignedTo',
        header: 'Technicien',
        size: 130,
        cell: ({ row }) => {
          const name = row.original.assignedTo;
          return (
            <div className="flex items-center gap-2">
              {name && (
                <div className="w-5 h-5 rounded-full bg-accent-teal/20 text-accent-teal flex items-center justify-center text-[9px] font-bold">
                  {getInitials(name)}
                </div>
              )}
              <span className="text-[13px] text-text-primary">
                {name ?? '-'}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Cr\u00e9\u00e9 le',
        size: 110,
        cell: ({ row }) => (
          <span className="font-mono text-[12px] text-text-secondary">
            {formatRelativeTime(row.original.createdAt)}
          </span>
        ),
      },
      {
        accessorKey: 'duration',
        header: 'Dur\u00e9e',
        size: 80,
        cell: ({ row }) => (
          <span className="text-[13px] text-text-secondary">
            {formatDuration(row.original.duration)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        size: 80,
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectWorkOrder(row.original);
              }}
              className="p-1.5 rounded-md hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors"
              aria-label="Voir d\u00e9tails"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              className="p-1.5 rounded-md hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors"
              aria-label="Plus d\u0027actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [onSelectWorkOrder]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, pagination: { pageIndex: 0, pageSize: 25 } },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();
  const rowCount = filteredData.length;

  return (
    <div className="flex flex-col gap-4">
      {/* Search bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Rechercher par N\u00b0, \u00e9quipement, technicien..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-bg-input border border-[rgba(90,94,117,0.3)] rounded-md text-text-primary text-sm focus:outline-none focus:border-accent-teal focus:shadow-glow placeholder:text-text-muted"
          />
        </div>
        <span className="text-sm text-text-muted ml-auto">
          {rowCount} r\u00e9sultat{rowCount > 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[rgba(90,94,117,0.2)]">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-bg-primary border-b border-[rgba(90,94,117,0.2)]">
              {table.getFlatHeaders().map((header) => (
                <th
                  key={header.id}
                  className="h-11 px-4 text-[11px] font-medium uppercase tracking-widest text-text-secondary whitespace-nowrap cursor-pointer select-none hover:text-text-primary transition-colors"
                  style={{ width: header.column.getSize() }}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center gap-1">
                    {header.isPlaceholder
                      ? null
                      : (header.column.columnDef.header as string)}
                    {header.column.getCanSort() && (
                      <ArrowUpDown className="w-3.5 h-3.5 text-text-muted" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center text-text-muted">
                    <Inbox className="w-10 h-10 mb-3" />
                    <p className="text-sm font-medium">Aucun bon de travail trouv\u00e9</p>
                    <p className="text-xs mt-1">Essayez de modifier vos filtres</p>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, i) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  onClick={() => onSelectWorkOrder(row.original)}
                  className="h-[52px] border-b border-[rgba(90,94,117,0.1)] hover:bg-bg-hover cursor-pointer transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3 whitespace-nowrap"
                      style={{ width: cell.column.getSize() }}
                    >
                      {cell.renderValue() as React.ReactNode}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between px-1">
          <span className="text-sm text-text-muted">
            Page {pageIndex + 1} sur {pageCount}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded-md hover:bg-bg-hover text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded-md hover:bg-bg-hover text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded-md hover:bg-bg-hover text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => table.setPageIndex(pageCount - 1)}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded-md hover:bg-bg-hover text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
