import { describe, it, expect, vi, beforeEach } from "vitest"
import { flushPromises } from "@vue/test-utils"
import { renderComponent } from "@/test/test-utils"
import { createIdentity, createSession } from "@/test/factories"
import type { Identity } from "@/types/api"

vi.mock("@/api/identities", () => ({
  identitiesApi: {
    get: vi.fn(),
    getSessions: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
    createRecoveryLink: vi.fn(),
  },
}))

vi.mock("@/api/sessions", () => ({
  sessionsApi: {
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

import { identitiesApi } from "@/api/identities"
import IdentityDetailView from "../IdentityDetailView.vue"

const mockIdentity: Identity = createIdentity({
  id: "test-uuid-1234-5678-abcd-ef1234567890",
  traits: { email: "alice@example.com", username: "alice" },
  state: "active",
  schema_id: "default",
  created_at: "2025-01-15T10:00:00Z",
  updated_at: "2025-06-01T12:00:00Z",
})

const mockSessions = [
  createSession({ active: true, identity: mockIdentity }),
  createSession({ active: true, identity: mockIdentity }),
]

describe("IdentityDetailView", () => {
  beforeEach(() => {
    vi.mocked(identitiesApi.get).mockResolvedValue(mockIdentity)
    vi.mocked(identitiesApi.getSessions).mockResolvedValue(mockSessions)
  })

  function renderDetail() {
    return renderComponent(IdentityDetailView, {
      initialRoute: "/identities/test-uuid-1234-5678-abcd-ef1234567890",
    })
  }

  it("renders identity name and ID after loading", async () => {
    const { wrapper, router } = renderDetail()
    await router.isReady()
    await flushPromises()

    expect(wrapper.text()).toContain("alice@example.com")
    expect(wrapper.text()).toContain("test-uuid-1234-5678-abcd-ef1234567890")
  })

  it("shows active badge for active identity", async () => {
    const { wrapper, router } = renderDetail()
    await router.isReady()
    await flushPromises()

    expect(wrapper.text()).toContain("Active")
  })

  it("shows blocked badge for inactive identity", async () => {
    vi.mocked(identitiesApi.get).mockResolvedValue(
      createIdentity({ ...mockIdentity, state: "inactive" })
    )
    const { wrapper, router } = renderDetail()
    await router.isReady()
    await flushPromises()

    expect(wrapper.text()).toContain("Blocked")
  })

  it("renders tabs for overview, sessions, credentials, raw JSON", async () => {
    const { wrapper, router } = renderDetail()
    await router.isReady()
    await flushPromises()

    expect(wrapper.text()).toContain("Overview")
    expect(wrapper.text()).toContain("Sessions")
    expect(wrapper.text()).toContain("Credentials")
    expect(wrapper.text()).toContain("Raw JSON")
  })

  it("shows schema ID in metadata", async () => {
    const { wrapper, router } = renderDetail()
    await router.isReady()
    await flushPromises()

    expect(wrapper.text()).toContain("default")
  })

  it("shows loading skeletons initially", async () => {
    vi.mocked(identitiesApi.get).mockReturnValue(new Promise(() => {}))
    const { wrapper, router } = renderDetail()
    await router.isReady()
    await flushPromises()

    const skeletons = wrapper.findAll('[class*="animate-pulse"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it("shows error state when identity fails to load", async () => {
    vi.mocked(identitiesApi.get).mockRejectedValue(new Error("Not found"))
    const { wrapper, router } = renderDetail()
    await router.isReady()
    await flushPromises()
    await flushPromises()

    expect(wrapper.text()).toContain("Failed to load identity")
  })

  it("renders Recovery Link button", async () => {
    const { wrapper, router } = renderDetail()
    await router.isReady()
    await flushPromises()

    expect(wrapper.text()).toContain("Recovery Link")
  })

  it("renders Block/Unblock button based on state", async () => {
    const { wrapper, router } = renderDetail()
    await router.isReady()
    await flushPromises()

    expect(wrapper.text()).toContain("Block")
  })

  it("shows Unblock for inactive identity", async () => {
    vi.mocked(identitiesApi.get).mockResolvedValue(
      createIdentity({ ...mockIdentity, state: "inactive" })
    )
    const { wrapper, router } = renderDetail()
    await router.isReady()
    await flushPromises()

    expect(wrapper.text()).toContain("Unblock")
  })

  it("renders Delete button", async () => {
    const { wrapper, router } = renderDetail()
    await router.isReady()
    await flushPromises()

    expect(wrapper.text()).toContain("Delete")
  })

  it("opens delete confirmation dialog when Delete is clicked", async () => {
    const { wrapper, router } = renderDetail()
    await router.isReady()
    await flushPromises()

    const deleteBtn = wrapper.findAll("button").find((b) => b.text().includes("Delete"))!
    await deleteBtn.trigger("click")
    await flushPromises()

    // AlertDialog content is rendered via radix-vue portal (teleported).
    // Verify the dialog is opened by checking that an AlertDialogRoot has open=true.
    const alertDialogs = wrapper.findAllComponents({ name: "AlertDialogRoot" })
    const openDialog = alertDialogs.find((d) => d.props("open") === true)
    expect(openDialog).toBeDefined()
  })
})
