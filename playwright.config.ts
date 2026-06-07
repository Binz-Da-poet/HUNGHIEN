import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  retries: 0,
  workers: 1,
  reporter: [['html'], ['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: 'pnpm --filter api dev',
      port: 3001,
      reuseExistingServer: true,
      timeout: 30_000,
    },
    {
      command: 'pnpm --filter storefront dev',
      port: 3000,
      reuseExistingServer: true,
      timeout: 30_000,
    },
    {
      command: 'pnpm --filter admin dev',
      port: 3002,
      reuseExistingServer: true,
      timeout: 30_000,
    },
  ],
});
