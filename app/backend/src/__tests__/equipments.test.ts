/**
 * =============================================================================
 * Tests — Equipements (CRUD complet)
 * =============================================================================
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import equipmentRoutes from '../routes/equipments';
import { prisma as mockPrisma } from '../config/__mocks__/database';

vi.mock('../middleware/auth');
vi.mock('../middleware/validation');
vi.mock('../config/database');
vi.mock('../utils/logger');
vi.mock('../utils/cache');

describe('Equipment Routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/equipments', equipmentRoutes);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /api/equipments — retourne une liste paginee', async () => {
    mockPrisma.equipment.findMany.mockResolvedValue([
      { id: 'eq-1', code: 'P001', name: 'Presse 1', statut: 'EN_SERVICE', criticality: 'CRITIQUE', ligne: { name: 'L1', zone: { name: 'Z1', site: { name: 'S1' } } } },
    ]);
    mockPrisma.equipment.count.mockResolvedValue(1);

    const res = await request(app).get('/api/equipments');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.pagination).toBeDefined();
  });

  it('GET /api/equipments/:id — retourne un equipement', async () => {
    mockPrisma.equipment.findUnique.mockResolvedValue({
      id: 'eq-1', code: 'P001', name: 'Presse 1', statut: 'EN_SERVICE', criticality: 'CRITIQUE',
      ligne: { name: 'L1', zone: { name: 'Z1', site: { name: 'S1' } } },
      workOrders: [], documents: [], preventivePlans: [],
    });

    const res = await request(app).get('/api/equipments/eq-1');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('eq-1');
  });

  it('GET /api/equipments/:id — retourne 404 si inconnu', async () => {
    mockPrisma.equipment.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/equipments/unknown-id');
    expect(res.status).toBe(404);
  });

  it('POST /api/equipments — cree un equipement', async () => {
    mockPrisma.equipment.findUnique.mockResolvedValue(null);
    mockPrisma.ligne.findUnique.mockResolvedValue({ id: 'ligne-1', name: 'L1' });
    mockPrisma.equipment.create.mockResolvedValue({
      id: 'eq-new', code: 'P002', name: 'Presse 2', statut: 'EN_SERVICE', criticality: 'MOYENNE',
      ligne: { name: 'L1', zone: { name: 'Z1', site: { name: 'S1' } } },
    });

    const res = await request(app)
      .post('/api/equipments')
      .send({ code: 'P002', name: 'Presse 2', type: 'presse', criticality: 'MOYENNE', statut: 'EN_SERVICE' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.code).toBe('P002');
  });

  it('POST /api/equipments — retourne 409 si code existe deja', async () => {
    mockPrisma.equipment.findUnique.mockResolvedValue({ id: 'existing', code: 'P001' });

    const res = await request(app)
      .post('/api/equipments')
      .send({ code: 'P001', name: 'Presse', type: 'presse', criticality: 'MOYENNE' });

    expect(res.status).toBe(409);
  });

  it('PUT /api/equipments/:id — modifie un equipement', async () => {
    mockPrisma.equipment.findUnique.mockResolvedValue({ id: 'eq-1', code: 'P001' });
    mockPrisma.equipment.update.mockResolvedValue({
      id: 'eq-1', code: 'P001', name: 'Presse 1 updated', statut: 'EN_SERVICE', criticality: 'CRITIQUE',
      ligne: { name: 'L1', zone: { name: 'Z1', site: { name: 'S1' } } },
    });

    const res = await request(app)
      .put('/api/equipments/eq-1')
      .send({ name: 'Presse 1 updated' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Presse 1 updated');
  });

  it('DELETE /api/equipments/:id — supprime logiquement', async () => {
    mockPrisma.equipment.findUnique.mockResolvedValue({ id: 'eq-1', code: 'P001' });
    mockPrisma.equipment.update.mockResolvedValue({ id: 'eq-1', code: 'P001', deletedAt: new Date() });

    const res = await request(app).delete('/api/equipments/eq-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/equipments/:id/qrcode — retourne 404 pour ID inconnu', async () => {
    mockPrisma.equipment.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/equipments/00000000-0000-0000-0000-000000000000/qrcode');
    expect(res.status).toBe(404);
  });
});
