import ky from "ky"
import log from "loglevel"
import { useSettingsStore } from "@/stores/settings"

log.setLevel(import.meta.env.DEV ? "debug" : "warn")

export function createApiClient() {
  const settings = useSettingsStore()

  return ky.create({
    prefixUrl: settings.apiEndpoint,
    timeout: 30000,
    credentials: "include",
    redirect: "follow",
    hooks: {
      beforeRequest: [
        (request) => {
          log.debug(`[API] Request: ${request.method} ${request.url}`)
        },
      ],
      afterResponse: [
        (_request, _options, response) => {
          log.debug(`[API] Response: ${response.status}`)
          return response
        },
      ],
      beforeError: [
        (error) => {
          log.error(`[API] Error:`, error.message)
          return error
        },
      ],
    },
  })
}

let apiClient: ReturnType<typeof createApiClient> | null = null

export function getApiClient() {
  if (!apiClient) {
    apiClient = createApiClient()
  }
  return apiClient
}
