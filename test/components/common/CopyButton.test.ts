import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { mount } from "@vue/test-utils"
import CopyButton from "@/components/common/CopyButton.vue"
import Button from "@/components/ui/Button.vue"

// Mock vue-sonner
vi.mock("vue-sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe("CopyButton", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders copy icon initially", () => {
    const wrapper = mount(CopyButton, {
      props: { text: "test-value" },
      global: {
        components: { Button },
        stubs: {
          Copy: { template: '<svg data-testid="copy-icon" />' },
          Check: { template: '<svg data-testid="check-icon" />' },
        },
      },
    })

    expect(wrapper.find('[data-testid="copy-icon"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="check-icon"]').exists()).toBe(false)
  })

  it("copies value to clipboard on click", async () => {
    const wrapper = mount(CopyButton, {
      props: { text: "test-value" },
      global: {
        components: { Button },
        stubs: {
          Copy: { template: '<svg data-testid="copy-icon" />' },
          Check: { template: '<svg data-testid="check-icon" />' },
        },
      },
    })

    await wrapper.trigger("click")

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("test-value")
  })

  it("shows check icon after copying", async () => {
    const wrapper = mount(CopyButton, {
      props: { text: "test-value" },
      global: {
        components: { Button },
        stubs: {
          Copy: { template: '<svg data-testid="copy-icon" />' },
          Check: { template: '<svg data-testid="check-icon" />' },
        },
      },
    })

    await wrapper.trigger("click")
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-testid="check-icon"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="copy-icon"]').exists()).toBe(false)
  })

  it("reverts to copy icon after timeout", async () => {
    vi.useFakeTimers()

    const wrapper = mount(CopyButton, {
      props: { text: "test-value" },
      global: {
        components: { Button },
        stubs: {
          Copy: { template: '<svg data-testid="copy-icon" />' },
          Check: { template: '<svg data-testid="check-icon" />' },
        },
      },
    })

    await wrapper.trigger("click")
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-testid="check-icon"]').exists()).toBe(true)

    vi.advanceTimersByTime(2000)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-testid="copy-icon"]').exists()).toBe(true)

    vi.useRealTimers()
  })

  it("has correct title attribute", () => {
    const wrapper = mount(CopyButton, {
      props: { text: "test-value", label: "Copy ID" },
      global: {
        components: { Button },
        stubs: {
          Copy: { template: "<svg />" },
          Check: { template: "<svg />" },
        },
      },
    })

    expect(wrapper.attributes("title")).toBe("Copy ID")
  })

  it("uses default label when not provided", () => {
    const wrapper = mount(CopyButton, {
      props: { text: "test-value" },
      global: {
        components: { Button },
        stubs: {
          Copy: { template: "<svg />" },
          Check: { template: "<svg />" },
        },
      },
    })

    expect(wrapper.attributes("title")).toBe("Copy")
  })
})
