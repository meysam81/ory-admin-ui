import { getApiClient } from "./client"
import { safeParseWithLog } from "@/lib/validation"
import { healthStatusSchema, versionSchema } from "@/types/api.schemas"
import type { HealthStatus, Version } from "@/types/api"

export const healthApi = {
  alive: async (): Promise<HealthStatus> => {
    const client = getApiClient()
    const raw = await client.get("admin/health/alive").json<HealthStatus>()
    return safeParseWithLog(healthStatusSchema, raw, "healthApi.alive")
  },

  ready: async (): Promise<HealthStatus> => {
    const client = getApiClient()
    const raw = await client.get("admin/health/ready").json<HealthStatus>()
    return safeParseWithLog(healthStatusSchema, raw, "healthApi.ready")
  },

  version: async (): Promise<Version> => {
    const client = getApiClient()
    const raw = await client.get("admin/version").json<Version>()
    return safeParseWithLog(versionSchema, raw, "healthApi.version")
  },
}
