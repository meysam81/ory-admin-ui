import type { z } from "zod"
import type {
  identitySchema,
  identityCredentialSchema,
  verifiableAddressSchema,
  recoveryAddressSchema,
  sessionSchema,
  authenticationMethodSchema,
  sessionDeviceSchema,
  messageSchema,
  messageDispatchSchema,
  identitySchemaSchema,
  healthStatusSchema,
  versionSchema,
  recoveryLinkResponseSchema,
  recoveryCodeResponseSchema,
  apiErrorSchema,
} from "./api.schemas"

// --- Response types (derived from Zod schemas) ---

export type Identity = z.infer<typeof identitySchema>
export type IdentityCredential = z.infer<typeof identityCredentialSchema>
export type VerifiableAddress = z.infer<typeof verifiableAddressSchema>
export type RecoveryAddress = z.infer<typeof recoveryAddressSchema>
export type Session = z.infer<typeof sessionSchema>
export type AuthenticationMethod = z.infer<typeof authenticationMethodSchema>
export type SessionDevice = z.infer<typeof sessionDeviceSchema>
export type Message = z.infer<typeof messageSchema>
export type MessageDispatch = z.infer<typeof messageDispatchSchema>
export type IdentitySchema = z.infer<typeof identitySchemaSchema>
export type HealthStatus = z.infer<typeof healthStatusSchema>
export type Version = z.infer<typeof versionSchema>
export type RecoveryLinkResponse = z.infer<typeof recoveryLinkResponseSchema>
export type RecoveryCodeResponse = z.infer<typeof recoveryCodeResponseSchema>
export type ApiError = z.infer<typeof apiErrorSchema>

// --- Request-body types (manual — we construct these, no need to validate) ---

export interface CreateIdentityBody {
  schema_id: string
  traits: Record<string, unknown>
  state?: "active" | "inactive"
  metadata_admin?: Record<string, unknown>
  metadata_public?: Record<string, unknown>
  credentials?: {
    password?: {
      config: {
        password: string
      }
    }
  }
}

export interface UpdateIdentityBody {
  schema_id: string
  traits: Record<string, unknown>
  state: "active" | "inactive"
  metadata_admin?: Record<string, unknown>
  metadata_public?: Record<string, unknown>
}

// --- Pagination (structural, not API response) ---

export interface PaginationParams {
  page_size?: number
  page_token?: string
}

export interface IdentitySearchParams extends PaginationParams {
  credentials_identifier?: string
  preview_credentials_identifier_similar?: string
  ids?: string[]
}

export interface PaginationMeta {
  nextToken?: string
  prevToken?: string
  totalCount?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationMeta
}
