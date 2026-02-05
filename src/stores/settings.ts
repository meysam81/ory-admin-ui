import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { getRuntimeConfig } from "@/config/loader"

const HARDCODED_FALLBACK = "http://localhost:4434"
const BUILD_TIME_DEFAULT = import.meta.env.VITE_DEFAULT_API_ENDPOINT || HARDCODED_FALLBACK

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

export const useSettingsStore = defineStore("settings", () => {
  // Priority: localStorage (user override) > default endpoint
  const userOverride = localStorage.getItem("apiEndpoint")
  const apiEndpoint = ref(userOverride || getDefaultEndpoint())

  function setApiEndpoint(endpoint: string) {
    const normalized = endpoint.replace(/\/+$/, "")
    apiEndpoint.value = normalized
    localStorage.setItem("apiEndpoint", normalized)
  }

  function resetApiEndpoint() {
    apiEndpoint.value = getDefaultEndpoint()
    localStorage.removeItem("apiEndpoint")
  }

  const isConfigured = computed(() => apiEndpoint.value.length > 0)

  /**
   * Check if user has a custom override (different from default)
   */
  const hasUserOverride = computed(() => {
    return localStorage.getItem("apiEndpoint") !== null
  })

  /**
   * Get the current default (for display in settings UI)
   */
  const defaultEndpoint = computed(() => getDefaultEndpoint())

  function resetSettings() {
    resetApiEndpoint()
  }

  return {
    apiEndpoint,
    setApiEndpoint,
    resetApiEndpoint,
    resetSettings,
    isConfigured,
    hasUserOverride,
    defaultEndpoint,
  }
})
