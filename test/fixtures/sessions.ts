import type { Session } from '@/types/api'
import { mockIdentity } from './identities'

export const mockSession: Session = {
  id: '880e8400-e29b-41d4-a716-446655440000',
  active: true,
  expires_at: '2024-02-15T10:30:00Z',
  authenticated_at: '2024-01-15T10:30:00Z',
  authenticator_assurance_level: 'aal1',
  authentication_methods: [
    {
      method: 'password',
      aal: 'aal1',
      completed_at: '2024-01-15T10:30:00Z',
    },
  ],
  issued_at: '2024-01-15T10:30:00Z',
  identity: mockIdentity,
  devices: [
    {
      id: '990e8400-e29b-41d4-a716-446655440000',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      location: 'San Francisco, CA',
    },
  ],
}

export const mockSessions: Session[] = [
  mockSession,
  {
    id: '880e8400-e29b-41d4-a716-446655440001',
    active: true,
    expires_at: '2024-02-16T14:00:00Z',
    authenticated_at: '2024-01-16T14:00:00Z',
    authenticator_assurance_level: 'aal1',
    authentication_methods: [
      {
        method: 'password',
        aal: 'aal1',
        completed_at: '2024-01-16T14:00:00Z',
      },
    ],
    issued_at: '2024-01-16T14:00:00Z',
    identity: mockIdentity,
    devices: [
      {
        id: '990e8400-e29b-41d4-a716-446655440001',
        ip_address: '10.0.0.50',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        location: 'New York, NY',
      },
    ],
  },
  {
    id: '880e8400-e29b-41d4-a716-446655440002',
    active: false,
    expires_at: '2024-01-10T08:00:00Z',
    authenticated_at: '2024-01-01T08:00:00Z',
    authenticator_assurance_level: 'aal1',
    authentication_methods: [
      {
        method: 'password',
        aal: 'aal1',
        completed_at: '2024-01-01T08:00:00Z',
      },
    ],
    issued_at: '2024-01-01T08:00:00Z',
    identity: mockIdentity,
    devices: [],
  },
]

export function createMockSession(overrides: Partial<Session> = {}): Session {
  return {
    ...mockSession,
    id: crypto.randomUUID(),
    issued_at: new Date().toISOString(),
    authenticated_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    ...overrides,
  }
}
