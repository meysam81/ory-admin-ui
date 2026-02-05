import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { getRuntimeConfig } from "@/config/loader"

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
  return runtimeConfig?.apiEndpoint || BUILD_TIME_DEFAULT
}

/**
 * Get the default public API endpoint using priority chain:
 * 1. Runtime config (deployment-time)
 * 2. Build-time env var
 * 3. Hardcoded fallback
 */
function getDefaultPublicEndpoint(): string {
  const runtimeConfig = getRuntimeConfig()
  return runtimeConfig?.publicApiEndpoint || PUBLIC_BUILD_TIME_DEFAULT
}

export const useSettingsStore = defineStore("settings", () => {
  // Priority: localStorage (user override) > default endpoint
  const userOverride = localStorage.getItem("apiEndpoint")
  const apiEndpoint = ref(userOverride || getDefaultEndpoint())

  // Priority: localStorage (user override) > default public endpoint
  const publicUserOverride = localStorage.getItem("publicApiEndpoint")
  const publicApiEndpoint = ref(publicUserOverride || getDefaultPublicEndpoint())

  function setApiEndpoint(endpoint: string) {
    const normalized = endpoint.replace(/\/+$/, "")
    apiEndpoint.value = normalized
    localStorage.setItem("apiEndpoint", normalized)
  }

  function resetApiEndpoint() {
    apiEndpoint.value = getDefaultEndpoint()
    localStorage.removeItem("apiEndpoint")
  }

  function setPublicApiEndpoint(endpoint: string) {
    const normalized = endpoint.replace(/\/+$/, "")
    publicApiEndpoint.value = normalized
    localStorage.setItem("publicApiEndpoint", normalized)
  }

  function resetPublicApiEndpoint() {
    publicApiEndpoint.value = getDefaultPublicEndpoint()
    localStorage.removeItem("publicApiEndpoint")
  }

  const isConfigured = computed(() => apiEndpoint.value.length > 0)

  /**
   * Check if user has a custom override (different from default)
   */
  const hasUserOverride = computed(() => {
    return localStorage.getItem("apiEndpoint") !== null
  })

  /**
   * Check if user has a custom public endpoint override
   */
  const hasPublicUserOverride = computed(() => {
    return localStorage.getItem("publicApiEndpoint") !== null
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
    resetApiEndpoint()
    resetPublicApiEndpoint()
  }

  return {
    apiEndpoint,
    setApiEndpoint,
    resetApiEndpoint,
    publicApiEndpoint,
    setPublicApiEndpoint,
    resetPublicApiEndpoint,
    resetSettings,
    isConfigured,
    hasUserOverride,
    hasPublicUserOverride,
    defaultEndpoint,
    defaultPublicEndpoint,
  }
})
