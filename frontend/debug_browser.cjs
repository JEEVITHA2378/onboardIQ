const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER_LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER_ERROR:', err.message));
  
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
  
  await page.waitForTimeout(3000);
  const content = await page.content();
  console.log('FULL_HTML:');
  console.log(content);
  
  await browser.close();
})();
