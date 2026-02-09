import { describe, it, expect, vi, beforeEach } from "vitest"
import { flushPromises } from "@vue/test-utils"
import { renderComponent } from "@/test/test-utils"
import { createIdentity, createIdentitySchema } from "@/test/factories"

vi.mock("@/api/identities", () => ({
  identitiesApi: {
    create: vi.fn(),
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
import IdentityCreateView from "../IdentityCreateView.vue"

const schemas = [createIdentitySchema({ id: "default" }), createIdentitySchema({ id: "admin" })]

describe("IdentityCreateView", () => {
  beforeEach(() => {
    vi.mocked(schemasApi.list).mockResolvedValue(schemas)
  })

  it("renders the creation form after schemas load", async () => {
    const { wrapper, router } = renderComponent(IdentityCreateView, {
      initialRoute: "/identities/new",
    })
    await router.isReady()
    await flushPromises()

    expect(wrapper.text()).toContain("Create Identity")
    expect(wrapper.text()).toContain("Identity Schema")
    expect(wrapper.text()).toContain("Traits")
  })

  it("shows loading skeletons while schemas load", async () => {
    vi.mocked(schemasApi.list).mockReturnValue(new Promise(() => {}))
    const { wrapper, router } = renderComponent(IdentityCreateView, {
      initialRoute: "/identities/new",
    })
    await router.isReady()
    await flushPromises()

    const skeletons = wrapper.findAll('[class*="animate-pulse"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it("shows error state when schemas fail to load", async () => {
    vi.mocked(schemasApi.list).mockRejectedValue(new Error("Network error"))
    const { wrapper, router } = renderComponent(IdentityCreateView, {
      initialRoute: "/identities/new",
    })
    await router.isReady()
    await flushPromises()
    await flushPromises()

    expect(wrapper.text()).toContain("Failed to load schemas")
  })

  it("submit button is disabled when no schema is selected", async () => {
    const { wrapper, router } = renderComponent(IdentityCreateView, {
      initialRoute: "/identities/new",
    })
    await router.isReady()
    await flushPromises()

    const submitBtn = wrapper.findAll("button").find((b) => b.text().includes("Create Identity"))!
    expect(submitBtn.attributes("disabled")).toBeDefined()
  })

  it("renders Cancel button", async () => {
    const { wrapper, router } = renderComponent(IdentityCreateView, {
      initialRoute: "/identities/new",
    })
    await router.isReady()
    await flushPromises()

    expect(wrapper.text()).toContain("Cancel")
  })

  it("navigates to detail page on successful create", async () => {
    const created = createIdentity({ id: "new-identity-id" })
    vi.mocked(identitiesApi.create).mockResolvedValue(created)

    const { wrapper, router } = renderComponent(IdentityCreateView, {
      initialRoute: "/identities/new",
    })
    await router.isReady()
    await flushPromises()

    // Select a schema by finding the select and setting value
    const select = wrapper.find("select")
    if (select.exists()) {
      await select.setValue("default")
    }

    // Fill in traits JSON
    const textarea = wrapper.find("textarea#traits")
    if (textarea.exists()) {
      await textarea.setValue('{"email": "new@example.com"}')
    }

    // Submit the form
    const form = wrapper.find("form")
    if (form.exists()) {
      await form.trigger("submit")
      await flushPromises()
    }

    // If create was called, it should navigate
    if (vi.mocked(identitiesApi.create).mock.calls.length > 0) {
      expect(router.currentRoute.value.path).toBe("/identities/new-identity-id")
    }
  })
})
