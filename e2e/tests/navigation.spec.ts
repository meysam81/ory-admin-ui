import { test, expect } from '@playwright/test'
import { BasePage } from '../pages/BasePage'

test.describe('Navigation', () => {
  test('sidebar links navigate correctly', async ({ page }) => {
    const basePage = new BasePage(page)
    await basePage.goto('/')

    // Dashboard
    await expect(page).toHaveURL('/')

    // Identities
    await basePage.navigateTo('identities')
    await expect(page).toHaveURL('/identities')

    // Sessions
    await basePage.navigateTo('sessions')
    await expect(page).toHaveURL('/sessions')

    // Courier
    await basePage.navigateTo('courier')
    await expect(page).toHaveURL('/courier')

    // Schemas
    await basePage.navigateTo('schemas')
    await expect(page).toHaveURL('/schemas')

    // Settings
    await basePage.navigateTo('settings')
    await expect(page).toHaveURL('/settings')
  })

  test('highlights active route in sidebar', async ({ page }) => {
    const basePage = new BasePage(page)
    await basePage.goto('/identities')

    const identitiesLink = page.locator('nav a[href="/identities"]')
    await expect(identitiesLink).toHaveClass(/bg-accent/)
  })

  test('handles 404 for unknown routes', async ({ page }) => {
    const basePage = new BasePage(page)
    await basePage.goto('/nonexistent-page')

    await expect(page.locator('text=404')).toBeVisible()
  })

  test('can navigate back to dashboard from any page', async ({ page }) => {
    const basePage = new BasePage(page)
    await basePage.goto('/identities')

    await basePage.navigateTo('dashboard')
    await expect(page).toHaveURL('/')
  })
})
