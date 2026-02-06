import { getApiClient } from "./client"
import { parseLinkHeader } from "./pagination"
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
    const data = await response.json<Identity[]>()
    const pagination = parseLinkHeader(response.headers.get("link"))
    return { data, pagination }
  },

  get: async (id: string, includeCredentials?: string[]) => {
    const client = getApiClient()
    const searchParams = new URLSearchParams()
    if (includeCredentials?.length) {
      includeCredentials.forEach((c) => searchParams.append("include_credential", c))
    }
    return client
      .get(`admin/identities/${id}`, {
        searchParams: searchParams.toString() ? searchParams : undefined,
      })
      .json<Identity>()
  },

  create: async (body: CreateIdentityBody) => {
    const client = getApiClient()
    return client.post("admin/identities", { json: body }).json<Identity>()
  },

  update: async (id: string, body: UpdateIdentityBody) => {
    const client = getApiClient()
    return client.put(`admin/identities/${id}`, { json: body }).json<Identity>()
  },

  patch: async (id: string, body: Partial<UpdateIdentityBody>) => {
    const client = getApiClient()
    return client.patch(`admin/identities/${id}`, { json: body }).json<Identity>()
  },

  delete: async (id: string) => {
    const client = getApiClient()
    return client.delete(`admin/identities/${id}`)
  },

  deleteCredential: async (id: string, type: string) => {
    const client = getApiClient()
    return client.delete(`admin/identities/${id}/credentials/${type}`)
  },

  getSessions: async (id: string, params?: PaginationParams & { active?: boolean }) => {
    const client = getApiClient()
    return client
      .get(`admin/identities/${id}/sessions`, {
        searchParams: params as Record<string, string | number | boolean>,
      })
      .json<Session[]>()
  },

  deleteSessions: async (id: string) => {
    const client = getApiClient()
    return client.delete(`admin/identities/${id}/sessions`)
  },

  createRecoveryLink: async (identityId: string, expiresIn?: string) => {
    const client = getApiClient()
    return client
      .post("admin/recovery/link", {
        json: {
          identity_id: identityId,
          expires_in: expiresIn,
        },
      })
      .json<RecoveryLinkResponse>()
  },

  createRecoveryCode: async (identityId: string, expiresIn?: string) => {
    const client = getApiClient()
    return client
      .post("admin/recovery/code", {
        json: {
          identity_id: identityId,
          expires_in: expiresIn,
        },
      })
      .json<RecoveryCodeResponse>()
  },
}
