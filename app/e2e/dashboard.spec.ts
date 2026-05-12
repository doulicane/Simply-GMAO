import { test, expect } from '@playwright/test';
import { mockAuthApi, mockDashboardApi, mockTicketsApi } from './mocks/api';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthApi(page);
    await mockDashboardApi(page);
    await mockTicketsApi(page);
  });

  test('redirection vers login sans session', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('affichage du dashboard responsable après connexion', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'simply-gmao@gmao.com');
    await page.fill('input[type="password"]', 'simply-gmao2025');
    await page.click('button[type="submit"]');
    await expect(page.getByRole('heading', { name: 'DASHBOARD' })).toBeVisible();
    await expect(page.getByText('DISPONIBILITÉ', { exact: true })).toBeVisible();
  });
});
