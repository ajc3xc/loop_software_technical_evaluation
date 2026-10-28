import { expect, test } from '@playwright/test';
import { BoardPage } from './pages/board-page';
import { loadBoardCases } from './data/load-cases';

// Offline check of the page object. It renders a static copy of the board markup
// with page.setContent, so it needs no network and no login. It proves the locators
// match the markup the demo app renders and that a wrong column is reported.

const boardCases = loadBoardCases();

type Columns = Record<string, { task: string; tags: string[] }[]>;

const escapeHtml = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const sectionNames = [...new Set(boardCases.map((boardCase) => boardCase.section))];

function columnsFor(section: string): Columns {
  const columns: Columns = {};
  for (const boardCase of boardCases) {
    if (boardCase.section === section) {
      (columns[boardCase.column] ??= []).push({ task: boardCase.task, tags: boardCase.tags });
    }
  }
  return columns;
}

function boardHtml(section: string, columns: Columns): string {
  const nav = sectionNames
    .map((name) => `<button><h2>${escapeHtml(name)}</h2><p>Demo project</p></button>`)
    .join('');

  const columnMarkup = Object.entries(columns)
    .map(([title, tasks]) => {
      const cards = tasks
        .map(
          ({ task, tags }) =>
            `<div><h3>${escapeHtml(task)}</h3><p>Description</p>` +
            `<div>${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div></div>`,
        )
        .join('');
      return `<div><h2>${escapeHtml(title)} <span>(${tasks.length})</span></h2><div>${cards}</div></div>`;
    })
    .join('');

  return (
    `<aside><nav>${nav}</nav></aside>` +
    `<header><h1>${escapeHtml(section)}</h1></header>` +
    `<main>${columnMarkup}</main>`
  );
}

test.describe('Board page object against static markup', () => {
  for (const section of sectionNames) {
    test(`finds every case on the ${section} board`, async ({ page }) => {
      await page.setContent(boardHtml(section, columnsFor(section)));

      const board = new BoardPage(page);
      await board.openSection(section);

      for (const boardCase of boardCases.filter((item) => item.section === section)) {
        await board.expectTaskInColumn(boardCase.column, boardCase.task);
        await board.expectTaskTags(boardCase.column, boardCase.task, boardCase.tags);
      }
    });
  }

  test('reports a task that sits in the wrong column', async ({ page }) => {
    const columns = columnsFor('Web Application');
    const moved = { task: 'Implement user authentication', tags: ['Feature', 'High Priority'] };
    columns['To Do'] = columns['To Do'].filter((item) => item.task !== moved.task);
    columns['Done'] = [...(columns['Done'] ?? []), moved];

    await page.setContent(boardHtml('Web Application', columns));

    const board = new BoardPage(page);
    await board.openSection('Web Application');
    await expect(board.expectTaskInColumn('To Do', moved.task)).rejects.toThrow();
  });
});
