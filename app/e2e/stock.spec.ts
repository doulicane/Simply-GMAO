import { test, expect } from '@playwright/test';
import { mockAuthApi, mockStockApi, mockDashboardApi, mockTicketsApi } from './mocks/api';

test.describe('Stocks', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthApi(page);
    await mockDashboardApi(page);
    await mockTicketsApi(page);
    await mockStockApi(page);
  });

  test('navigation et affichage de la page stocks', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'simply-gmao@gmao.com');
    await page.fill('input[type="password"]', 'simply-gmao2025');
    await page.click('button[type="submit"]');
    await expect(page.getByRole('heading', { name: 'DASHBOARD' })).toBeVisible();

    await page.click('text=Stocks');
    await expect(page.getByRole('heading', { name: /Stocks/i })).toBeVisible();
  });
});
