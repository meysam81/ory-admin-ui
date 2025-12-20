import { describe, it, expect, beforeEach } from "vitest"
import { setActivePinia, createPinia } from "pinia"
import { useSettingsStore } from "@/stores/settings"

describe("Settings Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it("initializes with default API endpoint", () => {
    const store = useSettingsStore()
    expect(store.apiEndpoint).toBe("http://localhost:4434")
  })

  it("sets and persists API endpoint to localStorage", () => {
    const store = useSettingsStore()
    store.setApiEndpoint("http://kratos.example.com:4434")

    expect(store.apiEndpoint).toBe("http://kratos.example.com:4434")
    expect(localStorage.getItem("apiEndpoint")).toBe("http://kratos.example.com:4434")
  })

  it("normalizes API endpoint by removing trailing slashes", () => {
    const store = useSettingsStore()
    store.setApiEndpoint("http://kratos.example.com:4434///")

    expect(store.apiEndpoint).toBe("http://kratos.example.com:4434")
  })

  it("loads API endpoint from localStorage", () => {
    localStorage.setItem("apiEndpoint", "http://saved.example.com:4434")

    const store = useSettingsStore()
    expect(store.apiEndpoint).toBe("http://saved.example.com:4434")
  })

  it("resets API endpoint to default", () => {
    const store = useSettingsStore()
    store.setApiEndpoint("http://custom.example.com:4434")
    store.resetApiEndpoint()

    expect(store.apiEndpoint).toBe("http://localhost:4434")
    expect(localStorage.getItem("apiEndpoint")).toBeNull()
  })

  it("isConfigured returns true when endpoint is set", () => {
    const store = useSettingsStore()
    expect(store.isConfigured).toBe(true)
  })

  it("resetSettings resets all settings", () => {
    const store = useSettingsStore()
    store.setApiEndpoint("http://custom.example.com:4434")
    store.resetSettings()

    expect(store.apiEndpoint).toBe("http://localhost:4434")
  })
})
