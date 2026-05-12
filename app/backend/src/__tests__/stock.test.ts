/**
 * =============================================================================
 * Tests — Stock (Articles + Mouvements)
 * =============================================================================
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import stockRoutes from '../routes/stock';
import { prisma as mockPrisma } from '../config/__mocks__/database';

vi.mock('../middleware/auth');
vi.mock('../middleware/validation');
vi.mock('../config/database');
vi.mock('../utils/logger');
vi.mock('../utils/cache');

describe('Stock Routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/stock', stockRoutes);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /api/stock — retourne une liste paginee', async () => {
    mockPrisma.stockItem.findMany.mockResolvedValue([
      { id: 'stk-1', code: 'VIS-001', name: 'Vis M8', quantite: 100, stockMinimum: 20 },
    ]);
    mockPrisma.stockItem.count.mockResolvedValue(1);

    const res = await request(app).get('/api/stock');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
  });

  it('GET /api/stock/:id — retourne un article', async () => {
    mockPrisma.stockItem.findUnique.mockResolvedValue({
      id: 'stk-1', code: 'VIS-001', name: 'Vis M8', quantite: 100, stockMinimum: 20,
      stockMovements: [],
    });

    const res = await request(app).get('/api/stock/stk-1');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('stk-1');
  });

  it('GET /api/stock/:id — retourne 404 si inconnu', async () => {
    mockPrisma.stockItem.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/stock/unknown-id');
    expect(res.status).toBe(404);
  });

  it('POST /api/stock — cree un article', async () => {
    mockPrisma.stockItem.create.mockResolvedValue({
      id: 'stk-new', code: 'ECR-001', name: 'Ecrou M8', quantite: 50, stockMinimum: 10,
    });

    const res = await request(app)
      .post('/api/stock')
      .send({ code: 'ECR-001', name: 'Ecrou M8', quantite: 50, stockMinimum: 10 });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.code).toBe('ECR-001');
  });

  it('POST /api/stock/movements — cree un mouvement de sortie', async () => {
    mockPrisma.stockItem.findUnique.mockResolvedValue({
      id: 'stk-1', code: 'VIS-001', name: 'Vis M8', quantite: 100, stockMinimum: 20, active: true,
    });
    mockPrisma.$transaction.mockImplementation(async (cb: any) => cb(mockPrisma));
    mockPrisma.stockMovement.create.mockResolvedValue({ id: 'mov-1', type: 'SORTIE', quantite: 10 });
    mockPrisma.stockItem.update.mockResolvedValue({ id: 'stk-1', quantite: 90 });

    const res = await request(app)
      .post('/api/stock/movements')
      .send({ stockItemId: 'stk-1', type: 'SORTIE', quantite: 10 });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/stock/movements — retourne 400 si stock insuffisant', async () => {
    mockPrisma.stockItem.findUnique.mockResolvedValue({
      id: 'stk-1', code: 'VIS-001', name: 'Vis M8', quantite: 5, stockMinimum: 20, active: true,
    });

    const res = await request(app)
      .post('/api/stock/movements')
      .send({ stockItemId: 'stk-1', type: 'SORTIE', quantite: 10 });

    expect(res.status).toBe(400);
  });

  it('PUT /api/stock/:id — modifie un article', async () => {
    mockPrisma.stockItem.findUnique.mockResolvedValue({ id: 'stk-1', code: 'VIS-001' });
    mockPrisma.stockItem.update.mockResolvedValue({
      id: 'stk-1', code: 'VIS-001', name: 'Vis M8x30', quantite: 100, stockMinimum: 20,
    });

    const res = await request(app)
      .put('/api/stock/stk-1')
      .send({ name: 'Vis M8x30' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Vis M8x30');
  });

  it('DELETE /api/stock/:id — supprime logiquement', async () => {
    mockPrisma.stockItem.findUnique.mockResolvedValue({ id: 'stk-1', code: 'VIS-001' });
    mockPrisma.stockItem.update.mockResolvedValue({ id: 'stk-1', code: 'VIS-001', deletedAt: new Date() });

    const res = await request(app).delete('/api/stock/stk-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
