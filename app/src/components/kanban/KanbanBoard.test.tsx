import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KanbanBoard } from './KanbanBoard'
import type { WorkOrder } from '@/types'

/* ── Mock @hello-pangea/dnd pour éviter le besoin de contexte DOM ── */
vi.mock('@hello-pangea/dnd', () => ({
  DragDropContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Droppable: ({ children }: { children: (provided: any, snapshot: any) => React.ReactNode }) =>
    children({ innerRef: vi.fn(), droppableProps: {}, placeholder: null }, { isDraggingOver: false }),
  Draggable: ({ children }: { children: (provided: any, snapshot: any) => React.ReactNode }) =>
    children({ innerRef: vi.fn(), draggableProps: {}, dragHandleProps: {} }, { isDragging: false }),
}));

const mockWorkOrders: WorkOrder[] = [
  {
    id: 'wo-1',
    number: 'BT-001',
    title: 'Panne presse',
    description: '',
    type: 'corrective',
    status: 'planned',
    priority: 'P2',
    equipmentId: 'eq-1',
    equipmentName: 'Presse 1',
    requestedBy: '',
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'wo-2',
    number: 'BT-002',
    title: 'Maintenance tour',
    description: '',
    type: 'preventive',
    status: 'in_progress',
    priority: 'P3',
    equipmentId: 'eq-2',
    equipmentName: 'Tour 1',
    requestedBy: '',
    assignedTo: 'Jean D.',
    createdAt: '2025-01-02T00:00:00Z',
  },
];

describe('KanbanBoard', () => {
  it('renders columns and cards', () => {
    const onMove = vi.fn();
    render(<KanbanBoard workOrders={mockWorkOrders} onMove={onMove} />);

    expect(screen.getAllByText('Planifié').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('En cours').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Attente pièces')).toBeInTheDocument();
    expect(screen.getByText('Terminé')).toBeInTheDocument();

    expect(screen.getByText('BT-001')).toBeInTheDocument();
    expect(screen.getByText('Panne presse')).toBeInTheDocument();
    expect(screen.getByText('BT-002')).toBeInTheDocument();
    expect(screen.getByText('Maintenance tour')).toBeInTheDocument();
  });

  it('shows correct card count per column', () => {
    const onMove = vi.fn();
    render(<KanbanBoard workOrders={mockWorkOrders} onMove={onMove} />);

    // Les badges de comptage : Planifié=1, En cours=1, Attente=0, Terminé=0
    const counts = screen.getAllByText(/^[01]$/);
    expect(counts.length).toBe(4);
  });
})
