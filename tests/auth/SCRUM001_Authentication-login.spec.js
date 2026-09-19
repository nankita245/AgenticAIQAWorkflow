const { test, expect } = require('../../fixtures/test-fixtures.js');
const LoginPage = require('../../pages/LoginPage');
const users = require('../../test-data/users.data.js');

test.describe('SCRUM001: Authentication tests', () => {
  test('SCRUM001: Admin can log in with valid credentials', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto('/web/index.php/auth/login');
    await login.login(users.admin.username, users.admin.password);
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator(login.dashboardWidget)).toBeVisible();
  });

  test('SCRUM001: Invalid credentials are rejected', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto('/web/index.php/auth/login');
    await page.fill("input[name='username']", 'Admin');
    await page.fill("input[name='password']", 'wrongpassword');
    await page.click("button[type='submit']");
    const alert = page.locator('.oxd-alert-content-text');
    await expect(alert).toHaveText('Invalid credentials');
  });

  test('SCRUM001: Empty field validation shows Required', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto('/web/index.php/auth/login');
    // Submit empty form
    await page.click("button[type='submit']");
    // Expect inline validation text 'Required' to appear
    const req = page.locator('text=Required');
    await expect(req.first()).toBeVisible();
  });

  test('SCRUM001: Logout clears session and blocks back-navigation', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto('/web/index.php/auth/login');
    await login.login(users.admin.username, users.admin.password);
    // Ensure logged in
    await expect(page.locator(login.dashboardWidget)).toBeVisible();
    // Perform logout
    await login.logout();
    // After logout, should be back at login page
    await expect(page).toHaveURL(/auth\/login/);
    // Try to navigate back: should not restore authenticated session
    await page.goBack();
    // Ensure we are still on login (or not on dashboard)
    await expect(page).not.toHaveURL(/dashboard/);
  });

  test('SCRUM001: Unauthorized direct URL access redirects to login', async ({ page }) => {
    const protectedUrl = '/web/index.php/pim/viewEmployeeList';
    await page.goto(new URL(protectedUrl, process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com').toString());
    // Expect redirect to login
    await expect(page).toHaveURL(/auth\/login/);
  });

  test('SCRUM001: SQL-injection style inputs are rejected and safe', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto('/web/index.php/auth/login');
    const injStrings = ["' OR '1'='1", "admin'--", "' OR 1=1 -- "];
    for (const s of injStrings) {
      await page.fill("input[name='username']", s);
      await page.fill("input[name='password']", s);
      await page.click("button[type='submit']");
      // Expect generic invalid credentials message and no stack traces
      const alert = page.locator('.oxd-alert-content-text');
      await expect(alert).toHaveText('Invalid credentials');
      const bodyText = await page.content();
      // Check for common stack-trace or SQL error markers and fail if found
      expect(bodyText).not.toMatch(/Exception|Stack trace|SQLSTATE|ORA-|Syntax error|Fatal error/i);
    }
  });
});
