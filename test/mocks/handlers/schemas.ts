import { http, HttpResponse, delay } from 'msw'
import { mockSchemas } from '@test/fixtures/schemas'

const BASE_URL = 'http://localhost:4434'

export const schemaHandlers = [
  http.get(`${BASE_URL}/schemas`, async () => {
    await delay(50)
    return HttpResponse.json(mockSchemas)
  }),

  http.get(`${BASE_URL}/schemas/:id`, async ({ params }) => {
    await delay(50)

    const { id } = params
    const schema = mockSchemas.find((s) => s.id === id)

    if (!schema) {
      return HttpResponse.json({ error: { code: 404, message: 'Schema not found' } }, { status: 404 })
    }

    return HttpResponse.json(schema)
  }),
]
