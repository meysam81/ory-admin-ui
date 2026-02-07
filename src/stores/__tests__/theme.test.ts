import { describe, it, expect, vi, beforeEach } from "vitest"
import { setActivePinia, createPinia } from "pinia"

vi.mock("@/types/api.schemas", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/types/api.schemas")>()
  return { ...actual }
})

import { useThemeStore } from "../theme"

describe("useThemeStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    document.documentElement.classList.remove("light")
  })

  it("defaults to dark theme", () => {
    const store = useThemeStore()
    expect(store.theme).toBe("dark")
    expect(store.isDark).toBe(true)
  })

  it("reads theme from localStorage", () => {
    localStorage.setItem("theme", "light")
    setActivePinia(createPinia())
    const store = useThemeStore()
    expect(store.theme).toBe("light")
    expect(store.isDark).toBe(false)
  })

  it("falls back to dark for invalid localStorage values", () => {
    localStorage.setItem("theme", "invalid")
    setActivePinia(createPinia())
    const store = useThemeStore()
    expect(store.theme).toBe("dark")
  })

  it("setTheme persists to localStorage and applies", () => {
    const store = useThemeStore()
    store.setTheme("light")
    expect(store.theme).toBe("light")
    expect(localStorage.setItem).toHaveBeenCalledWith("theme", "light")
    expect(document.documentElement.classList.contains("light")).toBe(true)
  })

  it("toggleTheme switches between dark and light", () => {
    const store = useThemeStore()
    expect(store.isDark).toBe(true)
    store.toggleTheme()
    expect(store.theme).toBe("light")
    expect(store.isDark).toBe(false)
    store.toggleTheme()
    expect(store.theme).toBe("dark")
    expect(store.isDark).toBe(true)
  })

  it("removes light class when dark", () => {
    const store = useThemeStore()
    document.documentElement.classList.add("light")
    store.setTheme("dark")
    expect(document.documentElement.classList.contains("light")).toBe(false)
  })

  it("system theme delegates to matchMedia", () => {
    const store = useThemeStore()
    store.setTheme("system")
    // matchMedia mock returns true for prefers-color-scheme: dark
    expect(store.isDark).toBe(true)
  })
})
