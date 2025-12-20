import { http, HttpResponse, delay } from "msw"
import { mockMessages } from "@test/fixtures/courier"

const BASE_URL = "http://localhost:4434"

export const courierHandlers = [
  http.get(`${BASE_URL}/admin/courier/messages`, async ({ request }) => {
    await delay(100)

    const url = new URL(request.url)
    const status = url.searchParams.get("status")

    let messages = [...mockMessages]

    if (status) {
      messages = messages.filter((m) => m.status === status)
    }

    return HttpResponse.json(messages)
  }),

  http.get(`${BASE_URL}/admin/courier/messages/:id`, async ({ params }) => {
    await delay(50)

    const { id } = params
    const message = mockMessages.find((m) => m.id === id)

    if (!message) {
      return HttpResponse.json(
        { error: { code: 404, message: "Message not found" } },
        { status: 404 }
      )
    }

    return HttpResponse.json(message)
  }),
]
