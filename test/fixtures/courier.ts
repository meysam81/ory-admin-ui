import type { Message } from '@/types/api'

export const mockMessage: Message = {
  id: 'aa0e8400-e29b-41d4-a716-446655440000',
  status: 'sent',
  type: 'email',
  recipient: 'john.doe@example.com',
  body: 'Please verify your email address by clicking the link below.',
  subject: 'Verify your email',
  template_type: 'verification',
  send_count: 1,
  created_at: '2024-01-15T10:30:00Z',
  updated_at: '2024-01-15T10:31:00Z',
}

export const mockMessages: Message[] = [
  mockMessage,
  {
    id: 'aa0e8400-e29b-41d4-a716-446655440001',
    status: 'queued',
    type: 'email',
    recipient: 'jane.smith@example.com',
    body: 'Your password has been reset.',
    subject: 'Password Reset',
    template_type: 'recovery',
    send_count: 0,
    created_at: '2024-01-16T09:00:00Z',
    updated_at: '2024-01-16T09:00:00Z',
  },
  {
    id: 'aa0e8400-e29b-41d4-a716-446655440002',
    status: 'abandoned',
    type: 'email',
    recipient: 'invalid@example',
    body: 'Test message',
    subject: 'Test',
    template_type: 'verification',
    send_count: 3,
    created_at: '2024-01-14T15:00:00Z',
    updated_at: '2024-01-14T15:05:00Z',
  },
]

export function createMockMessage(overrides: Partial<Message> = {}): Message {
  return {
    ...mockMessage,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}
