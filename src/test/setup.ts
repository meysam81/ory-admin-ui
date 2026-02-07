import { vi } from "vitest"
import { config } from "@vue/test-utils"

// --- navigator.clipboard ---
Object.defineProperty(navigator, "clipboard", {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(""),
  },
  writable: true,
})

// --- window.matchMedia ---
Object.defineProperty(window, "matchMedia", {
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
  writable: true,
})

// --- localStorage ---
const localStorageMap = new Map<string, string>()
const localStorageMock: Storage = {
  getItem: vi.fn((key: string) => localStorageMap.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) => localStorageMap.set(key, value)),
  removeItem: vi.fn((key: string) => localStorageMap.delete(key)),
  clear: vi.fn(() => localStorageMap.clear()),
  get length() {
    return localStorageMap.size
  },
  key: vi.fn((index: number) => [...localStorageMap.keys()][index] ?? null),
}
Object.defineProperty(window, "localStorage", { value: localStorageMock })

// --- sessionStorage ---
const sessionStorageMap = new Map<string, string>()
const sessionStorageMock: Storage = {
  getItem: vi.fn((key: string) => sessionStorageMap.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) => sessionStorageMap.set(key, value)),
  removeItem: vi.fn((key: string) => sessionStorageMap.delete(key)),
  clear: vi.fn(() => sessionStorageMap.clear()),
  get length() {
    return sessionStorageMap.size
  },
  key: vi.fn((index: number) => [...sessionStorageMap.keys()][index] ?? null),
}
Object.defineProperty(window, "sessionStorage", { value: sessionStorageMock })

// --- vue-sonner ---
vi.mock("vue-sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}))

// --- Stub teleport for AlertDialog portals ---
config.global.stubs["Teleport"] = true

// --- Clean state between tests ---
beforeEach(() => {
  localStorageMap.clear()
  sessionStorageMap.clear()
  vi.clearAllMocks()
})
