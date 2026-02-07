import type {
  Identity,
  Session,
  Message,
  IdentitySchema,
  PaginatedResponse,
  PaginationMeta,
} from "@/types/api"

let counter = 0

function nextId(): string {
  counter++
  const hex = counter.toString(16).padStart(8, "0")
  return `${hex}-0000-4000-a000-000000000000`
}

/** Reset the factory counter (call in beforeEach if deterministic IDs matter) */
export function resetFactories() {
  counter = 0
}

export function createIdentity(overrides: Partial<Identity> = {}): Identity {
  const id = overrides.id ?? nextId()
  return {
    id,
    schema_id: "default",
    schema_url: "http://localhost:4434/schemas/default",
    state: "active",
    traits: { email: `user-${id.slice(0, 8)}@example.com` },
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    ...overrides,
  }
}

export function createSession(overrides: Partial<Session> = {}): Session {
  return {
    id: overrides.id ?? nextId(),
    active: true,
    expires_at: "2025-12-31T23:59:59Z",
    authenticated_at: "2025-01-01T00:00:00Z",
    authenticator_assurance_level: "aal1",
    issued_at: "2025-01-01T00:00:00Z",
    ...overrides,
  }
}

export function createMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: overrides.id ?? nextId(),
    type: "email",
    status: "sent",
    recipient: "user@example.com",
    subject: "Verify your email",
    body: "<p>Click here to verify</p>",
    template_type: "verification_valid",
    send_count: 1,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    ...overrides,
  }
}

export function createIdentitySchema(overrides: Partial<IdentitySchema> = {}): IdentitySchema {
  return {
    id: overrides.id ?? "default",
    schema: {
      $id: "https://schemas.ory.sh/presets/kratos/identity.default.schema.json",
      $schema: "http://json-schema.org/draft-07/schema#",
      title: "Default Identity Schema",
      type: "object",
      properties: {
        traits: {
          type: "object",
          properties: {
            email: { type: "string", format: "email" },
          },
          required: ["email"],
        },
      },
    },
    ...overrides,
  }
}

export function paginatedResponse<T>(
  data: T[],
  pagination: PaginationMeta = {}
): PaginatedResponse<T> {
  return { data, pagination }
}
