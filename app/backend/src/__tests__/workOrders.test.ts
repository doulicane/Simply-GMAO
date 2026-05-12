/**
 * =============================================================================
 * Tests — Bons de Travail (Work Orders)
 * =============================================================================
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import workOrderRoutes from '../routes/workOrders';
import { prisma as mockPrisma } from '../config/__mocks__/database';

vi.mock('../middleware/auth');
vi.mock('../middleware/validation');
vi.mock('../config/database');
vi.mock('../utils/logger');
vi.mock('../utils/cache');
vi.mock('../services/pdfService');

describe('WorkOrder Routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/work-orders', workOrderRoutes);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /api/work-orders — retourne une liste paginee', async () => {
    mockPrisma.workOrder.findMany.mockResolvedValue([
      { id: 'wo-1', numero: 'BT-001', title: 'Panne presse', status: 'EN_COURS', priority: 'HAUTE' },
    ]);
    mockPrisma.workOrder.count.mockResolvedValue(1);

    const res = await request(app).get('/api/work-orders');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
  });

  it('GET /api/work-orders/:id — retourne un BT', async () => {
    mockPrisma.workOrder.findUnique.mockResolvedValue({
      id: 'wo-1', numero: 'BT-001', title: 'Panne presse', status: 'EN_COURS', priority: 'HAUTE',
      equipment: { name: 'Presse 1' }, demandeur: { firstName: 'Jean', lastName: 'DUPONT' },
    });

    const res = await request(app).get('/api/work-orders/wo-1');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('wo-1');
  });

  it('GET /api/work-orders/:id — retourne 404 si inconnu', async () => {
    mockPrisma.workOrder.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/work-orders/unknown-id');
    expect(res.status).toBe(404);
  });

  it('POST /api/work-orders — cree un BT', async () => {
    mockPrisma.workOrder.create.mockResolvedValue({
      id: 'wo-new', numero: 'BT-002', title: 'Maintenance', status: 'CREE', priority: 'MOYENNE',
    });
    mockPrisma.equipment.findUnique.mockResolvedValue({ id: 'eq-1', name: 'Presse 1' });

    const res = await request(app)
      .post('/api/work-orders')
      .send({ title: 'Maintenance', equipmentId: 'eq-1', type: 'CORRECTIF', priority: 'MOYENNE' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Maintenance');
  });

  it.skip('PUT /api/work-orders/:id/status — change le statut (TODO: mock service)', async () => {
    mockPrisma.workOrder.findUnique.mockResolvedValue({ id: 'wo-1', status: 'CREE' });
    mockPrisma.workOrder.update.mockResolvedValue({
      id: 'wo-1', numero: 'BT-001', title: 'Panne presse', status: 'EN_COURS', priority: 'HAUTE',
    });

    const res = await request(app)
      .put('/api/work-orders/wo-1/status')
      .send({ status: 'EN_COURS' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('EN_COURS');
  });

  it('POST /api/work-orders/:id/complete — cloture un BT', async () => {
    mockPrisma.workOrder.findUnique.mockResolvedValue({ id: 'wo-1', status: 'EN_COURS' });
    mockPrisma.workOrder.update.mockResolvedValue({
      id: 'wo-1', numero: 'BT-001', title: 'Panne presse', status: 'TERMINE', priority: 'HAUTE',
    });

    const res = await request(app)
      .post('/api/work-orders/wo-1/complete')
      .send({ dureeMinutes: 120 });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('TERMINE');
  });
});
