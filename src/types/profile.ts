import { z } from "zod"

// --- Slug validation (DNS RFC 1123 label) ---

export const slugSchema = z
  .string()
  .regex(
    /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/,
    "Slug must be a valid DNS label (lowercase alphanumeric + hyphens, 1-63 chars)"
  )

// --- Service endpoints ---

export const serviceEndpointsSchema = z.object({
  adminUrl: z.string(),
  publicUrl: z.string(),
})

// --- Raw config shape (per-profile in config.json / localStorage) ---

export const profileDataSchema = z.object({
  kratosAdminBaseURL: z.string().optional(),
  kratosPublicBaseURL: z.string().optional(),
})

// --- Profiles map (Record<slug, profileData>) ---

export const profilesMapSchema = z.record(z.string(), profileDataSchema)

// --- Internal normalized profile ---

export const profileSchema = z.object({
  name: z.string(),
  slug: slugSchema,
  services: z.object({
    kratos: serviceEndpointsSchema.optional(),
  }),
})

// --- Import/Export format ---

export const importExportSchema = z.object({
  version: z.literal(1),
  profiles: profilesMapSchema,
})

// --- Inferred types ---

export type ServiceEndpoints = z.infer<typeof serviceEndpointsSchema>
export type ProfileData = z.infer<typeof profileDataSchema>
export type ProfilesMap = z.infer<typeof profilesMapSchema>
export type Profile = z.infer<typeof profileSchema>
export type ProfileSource = "config" | "local"
export type ImportExportData = z.infer<typeof importExportSchema>
