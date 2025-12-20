import { beforeAll, afterAll, afterEach, beforeEach, vi } from "vitest"
import { config } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"
import { VueQueryPlugin } from "@tanstack/vue-query"
import { server } from "./mocks/server"

// Start MSW server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" })
})

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers()
})

// Close server after all tests
afterAll(() => {
  server.close()
})

// Reset Pinia before each test
beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
})

// Global Vue Test Utils config
config.global.plugins = [createPinia(), VueQueryPlugin]

// Mock window.matchMedia for theme tests
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: query === "(prefers-color-scheme: dark)",
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
})

// Mock clipboard API
Object.defineProperty(navigator, "clipboard", {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(""),
  },
})
