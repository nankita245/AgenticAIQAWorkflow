// BasePage: simple page object skeleton
// Load environment variables from .env
require('dotenv').config();
class BasePage {
  constructor(page) {
    this.page = page;
  }

  async goto(path = '/') {
    const base = process.env.BASE_URL || 'http://localhost:3000';
    await this.page.goto(new URL(path, base).toString());
  }

  async click(selector) {
    await this.page.click(selector);
  }

  async fill(selector, value) {
    await this.page.fill(selector, value);
  }

  async textContent(selector) {
    return this.page.textContent(selector);
  }
}

module.exports = BasePage;
