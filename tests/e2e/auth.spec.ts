/**
 * =============================================================================
 * E2E Tests — Authentification
 * =============================================================================
 * Playwright E2E specs pour le flux login/logout et RBAC.
 * =============================================================================
 */

import { test, expect } from '@playwright/test';

test.describe('Authentification', () => {
  test('page de login affiche le formulaire', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('login avec identifiants invalides affiche une erreur', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[name="email"]', 'invalide@test.com');
    await page.fill('input[name="password"]', 'mauvaismdp');
    await page.click('button[type="submit"]');
    await expect(page.locator('[role="alert"]')).toContainText(/erreur|incorrect|invalid/i);
  });

  test('login avec identifiants valides redirige vers le dashboard', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[name="email"]', 'simply-gmao@gmao.com');
    await page.fill('input[name="password"]', 'simply-gmao2025');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 10000 });
    await expect(page.locator('text=Tableau de bord')).toBeVisible();
  });
});
