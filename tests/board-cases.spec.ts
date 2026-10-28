import { test } from '@playwright/test';
import { openSignedIn } from './helpers/login';
import { BoardPage } from './pages/board-page';
import { loadBoardCases } from './data/load-cases';

// One test per entry in tests/data/board-cases.json. To add a case, add a JSON entry.
const boardCases = loadBoardCases();

test.describe('Project board: task column and tags', () => {
  for (const boardCase of boardCases) {
    test(`${boardCase.id}: "${boardCase.task}" is in "${boardCase.column}" on ${boardCase.section}`, async ({ page }) => {
      await openSignedIn(page);

      const board = new BoardPage(page);
      await board.openSection(boardCase.section);
      await board.expectTaskInColumn(boardCase.column, boardCase.task);
      await board.expectTaskTags(boardCase.column, boardCase.task, boardCase.tags);
    });
  }
});
