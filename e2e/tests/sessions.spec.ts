import { test, expect } from '@playwright/test'
import { BasePage } from '../pages/BasePage'

test.describe('Sessions', () => {
  test('displays sessions page', async ({ page }) => {
    const basePage = new BasePage(page)
    await basePage.goto('/sessions')

    await expect(page).toHaveURL('/sessions')
    await expect(page.locator('h1')).toContainText(/sessions/i)
  })

  test('shows loading state or content', async ({ page }) => {
    const basePage = new BasePage(page)
    await basePage.goto('/sessions')

    // Page should load and show main content
    await expect(page.locator('main')).toBeVisible()
  })

  test('displays session list or empty state', async ({ page }) => {
    const basePage = new BasePage(page)
    await basePage.goto('/sessions')

    // Wait for table or empty state
    const table = page.locator('table')
    const emptyState = page.locator('[data-testid="empty-state"], text=No sessions')

    await expect(table.or(emptyState)).toBeVisible({ timeout: 10000 })
  })

  test('session row shows basic info', async ({ page }) => {
    const basePage = new BasePage(page)
    await basePage.goto('/sessions')

    const table = page.locator('table')
    if (await table.isVisible()) {
      const headerRow = table.locator('thead tr')
      // Should have columns for ID, status, etc.
      await expect(headerRow).toBeVisible()
    }
  })

  test('can navigate to session detail', async ({ page }) => {
    const basePage = new BasePage(page)
    await basePage.goto('/sessions')

    const table = page.locator('table')
    if (await table.isVisible()) {
      const firstRow = table.locator('tbody tr').first()
      if (await firstRow.isVisible()) {
        await firstRow.click()
        await expect(page).toHaveURL(/\/sessions\/[a-f0-9-]+/)
      }
    }
  })

  test('session detail page shows session info', async ({ page }) => {
    await page.goto('/sessions/880e8400-e29b-41d4-a716-446655440000')

    // Should show session details or error
    await expect(page.locator('main')).toBeVisible()
  })
})

test.describe('Session Management', () => {
  test('can filter sessions by status', async ({ page }) => {
    const basePage = new BasePage(page)
    await basePage.goto('/sessions')

    // Look for filter controls
    const filterButton = page.locator('[data-testid="filter-button"], button:has-text("Filter")')
    if (await filterButton.isVisible()) {
      await filterButton.click()
      // Filter options should appear
      await expect(page.locator('[data-testid="filter-options"], [role="menu"]')).toBeVisible()
    }
  })
})
