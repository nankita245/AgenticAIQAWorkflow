const BasePage = require('./BasePage');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.username = "input[name='username']";
    this.password = "input[name='password']";
    this.submit = "button[type='submit']";
    this.userDropdown = '.oxd-userdropdown-tab';
    this.logoutMenuItem = 'text=Logout';
    this.dashboardWidget = 'text=Time at Work';
  }

  async login(username, password) {
    await this.page.fill(this.username, username);
    await this.page.fill(this.password, password);
    await Promise.all([
      this.page.waitForSelector(this.dashboardWidget, { timeout: 10000 }),
      this.page.click(this.submit),
    ]);
  }

  async logout() {
    await this.page.click(this.userDropdown);
    await this.page.click(this.logoutMenuItem);
    await this.page.waitForSelector(this.submit);
  }
}

module.exports = LoginPage;
