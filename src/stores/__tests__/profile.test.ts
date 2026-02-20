import { describe, it, expect, vi, beforeEach } from "vitest"
import { setActivePinia, createPinia } from "pinia"

vi.mock("@/config/loader", () => ({
  getRuntimeProfiles: vi.fn(() => null),
}))

vi.mock("@/api/client", () => ({
  resetApiClient: vi.fn(),
  resetPublicApiClient: vi.fn(),
}))

import { useProfileStore, nameToSlug } from "../profile"
import { getRuntimeProfiles } from "@/config/loader"
import { resetApiClient, resetPublicApiClient } from "@/api/client"

describe("useProfileStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe("initialize", () => {
    it("creates hardcoded local profile when no sources available", () => {
      const store = useProfileStore()
      store.initialize()

      expect(store.allProfiles).toHaveLength(1)
      expect(store.activeSlug).toBe("local")
      expect(store.kratosAdminBaseURL).toBe("http://localhost:4455")
      expect(store.kratosPublicBaseURL).toBe("http://localhost:4433")
    })

    it("loads profiles from config.json", () => {
      vi.mocked(getRuntimeProfiles).mockReturnValue({
        "prod-eu": {
          kratosAdminBaseURL: "https://admin.eu.example.com",
          kratosPublicBaseURL: "https://public.eu.example.com",
        },
      })

      const store = useProfileStore()
      store.initialize()

      expect(store.allProfiles).toHaveLength(1)
      expect(store.activeSlug).toBe("prod-eu")
      expect(store.kratosAdminBaseURL).toBe("https://admin.eu.example.com")
      expect(store.getProfileSource("prod-eu")).toBe("config")

      vi.mocked(getRuntimeProfiles).mockReturnValue(null)
    })

    it("loads profiles from localStorage", () => {
      localStorage.setItem(
        "ory-profiles",
        JSON.stringify({
          staging: {
            kratosAdminBaseURL: "http://staging:4434",
            kratosPublicBaseURL: "http://staging:4433",
          },
        })
      )

      const store = useProfileStore()
      store.initialize()

      expect(store.allProfiles).toHaveLength(1)
      expect(store.activeSlug).toBe("staging")
      expect(store.getProfileSource("staging")).toBe("local")
    })

    it("restores active slug from localStorage", () => {
      localStorage.setItem(
        "ory-profiles",
        JSON.stringify({
          first: { kratosAdminBaseURL: "http://first:4434" },
          second: { kratosAdminBaseURL: "http://second:4434" },
        })
      )
      localStorage.setItem("ory-active-profile", "second")

      const store = useProfileStore()
      store.initialize()

      expect(store.activeSlug).toBe("second")
    })

    it("falls back to first profile if saved slug is invalid", () => {
      localStorage.setItem(
        "ory-profiles",
        JSON.stringify({
          alpha: { kratosAdminBaseURL: "http://alpha:4434" },
        })
      )
      localStorage.setItem("ory-active-profile", "nonexistent")

      const store = useProfileStore()
      store.initialize()

      expect(store.activeSlug).toBe("alpha")
    })

    it("localStorage profiles override config profiles with same slug", () => {
      vi.mocked(getRuntimeProfiles).mockReturnValue({
        shared: {
          kratosAdminBaseURL: "http://config:4434",
        },
      })
      localStorage.setItem(
        "ory-profiles",
        JSON.stringify({
          shared: {
            kratosAdminBaseURL: "http://local-override:4434",
          },
        })
      )

      const store = useProfileStore()
      store.initialize()

      expect(store.kratosAdminBaseURL).toBe("http://local-override:4434")

      vi.mocked(getRuntimeProfiles).mockReturnValue(null)
    })
  })

  describe("switchProfile", () => {
    it("changes active profile and resets clients", () => {
      localStorage.setItem(
        "ory-profiles",
        JSON.stringify({
          first: { kratosAdminBaseURL: "http://first:4434" },
          second: { kratosAdminBaseURL: "http://second:4434" },
        })
      )

      const store = useProfileStore()
      store.initialize()
      store.switchProfile("second")

      expect(store.activeSlug).toBe("second")
      expect(store.kratosAdminBaseURL).toBe("http://second:4434")
      expect(resetApiClient).toHaveBeenCalled()
      expect(resetPublicApiClient).toHaveBeenCalled()
    })

    it("does nothing for nonexistent slug", () => {
      const store = useProfileStore()
      store.initialize()
      const originalSlug = store.activeSlug

      store.switchProfile("nonexistent")

      expect(store.activeSlug).toBe(originalSlug)
    })
  })

  describe("createProfile", () => {
    it("creates a new local profile", () => {
      const store = useProfileStore()
      store.initialize()

      const slug = store.createProfile("Staging Server", {
        kratosAdminBaseURL: "http://staging:4434",
        kratosPublicBaseURL: "http://staging:4433",
      })

      expect(slug).toBe("staging-server")
      expect(store.allProfiles).toHaveLength(2)
      expect(store.getProfileSource("staging-server")).toBe("local")
    })

    it("throws if slug already exists", () => {
      const store = useProfileStore()
      store.initialize()

      expect(() => store.createProfile("Local", { kratosAdminBaseURL: "http://x:4434" })).toThrow(
        "already exists"
      )
    })

    it("persists to localStorage", () => {
      const store = useProfileStore()
      store.initialize()

      store.createProfile("New Profile", {
        kratosAdminBaseURL: "http://new:4434",
      })

      const stored = JSON.parse(localStorage.getItem("ory-profiles")!)
      expect(stored["new-profile"]).toBeDefined()
    })
  })

  describe("updateProfile", () => {
    it("updates profile endpoints", () => {
      const store = useProfileStore()
      store.initialize()

      store.updateProfile("local", {
        kratosAdminBaseURL: "http://updated:4434",
      })

      expect(store.kratosAdminBaseURL).toBe("http://updated:4434")
    })

    it("resets clients when active profile is updated", () => {
      const store = useProfileStore()
      store.initialize()
      vi.clearAllMocks()

      store.updateProfile("local", {
        kratosAdminBaseURL: "http://updated:4434",
      })

      expect(resetApiClient).toHaveBeenCalled()
    })
  })

  describe("deleteProfile", () => {
    it("deletes a local profile", () => {
      localStorage.setItem(
        "ory-profiles",
        JSON.stringify({
          first: { kratosAdminBaseURL: "http://first:4434" },
          second: { kratosAdminBaseURL: "http://second:4434" },
        })
      )

      const store = useProfileStore()
      store.initialize()
      store.switchProfile("first")
      store.deleteProfile("second")

      expect(store.allProfiles).toHaveLength(1)
    })

    it("switches to another profile when deleting active", () => {
      localStorage.setItem(
        "ory-profiles",
        JSON.stringify({
          first: { kratosAdminBaseURL: "http://first:4434" },
          second: { kratosAdminBaseURL: "http://second:4434" },
        })
      )

      const store = useProfileStore()
      store.initialize()
      store.switchProfile("first")
      store.deleteProfile("first")

      expect(store.activeSlug).toBe("second")
    })

    it("does not delete config profiles", () => {
      vi.mocked(getRuntimeProfiles).mockReturnValue({
        "config-profile": { kratosAdminBaseURL: "http://config:4434" },
      })

      const store = useProfileStore()
      store.initialize()
      store.deleteProfile("config-profile")

      expect(store.allProfiles).toHaveLength(1)
      vi.mocked(getRuntimeProfiles).mockReturnValue(null)
    })
  })

  describe("exportProfiles / importProfiles", () => {
    it("exports only local profiles", () => {
      vi.mocked(getRuntimeProfiles).mockReturnValue({
        "config-one": { kratosAdminBaseURL: "http://config:4434" },
      })
      localStorage.setItem(
        "ory-profiles",
        JSON.stringify({
          "local-one": { kratosAdminBaseURL: "http://local:4434" },
        })
      )

      const store = useProfileStore()
      store.initialize()

      const exported = store.exportProfiles()
      expect(exported.version).toBe(1)
      expect(Object.keys(exported.profiles)).toEqual(["local-one"])

      vi.mocked(getRuntimeProfiles).mockReturnValue(null)
    })

    it("imports profiles from valid JSON", () => {
      const store = useProfileStore()
      store.initialize()

      const { imported, skipped } = store.importProfiles(
        JSON.stringify({
          version: 1,
          profiles: {
            imported: {
              kratosAdminBaseURL: "http://imported:4434",
              kratosPublicBaseURL: "http://imported:4433",
            },
          },
        })
      )

      expect(imported).toBe(1)
      expect(skipped).toHaveLength(0)
      expect(store.allProfiles).toHaveLength(2)
    })

    it("skips existing slugs on import", () => {
      const store = useProfileStore()
      store.initialize()

      const { imported, skipped } = store.importProfiles(
        JSON.stringify({
          version: 1,
          profiles: {
            local: {
              kratosAdminBaseURL: "http://should-skip:4434",
            },
          },
        })
      )

      expect(imported).toBe(0)
      expect(skipped).toEqual(["local"])
    })

    it("throws on invalid import format", () => {
      const store = useProfileStore()
      store.initialize()

      expect(() => store.importProfiles('{"invalid": true}')).toThrow()
    })
  })

  describe("backward compatibility computed", () => {
    it("provides kratosAdminBaseURL from active profile", () => {
      const store = useProfileStore()
      store.initialize()

      expect(store.kratosAdminBaseURL).toBe("http://localhost:4434")
    })

    it("provides kratosPublicBaseURL from active profile", () => {
      const store = useProfileStore()
      store.initialize()

      expect(store.kratosPublicBaseURL).toBe("http://localhost:4433")
    })

    it("isConfigured is true when admin URL is set", () => {
      const store = useProfileStore()
      store.initialize()

      expect(store.isConfigured).toBe(true)
    })
  })
})

describe("nameToSlug", () => {
  it("converts names to slugs", () => {
    expect(nameToSlug("Production EU")).toBe("production-eu")
    expect(nameToSlug("My Staging 123")).toBe("my-staging-123")
    expect(nameToSlug("local")).toBe("local")
  })

  it("removes special characters", () => {
    expect(nameToSlug("prod@eu!")).toBe("prod-eu")
  })

  it("trims leading/trailing hyphens", () => {
    expect(nameToSlug("  spaces  ")).toBe("spaces")
  })

  it("truncates to 63 characters", () => {
    const long = "a".repeat(100)
    expect(nameToSlug(long).length).toBeLessThanOrEqual(63)
  })
})
