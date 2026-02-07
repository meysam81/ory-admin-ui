/**
 * Runtime configuration loader
 *
 * Fetches /config.json at boot time with sessionStorage caching.
 * This allows deployment-time configuration without rebuilding.
 */

import { safeParseWithLog } from "@/lib/validation"
import { runtimeConfigSchema, cachedConfigSchema } from "@/types/api.schemas"

export type RuntimeConfig = {
  kratosAdminBaseURL?: string
  kratosPublicBaseURL?: string
}

const CONFIG_CACHE_KEY = "runtime-config"
const CONFIG_CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

let runtimeConfig: RuntimeConfig | null = null

/**
 * Get the loaded runtime config (must call loadRuntimeConfig first)
 */
export function getRuntimeConfig(): RuntimeConfig | null {
  return runtimeConfig
}

/**
 * Check if cached config is still valid
 */
function getCachedConfig(): RuntimeConfig | null {
  try {
    const cached = sessionStorage.getItem(CONFIG_CACHE_KEY)
    if (!cached) return null

    const parsed = safeParseWithLog(cachedConfigSchema, JSON.parse(cached), "config.cached")
    const { config, timestamp } = parsed
    const isExpired = Date.now() - timestamp > CONFIG_CACHE_TTL_MS

    if (isExpired) {
      sessionStorage.removeItem(CONFIG_CACHE_KEY)
      return null
    }

    return config
  } catch {
    sessionStorage.removeItem(CONFIG_CACHE_KEY)
    return null
  }
}

/**
 * Cache the config in sessionStorage
 */
function setCachedConfig(config: RuntimeConfig): void {
  try {
    const cached = {
      config,
      timestamp: Date.now(),
    }
    sessionStorage.setItem(CONFIG_CACHE_KEY, JSON.stringify(cached))
  } catch {
    // sessionStorage might be full or disabled - ignore
  }
}

/**
 * Load runtime configuration from /config.json
 *
 * Priority:
 * 1. Return cached config if valid
 * 2. Fetch from /config.json
 * 3. Return empty config on failure (graceful degradation)
 */
export async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  // Check cache first
  const cached = getCachedConfig()
  if (cached) {
    runtimeConfig = cached
    return cached
  }

  // Fetch fresh config
  try {
    const response = await fetch("/config.json", {
      cache: "no-cache", // Always validate with server
    })

    if (!response.ok) {
      // 404 is expected if no config.json is provided
      if (response.status !== 404) {
        console.warn(`[Config] Failed to load config.json: ${response.status}`)
      }
      runtimeConfig = {}
      return {}
    }

    const raw = await response.json()
    const config = safeParseWithLog(runtimeConfigSchema, raw, "config.load")
    setCachedConfig(config)
    runtimeConfig = config

    console.debug("[Config] Loaded runtime config:", config)
    return config
  } catch (error) {
    // Network error or invalid JSON - graceful degradation
    console.warn("[Config] Could not load config.json:", error)
    runtimeConfig = {}
    return {}
  }
}
