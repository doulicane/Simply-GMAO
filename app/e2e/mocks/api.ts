import { Page } from '@playwright/test';

export async function mockAuthApi(page: Page) {
  await page.route('**/api/auth/login', async (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          user: {
            id: 'user-1',
            email: 'simply-gmao@gmao.com',
            firstName: 'Admin',
            lastName: 'Test',
            role: 'RESPONSABLE',
          },
          accessToken: 'fake-jwt-token-e2e',
        },
      }),
    });
  });

  await page.route('**/api/auth/me', async (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          id: 'user-1',
          email: 'simply-gmao@gmao.com',
          firstName: 'Admin',
          lastName: 'Test',
          role: 'RESPONSABLE',
          active: true,
        },
      }),
    });
  });

  await page.route('**/api/auth/refresh', async (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { accessToken: 'fake-jwt-token-e2e-refreshed' },
      }),
    });
  });
}

export async function mockEquipmentsApi(page: Page) {
  await page.route('**/api/equipments?**', async (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          items: [
            {
              id: 'eq-1',
              code: 'P001',
              name: 'Presse 1',
              type: 'presse',
              statut: 'EN_SERVICE',
              criticality: 'CRITIQUE',
              ligne: { name: 'L1', zone: { name: 'Zone A' } },
            },
          ],
          pagination: { page: 1, limit: 20, total: 1 },
        },
      }),
    });
  });

  await page.route('**/api/equipments/eq-1', async (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          id: 'eq-1',
          code: 'P001',
          name: 'Presse 1',
          type: 'presse',
          statut: 'EN_SERVICE',
          criticality: 'CRITIQUE',
          ligne: { name: 'L1', zone: { name: 'Zone A' } },
        },
      }),
    });
  });
}

export async function mockStockApi(page: Page) {
  await page.route('**/api/stock?**', async (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          items: [
            {
              id: 'stk-1',
              code: 'PIE-001',
              name: 'Roulement',
              famille: 'Mecanique',
              quantite: 2,
              stockMinimum: 5,
              unite: 'pc',
            },
          ],
          pagination: { page: 1, limit: 20, total: 1 },
        },
      }),
    });
  });
}

export async function mockWorkOrdersApi(page: Page) {
  await page.route('**/api/work-orders?**', async (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          items: [
            {
              id: 'wo-1',
              numero: 'BT-2025-001',
              title: 'Panne presse',
              status: 'EN_COURS',
              priority: 'HAUTE',
              type: 'CORRECTIF',
              equipmentId: 'eq-1',
              equipment: { name: 'Presse 1' },
              dateCreation: '2025-01-01T00:00:00Z',
            },
          ],
          pagination: { page: 1, limit: 20, total: 1 },
        },
      }),
    });
  });

  await page.route('**/api/work-orders', async (route, request) => {
    if (request.method() === 'POST') {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'wo-new',
            numero: 'BT-2025-099',
            title: 'Test E2E — Pompe P101',
            status: 'CREE',
            priority: 'HAUTE',
            type: 'CORRECTIF',
            equipmentId: 'eq-1',
            dateCreation: new Date().toISOString(),
          },
        }),
      });
    } else {
      route.continue();
    }
  });

  await page.route(/.*\/api\/work-orders\/.*\/status/, async (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          id: 'wo-1',
          numero: 'BT-2025-001',
          title: 'Panne presse',
          status: 'PLANIFIE',
          priority: 'HAUTE',
          type: 'CORRECTIF',
          equipmentId: 'eq-1',
          dateCreation: '2025-01-01T00:00:00Z',
        },
      }),
    });
  });
}

export async function mockDashboardApi(page: Page) {
  await page.route('**/api/dashboard/kpis', async (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          availability: 92.5,
          availabilityTrend: 1.2,
          mttr: 2.5,
          mttrTrend: -0.3,
          mtbf: 48.0,
          mtbfTrend: 2.1,
          openWorkOrders: 12,
          urgentWorkOrders: 1,
          highWorkOrders: 3,
          mediumWorkOrders: 5,
          lowWorkOrders: 3,
          overdueWorkOrders: 0,
        },
      }),
    });
  });

  await page.route('**/api/dashboard/alerts', async (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [] }),
    });
  });

  await page.route('**/api/dashboard/recent-work-orders', async (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [] }),
    });
  });

  await page.route('**/api/dashboard/upcoming-preventive', async (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [] }),
    });
  });

  await page.route('**/api/dashboard/availability-by-line', async (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [] }),
    });
  });
}
