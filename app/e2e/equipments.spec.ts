import { test, expect } from '@playwright/test';
import { mockAuthApi, mockEquipmentsApi, mockDashboardApi, mockTicketsApi } from './mocks/api';

test.describe('Équipements', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthApi(page);
    await mockDashboardApi(page);
    await mockTicketsApi(page);
    await mockEquipmentsApi(page);
  });

  test('navigation et affichage de la page équipements', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'simply-gmao@gmao.com');
    await page.fill('input[type="password"]', 'simply-gmao2025');
    await page.click('button[type="submit"]');
    await expect(page.getByRole('heading', { name: 'DASHBOARD' })).toBeVisible();

    await page.click('text=Équipements');
    await expect(page.getByRole('heading', { name: 'ÉQUIPEMENTS' })).toBeVisible();
    await expect(page.getByText('Répertoire complet des actifs de production')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Nouveau' })).toBeVisible();
  });
});
