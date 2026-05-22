const { firefox } = require('@playwright/test').default || require('playwright');

(async () => {
  const { firefox: fx } = require('@playwright/test');
  const b = await fx.launch({ headless: true });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  await page.goto('https://wdesignkit.com/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await page.fill('input[type="text"]', 'devpanchal.posimyth@gmail.com');
  await page.fill('input[type="password"]', 'Dev@0107');
  await page.press('input[type="password"]', 'Enter');
  await page.waitForURL(/admin/, { timeout: 15000 });

  await page.goto('https://wdesignkit.com/admin/widgets/edit/12422', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  await page.screenshot({ path: 'reports/screenshots/builder-top.png' });
  await page.evaluate(() => window.scrollTo(0, 700));
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'reports/screenshots/builder-mid.png' });
  await page.evaluate(() => window.scrollTo(0, 1400));
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'reports/screenshots/builder-bottom.png' });
  await page.screenshot({ path: 'reports/screenshots/builder-fullpage.png', fullPage: true });

  // Also capture Push Elementor builder (12415)
  await page.goto('https://wdesignkit.com/admin/widgets/edit/12415', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'reports/screenshots/builder-elementor.png', fullPage: true });

  // Capture console errors
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('https://wdesignkit.com/admin/widgets/edit/12422', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  console.log('Console errors:', JSON.stringify(errors, null, 2));

  await b.close();
})();
