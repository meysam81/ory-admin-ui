/**
 * Runtime configuration loader (multi-profile)
 *
 * Fetches /config.json at boot time with sessionStorage caching.
 * Config format: Record<slug, { kratosAdminBaseURL?, kratosPublicBaseURL? }>
 */

import { safeParseWithLog } from "@/lib/validation"
import { runtimeProfilesConfigSchema, cachedProfilesConfigSchema } from "@/types/api.schemas"
import type { ProfilesMap } from "@/types/profile"

const CONFIG_CACHE_KEY = "runtime-profiles"
const CONFIG_CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

let runtimeProfiles: ProfilesMap | null = null

/**
 * Get the loaded runtime profiles (must call loadRuntimeProfiles first)
 */
export function getRuntimeProfiles(): ProfilesMap | null {
  return runtimeProfiles
}

/**
 * Check if cached profiles are still valid
 */
function getCachedProfiles(): ProfilesMap | null {
  try {
    const cached = sessionStorage.getItem(CONFIG_CACHE_KEY)
    if (!cached) return null

    const parsed = safeParseWithLog(
      cachedProfilesConfigSchema,
      JSON.parse(cached),
      "profiles.cached"
    )
    const { profiles, timestamp } = parsed
    const isExpired = Date.now() - timestamp > CONFIG_CACHE_TTL_MS

    if (isExpired) {
      sessionStorage.removeItem(CONFIG_CACHE_KEY)
      return null
    }

    return profiles
  } catch {
    sessionStorage.removeItem(CONFIG_CACHE_KEY)
    return null
  }
}

/**
 * Cache the profiles in sessionStorage
 */
function setCachedProfiles(profiles: ProfilesMap): void {
  try {
    const cached = {
      profiles,
      timestamp: Date.now(),
    }
    sessionStorage.setItem(CONFIG_CACHE_KEY, JSON.stringify(cached))
  } catch {
    // sessionStorage might be full or disabled - ignore
  }
}

/**
 * Load runtime profiles from /config.json
 *
 * Priority:
 * 1. Return cached profiles if valid
 * 2. Fetch from /config.json
 * 3. Return empty map on failure (graceful degradation)
 */
export async function loadRuntimeProfiles(): Promise<ProfilesMap> {
  // Check cache first
  const cached = getCachedProfiles()
  if (cached) {
    runtimeProfiles = cached
    return cached
  }

  // Fetch fresh config
  try {
    const response = await fetch("/config.json", {
      cache: "no-cache",
    })

    if (!response.ok) {
      if (response.status !== 404) {
        console.warn(`[Config] Failed to load config.json: ${response.status}`)
      }
      runtimeProfiles = {}
      return {}
    }

    const raw = await response.json()
    const profiles = safeParseWithLog(runtimeProfilesConfigSchema, raw, "profiles.load")
    setCachedProfiles(profiles)
    runtimeProfiles = profiles

    console.debug("[Config] Loaded runtime profiles:", profiles)
    return profiles
  } catch (error) {
    console.warn("[Config] Could not load config.json:", error)
    runtimeProfiles = {}
    return {}
  }
}
