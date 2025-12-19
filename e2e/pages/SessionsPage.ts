import { type Page, type Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class SessionsPage extends BasePage {
  readonly sessionsTable: Locator
  readonly filterActive: Locator
  readonly filterInactive: Locator
  readonly emptyState: Locator

  constructor(page: Page) {
    super(page)
    this.sessionsTable = page.locator('[data-testid="sessions-table"]')
    this.filterActive = page.locator('[data-testid="filter-active"]')
    this.filterInactive = page.locator('[data-testid="filter-inactive"]')
    this.emptyState = page.locator('[data-testid="empty-state"]')
  }

  async gotoSessions() {
    await this.goto('/sessions')
  }

  async getSessionRows(): Promise<Locator> {
    return this.sessionsTable.locator('tbody tr')
  }

  async getSessionCount(): Promise<number> {
    const rows = await this.getSessionRows()
    return await rows.count()
  }

  async clickSession(index: number) {
    const rows = await this.getSessionRows()
    await rows.nth(index).click()
  }

  async filterByActive() {
    await this.filterActive.click()
    await this.waitForLoad()
  }

  async filterByInactive() {
    await this.filterInactive.click()
    await this.waitForLoad()
  }

  async revokeSession(index: number) {
    const rows = await this.getSessionRows()
    const revokeButton = rows.nth(index).locator('[data-testid="revoke-session"]')
    await revokeButton.click()
    await this.page.locator('[data-testid="confirm-revoke"]').click()
  }
}
