import { expect, type Page } from '@playwright/test';

export interface DemoCredentials {
  username: string;
  password: string;
}

/** Reads credentials from the environment, falling back to the demo values from the brief. */
export const demoCredentials: DemoCredentials = {
  username: process.env.DEMO_USERNAME ?? 'admin',
  password: process.env.DEMO_PASSWORD ?? 'password123',
};

/** Signs in through the login form and waits until the project list is shown. */
export async function login(page: Page, credentials: DemoCredentials = demoCredentials): Promise<void> {
  await page.goto('/');
  await page.getByLabel('Username', { exact: true }).fill(credentials.username);
  await page.getByLabel('Password', { exact: true }).fill(credentials.password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Projects', exact: true })).toBeVisible();
}
