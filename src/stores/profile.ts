import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { useQueryClient } from "@tanstack/vue-query"
import { getRuntimeProfiles } from "@/config/loader"
import { resetApiClient, resetPublicApiClient } from "@/api/client"
import { profilesMapSchema, importExportSchema, slugSchema } from "@/types/profile"
import type {
  Profile,
  ProfileData,
  ProfilesMap,
  ProfileSource,
  ImportExportData,
} from "@/types/profile"

const PROFILES_STORAGE_KEY = "ory-profiles"
const ACTIVE_SLUG_STORAGE_KEY = "ory-active-profile"

const HARDCODED_LOCAL_PROFILE: ProfileData = {
  kratosAdminBaseURL: "http://localhost:4455",
  kratosPublicBaseURL: "http://localhost:4433",
}

/**
 * Convert a slug to a display name: "prod-eu" -> "Prod EU"
 */
function slugToName(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

/**
 * Convert a ProfileData + slug into a normalized Profile
 */
function toProfile(slug: string, data: ProfileData): Profile {
  return {
    name: slugToName(slug),
    slug,
    services: {
      kratos: {
        adminUrl: data.kratosAdminBaseURL || "http://localhost:4455",
        publicUrl: data.kratosPublicBaseURL || "http://localhost:4433",
      },
    },
  }
}

/**
 * Generate a slug from a name: "Production EU" -> "production-eu"
 */
export function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63)
}

