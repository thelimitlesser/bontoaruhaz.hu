const { chromium } = require('playwright');

(async () => {
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    await page.setViewportSize({ width: 800, height: 1200 });
    
    console.log('Navigating to http://localhost:8008/ajanlat.html...');
    await page.goto('http://localhost:8008/ajanlat.html', { waitUntil: 'networkidle' });
    
    console.log('Emulating print media...');
    await page.emulateMedia({ media: 'print' });
    
    const screenshotPath = '/Users/erdelyipeter/Árajánlat:szerződés/ajanlat_full_print_emulation.png';
    console.log('Taking full-page screenshot...');
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });
    
    console.log('Screenshot saved to: ' + screenshotPath);
    await browser.close();
  } catch (err) {
    console.error('Error taking screenshot:', err);
  }
})();
