import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';

// Saved login session written by `npm run auth:save`. Only used when DEMO_USE_SAVED_SESSION=1,
// so the default run still signs in through the form.
const savedSession = path.resolve(__dirname, process.env.DEMO_SESSION_FILE || path.join('.auth', 'demo.json'));
const useSavedSession = process.env.DEMO_USE_SAVED_SESSION === '1';

if (useSavedSession && !fs.existsSync(savedSession)) {
  throw new Error(`DEMO_USE_SAVED_SESSION=1 but ${savedSession} is missing. Run: npm run auth:save`);
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.DEMO_APP_URL ?? 'https://create-asana-like-pr-39y5.bolt.host/',
    storageState: useSavedSession ? savedSession : undefined,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],
});
