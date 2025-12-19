import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUIStore } from '@/stores/ui'

describe('UI Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  describe('sidebar', () => {
    it('initializes with sidebar not collapsed by default', () => {
      const store = useUIStore()
      expect(store.sidebarCollapsed).toBe(false)
    })

    it('loads sidebar state from localStorage', () => {
      localStorage.setItem('sidebarCollapsed', 'true')
      const store = useUIStore()
      expect(store.sidebarCollapsed).toBe(true)
    })

    it('toggles sidebar state', () => {
      const store = useUIStore()
      expect(store.sidebarCollapsed).toBe(false)

      store.toggleSidebar()
      expect(store.sidebarCollapsed).toBe(true)
      expect(localStorage.getItem('sidebarCollapsed')).toBe('true')

      store.toggleSidebar()
      expect(store.sidebarCollapsed).toBe(false)
      expect(localStorage.getItem('sidebarCollapsed')).toBe('false')
    })

    it('sets sidebar collapsed state directly', () => {
      const store = useUIStore()

      store.setSidebarCollapsed(true)
      expect(store.sidebarCollapsed).toBe(true)
      expect(localStorage.getItem('sidebarCollapsed')).toBe('true')

      store.setSidebarCollapsed(false)
      expect(store.sidebarCollapsed).toBe(false)
      expect(localStorage.getItem('sidebarCollapsed')).toBe('false')
    })
  })

  describe('command palette', () => {
    it('initializes with command palette closed', () => {
      const store = useUIStore()
      expect(store.commandPaletteOpen).toBe(false)
    })

    it('opens command palette', () => {
      const store = useUIStore()

      store.openCommandPalette()
      expect(store.commandPaletteOpen).toBe(true)
    })

    it('closes command palette', () => {
      const store = useUIStore()

      store.openCommandPalette()
      expect(store.commandPaletteOpen).toBe(true)

      store.closeCommandPalette()
      expect(store.commandPaletteOpen).toBe(false)
    })

    it('toggles command palette', () => {
      const store = useUIStore()
      expect(store.commandPaletteOpen).toBe(false)

      store.toggleCommandPalette()
      expect(store.commandPaletteOpen).toBe(true)

      store.toggleCommandPalette()
      expect(store.commandPaletteOpen).toBe(false)
    })
  })
})
