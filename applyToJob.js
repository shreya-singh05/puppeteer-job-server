const puppeteer = require('puppeteer');

module.exports = async function applyToJob({ link }) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  let page = await browser.newPage();

  try {
    console.log(`Navigating to: ${link}`);
    await page.goto(link, { waitUntil: 'networkidle2' });

    const possibleApplyButtons = [
      'a[href*="apply"]',
      'button:contains("Apply")',
      'button:contains("Continue")',
    ];

    for (const selector of possibleApplyButtons) {
      const exists = await page.$(selector);
      if (exists) {
        await page.click(selector);
        await page.waitForTimeout(2000);
        break;
      }
    }

    const pages = await browser.pages();
    if (pages.length > 1) {
      page = pages[pages.length - 1];
    }

    await page.waitForSelector('button[type="submit"], input[type="submit"]', { timeout: 10000 });

    if (await page.$('input[name="name"]')) {
      await page.type('input[name="name"]', 'John Doe');
    }
    if (await page.$('input[name="email"]')) {
      await page.type('input[name="email"]', 'john@example.com');
    }

    const submitBtn = await page.$('button[type="submit"], input[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
      await page.waitForTimeout(3000);
    }

    const bodyText = await page.evaluate(() => document.body.innerText);
    const success = /thank you|application received|successfully applied/i.test(bodyText);

    return {
      success,
      message: success ? 'Application submitted successfully' : 'Application may not have succeeded',
      finalUrl: page.url(),
    };
  } catch (err) {
    return { success: false, error: err.message };
  } finally {
    await browser.close();
  }
};
