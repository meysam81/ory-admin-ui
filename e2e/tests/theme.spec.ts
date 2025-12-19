import { test, expect } from '@playwright/test'
import { BasePage } from '../pages/BasePage'

test.describe('Theme', () => {
  test('defaults to dark mode', async ({ page }) => {
    const basePage = new BasePage(page)
    await basePage.goto('/')

    const isDark = await basePage.isDarkMode()
    expect(isDark).toBe(true)
  })

  test('toggles between dark and light mode', async ({ page }) => {
    const basePage = new BasePage(page)
    await basePage.goto('/')

    // Start in dark
    expect(await basePage.isDarkMode()).toBe(true)

    // Toggle to light
    await basePage.toggleTheme()
    expect(await basePage.isDarkMode()).toBe(false)

    // Toggle back to dark
    await basePage.toggleTheme()
    expect(await basePage.isDarkMode()).toBe(true)
  })

  test('persists theme preference', async ({ page }) => {
    const basePage = new BasePage(page)
    await basePage.goto('/')

    // Set to light mode
    await basePage.toggleTheme()
    expect(await basePage.isDarkMode()).toBe(false)

    // Reload page
    await page.reload()

    // Should still be light
    expect(await basePage.isDarkMode()).toBe(false)
  })

  test('applies correct styles in light mode', async ({ page }) => {
    const basePage = new BasePage(page)
    await basePage.goto('/')

    await basePage.toggleTheme() // Switch to light

    const html = page.locator('html')
    await expect(html).toHaveClass(/light/)
  })
})
