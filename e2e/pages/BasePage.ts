import type { Page, Locator } from "@playwright/test"

export class BasePage {
  readonly page: Page
  readonly sidebar: Locator
  readonly header: Locator
  readonly themeToggle: Locator
  readonly loadingSpinner: Locator

  constructor(page: Page) {
    this.page = page
    this.sidebar = page.locator('[data-testid="app-sidebar"]')
    this.header = page.locator('[data-testid="app-header"]')
    this.themeToggle = page.locator('[data-testid="theme-toggle"]')
    this.loadingSpinner = page.locator('[data-testid="loading-spinner"]')
  }

  async goto(path: string) {
    await this.page.goto(path)
    await this.waitForLoad()
  }

  async waitForLoad() {
    await this.page.waitForLoadState("networkidle")
  }

  async navigateTo(
    name: "dashboard" | "identities" | "sessions" | "courier" | "schemas" | "settings"
  ) {
    const pathMap: Record<string, string> = {
      dashboard: "/",
      identities: "/identities",
      sessions: "/sessions",
      courier: "/courier",
      schemas: "/schemas",
      settings: "/settings",
    }

    const link = this.sidebar.locator(`a[href="${pathMap[name]}"]`)
    await link.click()
    await this.waitForLoad()
  }

  async toggleTheme() {
    await this.themeToggle.click()
  }

  async isDarkMode(): Promise<boolean> {
    return await this.page.locator("html").evaluate((el) => !el.classList.contains("light"))
  }
}
