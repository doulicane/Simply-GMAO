/**
 * =============================================================================
 * E2E Tests — Workflow complet BT (Creation → Cloture)
 * =============================================================================
 */

import { test, expect } from '@playwright/test';

test.describe('Workflow BT complet', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[name="email"]', 'simply-gmao@gmao.com');
    await page.fill('input[name="password"]', 'simply-gmao2025');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 10000 });
  });

  test('Creer un BT, le planifier, le demarrer, le terminer et le cloturer', async ({ page }) => {
    // 1. Aller sur Bons de Travail
    await page.click('text=Bons de Travail');
    await page.waitForSelector('text=Nouveau BT', { timeout: 5000 });

    // 2. Creer un BT
    await page.click('text=Nouveau BT');
    await page.fill('input[name="title"]', 'Test E2E — Pompe P101');
    await page.selectOption('select[name="type"]', 'CORRECTIF');
    await page.selectOption('select[name="priority"]', 'HAUTE');
    await page.click('button:has-text("Creer")');
    await page.waitForSelector('text=BT cree', { timeout: 5000 });

    // 3. Planifier (assigner technicien)
    await page.click('text=Planifier');
    await page.selectOption('select[name="technicien"]', 'USR-002');
    await page.click('button:has-text("Confirmer")');

    // 4. Demarrer
    await page.click('text=Demarrer');
    await page.waitForSelector('text=En cours', { timeout: 5000 });

    // 5. Terminer
    await page.click('text=Terminer');
    await page.fill('textarea[name="actionsRealisees"]', 'Remplacement joint');
    await page.click('button:has-text("Confirmer")');

    // 6. Cloturer
    await page.click('text=Cloturer');
    await page.click('button:has-text("Valider")');
    await page.waitForSelector('text=CLOTURE', { timeout: 5000 });
  });
});
