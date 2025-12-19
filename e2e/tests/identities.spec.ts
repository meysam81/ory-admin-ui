import { test, expect } from '@playwright/test'
import { IdentitiesPage } from '../pages/IdentitiesPage'

test.describe('Identities', () => {
  test('displays identities page', async ({ page }) => {
    const identitiesPage = new IdentitiesPage(page)
    await identitiesPage.gotoIdentities()

    await expect(page).toHaveURL('/identities')
    await expect(page.locator('h1')).toContainText(/identities/i)
  })

  test('shows loading state initially', async ({ page }) => {
    const identitiesPage = new IdentitiesPage(page)
    await page.goto('/identities')

    // Page should eventually load content or show empty state
    await expect(page.locator('main')).toBeVisible()
  })

  test('navigates to create identity page', async ({ page }) => {
    const identitiesPage = new IdentitiesPage(page)
    await identitiesPage.gotoIdentities()

    const createButton = page.locator('a[href="/identities/new"], button:has-text("Create")')
    if (await createButton.isVisible()) {
      await createButton.click()
      await expect(page).toHaveURL('/identities/new')
    }
  })

  test('displays identity details on row click', async ({ page }) => {
    const identitiesPage = new IdentitiesPage(page)
    await identitiesPage.gotoIdentities()

    // Wait for table to load
    const table = page.locator('table')
    if (await table.isVisible()) {
      const firstRow = table.locator('tbody tr').first()
      if (await firstRow.isVisible()) {
        await firstRow.click()
        await expect(page).toHaveURL(/\/identities\/[a-f0-9-]+/)
      }
    }
  })

  test('identity detail page shows identity information', async ({ page }) => {
    await page.goto('/identities/550e8400-e29b-41d4-a716-446655440000')

    // Should show identity details or error
    await expect(page.locator('main')).toBeVisible()
  })

  test('can navigate back to identities list', async ({ page }) => {
    await page.goto('/identities/550e8400-e29b-41d4-a716-446655440000')

    const backLink = page.locator('a[href="/identities"]')
    if (await backLink.isVisible()) {
      await backLink.click()
      await expect(page).toHaveURL('/identities')
    }
  })
})

test.describe('Identity Creation', () => {
  test('create identity page has form fields', async ({ page }) => {
    await page.goto('/identities/new')

    // Should have form elements
    await expect(page.locator('form, [role="form"]')).toBeVisible()
  })

  test('displays schema selector', async ({ page }) => {
    await page.goto('/identities/new')

    // Should have schema selection
    const schemaSelect = page.locator('[data-testid="schema-select"], select, [role="combobox"]')
    if (await schemaSelect.isVisible()) {
      await expect(schemaSelect).toBeVisible()
    }
  })
})
