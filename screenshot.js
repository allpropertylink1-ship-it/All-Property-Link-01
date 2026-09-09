const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('https://allpropertylink.co.ke', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  
  // Scroll to the CategoryGrid section
  await page.locator('text=Browse by Category').first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'homepage-desktop.png', fullPage: false });
  console.log('Screenshot saved to homepage-desktop.png');
  
  // Also take mobile view
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'homepage-mobile.png', fullPage: false });
  console.log('Screenshot saved to homepage-mobile.png');
  
  await browser.close();
})();