import { describe, it, expect, vi, beforeEach } from "vitest"
import { flushPromises } from "@vue/test-utils"
import { renderComponent } from "@/test/test-utils"
import { createSession, createIdentity, paginatedResponse } from "@/test/factories"

vi.mock("@/api/sessions", () => ({
  sessionsApi: {
    list: vi.fn(),
    disable: vi.fn(),
  },
}))

vi.mock("@/api/client", () => ({
  getApiClient: vi.fn(),
  resetApiClient: vi.fn(),
  getPublicApiClient: vi.fn(),
  resetPublicApiClient: vi.fn(),
}))

vi.mock("@/config/loader", () => ({
  getRuntimeProfiles: vi.fn(() => null),
}))

import { sessionsApi } from "@/api/sessions"
import SessionsView from "../SessionsView.vue"

const sessions = [
  createSession({
    active: true,
    identity: createIdentity({ traits: { email: "alice@example.com" } }),
  }),
  createSession({
    active: false,
    identity: createIdentity({ traits: { email: "bob@example.com" } }),
  }),
  createSession({
    active: true,
    identity: createIdentity({ traits: { email: "charlie@example.com" } }),
  }),
]

describe("SessionsView", () => {
  beforeEach(() => {
    vi.mocked(sessionsApi.list).mockResolvedValue(paginatedResponse(sessions))
  })

  it("renders sessions list", async () => {
    const { wrapper, router } = renderComponent(SessionsView, { initialRoute: "/sessions" })
    await router.isReady()
    await flushPromises()

    expect(wrapper.text()).toContain("Sessions")
    expect(wrapper.text()).toContain("alice@example.com")
    expect(wrapper.text()).toContain("bob@example.com")
  })

  it("shows loading skeletons initially", async () => {
    vi.mocked(sessionsApi.list).mockReturnValue(new Promise(() => {}))
    const { wrapper, router } = renderComponent(SessionsView, { initialRoute: "/sessions" })
    await router.isReady()
    await flushPromises()

    const skeletons = wrapper.findAll('[class*="animate-pulse"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it("shows error state when API fails", async () => {
    vi.mocked(sessionsApi.list).mockRejectedValue(new Error("Connection refused"))
    const { wrapper, router } = renderComponent(SessionsView, { initialRoute: "/sessions" })
    await router.isReady()
    await flushPromises()
    await flushPromises()

    expect(wrapper.text()).toContain("Failed to load sessions")
  })

  it("shows empty state when no sessions", async () => {
    vi.mocked(sessionsApi.list).mockResolvedValue(paginatedResponse([]))
    const { wrapper, router } = renderComponent(SessionsView, { initialRoute: "/sessions" })
    await router.isReady()
    await flushPromises()

    expect(wrapper.text()).toContain("No sessions found")
  })

  it("renders status badges for active/inactive sessions", async () => {
    const { wrapper, router } = renderComponent(SessionsView, { initialRoute: "/sessions" })
    await router.isReady()
    await flushPromises()

    // Active and inactive badges should be present
    expect(wrapper.text()).toContain("Active")
    expect(wrapper.text()).toContain("Inactive")
  })

  it("has search input for filtering", async () => {
    const { wrapper, router } = renderComponent(SessionsView, { initialRoute: "/sessions" })
    await router.isReady()
    await flushPromises()

    const searchInput = wrapper.find('input[placeholder*="Search"]')
    expect(searchInput.exists()).toBe(true)
  })

  it("shows revoke button for each session", async () => {
    const { wrapper, router } = renderComponent(SessionsView, { initialRoute: "/sessions" })
    await router.isReady()
    await flushPromises()

    const revokeButtons = wrapper.findAll('button[title="Revoke"]')
    expect(revokeButtons).toHaveLength(3)
  })

  it("opens revoke confirmation dialog", async () => {
    const { wrapper, router } = renderComponent(SessionsView, { initialRoute: "/sessions" })
    await router.isReady()
    await flushPromises()

    const revokeBtn = wrapper.findAll('button[title="Revoke"]')[0]
    await revokeBtn.trigger("click")
    await flushPromises()

    // AlertDialog content is rendered via radix-vue portal (teleported).
    // Verify the dialog is opened by checking that the AlertDialogRoot has open=true.
    const alertDialog = wrapper.findComponent({ name: "AlertDialogRoot" })
    expect(alertDialog.exists()).toBe(true)
    expect(alertDialog.props("open")).toBe(true)
  })
})
