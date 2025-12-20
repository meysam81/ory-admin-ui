import { test, expect } from "@playwright/test"
import { BasePage } from "../pages/BasePage"

test.describe("Navigation", () => {
  test("loads dashboard by default", async ({ page }) => {
    const basePage = new BasePage(page)
    await basePage.goto("/")

    await expect(page).toHaveURL("/")
    await expect(page.locator("h1")).toContainText(/dashboard/i)
  })

  test("sidebar links navigate correctly", async ({ page }) => {
    const basePage = new BasePage(page)
    await basePage.goto("/")

    // Navigate to Identities
    await page.click('a[href="/identities"]')
    await expect(page).toHaveURL("/identities")

    // Navigate to Sessions
    await page.click('a[href="/sessions"]')
    await expect(page).toHaveURL("/sessions")

    // Navigate to Courier
    await page.click('a[href="/courier"]')
    await expect(page).toHaveURL("/courier")

    // Navigate to Schemas
    await page.click('a[href="/schemas"]')
    await expect(page).toHaveURL("/schemas")

    // Navigate to Settings
    await page.click('a[href="/settings"]')
    await expect(page).toHaveURL("/settings")

    // Navigate back to Dashboard
    await page.click('a[href="/"]')
    await expect(page).toHaveURL("/")
  })

  test("highlights active route in sidebar", async ({ page }) => {
    const basePage = new BasePage(page)
    await basePage.goto("/identities")

    const identitiesLink = page.locator('a[href="/identities"]')
    await expect(identitiesLink).toHaveClass(/bg-accent/)
  })

  test("handles 404 for unknown routes", async ({ page }) => {
    const basePage = new BasePage(page)
    await basePage.goto("/nonexistent-page")

    await expect(page.locator("text=Page Not Found")).toBeVisible()
  })

  test("sidebar can be collapsed", async ({ page }) => {
    const basePage = new BasePage(page)
    await basePage.goto("/")

    const sidebar = page.locator("aside")
    const toggleButton = page.locator('[data-testid="sidebar-toggle"]')

    // Check initial expanded state
    await expect(sidebar).toBeVisible()

    // Toggle sidebar (if toggle exists)
    if (await toggleButton.isVisible()) {
      await toggleButton.click()
      // Sidebar should be collapsed (narrower)
      await expect(sidebar).toHaveClass(/w-16/)
    }
  })
})
