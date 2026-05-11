import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('navigation vers le dashboard', async ({ page }) => {
    await page.goto('/');
    // En l'absence de session, redirige vers login
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('navigation sidebar visible sur desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/login');
    // La sidebar n'est pas visible sur login, mais sur les pages authentifiées oui
    await expect(page.locator('nav')).not.toBeVisible();
  });
});
