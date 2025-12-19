import { http, HttpResponse, delay } from 'msw'
import { mockSessions } from '@test/fixtures/sessions'

const BASE_URL = 'http://localhost:4434'

export const sessionHandlers = [
  // List all sessions
  http.get(`${BASE_URL}/admin/sessions`, async ({ request }) => {
    await delay(100)

    const url = new URL(request.url)
    const active = url.searchParams.get('active')

    let sessions = [...mockSessions]

    if (active === 'true') {
      sessions = sessions.filter((s) => s.active)
    } else if (active === 'false') {
      sessions = sessions.filter((s) => !s.active)
    }

    return HttpResponse.json(sessions)
  }),

  // Get single session
  http.get(`${BASE_URL}/admin/sessions/:id`, async ({ params }) => {
    await delay(50)

    const { id } = params
    const session = mockSessions.find((s) => s.id === id)

    if (!session) {
      return HttpResponse.json({ error: { code: 404, message: 'Session not found' } }, { status: 404 })
    }

    return HttpResponse.json(session)
  }),

  // Disable session
  http.delete(`${BASE_URL}/admin/sessions/:id`, async ({ params }) => {
    await delay(100)

    const { id } = params
    const session = mockSessions.find((s) => s.id === id)

    if (!session) {
      return HttpResponse.json({ error: { code: 404, message: 'Session not found' } }, { status: 404 })
    }

    return new HttpResponse(null, { status: 204 })
  }),

  // Extend session
  http.patch(`${BASE_URL}/admin/sessions/:id/extend`, async ({ params }) => {
    await delay(100)

    const { id } = params
    const session = mockSessions.find((s) => s.id === id)

    if (!session) {
      return HttpResponse.json({ error: { code: 404, message: 'Session not found' } }, { status: 404 })
    }

    return HttpResponse.json({
      ...session,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
  }),
]
