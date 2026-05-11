/**
 * =============================================================================
 * Tests — Equipements (QR Code + CRUD)
 * =============================================================================
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { prisma } from '../config/database';
import equipmentRoutes from '../routes/equipments';

// Mock auth middleware pour les tests
vi.mock('../middleware/auth', () => ({
  authenticate: (req: any, _res: any, next: any) => {
    req.user = { id: 'test-user', email: 'test@simply-gmao.fr', role: 'RESPONSABLE' };
    next();
  },
  authorize: () => (_req: any, _res: any, next: any) => next(),
}));

describe('Equipment Routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/equipments', equipmentRoutes);

  beforeAll(async () => {
    await prisma.equipment.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('GET /api/equipments — retourne une liste paginee', async () => {
    const res = await request(app).get('/api/equipments');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.pagination).toBeDefined();
  });

  it('GET /api/equipments/:id/qrcode — retourne 404 pour ID inconnu', async () => {
    const res = await request(app).get('/api/equipments/00000000-0000-0000-0000-000000000000/qrcode');
    expect(res.status).toBe(404);
  });
});
