// Opens the demo app in a visible browser and waits for you to sign in yourself. Once the
// project board appears, it saves the signed-in session for `npm run test:live`.
// This script never types a password. Only the board is read to detect the sign-in.
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const appUrl = process.env.DEMO_APP_URL || 'https://create-asana-like-pr-39y5.bolt.host/';
const sessionFile = path.resolve(__dirname, '..', process.env.DEMO_SESSION_FILE || '.auth/demo.json');
const waitMinutes = 10;

(async () => {
  const browser = await chromium.launch({ headless: false });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(appUrl);

    console.log('Sign in in the browser window that just opened.');
    console.log(`The session saves automatically once the project board appears (waiting up to ${waitMinutes} minutes).`);

    await page
      .getByRole('heading', { level: 1, name: 'Projects', exact: true })
      .waitFor({ state: 'visible', timeout: waitMinutes * 60 * 1000 });

    fs.mkdirSync(path.dirname(sessionFile), { recursive: true });
    await context.storageState({ path: sessionFile });
    console.log(`Saved signed-in session to ${sessionFile}`);
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(`Session not saved: ${error.message}`);
  process.exit(1);
});
