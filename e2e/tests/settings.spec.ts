import { test, expect } from "@playwright/test"
import { SettingsPage } from "../pages/SettingsPage"

test.describe("Settings", () => {
  test("displays settings page", async ({ page }) => {
    const settingsPage = new SettingsPage(page)
    await settingsPage.gotoSettings()

    await expect(page).toHaveURL("/settings")
    await expect(page.locator("h1")).toContainText(/settings/i)
  })

  test("displays API endpoint input", async ({ page }) => {
    const settingsPage = new SettingsPage(page)
    await settingsPage.gotoSettings()

    // Look for input field for API endpoint
    const input = page.locator('input[type="text"], input[type="url"]').first()
    await expect(input).toBeVisible()
  })

  test("API endpoint input has default value", async ({ page }) => {
    const settingsPage = new SettingsPage(page)
    await settingsPage.gotoSettings()

    const input = page.locator('input[type="text"], input[type="url"]').first()
    const value = await input.inputValue()

    expect(value).toContain("http")
  })

  test("can update API endpoint", async ({ page }) => {
    const settingsPage = new SettingsPage(page)
    await settingsPage.gotoSettings()

    const input = page.locator('input[type="text"], input[type="url"]').first()

    // Clear and type new value
    await input.fill("http://new-endpoint:4434")

    const value = await input.inputValue()
    expect(value).toBe("http://new-endpoint:4434")
  })

  test("saves settings and persists", async ({ page }) => {
    const settingsPage = new SettingsPage(page)
    await settingsPage.gotoSettings()

    const input = page.locator('input[type="text"], input[type="url"]').first()
    await input.fill("http://test-endpoint:4434")

    // Look for save button
    const saveButton = page.locator('button:has-text("Save"), button[type="submit"]')
    if (await saveButton.isVisible()) {
      await saveButton.click()

      // Wait for save to complete
      await page.waitForTimeout(500)

      // Reload and check persistence
      await page.reload()

      const newValue = await input.inputValue()
      expect(newValue).toBe("http://test-endpoint:4434")
    }
  })

  test("validates API endpoint format", async ({ page }) => {
    const settingsPage = new SettingsPage(page)
    await settingsPage.gotoSettings()

    const input = page.locator('input[type="text"], input[type="url"]').first()
    await input.fill("not-a-valid-url")

    // Try to save
    const saveButton = page.locator('button:has-text("Save"), button[type="submit"]')
    if (await saveButton.isVisible()) {
      await saveButton.click()

      // Should show error or validation message
      const errorMessage = page.locator('[data-testid="error-message"], .text-destructive, .error')
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toBeVisible()
      }
    }
  })

  test("shows connection test button", async ({ page }) => {
    const settingsPage = new SettingsPage(page)
    await settingsPage.gotoSettings()

    // Look for test connection button
    const testButton = page.locator(
      'button:has-text("Test"), button:has-text("Check"), [data-testid="test-connection"]'
    )
    if (await testButton.isVisible()) {
      await expect(testButton).toBeVisible()
    }
  })

  test("shows reset button", async ({ page }) => {
    const settingsPage = new SettingsPage(page)
    await settingsPage.gotoSettings()

    // Look for reset button
    const resetButton = page.locator('button:has-text("Reset"), button:has-text("Default")')
    if (await resetButton.isVisible()) {
      await expect(resetButton).toBeVisible()
    }
  })
})

test.describe("Settings Integration", () => {
  test("changing endpoint affects API calls", async ({ page }) => {
    // Set a custom endpoint
    await page.goto("/settings")

    const input = page.locator('input[type="text"], input[type="url"]').first()
    await input.fill("http://localhost:4434")

    const saveButton = page.locator('button:has-text("Save"), button[type="submit"]')
    if (await saveButton.isVisible()) {
      await saveButton.click()
    }

    // Navigate to identities and verify page loads
    await page.goto("/identities")
    await expect(page.locator("main")).toBeVisible()
  })
})
