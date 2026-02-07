import { getApiClient } from "./client"
import { parseLinkHeader } from "./pagination"
import { safeParseArrayWithLog, safeParseWithLog } from "@/lib/validation"
import {
  identitySchema,
  sessionSchema,
  recoveryLinkResponseSchema,
  recoveryCodeResponseSchema,
} from "@/types/api.schemas"
import type {
  Identity,
  CreateIdentityBody,
  UpdateIdentityBody,
  RecoveryLinkResponse,
  RecoveryCodeResponse,
  PaginationParams,
  IdentitySearchParams,
  PaginatedResponse,
  Session,
} from "@/types/api"

export const identitiesApi = {
  list: async (params?: IdentitySearchParams): Promise<PaginatedResponse<Identity>> => {
    const client = getApiClient()
    const searchParams = new URLSearchParams()
    if (params?.page_size) searchParams.set("page_size", String(params.page_size))
    if (params?.page_token) searchParams.set("page_token", params.page_token)
    if (params?.credentials_identifier)
      searchParams.set("credentials_identifier", params.credentials_identifier)
    if (params?.preview_credentials_identifier_similar)
      searchParams.set(
        "preview_credentials_identifier_similar",
        params.preview_credentials_identifier_similar
      )
    if (params?.ids) {
      for (const id of params.ids) {
        searchParams.append("ids", id)
      }
    }

    const response = await client.get("admin/identities", {
      searchParams: searchParams.toString() ? searchParams : undefined,
    })
    const raw = await response.json<Identity[]>()
    const data = safeParseArrayWithLog(identitySchema, raw, "identitiesApi.list")
    const pagination = parseLinkHeader(response.headers.get("link"))
    return { data, pagination }
  },

  get: async (id: string, includeCredentials?: string[]): Promise<Identity> => {
    const client = getApiClient()
    const searchParams = new URLSearchParams()
    if (includeCredentials?.length) {
      includeCredentials.forEach((c) => searchParams.append("include_credential", c))
    }
    const raw = await client
      .get(`admin/identities/${id}`, {
        searchParams: searchParams.toString() ? searchParams : undefined,
      })
      .json<Identity>()
    return safeParseWithLog(identitySchema, raw, "identitiesApi.get")
  },

  create: async (body: CreateIdentityBody): Promise<Identity> => {
    const client = getApiClient()
    const raw = await client.post("admin/identities", { json: body }).json<Identity>()
    return safeParseWithLog(identitySchema, raw, "identitiesApi.create")
  },

  update: async (id: string, body: UpdateIdentityBody): Promise<Identity> => {
    const client = getApiClient()
    const raw = await client.put(`admin/identities/${id}`, { json: body }).json<Identity>()
    return safeParseWithLog(identitySchema, raw, "identitiesApi.update")
  },

  patch: async (id: string, body: Partial<UpdateIdentityBody>): Promise<Identity> => {
    const client = getApiClient()
    const raw = await client.patch(`admin/identities/${id}`, { json: body }).json<Identity>()
    return safeParseWithLog(identitySchema, raw, "identitiesApi.patch")
  },

  delete: async (id: string) => {
    const client = getApiClient()
    return client.delete(`admin/identities/${id}`)
  },

  deleteCredential: async (id: string, type: string) => {
    const client = getApiClient()
    return client.delete(`admin/identities/${id}/credentials/${type}`)
  },

  getSessions: async (
    id: string,
    params?: PaginationParams & { active?: boolean }
  ): Promise<Session[]> => {
    const client = getApiClient()
    const searchParams = new URLSearchParams()
    if (params?.page_size) searchParams.set("page_size", String(params.page_size))
    if (params?.page_token) searchParams.set("page_token", params.page_token)
    if (params?.active !== undefined) searchParams.set("active", String(params.active))

    const raw = await client
      .get(`admin/identities/${id}/sessions`, {
        searchParams: searchParams.toString() ? searchParams : undefined,
      })
      .json<Session[]>()
    return safeParseArrayWithLog(sessionSchema, raw, "identitiesApi.getSessions")
  },

  deleteSessions: async (id: string) => {
    const client = getApiClient()
    return client.delete(`admin/identities/${id}/sessions`)
  },

  createRecoveryLink: async (
    identityId: string,
    expiresIn?: string
  ): Promise<RecoveryLinkResponse> => {
    const client = getApiClient()
    const raw = await client
      .post("admin/recovery/link", {
        json: {
          identity_id: identityId,
          expires_in: expiresIn,
        },
      })
      .json<RecoveryLinkResponse>()
    return safeParseWithLog(recoveryLinkResponseSchema, raw, "identitiesApi.createRecoveryLink")
  },

  createRecoveryCode: async (
    identityId: string,
    expiresIn?: string
  ): Promise<RecoveryCodeResponse> => {
    const client = getApiClient()
    const raw = await client
      .post("admin/recovery/code", {
        json: {
          identity_id: identityId,
          expires_in: expiresIn,
        },
      })
      .json<RecoveryCodeResponse>()
    return safeParseWithLog(recoveryCodeResponseSchema, raw, "identitiesApi.createRecoveryCode")
  },
}
