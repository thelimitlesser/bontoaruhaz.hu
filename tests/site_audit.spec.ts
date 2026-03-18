import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Public Site Audit', () => {
  test('Home Page - Hero and Search', async ({ page }) => {
    await page.goto(BASE_URL);
    // Use a more flexible text check for the main heading
    await expect(page.locator('h1')).toHaveText(/Megbízható autóalkatrészek/i, { timeout: 15000 });
    
    // Check for the main search widget tab
    await expect(page.locator('text=Márka / Modell')).toBeVisible();
    
    // Test Brand Selection - Look for the "Válassz Márkát" heading
    await expect(page.locator('h2')).toContainText(/Válassz/i);
    
    // Click an Audi link
    const audiLink = page.locator('a[href*="/brand/audi"]').first();
    await expect(audiLink).toBeVisible();
    
    await page.screenshot({ path: 'tests/screenshots/audit-home.png', fullPage: true });
  });

  test('Search Flow - Alfa Romeo', async ({ page }) => {
    await page.goto(`${BASE_URL}/search?query=alfa`);
    // Check if there are results
    await page.waitForSelector('a[href*="/product/"]', { timeout: 15000 });
    
    await page.screenshot({ path: 'tests/screenshots/audit-search.png', fullPage: true });
  });

  test('Product Page - Details and Shipping', async ({ page }) => {
    await page.goto(`${BASE_URL}/search?query=alfa`);
    const firstProduct = page.locator('a[href*="/product/"]').first();
    await firstProduct.click();
    
    await expect(page.locator('h1')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('button:has-text("KOSÁRBA")')).toBeVisible();
    
    // Check for shipping info (PXP rates)
    await expect(page.locator('text=Szállítás')).toBeVisible();
    
    await page.screenshot({ path: 'tests/screenshots/audit-product.png', fullPage: true });
  });

  test('Checkout Flow - Guest', async ({ page }) => {
    await page.goto(`${BASE_URL}/search?query=alfa`);
    await page.locator('a[href*="/product/"]').first().click();
    await page.locator('button:has-text("KOSÁRBA")').click();
    
    // Open Cart modal or navigate to cart
    await page.goto(`${BASE_URL}/checkout`);
    
    await expect(page.url()).toContain('/checkout');
    await expect(page.locator('text=Rendelés összesítése')).toBeVisible();
    
    await page.screenshot({ path: 'tests/screenshots/audit-checkout.png', fullPage: true });
  });
});

test.describe('Admin Section Audit (Pre-Login Check)', () => {
    test('Admin Dashboard Redirect', async ({ page }) => {
        await page.goto(`${BASE_URL}/admin`);
        // Should redirect to login if not authenticated
        await page.waitForURL('**/login', { timeout: 15000 });
        // Use a more general check for the login page
        await expect(page.locator('body')).toContainText(['Bejelentkezés', 'Regisztráció', 'Üdvözöljük']);
        await page.screenshot({ path: 'tests/screenshots/audit-admin-redirect.png' });
    });
});
