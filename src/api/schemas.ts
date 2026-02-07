import { getPublicApiClient } from "./client"
import { safeParseArrayWithLog } from "@/lib/validation"
import { identitySchemaSchema } from "@/types/api.schemas"
import type { IdentitySchema, PaginationParams } from "@/types/api"

export const schemasApi = {
  list: async (params?: PaginationParams): Promise<IdentitySchema[]> => {
    const client = getPublicApiClient()
    const searchParams = new URLSearchParams()
    if (params?.page_size) searchParams.set("page_size", String(params.page_size))
    if (params?.page_token) searchParams.set("page_token", params.page_token)

    const raw = await client
      .get("schemas", {
        searchParams: searchParams.toString() ? searchParams : undefined,
      })
      .json<IdentitySchema[]>()
    return safeParseArrayWithLog(identitySchemaSchema, raw, "schemasApi.list")
  },

  get: async (id: string) => {
    const client = getPublicApiClient()
    return client.get(`schemas/${id}`).json<Record<string, unknown>>()
  },
}
