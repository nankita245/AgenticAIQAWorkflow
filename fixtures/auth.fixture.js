// Auth fixture: basic login flow that uses env vars.
const { test: base } = require('@playwright/test');

const test = base.extend({
  auth: async ({ page }, use) => {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const username = process.env.TEST_USERNAME || '';
    const password = process.env.TEST_PASSWORD || '';

    // Minimal login flow — adapt selectors to your app
    await page.goto(baseUrl);
    try {
      if (username) await page.fill('input[name="username"]', username);
      if (password) await page.fill('input[name="password"]', password);
      await page.click('button[type="submit"]');
    } catch (e) {
      // silent: tests can override with their own flow
    }

    await use({ page });
  },
});

module.exports = test;
