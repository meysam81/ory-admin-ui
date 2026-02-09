import { getApiClient } from "./client"
import { parsePaginationHeaders } from "./pagination"
import { safeParseArrayWithLog, safeParseWithLog } from "@/lib/validation"
import { sessionSchema } from "@/types/api.schemas"
import type { Session, PaginationParams, PaginatedResponse } from "@/types/api"

export const sessionsApi = {
  list: async (
    params?: PaginationParams & { active?: boolean; expand?: string[] }
  ): Promise<PaginatedResponse<Session>> => {
    const client = getApiClient()
    const searchParams = new URLSearchParams()
    if (params?.page_size) searchParams.set("page_size", String(params.page_size))
    if (params?.page_token) searchParams.set("page_token", params.page_token)
    if (params?.active !== undefined) searchParams.set("active", String(params.active))
    if (params?.expand?.length) {
      params.expand.forEach((e) => searchParams.append("expand", e))
    }
    const response = await client.get("admin/sessions", {
      searchParams: searchParams.toString() ? searchParams : undefined,
    })
    const raw = await response.json<Session[]>()
    const data = safeParseArrayWithLog(sessionSchema, raw, "sessionsApi.list")
    const pagination = parsePaginationHeaders(response.headers)
    return { data, pagination }
  },

  get: async (id: string, expand?: string[]): Promise<Session> => {
    const client = getApiClient()
    const searchParams = new URLSearchParams()
    if (expand?.length) {
      expand.forEach((e) => searchParams.append("expand", e))
    }
    const raw = await client
      .get(`admin/sessions/${id}`, {
        searchParams: searchParams.toString() ? searchParams : undefined,
      })
      .json<Session>()
    return safeParseWithLog(sessionSchema, raw, "sessionsApi.get")
  },

  disable: async (id: string) => {
    const client = getApiClient()
    return client.delete(`admin/sessions/${id}`)
  },

  extend: async (id: string): Promise<Session> => {
    const client = getApiClient()
    const raw = await client.patch(`admin/sessions/${id}/extend`).json<Session>()
    return safeParseWithLog(sessionSchema, raw, "sessionsApi.extend")
  },
}
