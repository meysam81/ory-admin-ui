import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { sessionsApi } from '@/api/sessions'
import { mockSession, mockSessions } from '@test/fixtures/sessions'

describe('Sessions API', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('list', () => {
    it('returns list of sessions', async () => {
      const sessions = await sessionsApi.list()

      expect(sessions).toHaveLength(mockSessions.length)
      expect(sessions[0]).toHaveProperty('id')
      expect(sessions[0]).toHaveProperty('active')
      expect(sessions[0]).toHaveProperty('expires_at')
    })

    it('filters by active status', async () => {
      const activeSessions = await sessionsApi.list({ active: true })

      expect(Array.isArray(activeSessions)).toBe(true)
      activeSessions.forEach((session) => {
        expect(session.active).toBe(true)
      })
    })

    it('accepts pagination parameters', async () => {
      const sessions = await sessionsApi.list({ page_size: 10 })

      expect(Array.isArray(sessions)).toBe(true)
    })
  })

  describe('get', () => {
    it('returns a single session by id', async () => {
      const session = await sessionsApi.get(mockSession.id)

      expect(session.id).toBe(mockSession.id)
      expect(session.active).toBe(mockSession.active)
    })

    it('throws error for non-existent session', async () => {
      await expect(sessionsApi.get('non-existent-id')).rejects.toThrow()
    })
  })

  describe('disable', () => {
    it('disables a session without throwing', async () => {
      await expect(sessionsApi.disable(mockSession.id)).resolves.not.toThrow()
    })
  })

  describe('extend', () => {
    it('extends a session and returns updated session', async () => {
      const extended = await sessionsApi.extend(mockSession.id)

      expect(extended).toHaveProperty('id')
      expect(extended).toHaveProperty('expires_at')
    })
  })
})
