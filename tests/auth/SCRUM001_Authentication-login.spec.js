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
});
