import type { HealthStatus, Version } from '@/types/api'

export const mockHealthAlive: HealthStatus = {
  status: 'ok',
}

export const mockHealthReady: HealthStatus = {
  status: 'ok',
}

export const mockHealthNotReady = {
  errors: {
    database: 'connection refused',
  },
}

export const mockVersion: Version = {
  version: 'v1.2.0',
}
