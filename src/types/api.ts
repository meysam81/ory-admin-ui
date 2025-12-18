export interface Identity {
  id: string
  schema_id: string
  schema_url: string
  state: 'active' | 'inactive'
  state_changed_at?: string
  traits: Record<string, unknown>
  verifiable_addresses?: VerifiableAddress[]
  recovery_addresses?: RecoveryAddress[]
  metadata_admin?: Record<string, unknown> | null
  metadata_public?: Record<string, unknown> | null
  credentials?: Record<string, IdentityCredential>
  created_at: string
  updated_at: string
}

export interface IdentityCredential {
  type: string
  identifiers: string[]
  config?: Record<string, unknown>
  created_at: string
  updated_at: string
  version?: number
}

export interface VerifiableAddress {
  id: string
  value: string
  verified: boolean
  via: 'email' | 'sms'
  status: string
  verified_at?: string
  created_at: string
  updated_at: string
}

export interface RecoveryAddress {
  id: string
  value: string
  via: string
  created_at: string
  updated_at: string
}

export interface Session {
  id: string
  active: boolean
  expires_at: string
  authenticated_at: string
  authenticator_assurance_level: 'aal0' | 'aal1' | 'aal2' | 'aal3'
  authentication_methods?: AuthenticationMethod[]
  issued_at: string
  identity?: Identity
  devices?: SessionDevice[]
}

export interface AuthenticationMethod {
  method: string
  aal: string
  completed_at: string
}

export interface SessionDevice {
  id: string
  ip_address?: string
  user_agent?: string
  location?: string
}

export interface Message {
  id: string
  type: 'email' | 'phone'
  status: 'queued' | 'sent' | 'processing' | 'abandoned'
  recipient: string
  subject: string
  body: string
  template_type: string
  send_count: number
  dispatches?: MessageDispatch[]
  created_at: string
  updated_at: string
}

export interface MessageDispatch {
  id: string
  message_id: string
  status: 'failed' | 'success'
  error?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface IdentitySchema {
  id: string
  schema: Record<string, unknown>
}

export interface HealthStatus {
  status: string
}

export interface Version {
  version: string
}

export interface CreateIdentityBody {
  schema_id: string
  traits: Record<string, unknown>
  state?: 'active' | 'inactive'
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
  state: 'active' | 'inactive'
  metadata_admin?: Record<string, unknown>
  metadata_public?: Record<string, unknown>
}

export interface RecoveryLinkResponse {
  recovery_link: string
  expires_at?: string
}

export interface RecoveryCodeResponse {
  recovery_link: string
  recovery_code: string
  expires_at?: string
}

export interface ApiError {
  error: {
    code: number
    message: string
    reason?: string
    status?: string
  }
}

export interface PaginationParams {
  page_size?: number
  page_token?: string
}
