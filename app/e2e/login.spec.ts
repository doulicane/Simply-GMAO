import { test, expect } from '@playwright/test';

test.describe('Authentification', () => {
  test('page de login affichée', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('text=Connexion')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('connexion avec credentials invalides', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@invalid.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Email ou mot de passe incorrect')).toBeVisible();
  });
});
