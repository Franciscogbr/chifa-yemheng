import { defineConfig } from '@playwright/test';
import baseConfig from './playwright.config.base';

export default defineConfig({
  ...baseConfig,
  testDir: './tests',
  use: {
    ...baseConfig.use,
    baseURL: process.env.BASE_URL || 'http://localhost:5174',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...baseConfig.use, browserName: 'chromium' },
    },
    {
      name: 'firefox',
      use: { ...baseConfig.use, browserName: 'firefox' },
    },
    {
      name: 'webkit',
      use: { ...baseConfig.use, browserName: 'webkit' },
    },
  ],
});
