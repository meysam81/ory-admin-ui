import { http, HttpResponse, delay } from "msw"
import { mockHealthAlive, mockHealthReady, mockVersion } from "@test/fixtures/health"

const BASE_URL = "http://localhost:4434"

export const healthHandlers = [
  http.get(`${BASE_URL}/health/alive`, async () => {
    await delay(20)
    return HttpResponse.json(mockHealthAlive)
  }),

  http.get(`${BASE_URL}/health/ready`, async () => {
    await delay(20)
    return HttpResponse.json(mockHealthReady)
  }),

  http.get(`${BASE_URL}/version`, async () => {
    await delay(20)
    return HttpResponse.json(mockVersion)
  }),
]
