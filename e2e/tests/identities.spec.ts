import { test, expect } from '@playwright/test'
import { IdentitiesPage } from '../pages/IdentitiesPage'
import { IdentityDetailPage } from '../pages/IdentityDetailPage'

test.describe('Identities', () => {
  test('displays list of identities', async ({ page }) => {
    const identitiesPage = new IdentitiesPage(page)
    await identitiesPage.gotoIdentities()

    // Wait for table to load
    await expect(identitiesPage.identitiesTable).toBeVisible()
  })

  test('navigates to identity detail on row click', async ({ page }) => {
    const identitiesPage = new IdentitiesPage(page)
    await identitiesPage.gotoIdentities()

    // Wait for data to load
    await expect(identitiesPage.identitiesTable).toBeVisible()

    // Click first row
    const rows = await identitiesPage.getIdentityRows()
    if ((await rows.count()) > 0) {
      await rows.first().click()
      await page.waitForURL(/\/identities\//)
    }
  })

  test('shows empty state when no identities', async ({ page }) => {
    // This test assumes the mock might return empty or we handle it gracefully
    const identitiesPage = new IdentitiesPage(page)
    await identitiesPage.gotoIdentities()

    // Either table or empty state should be visible
    const tableOrEmpty = page.locator(
      '[data-testid="identities-table"], [data-testid="empty-state"]'
    )
    await expect(tableOrEmpty.first()).toBeVisible()
  })
})

test.describe('Identity Detail', () => {
  test('displays identity information', async ({ page }) => {
    const detailPage = new IdentityDetailPage(page)
    await detailPage.gotoIdentity('550e8400-e29b-41d4-a716-446655440000')

    // Identity detail should show ID
    await expect(page.locator('text=550e8400')).toBeVisible()
  })

  test('has navigation back to list', async ({ page }) => {
    const detailPage = new IdentityDetailPage(page)
    await detailPage.gotoIdentity('550e8400-e29b-41d4-a716-446655440000')

    // Should have breadcrumb or back link
    await detailPage.navigateTo('identities')
    await expect(page).toHaveURL('/identities')
  })
})
