import { type Page, type Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class IdentitiesPage extends BasePage {
  readonly identitiesTable: Locator
  readonly createButton: Locator
  readonly searchInput: Locator
  readonly emptyState: Locator
  readonly paginationNext: Locator
  readonly paginationPrev: Locator

  constructor(page: Page) {
    super(page)
    this.identitiesTable = page.locator('[data-testid="identities-table"]')
    this.createButton = page.locator('[data-testid="create-identity-button"]')
    this.searchInput = page.locator('[data-testid="search-input"]')
    this.emptyState = page.locator('[data-testid="empty-state"]')
    this.paginationNext = page.locator('[data-testid="pagination-next"]')
    this.paginationPrev = page.locator('[data-testid="pagination-prev"]')
  }

  async gotoIdentities() {
    await this.goto('/identities')
  }

  async getIdentityRows(): Promise<Locator> {
    return this.identitiesTable.locator('tbody tr')
  }

  async getIdentityCount(): Promise<number> {
    const rows = await this.getIdentityRows()
    return await rows.count()
  }

  async clickIdentity(index: number) {
    const rows = await this.getIdentityRows()
    await rows.nth(index).click()
  }

  async clickCreateIdentity() {
    await this.createButton.click()
  }

  async searchIdentities(query: string) {
    await this.searchInput.fill(query)
    await this.page.waitForTimeout(500) // Debounce
  }

  async expectIdentityInTable(email: string) {
    await expect(this.identitiesTable.getByText(email)).toBeVisible()
  }

  async deleteIdentity(index: number) {
    const rows = await this.getIdentityRows()
    const deleteButton = rows.nth(index).locator('[data-testid="delete-button"]')
    await deleteButton.click()

    // Confirm deletion
    await this.page.locator('[data-testid="confirm-delete"]').click()
  }
}
