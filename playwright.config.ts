import { defineConfig, devices } from '@playwright/test';

import dotenv from 'dotenv';

dotenv.config({
  path: '.env.local',
});

export default defineConfig({
  testDir: './e2e',

  /*
   * Os testes usam o mesmo servidor Next,
   * banco e usuário administrativo.
   *
   * Rodamos em apenas um worker para evitar
   * interferência entre os fluxos E2E.
   */
  workers: 1,

  fullyParallel: false,

  retries: process.env.CI ? 2 : 0,

  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',

    trace: 'on-first-retry',

    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',

      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],

  webServer: {
    command: 'npm run dev',

    url: 'http://localhost:3000',

    reuseExistingServer: !process.env.CI,

    timeout: 120 * 1000,
  },
});
