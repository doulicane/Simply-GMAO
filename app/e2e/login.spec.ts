import { test, expect } from '@playwright/test';
import { mockAuthApi, mockTicketsApi } from './mocks/api';

test.describe('Authentification', () => {
  test('page de login affichée', async ({ page }) => {
    await mockAuthApi(page);
    await page.goto('/login');
    await expect(page.locator('text=IDENTIFICATION')).toBeVisible();
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('connexion avec credentials invalides affiche une erreur', async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'Email ou mot de passe incorrect' }),
      });
    });
    await page.goto('/login');
    await page.fill('input[name="username"]', 'test@invalid.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Identifiant ou mot de passe incorrect')).toBeVisible();
  });

  test('connexion avec credentials valides redirige vers le dashboard', async ({ page }) => {
    await mockAuthApi(page);
    await mockTicketsApi(page);
    await page.goto('/login');
    await page.fill('input[name="username"]', 'simply-gmao@gmao.com');
    await page.fill('input[type="password"]', 'simply-gmao2025');
    await page.click('button[type="submit"]');
    await expect(page.getByRole('heading', { name: 'DASHBOARD' })).toBeVisible();
  });
});
