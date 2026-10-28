import { expect, type Locator, type Page } from '@playwright/test';

const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Page object for the project board.
 *
 * Markup it relies on: the sidebar lists each project as a button whose h2 is the
 * project name. Each column is a div whose h2 reads "<title> (<count>)". Each task
 * card is a div whose h3 is the task title, followed by one span per tag.
 */
export class BoardPage {
  constructor(private readonly page: Page) {}

  /** Opens a project from the sidebar and waits for its title to appear. */
  async openSection(section: string): Promise<void> {
    await this.page
      .getByRole('navigation')
      .getByRole('button')
      .filter({ has: this.page.getByRole('heading', { level: 2, name: section, exact: true }) })
      .click();

    await expect(this.page.getByRole('heading', { level: 1, name: section, exact: true })).toBeVisible();
  }

  /** The column container for a title such as "To Do". The count in the heading is ignored. */
  column(title: string): Locator {
    return this.page
      .getByRole('heading', { level: 2, name: new RegExp(`^${escapeRegExp(title)}\\s+\\(\\d+\\)$`) })
      .locator('xpath=..');
  }

  /** The card container for a task title inside the given column. */
  card(column: string, task: string): Locator {
    return this.column(column).getByRole('heading', { level: 3, name: task, exact: true }).locator('xpath=..');
  }

  async expectTaskInColumn(column: string, task: string): Promise<void> {
    await expect(this.column(column).getByRole('heading', { level: 3, name: task, exact: true })).toBeVisible();
  }

  async expectTaskTags(column: string, task: string, tags: string[]): Promise<void> {
    const card = this.card(column, task);
    for (const tag of tags) {
      await expect(card.getByText(tag, { exact: true })).toBeVisible();
    }
  }
}
