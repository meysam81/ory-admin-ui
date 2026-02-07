import { describe, it, expect, beforeEach } from "vitest"
import { setActivePinia, createPinia } from "pinia"
import { useUIStore } from "../ui"

describe("useUIStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it("sidebar starts expanded by default", () => {
    const store = useUIStore()
    expect(store.sidebarCollapsed).toBe(false)
  })

  it("reads sidebarCollapsed from localStorage", () => {
    localStorage.setItem("sidebarCollapsed", "true")
    setActivePinia(createPinia())
    const store = useUIStore()
    expect(store.sidebarCollapsed).toBe(true)
  })

  it("toggleSidebar flips collapsed state and persists", () => {
    const store = useUIStore()
    store.toggleSidebar()
    expect(store.sidebarCollapsed).toBe(true)
    expect(localStorage.setItem).toHaveBeenCalledWith("sidebarCollapsed", "true")
    store.toggleSidebar()
    expect(store.sidebarCollapsed).toBe(false)
    expect(localStorage.setItem).toHaveBeenCalledWith("sidebarCollapsed", "false")
  })

  it("setSidebarCollapsed sets explicit value", () => {
    const store = useUIStore()
    store.setSidebarCollapsed(true)
    expect(store.sidebarCollapsed).toBe(true)
    store.setSidebarCollapsed(false)
    expect(store.sidebarCollapsed).toBe(false)
  })

  it("mobile sidebar starts closed", () => {
    const store = useUIStore()
    expect(store.sidebarOpen).toBe(false)
  })

  it("openSidebar / closeSidebar controls mobile sidebar", () => {
    const store = useUIStore()
    store.openSidebar()
    expect(store.sidebarOpen).toBe(true)
    store.closeSidebar()
    expect(store.sidebarOpen).toBe(false)
  })

  it("toggleMobileSidebar flips sidebarOpen", () => {
    const store = useUIStore()
    store.toggleMobileSidebar()
    expect(store.sidebarOpen).toBe(true)
    store.toggleMobileSidebar()
    expect(store.sidebarOpen).toBe(false)
  })

  it("command palette starts closed", () => {
    const store = useUIStore()
    expect(store.commandPaletteOpen).toBe(false)
  })

  it("openCommandPalette / closeCommandPalette works", () => {
    const store = useUIStore()
    store.openCommandPalette()
    expect(store.commandPaletteOpen).toBe(true)
    store.closeCommandPalette()
    expect(store.commandPaletteOpen).toBe(false)
  })

  it("toggleCommandPalette flips state", () => {
    const store = useUIStore()
    store.toggleCommandPalette()
    expect(store.commandPaletteOpen).toBe(true)
    store.toggleCommandPalette()
    expect(store.commandPaletteOpen).toBe(false)
  })
})
