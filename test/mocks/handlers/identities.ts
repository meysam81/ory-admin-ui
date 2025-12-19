import { http, HttpResponse, delay } from 'msw'
import {
  mockIdentities,
  mockIdentity,
  mockIdentityWithCredentials,
  mockIdentitySessions,
} from '@test/fixtures/identities'

const BASE_URL = 'http://localhost:4434'

export const identityHandlers = [
  // List identities
  http.get(`${BASE_URL}/admin/identities`, async ({ request }) => {
    await delay(100)

    const url = new URL(request.url)
    const pageSize = parseInt(url.searchParams.get('page_size') || '250')
    const pageToken = url.searchParams.get('page_token')

    // Simulate pagination
    const startIndex = pageToken ? parseInt(pageToken) : 0
    const endIndex = startIndex + pageSize
    const identities = mockIdentities.slice(startIndex, endIndex)

    const response = HttpResponse.json(identities)

    // Add pagination headers
    if (endIndex < mockIdentities.length) {
      response.headers.set('X-Next-Page-Token', String(endIndex))
    }

    return response
  }),

  // Get single identity
  http.get(`${BASE_URL}/admin/identities/:id`, async ({ params, request }) => {
    await delay(50)

    const { id } = params
    const url = new URL(request.url)
    const includeCredentials = url.searchParams.getAll('include_credential')

    const identity = mockIdentities.find((i) => i.id === id)

    if (!identity) {
      return HttpResponse.json({ error: { code: 404, message: 'Identity not found' } }, { status: 404 })
    }

    // Return with credentials if requested
    if (includeCredentials.length > 0 && identity.id === mockIdentity.id) {
      return HttpResponse.json(mockIdentityWithCredentials)
    }

    return HttpResponse.json(identity)
  }),

  // Create identity
  http.post(`${BASE_URL}/admin/identities`, async ({ request }) => {
    await delay(100)

    const body = (await request.json()) as { schema_id: string; traits: Record<string, unknown> }

    if (!body.schema_id || !body.traits) {
      return HttpResponse.json({ error: { code: 400, message: 'Missing required fields' } }, { status: 400 })
    }

    const newIdentity = {
      ...mockIdentity,
      id: crypto.randomUUID(),
      schema_id: body.schema_id,
      traits: body.traits,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    return HttpResponse.json(newIdentity, { status: 201 })
  }),

  // Update identity
  http.put(`${BASE_URL}/admin/identities/:id`, async ({ params, request }) => {
    await delay(100)

    const { id } = params
    const body = (await request.json()) as Partial<typeof mockIdentity>

    const identity = mockIdentities.find((i) => i.id === id)

    if (!identity) {
      return HttpResponse.json({ error: { code: 404, message: 'Identity not found' } }, { status: 404 })
    }

    return HttpResponse.json({
      ...identity,
      ...body,
      updated_at: new Date().toISOString(),
    })
  }),

  // Patch identity
  http.patch(`${BASE_URL}/admin/identities/:id`, async ({ params, request }) => {
    await delay(100)

    const { id } = params
    const body = (await request.json()) as Partial<typeof mockIdentity>

    const identity = mockIdentities.find((i) => i.id === id)

    if (!identity) {
      return HttpResponse.json({ error: { code: 404, message: 'Identity not found' } }, { status: 404 })
    }

    return HttpResponse.json({
      ...identity,
      ...body,
      updated_at: new Date().toISOString(),
    })
  }),

  // Delete identity
  http.delete(`${BASE_URL}/admin/identities/:id`, async ({ params }) => {
    await delay(100)

    const { id } = params
    const identity = mockIdentities.find((i) => i.id === id)

    if (!identity) {
      return HttpResponse.json({ error: { code: 404, message: 'Identity not found' } }, { status: 404 })
    }

    return new HttpResponse(null, { status: 204 })
  }),

  // List identity sessions
  http.get(`${BASE_URL}/admin/identities/:id/sessions`, async ({ params }) => {
    await delay(50)

    const { id } = params

    if (id === mockIdentity.id) {
      return HttpResponse.json(mockIdentitySessions)
    }

    return HttpResponse.json([])
  }),

  // Delete all identity sessions
  http.delete(`${BASE_URL}/admin/identities/:id/sessions`, async () => {
    await delay(100)
    return new HttpResponse(null, { status: 204 })
  }),

  // Delete identity credential
  http.delete(`${BASE_URL}/admin/identities/:id/credentials/:type`, async () => {
    await delay(100)
    return new HttpResponse(null, { status: 204 })
  }),

  // Create recovery link
  http.post(`${BASE_URL}/admin/recovery/link`, async ({ request }) => {
    await delay(100)

    const body = (await request.json()) as { identity_id: string }

    if (!body.identity_id) {
      return HttpResponse.json({ error: { code: 400, message: 'Missing identity_id' } }, { status: 400 })
    }

    return HttpResponse.json({
      recovery_link: `http://localhost:4433/self-service/recovery?token=${crypto.randomUUID()}`,
      expires_at: new Date(Date.now() + 3600000).toISOString(),
    })
  }),

  // Create recovery code
  http.post(`${BASE_URL}/admin/recovery/code`, async ({ request }) => {
    await delay(100)

    const body = (await request.json()) as { identity_id: string }

    if (!body.identity_id) {
      return HttpResponse.json({ error: { code: 400, message: 'Missing identity_id' } }, { status: 400 })
    }

    return HttpResponse.json({
      recovery_link: `http://localhost:4433/self-service/recovery?code=123456`,
      recovery_code: '123456',
      expires_at: new Date(Date.now() + 3600000).toISOString(),
    })
  }),
]