export const useProfileStore = defineStore("profile", () => {
  const profiles = ref<Map<string, Profile>>(new Map())
  const activeSlug = ref<string>("")
  const configSlugs = ref<Set<string>>(new Set())

  // --- Computed ---

  const activeProfile = computed<Profile | undefined>(() => profiles.value.get(activeSlug.value))

  const kratosAdminBaseURL = computed(
    () => activeProfile.value?.services.kratos?.adminUrl || "http://localhost:4434"
  )

  const kratosPublicBaseURL = computed(
    () => activeProfile.value?.services.kratos?.publicUrl || "http://localhost:4433"
  )

  const isConfigured = computed(() => kratosAdminBaseURL.value.length > 0)

  const allProfiles = computed(() => Array.from(profiles.value.values()))

  const localProfiles = computed(() =>
    allProfiles.value.filter((p) => getProfileSource(p.slug) === "local")
  )

  const configProfilesList = computed(() =>
    allProfiles.value.filter((p) => getProfileSource(p.slug) === "config")
  )

  // --- Helpers ---

  function getProfileSource(slug: string): ProfileSource {
    return configSlugs.value.has(slug) ? "config" : "local"
  }

  function loadLocalProfiles(): ProfilesMap {
    try {
      const raw = localStorage.getItem(PROFILES_STORAGE_KEY)
      if (!raw) return {}
      const parsed = JSON.parse(raw)
      const result = profilesMapSchema.safeParse(parsed)
      return result.success ? result.data : {}
    } catch {
      return {}
    }
  }

  function loadBuildTimeProfiles(): ProfilesMap {
    try {
      const envVar = import.meta.env.VITE_DEFAULT_PROFILES
      if (!envVar) return {}
      const parsed = JSON.parse(envVar)
      const result = profilesMapSchema.safeParse(parsed)
      return result.success ? result.data : {}
    } catch {
      return {}
    }
  }

  function persistLocalProfiles(): void {
    const localMap: ProfilesMap = {}
    for (const [slug, profile] of profiles.value) {
      if (!configSlugs.value.has(slug)) {
        localMap[slug] = {
          kratosAdminBaseURL: profile.services.kratos?.adminUrl,
          kratosPublicBaseURL: profile.services.kratos?.publicUrl,
        }
      }
    }
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(localMap))
  }

  function persistActiveSlug(): void {
    localStorage.setItem(ACTIVE_SLUG_STORAGE_KEY, activeSlug.value)
  }

  function invalidateAllQueries() {
    try {
      const queryClient = useQueryClient()
      queryClient.clear()
    } catch {
      // QueryClient may not be available during initial setup
    }
  }

  // --- Actions ---

  function initialize(): void {
    const configProfiles = getRuntimeProfiles() || {}
    const buildTimeProfiles = loadBuildTimeProfiles()
    const localProfilesData = loadLocalProfiles()

    // Track which slugs come from config
    configSlugs.value = new Set(Object.keys(configProfiles))

    // Merge: config < build-time < localStorage (localStorage wins per slug)
    const merged = new Map<string, Profile>()

    for (const [slug, data] of Object.entries(configProfiles)) {
      merged.set(slug, toProfile(slug, data))
    }
    for (const [slug, data] of Object.entries(buildTimeProfiles)) {
      if (!merged.has(slug)) {
        merged.set(slug, toProfile(slug, data))
      }
    }
    for (const [slug, data] of Object.entries(localProfilesData)) {
      merged.set(slug, toProfile(slug, data))
    }

    // Fallback: if no profiles at all, create a "default" profile
    if (merged.size === 0) {
      merged.set("local", toProfile("default", HARDCODED_LOCAL_PROFILE))
    }

    profiles.value = merged

    // Resolve active slug
    const savedSlug = localStorage.getItem(ACTIVE_SLUG_STORAGE_KEY)
    if (savedSlug && profiles.value.has(savedSlug)) {
      activeSlug.value = savedSlug
    } else {
      activeSlug.value = profiles.value.keys().next().value!
    }
    persistActiveSlug()
  }

  function switchProfile(slug: string): void {
    if (!profiles.value.has(slug)) return
    activeSlug.value = slug
    persistActiveSlug()
    resetApiClient()
    resetPublicApiClient()
    invalidateAllQueries()
  }

  function createProfile(name: string, data: ProfileData): string {
    const slug = nameToSlug(name)
    if (!slugSchema.safeParse(slug).success) {
      throw new Error(`Invalid slug: ${slug}`)
    }
    if (profiles.value.has(slug)) {
      throw new Error(`Profile "${slug}" already exists`)
    }
    profiles.value.set(slug, toProfile(slug, data))
    persistLocalProfiles()
    return slug
  }

  function updateProfile(slug: string, data: Partial<ProfileData>): void {
    const existing = profiles.value.get(slug)
    if (!existing) return

    const updatedData: ProfileData = {
      kratosAdminBaseURL: data.kratosAdminBaseURL ?? existing.services.kratos?.adminUrl,
      kratosPublicBaseURL: data.kratosPublicBaseURL ?? existing.services.kratos?.publicUrl,
    }

    profiles.value.set(slug, toProfile(slug, updatedData))
    persistLocalProfiles()

    if (slug === activeSlug.value) {
      resetApiClient()
      resetPublicApiClient()
      invalidateAllQueries()
    }
  }

  function deleteProfile(slug: string): void {
    // Only allow deleting local profiles
    if (configSlugs.value.has(slug)) return
    if (!profiles.value.has(slug)) return

    profiles.value.delete(slug)
    persistLocalProfiles()

    // If we deleted the active profile, switch to first available
    if (slug === activeSlug.value && profiles.value.size > 0) {
      switchProfile(profiles.value.keys().next().value!)
    }
  }

  function overrideConfigProfile(slug: string): void {
    const existing = profiles.value.get(slug)
    if (!existing) return
    // Remove from config set so it becomes a local profile
    configSlugs.value.delete(slug)
    persistLocalProfiles()
  }

  function exportProfiles(): ImportExportData {
    const exportMap: ProfilesMap = {}
    for (const [slug, profile] of profiles.value) {
      if (!configSlugs.value.has(slug)) {
        exportMap[slug] = {
          kratosAdminBaseURL: profile.services.kratos?.adminUrl,
          kratosPublicBaseURL: profile.services.kratos?.publicUrl,
        }
      }
    }
    return { version: 1, profiles: exportMap }
  }

  function importProfiles(json: string): { imported: number; skipped: string[] } {
    const parsed = importExportSchema.parse(JSON.parse(json))
    const skipped: string[] = []
    let imported = 0

    for (const [slug, data] of Object.entries(parsed.profiles)) {
      if (profiles.value.has(slug)) {
        skipped.push(slug)
        continue
      }
      profiles.value.set(slug, toProfile(slug, data))
      imported++
    }

    if (imported > 0) {
      persistLocalProfiles()
    }

    return { imported, skipped }
  }

  return {
    // State
    profiles,
    activeSlug,
    // Computed
    activeProfile,
    kratosAdminBaseURL,
    kratosPublicBaseURL,
    isConfigured,
    allProfiles,
    localProfiles,
    configProfiles: configProfilesList,
    // Actions
    initialize,
    switchProfile,
    createProfile,
    updateProfile,
    deleteProfile,
    overrideConfigProfile,
    exportProfiles,
    importProfiles,
    getProfileSource,
  }
})
