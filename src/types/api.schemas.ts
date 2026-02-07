import { z } from "zod"

// --- Leaf schemas ---

export const verifiableAddressSchema = z.object({
  id: z.string(),
  value: z.string(),
  verified: z.boolean(),
  via: z.enum(["email", "sms"]),
  status: z.string(),
  verified_at: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const recoveryAddressSchema = z.object({
  id: z.string(),
  value: z.string(),
  via: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const identityCredentialSchema = z.object({
  type: z.string(),
  identifiers: z.array(z.string()),
  config: z.record(z.string(), z.unknown()).optional(),
  created_at: z.string(),
  updated_at: z.string(),
  version: z.number().optional(),
})

// --- Identity ---

export const identitySchema = z.object({
  id: z.string(),
  schema_id: z.string(),
  schema_url: z.string(),
  state: z.enum(["active", "inactive"]),
  state_changed_at: z.string().optional(),
  traits: z.record(z.string(), z.unknown()),
  verifiable_addresses: z.array(verifiableAddressSchema).optional(),
  recovery_addresses: z.array(recoveryAddressSchema).optional(),
  metadata_admin: z.record(z.string(), z.unknown()).nullable().optional(),
  metadata_public: z.record(z.string(), z.unknown()).nullable().optional(),
  credentials: z.record(z.string(), identityCredentialSchema).optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

// --- Session ---

export const authenticationMethodSchema = z.object({
  method: z.string(),
  aal: z.string(),
  completed_at: z.string(),
})

export const sessionDeviceSchema = z.object({
  id: z.string(),
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
  location: z.string().optional(),
})

export const sessionSchema = z.object({
  id: z.string(),
  active: z.boolean(),
  expires_at: z.string(),
  authenticated_at: z.string(),
  authenticator_assurance_level: z.enum(["aal0", "aal1", "aal2", "aal3"]),
  authentication_methods: z.array(authenticationMethodSchema).optional(),
  issued_at: z.string(),
  identity: identitySchema.optional(),
  devices: z.array(sessionDeviceSchema).optional(),
})

// --- Courier ---

export const messageDispatchSchema = z.object({
  id: z.string(),
  message_id: z.string(),
  status: z.enum(["failed", "success"]),
  error: z.record(z.string(), z.unknown()).optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const messageSchema = z.object({
  id: z.string(),
  type: z.enum(["email", "phone"]),
  status: z.enum(["queued", "sent", "processing", "abandoned"]),
  recipient: z.string(),
  subject: z.string(),
  body: z.string(),
  template_type: z.string(),
  send_count: z.number(),
  dispatches: z.array(messageDispatchSchema).optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

// --- Schemas API ---

export const identitySchemaSchema = z.object({
  id: z.string(),
  schema: z.record(z.string(), z.unknown()),
})

// --- Health ---

export const healthStatusSchema = z.object({
  status: z.string(),
})

export const versionSchema = z.object({
  version: z.string(),
})

// --- Recovery responses ---

export const recoveryLinkResponseSchema = z.object({
  recovery_link: z.string(),
  expires_at: z.string().optional(),
})

export const recoveryCodeResponseSchema = z.object({
  recovery_link: z.string(),
  recovery_code: z.string(),
  expires_at: z.string().optional(),
})

// --- Error ---

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.number(),
    message: z.string(),
    reason: z.string().optional(),
    status: z.string().optional(),
  }),
})

// --- Config ---

export const runtimeConfigSchema = z.object({
  kratosAdminBaseURL: z.string().optional(),
  kratosPublicBaseURL: z.string().optional(),
})

export const cachedConfigSchema = z.object({
  config: runtimeConfigSchema,
  timestamp: z.number(),
})

// --- Theme ---

export const themeModeSchema = z.enum(["light", "dark", "system"])
