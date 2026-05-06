const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5173';
const OUTPUT_DIR = path.join(__dirname, '../screenshots');

const ROLES = [
  { role: 'responsable', label: 'Manager', name: 'dashboard_responsable' },
  { role: 'technicien', label: 'Technicien', name: 'dashboard_technicien' },
  { role: 'operateur', label: 'Opérateur', name: 'dashboard_operateur' },
  { role: 'magasinier', label: 'Magasinier', name: 'dashboard_magasinier' },
];

const PAGES = [
  { path: '/login', name: 'login' },
  { path: '/espace-magasinier', name: 'espace_magasinier', needRole: 'magasinier' },
  { path: '/stocks', name: 'stocks', needRole: 'responsable' },
  { path: '/bons-de-travail', name: 'bons_travail', needRole: 'responsable' },
  { path: '/equipements', name: 'equipements', needRole: 'responsable' },
];

async function login(page, label) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  
  const btn = page.locator(`button:has-text("${label}")`).first();
  await btn.waitFor({ state: 'visible', timeout: 15000 });
  await btn.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
}

async function capture(page, urlPath, name) {
  await page.goto(`${BASE_URL}${urlPath}`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  
  const screenshotPath = path.join(OUTPUT_DIR, `${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`✅ ${name}.png`);
}

(async () => {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  
  const browser = await chromium.launch({ headless: true });
  
  // Capture login page
  const loginPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await capture(loginPage, '/login', 'login');
  await loginPage.close();
  
  // Capture dashboards for each role
  for (const { role, label, name } of ROLES) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await login(page, label);
    const screenshotPath = path.join(OUTPUT_DIR, `${name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`✅ ${name}.png`);
    await page.close();
    await context.close();
  }
  
  // Capture other pages as responsable
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await login(page, 'Manager');
  
  for (const { path: urlPath, name } of PAGES.slice(1)) {
    await capture(page, urlPath, name);
  }
  
  await page.close();
  await ctx.close();
  await browser.close();
  console.log('\n📸 All screenshots saved to', OUTPUT_DIR);
})();
