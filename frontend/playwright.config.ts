import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@playwright/test';
import baseConfig from './playwright.config.base';

const e2eEnvPath = fileURLToPath(new URL('./.env.e2e', import.meta.url));
if (existsSync(e2eEnvPath)) {
  process.loadEnvFile(e2eEnvPath);
}

function getTimeout(name: string, fallback: number | undefined): number | undefined {
  const rawValue = process.env[name]?.trim();
  if (!rawValue) return fallback;

  const timeout = Number(rawValue);
  if (!Number.isSafeInteger(timeout) || timeout <= 0) {
    throw new Error(`${name} debe ser un entero mayor que cero.`);
  }

  return timeout;
}

export default defineConfig({
  ...baseConfig,
  timeout: getTimeout('PLAYWRIGHT_TIMEOUT', baseConfig.timeout),
  testDir: './tests',
  use: {
    ...baseConfig.use,
    baseURL: process.env.BASE_URL || 'http://localhost:5174',
    actionTimeout: getTimeout('ACTION_TIMEOUT', baseConfig.use?.actionTimeout),
    navigationTimeout: getTimeout('NAVIGATION_TIMEOUT', baseConfig.use?.navigationTimeout),
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
