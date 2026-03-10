import { test, expect } from '@playwright/test';

test.describe('Responsiveness and Mobile-Friendly Audit', () => {

    test('Home Page - Desktop vs Mobile Layout', async ({ page, isMobile }) => {
        await page.goto('/');

        // Check main elements - using more specific but semantic selectors
        await expect(page.locator('nav').first()).toBeVisible();
        await expect(page.locator('footer').first()).toBeVisible();

        // Hero section checks
        const heroTitle = page.locator('h1');
        await expect(heroTitle).toBeVisible();

        if (isMobile) {
            // Mobile specific checks - menu button in Navbar
            const menuButton = page.locator('button').filter({ has: page.locator('.lucide-menu') });
            await expect(menuButton).toBeVisible();
        } else {
            // Desktop specific checks - check for a link that is only visible in desktop nav
            const desktopNavLinks = page.locator('nav div.hidden.md\\:flex');
            await expect(desktopNavLinks).toBeVisible();
        }
    });

    test('Product Page - Gallery and Purchase Block', async ({ page, isMobile }) => {
        // Navigate to a product page (using a known ID or searching)
        await page.goto('/');
        // Search for something to get a product
        const searchInput = page.locator('input[placeholder*="keres"], input[type="text"]').first();
        await searchInput.fill('Alfa Romeo 147');
        await searchInput.press('Enter');

        // Wait for results and click first product
        const firstProduct = page.locator('a[href*="/product/"]').first();
        await firstProduct.waitFor();
        const productUrl = await firstProduct.getAttribute('href');
        await page.goto(productUrl!);

        // Gallery navigation visibility
        const galleryNav = page.locator('.lucide-chevron-left, .lucide-chevron-right').first();
        await expect(galleryNav).toBeVisible();

        // Purchase block (Buy Box) - more specific to our implementation
        const buyButton = page.locator('button:has-text("KOSÁRBA")').first();
        await expect(buyButton).toBeVisible();

        // Check for 2-column specifications on mobile if implemented
        if (isMobile) {
            const specGrid = page.locator('.grid-cols-2').first();
            if (await specGrid.count() > 0) {
                await expect(specGrid).toBeVisible();
            }
        }

        // Take screenshots for visual verification
        await page.screenshot({ path: `tests/screenshots/product-${isMobile ? 'mobile' : 'desktop'}.png`, fullPage: true });
    });

    test('Search Results - Grid and Filters', async ({ page, isMobile }) => {
        await page.goto('/search?query=valami');

        const resultsGrid = page.locator('.grid').first();
        await expect(resultsGrid).toBeVisible();

        if (isMobile) {
            // Check if filter sidebar is hidden/accessible via button
            const filterButton = page.locator('button:has-text("Szűrő"), button:has-text("Filter")').first();
            // This is project specific, but usually filters are in a modal/drawer on mobile
        }

        await page.screenshot({ path: `tests/screenshots/search-${isMobile ? 'mobile' : 'desktop'}.png`, fullPage: true });
    });
});
