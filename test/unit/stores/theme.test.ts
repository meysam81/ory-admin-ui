import { describe, it, expect, beforeEach, vi } from 'vitest'
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

  it('sets theme to light correctly', () => {
    const store = useThemeStore()

    store.setTheme('light')
    expect(store.theme).toBe('light')
    expect(store.isDark).toBe(false)
    expect(document.documentElement.classList.contains('light')).toBe(true)
  })

  it('sets theme to dark correctly', () => {
    const store = useThemeStore()

    store.setTheme('light')
    store.setTheme('dark')
    expect(store.theme).toBe('dark')
    expect(store.isDark).toBe(true)
    expect(document.documentElement.classList.contains('light')).toBe(false)
  })

  it('persists theme preference to localStorage', () => {
    const store = useThemeStore()
    store.setTheme('light')

    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('loads theme from localStorage', () => {
    localStorage.setItem('theme', 'light')

    const store = useThemeStore()
    expect(store.theme).toBe('light')
  })

  it('toggles between dark and light', () => {
    const store = useThemeStore()
    expect(store.isDark).toBe(true)

    store.toggleTheme()
    expect(store.theme).toBe('light')
    expect(store.isDark).toBe(false)

    store.toggleTheme()
    expect(store.theme).toBe('dark')
    expect(store.isDark).toBe(true)
  })

  it('respects system preference when set to system', () => {
    const store = useThemeStore()
    store.setTheme('system')

    // Our mock sets prefers-color-scheme: dark to true
    expect(store.isDark).toBe(true)
  })

  it('initializes theme correctly', () => {
    localStorage.setItem('theme', 'light')

    const store = useThemeStore()
    store.initTheme()

    expect(store.theme).toBe('light')
    expect(document.documentElement.classList.contains('light')).toBe(true)
  })
})
