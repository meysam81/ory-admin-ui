import { getApiClient } from "./client"
import type { HealthStatus, Version } from "@/types/api"

export const healthApi = {
  alive: async () => {
    const client = getApiClient()
    return client.get("admin/health/alive").json<HealthStatus>()
  },

  ready: async () => {
    const client = getApiClient()
    return client.get("health/ready").json<HealthStatus>()
  },

  version: async () => {
    const client = getApiClient()
    return client.get("admin/version").json<Version>()
  },
}
