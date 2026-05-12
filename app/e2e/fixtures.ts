import { test as base, expect } from '@playwright/test';

export type TestFixtures = {
  authenticatedPage: {
    page: ReturnType<typeof base>['page'];
    token: string;
  };
};

export const test = base.extend<TestFixtures>({
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'simply-gmao@gmao.com');
    await page.fill('input[type="password"]', 'simply-gmao2025');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 10000 });
    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    await use({ page, token: token ?? '' });
  },
});

export { expect };
