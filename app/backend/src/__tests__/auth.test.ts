/**
 * =============================================================================
 * Tests — Authentification
 * =============================================================================
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { prisma } from '../config/database';
import authRoutes from '../routes/auth';

describe('Auth Routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);

  beforeAll(async () => {
    // Nettoyer la base de test
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('POST /api/auth/login — retourne 401 pour identifiants invalides', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'invalide@test.com', password: 'wrong' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/login — retourne 422 pour donnees invalides', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'not-an-email', password: '123' });

    expect(res.status).toBe(422);
  });

  it('GET /api/auth/me — retourne 401 sans token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
