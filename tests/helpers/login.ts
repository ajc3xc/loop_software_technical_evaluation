import { expect, type Page } from '@playwright/test';

export interface DemoCredentials {
  username: string;
  password: string;
}

/** Reads credentials from the environment, falling back to the demo values from the brief. */
export const demoCredentials: DemoCredentials = {
  username: process.env.DEMO_USERNAME || 'admin',
  password: process.env.DEMO_PASSWORD || 'password123',
};

const LOGIN_ERROR = 'Invalid username or password';

/**
 * Signs in through the login form. Waits for either the project list or the app's
 * error message, and fails with that message when the credentials are rejected.
 */
export async function login(page: Page, credentials: DemoCredentials = demoCredentials): Promise<void> {
  await page.goto('/');
  await page.getByLabel('Username', { exact: true }).fill(credentials.username);
  await page.getByLabel('Password', { exact: true }).fill(credentials.password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();

  const projects = page.getByRole('heading', { level: 1, name: 'Projects', exact: true });
  const error = page.getByText(LOGIN_ERROR, { exact: true });
  await expect(projects.or(error)).toBeVisible();

  if (await error.isVisible()) {
    throw new Error(`Login failed for "${credentials.username}": ${LOGIN_ERROR}`);
  }
}
