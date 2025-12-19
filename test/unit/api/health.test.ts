import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { healthApi } from '@/api/health'

describe('Health API', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('alive', () => {
    it('returns health status', async () => {
      const status = await healthApi.alive()

      expect(status).toHaveProperty('status')
      expect(status.status).toBe('ok')
    })
  })

  describe('ready', () => {
    it('returns ready status', async () => {
      const status = await healthApi.ready()

      expect(status).toHaveProperty('status')
      expect(status.status).toBe('ok')
    })
  })

  describe('version', () => {
    it('returns version information', async () => {
      const version = await healthApi.version()

      expect(version).toHaveProperty('version')
      expect(version.version).toMatch(/^v\d+\.\d+\.\d+$/)
    })
  })
})
