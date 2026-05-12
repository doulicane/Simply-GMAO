import { test, expect } from '@playwright/test';
import { mockAuthApi, mockWorkOrdersApi, mockDashboardApi, mockTicketsApi, mockEquipmentsApi } from './mocks/api';

test.describe('Bons de Travail', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthApi(page);
    await mockDashboardApi(page);
    await mockTicketsApi(page);
    await mockEquipmentsApi(page);
    await mockWorkOrdersApi(page);
  });

  test('navigation et affichage de la page BT', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'simply-gmao@gmao.com');
    await page.fill('input[type="password"]', 'simply-gmao2025');
    await page.click('button[type="submit"]');
    await expect(page.getByRole('heading', { name: 'DASHBOARD' })).toBeVisible();

    await page.click('text=Bons de Travail');
    await expect(page.getByRole('heading', { name: /Bons de Travail/i })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Nouveau BT' })).toBeVisible();
  });
});
