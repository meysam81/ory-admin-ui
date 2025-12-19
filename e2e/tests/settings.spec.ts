import { test, expect } from '@playwright/test'
import { SettingsPage } from '../pages/SettingsPage'

test.describe('Settings', () => {
  test('displays current API endpoint', async ({ page }) => {
    const settingsPage = new SettingsPage(page)
    await settingsPage.gotoSettings()

    // API endpoint input should be visible and have a value
    await expect(settingsPage.apiEndpointInput).toBeVisible()
    await expect(settingsPage.apiEndpointInput).toHaveValue(/http/)
  })

  test('can modify API endpoint', async ({ page }) => {
    const settingsPage = new SettingsPage(page)
    await settingsPage.gotoSettings()

    await settingsPage.setApiEndpoint('http://new-endpoint:4434')

    await expect(settingsPage.apiEndpointInput).toHaveValue('http://new-endpoint:4434')
  })

  test('persists API endpoint after reload', async ({ page }) => {
    const settingsPage = new SettingsPage(page)
    await settingsPage.gotoSettings()

    // Set a new endpoint
    await settingsPage.setApiEndpoint('http://test-endpoint:4434')
    await settingsPage.saveSettings()

    // Reload the page
    await page.reload()

    // Value should persist
    await expect(settingsPage.apiEndpointInput).toHaveValue('http://test-endpoint:4434')
  })

  test('shows save button', async ({ page }) => {
    const settingsPage = new SettingsPage(page)
    await settingsPage.gotoSettings()

    await expect(settingsPage.saveButton).toBeVisible()
  })
})
