import { test, expect, Page } from '@playwright/test';

const TARGET_URL = 'http://localhost:3000';

async function checkTouchTargets(page: Page) {
    const clickableElements = await page.locator('button, a, input[type="button"], input[type="submit"], [role="button"], .cursor-pointer').all();
    const smallTargets: string[] = [];
    
    for (const element of clickableElements) {
        if (await element.isVisible()) {
            const box = await element.boundingBox();
            if (box && (box.width < 44 || box.height < 44)) {
                // Ignore very small decorative elements or icons that might be part of a larger target
                if (box.width < 10 || box.height < 10) continue;
                
                const text = await element.innerText() || await element.getAttribute('aria-label') || await element.getAttribute('title') || 'unnamed';
                smallTargets.push(`${text.trim()} (${Math.round(box.width)}x${Math.round(box.height)})`);
            }
        }
    }
    return smallTargets;
}

async function checkHorizontalScroll(page: Page) {
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    return scrollWidth > clientWidth;
}

async function checkFontSizes(page: Page) {
    const inputs = await page.locator('input, textarea, select').all();
    const smallFonts: string[] = [];

    for (const input of inputs) {
        if (await input.isVisible()) {
            const fontSize = await input.evaluate(el => window.getComputedStyle(el).fontSize);
            const size = parseFloat(fontSize);
            if (size < 16) {
                const name = await input.getAttribute('name') || await input.getAttribute('placeholder') || 'unnamed';
                smallFonts.push(`${name} (${fontSize})`);
            }
        }
    }
    return smallFonts;
}

test.describe('Mobile-Friendly Audit', () => {
    
    const pagesToAudit = [
        { name: 'Home', path: '/' },
        { name: 'Search', path: '/search?query=alfa' },
        { name: 'Product', path: '/product/fec71047-8170-43f9-813b-96decb9f3877' },
        { name: 'About', path: '/about' },
        { name: 'Contact', path: '/contact' },
        { name: 'FAQ', path: '/faq' },
        { name: 'Garage', path: '/garage' },
        { name: 'How-It-Works', path: '/how-it-works' },
        { name: 'Impressum', path: '/impressum' },
        { name: 'Privacy', path: '/privacy' },
        { name: 'Terms', path: '/terms' },
        { name: 'Warranty', path: '/warranty' },
        { name: 'Login', path: '/login' },
        { name: 'Register', path: '/auth/register' }
    ];

    for (const targetPage of pagesToAudit) {
        test(`Audit Page: ${targetPage.name}`, async ({ page, isMobile, viewport }) => {
            test.skip(!isMobile, 'Only running mobile audit on mobile devices');
            
            const deviceName = page.viewportSize()?.width === 390 ? 'iPhone-14' : 'Pixel-7';
            
            // Try to navigate, if it fails (e.g. 404 for product), just skip or log
            try {
                const response = await page.goto(`${TARGET_URL}${targetPage.path}`, { waitUntil: 'networkidle' });
                if (response?.status() === 404 && targetPage.name === 'Product') {
                    console.log(`Skipping Product page audit: No active product found at ${targetPage.path}`);
                    return;
                }
            } catch (e) {
                console.error(`Failed to navigate to ${targetPage.path}:`, e);
                return;
            }

            // 1. Horizontal Scroll Check
            const hasHorizontalScroll = await checkHorizontalScroll(page);
            if (hasHorizontalScroll) {
                console.warn(`[${deviceName}] ${targetPage.name}: Horizontal scroll detected!`);
            }
            expect(hasHorizontalScroll, `Horizontal scroll found on ${targetPage.name}`).toBe(false);

            // 2. Touch Target Check
            const smallTargets = await checkTouchTargets(page);
            if (smallTargets.length > 0) {
                console.warn(`[${deviceName}] ${targetPage.name}: Small touch targets found: ${smallTargets.slice(0, 10).join(', ')}`);
            }

            // 3. Font Size Check (iOS specific concern)
            const smallFonts = await checkFontSizes(page);
            if (smallFonts.length > 0) {
                console.warn(`[${deviceName}] ${targetPage.name}: Small fonts in inputs: ${smallFonts.slice(0, 5).join(', ')}`);
            }

            // 4. Capture Screenshot
            await page.screenshot({ 
                path: `tests/screenshots/audit/${deviceName}/${targetPage.name}.png`, 
                fullPage: true 
            });
        });
    }

    test('Interactive Audit: Mobile Menu', async ({ page, isMobile }) => {
        if (!isMobile) return;
        const deviceName = page.viewportSize()?.width === 390 ? 'iPhone-14' : 'Pixel-7';

        await page.goto(TARGET_URL);
        // Look for common menu button patterns
        const menuButton = page.locator('button').filter({ has: page.locator('svg') }).first();
        
        if (await menuButton.isVisible()) {
            await menuButton.click();
            await page.waitForTimeout(500); // Wait for animation
            await page.screenshot({ path: `tests/screenshots/audit/${deviceName}/Mobile-Menu-Open.png` });
            
            // Check if menu content is visible
            const navLinks = page.locator('nav a, div[role="menu"] a');
            // We don't want to fail the whole test if the menu structure is different, just log
            const count = await navLinks.count();
            if (count === 0) {
                console.warn(`[${deviceName}] No navigation links found in open menu.`);
            }
        }
    });

    test('Interactive Audit: Search Filters', async ({ page, isMobile }) => {
        if (!isMobile) return;
        const deviceName = page.viewportSize()?.width === 390 ? 'iPhone-14' : 'Pixel-7';

        await page.goto(`${TARGET_URL}/search?query=alfa`);
        const filterButton = page.locator('button:has-text("Szűrő"), button:has-text("Filter"), button:has(.lucide-filter)').first();
        
        if (await filterButton.isVisible()) {
            await filterButton.click();
            await page.waitForTimeout(500);
            await page.screenshot({ path: `tests/screenshots/audit/${deviceName}/Search-Filters-Open.png` });
        }
    });
});
