import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { identitiesApi } from '@/api/identities'
import { mockIdentities, mockIdentity, mockIdentityWithCredentials } from '@test/fixtures/identities'

describe('Identities API', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('list', () => {
    it('returns list of identities', async () => {
      const identities = await identitiesApi.list()

      expect(identities).toHaveLength(mockIdentities.length)
      expect(identities[0]).toHaveProperty('id')
      expect(identities[0]).toHaveProperty('traits')
      expect(identities[0]).toHaveProperty('schema_id')
    })

    it('accepts pagination parameters', async () => {
      const identities = await identitiesApi.list({ page_size: 10 })

      expect(Array.isArray(identities)).toBe(true)
    })
  })

  describe('get', () => {
    it('returns a single identity by id', async () => {
      const identity = await identitiesApi.get(mockIdentity.id)

      expect(identity.id).toBe(mockIdentity.id)
      expect(identity.traits).toEqual(mockIdentity.traits)
    })

    it('includes credentials when requested', async () => {
      const identity = await identitiesApi.get(mockIdentity.id, ['password'])

      expect(identity.credentials).toBeDefined()
      expect(identity.credentials?.password).toBeDefined()
    })

    it('throws error for non-existent identity', async () => {
      await expect(identitiesApi.get('non-existent-id')).rejects.toThrow()
    })
  })

  describe('create', () => {
    it('creates a new identity', async () => {
      const newIdentity = await identitiesApi.create({
        schema_id: 'default',
        traits: {
          email: 'newuser@example.com',
          name: { first: 'New', last: 'User' },
        },
      })

      expect(newIdentity).toHaveProperty('id')
      expect(newIdentity.traits.email).toBe('newuser@example.com')
      expect(newIdentity.schema_id).toBe('default')
    })
  })

  describe('update', () => {
    it('updates an existing identity', async () => {
      const updated = await identitiesApi.update(mockIdentity.id, {
        schema_id: 'default',
        traits: { email: 'updated@example.com' },
        state: 'active',
      })

      expect(updated.traits.email).toBe('updated@example.com')
    })
  })

  describe('delete', () => {
    it('deletes an identity without throwing', async () => {
      await expect(identitiesApi.delete(mockIdentity.id)).resolves.not.toThrow()
    })
  })

  describe('getSessions', () => {
    it('returns sessions for an identity', async () => {
      const sessions = await identitiesApi.getSessions(mockIdentity.id)

      expect(Array.isArray(sessions)).toBe(true)
    })
  })

  describe('deleteSessions', () => {
    it('deletes all sessions for an identity', async () => {
      await expect(identitiesApi.deleteSessions(mockIdentity.id)).resolves.not.toThrow()
    })
  })

  describe('createRecoveryLink', () => {
    it('creates a recovery link', async () => {
      const response = await identitiesApi.createRecoveryLink(mockIdentity.id)

      expect(response).toHaveProperty('recovery_link')
      expect(response.recovery_link).toContain('http')
    })
  })

  describe('createRecoveryCode', () => {
    it('creates a recovery code', async () => {
      const response = await identitiesApi.createRecoveryCode(mockIdentity.id)

      expect(response).toHaveProperty('recovery_link')
      expect(response).toHaveProperty('recovery_code')
    })
  })
})
