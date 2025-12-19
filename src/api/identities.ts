import { getApiClient } from "./client"
import type {
  Identity,
  CreateIdentityBody,
  UpdateIdentityBody,
  RecoveryLinkResponse,
  RecoveryCodeResponse,
  PaginationParams,
  Session,
} from "@/types/api"

export const identitiesApi = {
  list: async (params?: PaginationParams & { credentials_identifier?: string }) => {
    const client = getApiClient()
    return client
      .get("admin/identities", {
        searchParams: params as Record<string, string | number>,
      })
      .json<Identity[]>()
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
