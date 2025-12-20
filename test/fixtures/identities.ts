import type { Identity, Session } from "@/types/api"

export const mockIdentity: Identity = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  schema_id: "default",
  schema_url: "http://localhost:4434/schemas/default",
  state: "active",
  state_changed_at: "2024-01-15T10:30:00Z",
  traits: {
    email: "john.doe@example.com",
    name: {
      first: "John",
      last: "Doe",
    },
  },
  verifiable_addresses: [
    {
      id: "660e8400-e29b-41d4-a716-446655440001",
      value: "john.doe@example.com",
      verified: true,
      via: "email",
      status: "completed",
      verified_at: "2024-01-15T11:00:00Z",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T11:00:00Z",
    },
  ],
  recovery_addresses: [
    {
      id: "770e8400-e29b-41d4-a716-446655440002",
      value: "john.doe@example.com",
      via: "email",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
    },
  ],
  metadata_public: null,
  metadata_admin: null,
  created_at: "2024-01-15T10:30:00Z",
  updated_at: "2024-01-20T14:00:00Z",
}

export const mockIdentityWithCredentials: Identity = {
  ...mockIdentity,
  credentials: {
    password: {
      type: "password",
      identifiers: ["john.doe@example.com"],
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
      version: 1,
    },
  },
}

export const mockIdentities: Identity[] = [
  mockIdentity,
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    schema_id: "default",
    schema_url: "http://localhost:4434/schemas/default",
    state: "active",
    state_changed_at: "2024-01-16T09:00:00Z",
    traits: {
      email: "jane.smith@example.com",
      name: {
        first: "Jane",
        last: "Smith",
      },
    },
    verifiable_addresses: [],
    recovery_addresses: [],
    metadata_public: null,
    metadata_admin: null,
    created_at: "2024-01-16T09:00:00Z",
    updated_at: "2024-01-16T09:00:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    schema_id: "default",
    schema_url: "http://localhost:4434/schemas/default",
    state: "inactive",
    state_changed_at: "2024-01-10T12:00:00Z",
    traits: {
      email: "inactive.user@example.com",
      name: {
        first: "Inactive",
        last: "User",
      },
    },
    verifiable_addresses: [],
    recovery_addresses: [],
    metadata_public: null,
    metadata_admin: null,
    created_at: "2024-01-10T12:00:00Z",
    updated_at: "2024-01-10T12:00:00Z",
  },
]

export const mockIdentitySessions: Session[] = [
  {
    id: "880e8400-e29b-41d4-a716-446655440000",
    active: true,
    expires_at: "2024-02-15T10:30:00Z",
    authenticated_at: "2024-01-15T10:30:00Z",
    authenticator_assurance_level: "aal1",
    authentication_methods: [
      {
        method: "password",
        aal: "aal1",
        completed_at: "2024-01-15T10:30:00Z",
      },
    ],
    issued_at: "2024-01-15T10:30:00Z",
    identity: mockIdentity,
    devices: [
      {
        id: "990e8400-e29b-41d4-a716-446655440000",
        ip_address: "192.168.1.100",
        user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        location: "San Francisco, CA",
      },
    ],
  },
]

export function createMockIdentity(overrides: Partial<Identity> = {}): Identity {
  return {
    ...mockIdentity,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

export function createMockIdentities(count: number): Identity[] {
  return Array.from({ length: count }, (_, i) =>
    createMockIdentity({
      traits: {
        email: `user${i + 1}@example.com`,
        name: { first: `User`, last: `${i + 1}` },
      },
    })
  )
}
