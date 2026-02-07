import { describe, it, expect, vi, beforeEach } from "vitest"
import { flushPromises } from "@vue/test-utils"
import { renderComponent } from "@/test/test-utils"
import { createIdentity, createSession, createMessage, paginatedResponse } from "@/test/factories"

vi.mock("@/api/identities", () => ({
  identitiesApi: {
    list: vi.fn(),
  },
}))

vi.mock("@/api/sessions", () => ({
  sessionsApi: {
    list: vi.fn(),
    disable: vi.fn(),
  },
}))

vi.mock("@/api/courier", () => ({
  courierApi: {
    listMessages: vi.fn(),
  },
}))

vi.mock("@/api/health", () => ({
  healthApi: {
    alive: vi.fn(),
  },
}))

vi.mock("@/api/client", () => ({
  getApiClient: vi.fn(),
  resetApiClient: vi.fn(),
  getPublicApiClient: vi.fn(),
  resetPublicApiClient: vi.fn(),
}))

vi.mock("@/config/loader", () => ({
  getRuntimeConfig: vi.fn(() => null),
}))

import { identitiesApi } from "@/api/identities"
import { sessionsApi } from "@/api/sessions"
import { courierApi } from "@/api/courier"
import { healthApi } from "@/api/health"
import DashboardView from "../DashboardView.vue"

const identities = [createIdentity(), createIdentity({ traits: { email: "bob@test.com" } })]
const sessions = [createSession({ identity: createIdentity() })]
const messages = [createMessage()]

describe("DashboardView", () => {
  beforeEach(() => {
    vi.mocked(identitiesApi.list).mockResolvedValue(paginatedResponse(identities))
    vi.mocked(sessionsApi.list).mockResolvedValue(paginatedResponse(sessions))
    vi.mocked(courierApi.listMessages).mockResolvedValue(messages)
    vi.mocked(healthApi.alive).mockResolvedValue({ status: "ok" })
  })

  it("renders stat cards after data loads", async () => {
    const { wrapper, router } = renderComponent(DashboardView)
    await router.isReady()
    await flushPromises()

    expect(wrapper.text()).toContain("Dashboard")
    expect(wrapper.text()).toContain("Identities")
    expect(wrapper.text()).toContain("Active Sessions")
    expect(wrapper.text()).toContain("Messages")
    expect(wrapper.text()).toContain("API Status")
  })

  it("shows Online when health check succeeds", async () => {
    const { wrapper, router } = renderComponent(DashboardView)
    await router.isReady()
    await flushPromises()

    expect(wrapper.text()).toContain("Online")
  })

  it("shows Offline when health check fails", async () => {
    vi.useFakeTimers()
    vi.mocked(healthApi.alive).mockRejectedValue(new Error("fail"))
    const { wrapper, router } = renderComponent(DashboardView)
    await router.isReady()
    // useHealthAlive sets retry: 1 at query level.
    // Need to advance past the retry backoff delay (default ~1000ms for first retry).
    await vi.advanceTimersByTimeAsync(100)
    await flushPromises()
    await vi.advanceTimersByTimeAsync(2000)
    await flushPromises()
    await vi.advanceTimersByTimeAsync(2000)
    await flushPromises()

    expect(wrapper.text()).toContain("Offline")
    vi.useRealTimers()
  })

  it("renders recent identities list", async () => {
    const { wrapper, router } = renderComponent(DashboardView)
    await router.isReady()
    await flushPromises()

    expect(wrapper.text()).toContain("Recent Identities")
    // Identity email should appear
    expect(wrapper.text()).toContain("bob@test.com")
  })

  it("renders recent sessions list", async () => {
    const { wrapper, router } = renderComponent(DashboardView)
    await router.isReady()
    await flushPromises()

    expect(wrapper.text()).toContain("Recent Sessions")
  })

  it("shows empty state when no identities", async () => {
    vi.mocked(identitiesApi.list).mockResolvedValue(paginatedResponse([]))
    const { wrapper, router } = renderComponent(DashboardView)
    await router.isReady()
    await flushPromises()

    expect(wrapper.text()).toContain("No identities")
  })
})
