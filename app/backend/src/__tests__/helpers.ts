/**
 * =============================================================================
 * Helpers de test — Mock Prisma + Auth
 * =============================================================================
 */

import { vi } from 'vitest';
import express from 'express';

/**
 * Mock du middleware d'authentification
 * A utiliser avec vi.mock('../middleware/auth', () => mockAuth())
 */
export function mockAuth(role = 'RESPONSABLE') {
  return {
    authenticate: (req: any, _res: any, next: any) => {
      req.user = { id: 'test-user-id', email: 'test@simply-gmao.fr', role, firstName: 'Test', lastName: 'User' };
      next();
    },
    authorize: () => (_req: any, _res: any, next: any) => next(),
    optionalAuthenticate: (_req: any, _res: any, next: any) => next(),
  };
}

/**
 * Mock complet de Prisma pour les tests
 * Retourne un objet prisma mocké avec les méthodes CRUD basiques
 */
export function createMockPrisma(overrides: Record<string, unknown> = {}) {
  const defaultMock = {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn(),
    },
    equipment: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn(),
    },
    workOrder: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn(),
    },
    stockItem: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn(),
    },
    stockMovement: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    preventivePlan: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    ligne: {
      findUnique: vi.fn(),
    },
    sousEnsemble: {
      findMany: vi.fn(),
      createMany: vi.fn(),
    },
    compteurReleve: {
      create: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn((cb: any) => cb(defaultMock)),
    $queryRaw: vi.fn(),
    $disconnect: vi.fn(),
    ...overrides,
  };
  return defaultMock;
}

/**
 * Cree une app Express minimale pour tester des routes
 */
export function createTestApp(router: express.Router) {
  const app = express();
  app.use(express.json());
  app.use('/api', router);
  return app;
}
