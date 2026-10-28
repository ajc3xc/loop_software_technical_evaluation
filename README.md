# Asana-style board: data-driven Playwright suite

A Playwright + TypeScript suite that logs into the demo app at
https://create-asana-like-pr-39y5.bolt.host/ and checks where each task sits on the
board and which tags it carries. Every check is generated from one JSON file, so new
cases are added as data rather than as code.

## Setup

Requires Node.js 18 or later and npm.

```bash
npm install
npx playwright install chromium
```

## Run

```bash
npm test
```

Other commands:

```bash
npm run test:headed
npx playwright test -g "TC-02"
npm run test:list
npm run typecheck
npm run report
```

`npm run test:list` prints the generated tests without starting a browser.
`npm run typecheck` runs `tsc --noEmit`.

## Credentials and target

The login defaults come from the evaluation brief (`admin` / `password123`). Override
them with environment variables instead of editing the code:

```bash
DEMO_USERNAME=admin DEMO_PASSWORD=password123 npm test
DEMO_APP_URL=https://create-asana-like-pr-39y5.bolt.host/ npm test
```

## Layout

| Path | Purpose |
| --- | --- |
| `tests/data/board-cases.json` | The six cases. The only file to edit to add or change a check. |
| `tests/data/load-cases.ts` | Loads the JSON and fails fast on missing fields or duplicate ids. |
| `tests/board-cases.spec.ts` | Generates one test per JSON entry. Contains no per-case code. |
| `tests/helpers/login.ts` | Signs in and waits for the project list. Reads credentials from the environment. |
| `tests/pages/board-page.ts` | Page object: open a project, find a column, find a card, check its tags. |
| `tests/board-page.offline.spec.ts` | Runs the page object against static copies of the board markup. No network or login needed. |
| `playwright.config.ts` | Base URL, viewport (1440x900), retries in CI, and the trace and screenshot settings. |

## Adding a case

Add an object to `tests/data/board-cases.json`:

```json
{
  "id": "TC-07",
  "section": "Mobile Application",
  "column": "Review",
  "task": "Some task title",
  "tags": ["Feature"]
}
```

- `section` must match the project name shown in the sidebar.
- `column` must match the column title exactly (`To Do`, `In Progress`, `Review`, `Done`). The "(count)" suffix is ignored.
- `task` must match the card title exactly.
- `tags` lists tags that must appear on the card. Extra tags on the card are allowed.

`id` must be unique. The loader rejects duplicates and entries with missing fields.

## How the checks work

Each generated test does the following:

1. Logs in through the form and waits for the "Projects" heading.
2. Clicks the project in the sidebar and waits for its title.
3. Checks that the task heading is inside the column whose heading reads `<column> (<n>)`.
4. Checks that each expected tag is shown on that task's card.

The locators depend on the app's markup: sidebar buttons with an h2 project name, column
headings as h2 with a count, task titles as h3, and tags as spans. If the app's markup
changes, update `tests/pages/board-page.ts` and `tests/helpers/login.ts`. The JSON
file does not need to change.

## Notes

- The demo app's login is checked in the browser, against credentials in its own
  code. This suite exercises the UI as a user would. It does not test real authentication.
- Failed tests keep a trace and a screenshot. Open them with `npm run report`.
