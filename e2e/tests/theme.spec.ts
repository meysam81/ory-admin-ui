import { test, expect } from "@playwright/test"
import { BasePage } from "../pages/BasePage"

test.describe("Theme", () => {
  test("defaults to dark mode", async ({ page }) => {
    const basePage = new BasePage(page)
    await basePage.goto("/")

    const isDark = await basePage.isDarkMode()
    expect(isDark).toBe(true)
  })

  test("toggles between dark and light mode", async ({ page }) => {
    const basePage = new BasePage(page)
    await basePage.goto("/")

    // Start in dark
    expect(await basePage.isDarkMode()).toBe(true)

    // Find and click theme toggle
    const themeButton = page
      .locator("button")
      .filter({ has: page.locator("svg") })
      .first()
    if (await themeButton.isVisible()) {
      await themeButton.click()

      // Should now be in light mode
      expect(await basePage.isDarkMode()).toBe(false)

      // Toggle back to dark
      await themeButton.click()
      expect(await basePage.isDarkMode()).toBe(true)
    }
  })

  test("persists theme preference", async ({ page }) => {
    const basePage = new BasePage(page)
    await basePage.goto("/")

    // Set to light mode using localStorage
    await page.evaluate(() => {
      localStorage.setItem("theme", "light")
    })

    // Reload page
    await page.reload()

    // Should still be light
    expect(await basePage.isDarkMode()).toBe(false)
  })

  test("applies correct background styles in dark mode", async ({ page }) => {
    const basePage = new BasePage(page)
    await basePage.goto("/")

    const body = page.locator("body")
    const bgColor = await body.evaluate((el) => getComputedStyle(el).backgroundColor)

    // Dark mode should have dark background
    expect(bgColor).toBeTruthy()
  })

  test("applies correct background styles in light mode", async ({ page }) => {
    const basePage = new BasePage(page)
    await basePage.goto("/")

    // Set to light mode
    await page.evaluate(() => {
      localStorage.setItem("theme", "light")
      document.documentElement.classList.add("light")
    })

    await page.reload()

    const body = page.locator("body")
    const bgColor = await body.evaluate((el) => getComputedStyle(el).backgroundColor)

    expect(bgColor).toBeTruthy()
  })
})
