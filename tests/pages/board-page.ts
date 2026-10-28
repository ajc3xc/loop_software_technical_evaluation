import { expect, type Locator, type Page } from '@playwright/test';

const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Page object for the project board.
 *
 * Markup it relies on: the sidebar lists each project as a button whose h2 is the
 * project name. The main header holds an h1 with the open project's name. Each column
 * is a div whose h2 reads "<title> (<count>)", with its task cards inside. Each task
 * card is a div whose h3 is the task title, followed by a div holding one span per tag.
 */
export class BoardPage {
  constructor(private readonly page: Page) {}

  /** Opens a project from the sidebar and waits for the header to show its name. */
  async openSection(section: string): Promise<void> {
    const header = this.page.locator('header h1');

    // The app opens on its first project. Switch away first, so the click below really changes the view.
    if ((await header.textContent())?.trim() === section) {
      await this.sidebarButtons().filter({ hasNot: this.projectHeading(section) }).first().click();
      await expect(header).not.toHaveText(section);
    }

    await this.sidebarButtons().filter({ has: this.projectHeading(section) }).click();
    await expect(header).toHaveText(section);
  }

  /**
   * The column container for a title such as "To Do". The count in the heading is ignored.
   * Assumes the heading's parent is the column container, which holds the heading and its cards.
   */
  column(title: string): Locator {
    return this.page
      .getByRole('heading', { level: 2, name: new RegExp(`^${escapeRegExp(title)}\\s+\\(\\d+\\)$`) })
      .locator('xpath=..');
  }

  /**
   * The card container for a task title inside the given column.
   * Assumes the task heading's parent is the card container, which holds the title and tags.
   */
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

  private sidebarButtons(): Locator {
    return this.page.getByRole('navigation').getByRole('button');
  }

  private projectHeading(name: string): Locator {
    return this.page.getByRole('heading', { level: 2, name, exact: true });
  }
}
