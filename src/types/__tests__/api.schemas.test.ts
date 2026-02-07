import { describe, it, expect } from "vitest"
import {
  identitySchema,
  sessionSchema,
  healthStatusSchema,
  themeModeSchema,
  messageSchema,
} from "../api.schemas"

const validIdentity = {
  id: "uuid-1",
  schema_id: "default",
  schema_url: "https://example.com/schema.json",
  state: "active" as const,
  traits: { email: "test@example.com" },
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
}

describe("identitySchema", () => {
  it("accepts a valid identity", () => {
    const result = identitySchema.safeParse(validIdentity)
    expect(result.success).toBe(true)
  })

  it("rejects missing required fields", () => {
    const result = identitySchema.safeParse({ id: "uuid-1" })
    expect(result.success).toBe(false)
  })

  it("accepts identity with optional fields omitted", () => {
    const result = identitySchema.safeParse(validIdentity)
    expect(result.success).toBe(true)
    // verifiable_addresses, recovery_addresses, credentials etc. are all optional
  })

  it("accepts identity with optional fields present", () => {
    const full = {
      ...validIdentity,
      state_changed_at: "2024-01-01T00:00:00Z",
      verifiable_addresses: [
        {
          id: "addr-1",
          value: "test@example.com",
          verified: true,
          via: "email",
          status: "completed",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
      ],
      metadata_admin: { role: "admin" },
      metadata_public: null,
    }
    const result = identitySchema.safeParse(full)
    expect(result.success).toBe(true)
  })

  it("rejects invalid state value", () => {
    const result = identitySchema.safeParse({ ...validIdentity, state: "banned" })
    expect(result.success).toBe(false)
  })
})

describe("sessionSchema", () => {
  it("accepts a valid session", () => {
    const result = sessionSchema.safeParse({
      id: "sess-1",
      active: true,
      expires_at: "2024-12-31T00:00:00Z",
      authenticated_at: "2024-01-01T00:00:00Z",
      authenticator_assurance_level: "aal1",
      issued_at: "2024-01-01T00:00:00Z",
    })
    expect(result.success).toBe(true)
  })

  it("rejects invalid AAL value", () => {
    const result = sessionSchema.safeParse({
      id: "sess-1",
      active: true,
      expires_at: "2024-12-31T00:00:00Z",
      authenticated_at: "2024-01-01T00:00:00Z",
      authenticator_assurance_level: "aal5",
      issued_at: "2024-01-01T00:00:00Z",
    })
    expect(result.success).toBe(false)
  })
})

describe("healthStatusSchema", () => {
  it("accepts valid status", () => {
    expect(healthStatusSchema.safeParse({ status: "ok" }).success).toBe(true)
  })

  it("rejects missing status", () => {
    expect(healthStatusSchema.safeParse({}).success).toBe(false)
  })
})

describe("themeModeSchema", () => {
  it("accepts valid theme values", () => {
    expect(themeModeSchema.safeParse("light").success).toBe(true)
    expect(themeModeSchema.safeParse("dark").success).toBe(true)
    expect(themeModeSchema.safeParse("system").success).toBe(true)
  })

  it("rejects invalid theme values", () => {
    expect(themeModeSchema.safeParse("auto").success).toBe(false)
    expect(themeModeSchema.safeParse(null).success).toBe(false)
  })
})

describe("messageSchema", () => {
  it("accepts a valid message", () => {
    const result = messageSchema.safeParse({
      id: "msg-1",
      type: "email",
      status: "sent",
      recipient: "test@example.com",
      subject: "Test",
      body: "Hello",
      template_type: "recovery",
      send_count: 1,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    })
    expect(result.success).toBe(true)
  })

  it("rejects invalid message type", () => {
    const result = messageSchema.safeParse({
      id: "msg-1",
      type: "fax",
      status: "sent",
      recipient: "test@example.com",
      subject: "Test",
      body: "Hello",
      template_type: "recovery",
      send_count: 1,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    })
    expect(result.success).toBe(false)
  })
})
