const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'test-results/html-report', open: 'never' }]
  ],

  use: {
    baseURL:
      process.env.BASE_URL ||
      'https://opensource-demo.orangehrmlive.com',

    trace: 'on-first-retry',

    screenshot: 'only-on-failure',

    video: 'retain-on-failure'
  },

  projects: [
    {
      name: 'chrome',

      use: {
        ...devices['Desktop Chrome'],

        channel: 'chrome'
      }
    },

    // {
    //   name: 'webkit',

    //   use: {
    //     ...devices['Desktop Safari'],

    //     browserName: 'webkit'
    //   }
    // }
  ]
});