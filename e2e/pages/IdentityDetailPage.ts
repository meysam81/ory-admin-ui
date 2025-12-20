import type { Page, Locator } from "@playwright/test"
import { expect } from "@playwright/test"
import { BasePage } from "./BasePage"

export class IdentityDetailPage extends BasePage {
  readonly identityId: Locator
  readonly identityEmail: Locator
  readonly identityState: Locator
  readonly editButton: Locator
  readonly deleteButton: Locator
  readonly sessionsTab: Locator
  readonly credentialsTab: Locator
  readonly metadataTab: Locator
  readonly createRecoveryLinkButton: Locator
  readonly revokeAllSessionsButton: Locator

  constructor(page: Page) {
    super(page)
    this.identityId = page.locator('[data-testid="identity-id"]')
    this.identityEmail = page.locator('[data-testid="identity-email"]')
    this.identityState = page.locator('[data-testid="identity-state"]')
    this.editButton = page.locator('[data-testid="edit-identity-button"]')
    this.deleteButton = page.locator('[data-testid="delete-identity-button"]')
    this.sessionsTab = page.locator('[data-testid="sessions-tab"]')
    this.credentialsTab = page.locator('[data-testid="credentials-tab"]')
    this.metadataTab = page.locator('[data-testid="metadata-tab"]')
    this.createRecoveryLinkButton = page.locator('[data-testid="create-recovery-link"]')
    this.revokeAllSessionsButton = page.locator('[data-testid="revoke-all-sessions"]')
  }

  async gotoIdentity(id: string) {
    await this.goto(`/identities/${id}`)
  }

  async expectIdentityLoaded(id: string) {
    await expect(this.identityId).toContainText(id.substring(0, 8))
  }

  async clickEdit() {
    await this.editButton.click()
  }

  async clickDelete() {
    await this.deleteButton.click()
  }

  async confirmDelete() {
    await this.page.locator('[data-testid="confirm-delete"]').click()
  }

  async goToSessionsTab() {
    await this.sessionsTab.click()
  }

  async goToCredentialsTab() {
    await this.credentialsTab.click()
  }

  async createRecoveryLink() {
    await this.createRecoveryLinkButton.click()
    await expect(this.page.locator('[data-testid="recovery-link"]')).toBeVisible()
  }

  async revokeAllSessions() {
    await this.revokeAllSessionsButton.click()
    await this.page.locator('[data-testid="confirm-revoke"]').click()
  }
}
