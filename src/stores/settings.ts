import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { useQueryClient } from "@tanstack/vue-query"
import { getRuntimeConfig } from "@/config/loader"
import { resetApiClient, resetPublicApiClient } from "@/api/client"

const HARDCODED_FALLBACK = "http://localhost:4434"
const BUILD_TIME_DEFAULT = import.meta.env.VITE_DEFAULT_API_ENDPOINT || HARDCODED_FALLBACK

const PUBLIC_HARDCODED_FALLBACK = "http://localhost:4433"
const PUBLIC_BUILD_TIME_DEFAULT =
  import.meta.env.VITE_DEFAULT_PUBLIC_API_ENDPOINT || PUBLIC_HARDCODED_FALLBACK

/**
 * Get the default API endpoint using priority chain:
 * 1. Runtime config (deployment-time)
 * 2. Build-time env var
 * 3. Hardcoded fallback
 */
function getDefaultEndpoint(): string {
  const runtimeConfig = getRuntimeConfig()
  return runtimeConfig?.kratosAdminBaseURL || BUILD_TIME_DEFAULT
}

/**
 * Get the default public API endpoint using priority chain:
 * 1. Runtime config (deployment-time)
 * 2. Build-time env var
 * 3. Hardcoded fallback
 */
function getDefaultPublicEndpoint(): string {
  const runtimeConfig = getRuntimeConfig()
  return runtimeConfig?.kratosPublicBaseURL || PUBLIC_BUILD_TIME_DEFAULT
}

export const useSettingsStore = defineStore("settings", () => {
  // Priority: localStorage (user override) > default endpoint
  const userOverride = localStorage.getItem("kratosAdminBaseURL")
  const kratosAdminBaseURL = ref(userOverride || getDefaultEndpoint())

  // Priority: localStorage (user override) > default public endpoint
  const publicUserOverride = localStorage.getItem("kratosPublicBaseURL")
  const kratosPublicBaseURL = ref(publicUserOverride || getDefaultPublicEndpoint())

  function invalidateAllQueries() {
    try {
      const queryClient = useQueryClient()
      queryClient.invalidateQueries()
    } catch {
      // QueryClient may not be available during initial setup
    }
  }

  function setKratosAdminBaseURL(endpoint: string) {
    const normalized = endpoint.replace(/\/+$/, "")
    kratosAdminBaseURL.value = normalized
    localStorage.setItem("kratosAdminBaseURL", normalized)
    resetApiClient()
    invalidateAllQueries()
  }

  function resetKratosAdminBaseURL() {
    kratosAdminBaseURL.value = getDefaultEndpoint()
    localStorage.removeItem("kratosAdminBaseURL")
    resetApiClient()
    invalidateAllQueries()
  }

  function setKratosPublicBaseURL(endpoint: string) {
    const normalized = endpoint.replace(/\/+$/, "")
    kratosPublicBaseURL.value = normalized
    localStorage.setItem("kratosPublicBaseURL", normalized)
    resetPublicApiClient()
    invalidateAllQueries()
  }

  function resetKratosPublicBaseURL() {
    kratosPublicBaseURL.value = getDefaultPublicEndpoint()
    localStorage.removeItem("kratosPublicBaseURL")
    resetPublicApiClient()
    invalidateAllQueries()
  }

  const isConfigured = computed(() => kratosAdminBaseURL.value.length > 0)

  /**
   * Check if user has a custom override (different from default)
   */
  const hasUserOverride = computed(() => {
    return localStorage.getItem("kratosAdminBaseURL") !== null
  })

  /**
   * Check if user has a custom public endpoint override
   */
  const hasPublicUserOverride = computed(() => {
    return localStorage.getItem("kratosPublicBaseURL") !== null
  })

  /**
   * Get the current default (for display in settings UI)
   */
  const defaultEndpoint = computed(() => getDefaultEndpoint())

  /**
   * Get the current default public endpoint (for display in settings UI)
   */
  const defaultPublicEndpoint = computed(() => getDefaultPublicEndpoint())

  function resetSettings() {
    resetKratosAdminBaseURL()
    resetKratosPublicBaseURL()
  }

  return {
    kratosAdminBaseURL,
    setKratosAdminBaseURL,
    resetKratosAdminBaseURL,
    kratosPublicBaseURL,
    setKratosPublicBaseURL,
    resetKratosPublicBaseURL,
    resetSettings,
    isConfigured,
    hasUserOverride,
    hasPublicUserOverride,
    defaultEndpoint,
    defaultPublicEndpoint,
  }
})
