import { test } from '@playwright/test';
import { login } from './helpers/login';

// Always signs in through the form, ignoring any saved session.
test.use({ storageState: { cookies: [], origins: [] } });

test('signs in with the demo credentials and shows the project list', async ({ page }) => {
  await login(page);
});
