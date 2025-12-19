import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useThemeStore } from '@/stores/theme'

describe('Theme Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    document.documentElement.classList.remove('dark', 'light')
  })

  it('defaults to dark theme', () => {
    const store = useThemeStore()
    expect(store.theme).toBe('dark')
    expect(store.isDark).toBe(true)
  })

  it('loads theme from localStorage if available', () => {
    localStorage.setItem('theme', 'light')
    const store = useThemeStore()
    expect(store.theme).toBe('light')
  })

  it('sets theme and persists to localStorage', () => {
    const store = useThemeStore()

    store.setTheme('light')
    expect(store.theme).toBe('light')
    expect(store.isDark).toBe(false)
    expect(localStorage.getItem('theme')).toBe('light')

    store.setTheme('dark')
    expect(store.theme).toBe('dark')
    expect(store.isDark).toBe(true)
    expect(localStorage.getItem('theme')).toBe('dark')
  })

  it('toggles theme correctly', () => {
    const store = useThemeStore()
    expect(store.theme).toBe('dark')

    store.toggleTheme()
    expect(store.theme).toBe('light')
    expect(store.isDark).toBe(false)

    store.toggleTheme()
    expect(store.theme).toBe('dark')
    expect(store.isDark).toBe(true)
  })

  it('applies light class to document when in light mode', () => {
    const store = useThemeStore()

    store.setTheme('light')
    expect(document.documentElement.classList.contains('light')).toBe(true)

    store.setTheme('dark')
    expect(document.documentElement.classList.contains('light')).toBe(false)
  })

  it('respects system preference when set to system', () => {
    const store = useThemeStore()
    store.setTheme('system')

    expect(store.theme).toBe('system')
    // Our mock sets prefers-color-scheme: dark to true
    expect(store.isDark).toBe(true)
  })

  it('initializes theme from localStorage on init', () => {
    localStorage.setItem('theme', 'light')
    const store = useThemeStore()

    store.initTheme()
    expect(store.theme).toBe('light')
    expect(document.documentElement.classList.contains('light')).toBe(true)
  })
})
