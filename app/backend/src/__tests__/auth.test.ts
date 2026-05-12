/**
 * =============================================================================
 * Tests — Authentification
 * =============================================================================
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import authRoutes from '../routes/auth';
import { prisma as mockPrisma } from '../config/__mocks__/database';
import { globalErrorHandler } from '../middleware/errorHandler';

vi.mock('../config/database');
vi.mock('../config/redis');
vi.mock('../utils/logger');
vi.mock('../middleware/lockout');

describe('Auth Routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use(globalErrorHandler);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('POST /api/auth/login — 401 pour identifiants invalides', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'invalide@test.com', password: 'wrong' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/login — 400 pour donnees invalides', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'not-an-email' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/login — 200 avec identifiants valides', async () => {
    const passwordHash = await bcrypt.hash('password123', 12);
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@simply-gmao.fr',
      password: passwordHash,
      role: 'RESPONSABLE',
      firstName: 'Test',
      lastName: 'User',
      active: true,
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@simply-gmao.fr', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeUndefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('GET /api/auth/me — 401 sans token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('POST /api/auth/logout — 200 avec refresh token', async () => {
    const refreshToken = jwt.sign(
      { userId: 'user-1', type: 'refresh', jti: 'jti-1' },
      process.env.JWT_SECRET || 'test-secret-min-32-chars-long'
    );

    const res = await request(app)
      .post('/api/auth/logout')
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/auth/refresh — 401 sans refresh token', async () => {
    const res = await request(app).post('/api/auth/refresh').send({});
    expect(res.status).toBe(401);
  });
});
