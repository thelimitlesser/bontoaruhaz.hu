import { test, expect } from '@playwright/test';

test.describe('Public Site Quality Audit', () => {
  test('Home Page - Hero and Visual Integrity', async ({ page }) => {
    await page.goto('/');
    // Check main heading with flexible regex for "Minőségi Gyári Bontott Autóalkatrészek"
    await expect(page.locator('h1')).toHaveText(/Minőségi\s+Gyári\s+Bontott\s+Autóalkatrészek/i, { timeout: 15000 });
    
    // Check if the logo is visible and loaded (alt text is "Logo")
    const logo = page.locator('img[alt="Logo"]').first();
    await expect(logo).toBeVisible();
    
    // Check for the brand text
    await expect(page.locator('text=BONTÓÁRUHÁZ')).toBeVisible();
    
    // Check for the main search widget
    await expect(page.locator('text=Márka / Modell')).toBeVisible();
    
    await page.screenshot({ path: 'tests/screenshots/audit-home.png', fullPage: true });
  });

  test('Search and Product Navigation', async ({ page }) => {
    await page.goto('/search?query=audi');
    
    // Check if products are found
    const productCard = page.locator('a[href^="/product/"]').first();
    await expect(productCard).toBeVisible({ timeout: 15000 });
    
    // Check if product images are loading
    const productImage = productCard.locator('img').first();
    await expect(productImage).toBeVisible();
    
    // Click into a product
    await productCard.click();
    await expect(page.locator('h1')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('add-to-cart-button')).toBeVisible();
    
    await page.screenshot({ path: 'tests/screenshots/audit-product.png', fullPage: true });
  });

  test('Fuzzy Search Stability', async ({ page }) => {
    // Search for a misspelled word to trigger the fuzzy search logic (where the crash happened)
    await page.goto('/search?query=audy');
    
    // Instead of fuzzy search check (which was removed), let's just make sure it handles no results gracefully
    await expect(page.locator('text=Nincs közvetlen találat')).toBeVisible({ timeout: 15000 });
    
    await page.screenshot({ path: 'tests/screenshots/audit-fuzzy.png', fullPage: true });
  });

  test('Checkout Flow and Feature Toggles', async ({ page, baseURL }) => {
    // Navigate straight to search
    await page.goto('/search?query=audi');
    
    // Wait for the results to load
    await page.waitForSelector('a[href^="/product/"]', { timeout: 15000 });
    
    // Get all product links
    const productLinks = await page.locator('a[href^="/product/"]').all();
    
    let addedToCart = false;
    
    for (const link of productLinks) {
      // Get the product detail URL
      const href = await link.getAttribute('href');
      if (!href) continue;
      
      // Navigate to the product page
      await page.goto(href);
      
      const addToCartBtn = page.getByTestId('add-to-cart-button');
      await expect(addToCartBtn).toBeVisible({ timeout: 15000 });
      
      // Check if button is disabled (has "disabled" attribute or classes like "cursor-not-allowed")
      const isDisabledAttr = await addToCartBtn.getAttribute('disabled');
      const isDisabledClass = await addToCartBtn.evaluate(el => el.classList.contains('cursor-not-allowed') || (el as HTMLButtonElement).disabled);
      
      if (isDisabledAttr === null && !isDisabledClass) {
        // Not reserved/out of stock! We can buy this one.
        await addToCartBtn.click();
        addedToCart = true;
        break;
      } else {
        // Go back and try the next one
        console.log(`Product ${href} is reserved/disabled, trying another one...`);
        await page.goto('/search?query=audi');
        await page.waitForSelector('a[href^="/product/"]', { timeout: 15000 });
      }
    }
    
    expect(addedToCart).toBe(true);
    
    // Go to checkout
    await page.goto('/checkout');
    await expect(page.locator('text=Rendelés összesítése')).toBeVisible({ timeout: 15000 });
    
    // CRITICAL: Check that "Céges számlát kérek" is NOT visible (as requested)
    const corporateInvoice = page.locator('text=Céges számlát kérek');
    await expect(corporateInvoice).not.toBeVisible();
    
    await page.screenshot({ path: 'tests/screenshots/audit-checkout.png', fullPage: true });
  });
});

test.describe('Security Audit (Unauthorized Access)', () => {
    test('Admin Dashboard Redirection', async ({ page }) => {
        await page.goto('/admin');
        // Verify it forces a login redirect
        await page.waitForURL('**/login', { timeout: 15000 });
        await expect(page.locator('body')).toContainText(/bejelentkezés/i);
    });
});
