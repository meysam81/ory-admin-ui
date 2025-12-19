import { defineStore } from "pinia"
import { ref, computed } from "vue"

const DEFAULT_ENDPOINT = import.meta.env.VITE_DEFAULT_API_ENDPOINT || "http://localhost:4434"

export const useSettingsStore = defineStore("settings", () => {
  const apiEndpoint = ref(localStorage.getItem("apiEndpoint") || DEFAULT_ENDPOINT)

  function setApiEndpoint(endpoint: string) {
    const normalized = endpoint.replace(/\/+$/, "")
    apiEndpoint.value = normalized
    localStorage.setItem("apiEndpoint", normalized)
  }

  function resetApiEndpoint() {
    apiEndpoint.value = DEFAULT_ENDPOINT
    localStorage.removeItem("apiEndpoint")
  }

  const isConfigured = computed(() => apiEndpoint.value.length > 0)

  function resetSettings() {
    resetApiEndpoint()
  }

  return {
    apiEndpoint,
    setApiEndpoint,
    resetApiEndpoint,
    resetSettings,
    isConfigured,
  }
})
