import { describe, it, expect, vi, beforeEach } from "vitest"
import { setActivePinia, createPinia } from "pinia"

vi.mock("@/config/loader", () => ({
  getRuntimeConfig: vi.fn(() => null),
}))

vi.mock("@/api/client", () => ({
  resetApiClient: vi.fn(),
  resetPublicApiClient: vi.fn(),
}))

// Must import after mocks are declared
import { useSettingsStore } from "../settings"
import { getRuntimeConfig } from "@/config/loader"
import { resetApiClient, resetPublicApiClient } from "@/api/client"

describe("useSettingsStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it("defaults to hardcoded fallback when no runtime config or localStorage", () => {
    const store = useSettingsStore()
    expect(store.kratosAdminBaseURL).toBe("http://localhost:4434")
    expect(store.kratosPublicBaseURL).toBe("http://localhost:4433")
  })

  it("reads from localStorage when valid URL is stored", () => {
    localStorage.setItem("kratosAdminBaseURL", "http://custom:9999")
    setActivePinia(createPinia())
    const store = useSettingsStore()
    expect(store.kratosAdminBaseURL).toBe("http://custom:9999")
  })

  it("ignores invalid localStorage values", () => {
    localStorage.setItem("kratosAdminBaseURL", "not-a-url")
    setActivePinia(createPinia())
    const store = useSettingsStore()
    expect(store.kratosAdminBaseURL).toBe("http://localhost:4434")
  })

  it("prefers runtime config over hardcoded fallback", () => {
    vi.mocked(getRuntimeConfig).mockReturnValue({
      kratosAdminBaseURL: "http://runtime:4434",
    })
    setActivePinia(createPinia())
    const store = useSettingsStore()
    expect(store.kratosAdminBaseURL).toBe("http://runtime:4434")

    // Restore
    vi.mocked(getRuntimeConfig).mockReturnValue(null)
  })

  it("strips trailing slashes on set", () => {
    const store = useSettingsStore()
    store.setKratosAdminBaseURL("http://example.com///")
    expect(store.kratosAdminBaseURL).toBe("http://example.com")
    expect(localStorage.setItem).toHaveBeenCalledWith("kratosAdminBaseURL", "http://example.com")
  })

  it("calls resetApiClient when admin URL changes", () => {
    const store = useSettingsStore()
    store.setKratosAdminBaseURL("http://new-server:4434")
    expect(resetApiClient).toHaveBeenCalled()
  })

  it("calls resetPublicApiClient when public URL changes", () => {
    const store = useSettingsStore()
    store.setKratosPublicBaseURL("http://new-public:4433")
    expect(resetPublicApiClient).toHaveBeenCalled()
  })

  it("resets admin URL to default and clears localStorage", () => {
    const store = useSettingsStore()
    store.setKratosAdminBaseURL("http://custom:1234")
    store.resetKratosAdminBaseURL()
    expect(store.kratosAdminBaseURL).toBe("http://localhost:4434")
    expect(localStorage.removeItem).toHaveBeenCalledWith("kratosAdminBaseURL")
  })

  it("resetSettings resets both admin and public", () => {
    const store = useSettingsStore()
    store.setKratosAdminBaseURL("http://a:1")
    store.setKratosPublicBaseURL("http://b:2")
    store.resetSettings()
    expect(store.kratosAdminBaseURL).toBe("http://localhost:4434")
    expect(store.kratosPublicBaseURL).toBe("http://localhost:4433")
  })

  it("isConfigured is true when admin URL is non-empty", () => {
    const store = useSettingsStore()
    expect(store.isConfigured).toBe(true)
  })

  it("hasUserOverride is false when no localStorage key exists", () => {
    const store = useSettingsStore()
    expect(store.hasUserOverride).toBe(false)
  })

  it("hasUserOverride is true when localStorage key exists at init time", () => {
    localStorage.setItem("kratosAdminBaseURL", "http://custom:9999")
    setActivePinia(createPinia())
    const store = useSettingsStore()
    expect(store.hasUserOverride).toBe(true)
  })
})
