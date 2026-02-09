import { describe, it, expect } from "vitest"
import {
  slugSchema,
  serviceEndpointsSchema,
  profileDataSchema,
  profilesMapSchema,
  profileSchema,
  importExportSchema,
} from "../profile"

describe("slugSchema", () => {
  it("accepts valid slugs", () => {
    expect(slugSchema.safeParse("local").success).toBe(true)
    expect(slugSchema.safeParse("prod-eu").success).toBe(true)
    expect(slugSchema.safeParse("a").success).toBe(true)
    expect(slugSchema.safeParse("my-staging-env-123").success).toBe(true)
    expect(slugSchema.safeParse("a1").success).toBe(true)
  })

  it("rejects empty string", () => {
    expect(slugSchema.safeParse("").success).toBe(false)
  })

  it("rejects uppercase characters", () => {
    expect(slugSchema.safeParse("Prod").success).toBe(false)
    expect(slugSchema.safeParse("PROD-EU").success).toBe(false)
  })

  it("rejects leading/trailing hyphens", () => {
    expect(slugSchema.safeParse("-prod").success).toBe(false)
    expect(slugSchema.safeParse("prod-").success).toBe(false)
    expect(slugSchema.safeParse("-").success).toBe(false)
  })

  it("rejects special characters", () => {
    expect(slugSchema.safeParse("prod_eu").success).toBe(false)
    expect(slugSchema.safeParse("prod.eu").success).toBe(false)
    expect(slugSchema.safeParse("prod eu").success).toBe(false)
  })

  it("rejects strings longer than 63 characters", () => {
    const longSlug = "a" + "b".repeat(62) // 63 chars - should pass
    expect(slugSchema.safeParse(longSlug).success).toBe(true)

    const tooLong = "a" + "b".repeat(63) // 64 chars - should fail
    expect(slugSchema.safeParse(tooLong).success).toBe(false)
  })
})

describe("serviceEndpointsSchema", () => {
  it("accepts valid endpoints", () => {
    const result = serviceEndpointsSchema.safeParse({
      adminUrl: "http://localhost:4434",
      publicUrl: "http://localhost:4433",
    })
    expect(result.success).toBe(true)
  })

  it("rejects missing fields", () => {
    expect(serviceEndpointsSchema.safeParse({ adminUrl: "http://localhost" }).success).toBe(false)
    expect(serviceEndpointsSchema.safeParse({}).success).toBe(false)
  })
})

describe("profileDataSchema", () => {
  it("accepts full profile data", () => {
    const result = profileDataSchema.safeParse({
      kratosAdminBaseURL: "http://localhost:4434",
      kratosPublicBaseURL: "http://localhost:4433",
    })
    expect(result.success).toBe(true)
  })

  it("accepts partial profile data (all fields optional)", () => {
    expect(profileDataSchema.safeParse({}).success).toBe(true)
    expect(profileDataSchema.safeParse({ kratosAdminBaseURL: "http://x" }).success).toBe(true)
  })
})

describe("profilesMapSchema", () => {
  it("accepts a valid profiles map", () => {
    const result = profilesMapSchema.safeParse({
      local: { kratosAdminBaseURL: "http://localhost:4434" },
      "prod-eu": {
        kratosAdminBaseURL: "https://admin.eu.example.com",
        kratosPublicBaseURL: "https://public.eu.example.com",
      },
    })
    expect(result.success).toBe(true)
  })

  it("accepts empty map", () => {
    expect(profilesMapSchema.safeParse({}).success).toBe(true)
  })
})

describe("profileSchema", () => {
  it("accepts a valid profile", () => {
    const result = profileSchema.safeParse({
      name: "Local",
      slug: "local",
      services: {
        kratos: {
          adminUrl: "http://localhost:4434",
          publicUrl: "http://localhost:4433",
        },
      },
    })
    expect(result.success).toBe(true)
  })

  it("accepts profile without kratos service", () => {
    const result = profileSchema.safeParse({
      name: "Empty",
      slug: "empty",
      services: {},
    })
    expect(result.success).toBe(true)
  })

  it("rejects invalid slug in profile", () => {
    const result = profileSchema.safeParse({
      name: "Bad Slug",
      slug: "Bad-Slug",
      services: {},
    })
    expect(result.success).toBe(false)
  })
})

describe("importExportSchema", () => {
  it("accepts valid export format", () => {
    const result = importExportSchema.safeParse({
      version: 1,
      profiles: {
        staging: {
          kratosAdminBaseURL: "https://staging-admin.example.com",
          kratosPublicBaseURL: "https://staging.example.com",
        },
      },
    })
    expect(result.success).toBe(true)
  })

  it("rejects wrong version", () => {
    const result = importExportSchema.safeParse({
      version: 2,
      profiles: {},
    })
    expect(result.success).toBe(false)
  })

  it("rejects missing version", () => {
    const result = importExportSchema.safeParse({
      profiles: {},
    })
    expect(result.success).toBe(false)
  })
})
