const { chromium } = require('playwright');

(async () => {
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    console.log('Navigating to http://localhost:8008/ajanlat.html...');
    await page.goto('http://localhost:8008/ajanlat.html', { waitUntil: 'networkidle' });
    
    const pdfPath = '/Users/erdelyipeter/Árajánlat:szerződés/ajanlat_preview.pdf';
    console.log('Generating PDF...');
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      margin: {
        top: '0',
        bottom: '0',
        left: '0',
        right: '0'
      },
      printBackground: true
    });
    
    console.log('PDF saved to: ' + pdfPath);
    await browser.close();
  } catch (err) {
    console.error('Error generating PDF:', err);
  }
})();
