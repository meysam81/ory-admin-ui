import { test, expect } from '@playwright/test'
import { SessionsPage } from '../pages/SessionsPage'

test.describe('Sessions', () => {
  test('displays list of sessions', async ({ page }) => {
    const sessionsPage = new SessionsPage(page)
    await sessionsPage.gotoSessions()

    // Wait for table to load
    await expect(sessionsPage.sessionsTable).toBeVisible()
  })

  test('shows session details in table', async ({ page }) => {
    const sessionsPage = new SessionsPage(page)
    await sessionsPage.gotoSessions()

    await expect(sessionsPage.sessionsTable).toBeVisible()

    // Table should have headers for key session info
    await expect(page.locator('th').filter({ hasText: /identity|user/i })).toBeVisible()
  })

  test('can navigate to session detail', async ({ page }) => {
    const sessionsPage = new SessionsPage(page)
    await sessionsPage.gotoSessions()

    await expect(sessionsPage.sessionsTable).toBeVisible()

    const rows = await sessionsPage.getSessionRows()
    if ((await rows.count()) > 0) {
      await rows.first().click()
      await page.waitForURL(/\/sessions\//)
    }
  })

  test('shows empty state when no sessions', async ({ page }) => {
    const sessionsPage = new SessionsPage(page)
    await sessionsPage.gotoSessions()

    // Either table or empty state should be visible
    const tableOrEmpty = page.locator('[data-testid="sessions-table"], [data-testid="empty-state"]')
    await expect(tableOrEmpty.first()).toBeVisible()
  })
})
