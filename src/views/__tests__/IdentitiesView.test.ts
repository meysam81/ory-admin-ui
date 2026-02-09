import { describe, it, expect, vi, beforeEach } from "vitest"
import { flushPromises } from "@vue/test-utils"
import { renderComponent } from "@/test/test-utils"
import { createIdentity, paginatedResponse, createIdentitySchema } from "@/test/factories"

vi.mock("@/api/identities", () => ({
  identitiesApi: {
    list: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock("@/api/schemas", () => ({
  schemasApi: {
    list: vi.fn(),
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
import { schemasApi } from "@/api/schemas"
import IdentitiesView from "../IdentitiesView.vue"

const identities = [
  createIdentity({ traits: { email: "alice@example.com" }, state: "active" }),
  createIdentity({ traits: { email: "bob@example.com" }, state: "inactive" }),
  createIdentity({ traits: { email: "charlie@example.com" }, state: "active" }),
]

describe("IdentitiesView", () => {
  beforeEach(() => {
    vi.mocked(identitiesApi.list).mockResolvedValue(paginatedResponse(identities))
    vi.mocked(schemasApi.list).mockResolvedValue([createIdentitySchema()])
  })

  it("renders identity list after loading", async () => {
    const { wrapper, router } = renderComponent(IdentitiesView, { initialRoute: "/identities" })
    await router.isReady()
    await flushPromises()

    expect(wrapper.text()).toContain("Identities")
    expect(wrapper.text()).toContain("alice@example.com")
    expect(wrapper.text()).toContain("bob@example.com")
    expect(wrapper.text()).toContain("charlie@example.com")
  })

  it("shows loading skeletons initially", async () => {
    // Make the API never resolve
    vi.mocked(identitiesApi.list).mockReturnValue(new Promise(() => {}))
    const { wrapper, router } = renderComponent(IdentitiesView, { initialRoute: "/identities" })
    await router.isReady()
    await flushPromises()

    // Skeletons are rendered via Skeleton component (div elements with animate-pulse)
    const skeletons = wrapper.findAll('[class*="animate-pulse"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it("shows error state when API fails", async () => {
    vi.mocked(identitiesApi.list).mockRejectedValue(new Error("Connection refused"))
    const { wrapper, router } = renderComponent(IdentitiesView, { initialRoute: "/identities" })
    await router.isReady()
    await flushPromises()
    await flushPromises()

    expect(wrapper.text()).toContain("Failed to load identities")
  })

  it("shows empty state when no identities exist", async () => {
    vi.mocked(identitiesApi.list).mockResolvedValue(paginatedResponse([]))
    const { wrapper, router } = renderComponent(IdentitiesView, { initialRoute: "/identities" })
    await router.isReady()
    await flushPromises()

    expect(wrapper.text()).toContain("No identities found")
    expect(wrapper.text()).toContain("Create your first identity")
  })

  it("renders Create Identity button", async () => {
    const { wrapper, router } = renderComponent(IdentitiesView, { initialRoute: "/identities" })
    await router.isReady()
    await flushPromises()

    expect(wrapper.text()).toContain("Create Identity")
  })

  it("shows pagination when there are results", async () => {
    const { wrapper, router } = renderComponent(IdentitiesView, { initialRoute: "/identities" })
    await router.isReady()
    await flushPromises()

    expect(wrapper.text()).toContain("Showing 3 items")
  })

  it("shows pagination with next enabled when nextToken exists", async () => {
    vi.mocked(identitiesApi.list).mockResolvedValue(
      paginatedResponse(identities, { nextToken: "page2" })
    )
    const { wrapper, router } = renderComponent(IdentitiesView, { initialRoute: "/identities" })
    await router.isReady()
    await flushPromises()

    const nextBtn = wrapper.findAll("button").find((b) => b.attributes("title") === "Next page")
    expect(nextBtn).toBeDefined()
    expect(nextBtn!.attributes("disabled")).toBeUndefined()
  })

  it("has search input", async () => {
    const { wrapper, router } = renderComponent(IdentitiesView, { initialRoute: "/identities" })
    await router.isReady()
    await flushPromises()

    const searchInput = wrapper.find('input[placeholder*="Search"]')
    expect(searchInput.exists()).toBe(true)
  })

  it("shows delete button for each identity", async () => {
    const { wrapper, router } = renderComponent(IdentitiesView, { initialRoute: "/identities" })
    await router.isReady()
    await flushPromises()

    const deleteButtons = wrapper.findAll('button[title="Delete"]')
    expect(deleteButtons).toHaveLength(3)
  })

  it("opens delete confirmation dialog when delete is clicked", async () => {
    const { wrapper, router } = renderComponent(IdentitiesView, { initialRoute: "/identities" })
    await router.isReady()
    await flushPromises()

    const deleteBtn = wrapper.findAll('button[title="Delete"]')[0]
    await deleteBtn.trigger("click")
    await flushPromises()

    // AlertDialog content is rendered via radix-vue portal (teleported).
    // Verify the dialog is opened by checking that the AlertDialogRoot has open=true.
    const alertDialog = wrapper.findComponent({ name: "AlertDialogRoot" })
    expect(alertDialog.exists()).toBe(true)
    expect(alertDialog.props("open")).toBe(true)
  })

  it("displays schema badges for each identity", async () => {
    const { wrapper, router } = renderComponent(IdentitiesView, { initialRoute: "/identities" })
    await router.isReady()
    await flushPromises()

    // Each identity has schema_id "default"
    const badges = wrapper.findAll("span").filter((s) => s.text() === "default")
    expect(badges.length).toBeGreaterThanOrEqual(3)
  })
})
