import { type Page, type Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class SettingsPage extends BasePage {
  readonly apiEndpointInput: Locator
  readonly saveButton: Locator
  readonly connectionStatus: Locator
  readonly testConnectionButton: Locator
  readonly resetButton: Locator

  constructor(page: Page) {
    super(page)
    this.apiEndpointInput = page.locator('[data-testid="api-endpoint-input"]')
    this.saveButton = page.locator('[data-testid="save-settings-button"]')
    this.connectionStatus = page.locator('[data-testid="connection-status"]')
    this.testConnectionButton = page.locator('[data-testid="test-connection-button"]')
    this.resetButton = page.locator('[data-testid="reset-settings-button"]')
  }

  async gotoSettings() {
    await this.goto('/settings')
  }

  async setApiEndpoint(endpoint: string) {
    await this.apiEndpointInput.clear()
    await this.apiEndpointInput.fill(endpoint)
  }

  async saveSettings() {
    await this.saveButton.click()
  }

  async testConnection() {
    await this.testConnectionButton.click()
    await this.page.waitForTimeout(500)
  }

  async resetSettings() {
    await this.resetButton.click()
  }

  async expectConnectionStatus(status: 'connected' | 'disconnected' | 'error') {
    await expect(this.connectionStatus).toHaveAttribute('data-status', status)
  }
}
