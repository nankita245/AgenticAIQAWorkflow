// test-fixtures: re-exports `test` and `expect`, and includes auth-ready test
const authTest = require('./auth.fixture.js');
const { expect } = require('@playwright/test');

module.exports = {
  test: authTest,
  expect,
};
