import { describe, it, expect, vi } from "vitest"
import { mount, flushPromises } from "@vue/test-utils"
import { toast } from "vue-sonner"
import CopyButton from "../CopyButton.vue"

describe("CopyButton", () => {
  it("calls navigator.clipboard.writeText with the provided text", async () => {
    const wrapper = mount(CopyButton, { props: { text: "hello-world" } })
    await wrapper.find("button").trigger("click")
    await flushPromises()
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("hello-world")
  })

  it("shows success toast after copying", async () => {
    const wrapper = mount(CopyButton, { props: { text: "test" } })
    await wrapper.find("button").trigger("click")
    await flushPromises()
    expect(toast.success).toHaveBeenCalledWith("Copied to clipboard")
  })

  it("shows error toast when clipboard fails", async () => {
    vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(new Error("denied"))
    const wrapper = mount(CopyButton, { props: { text: "test" } })
    await wrapper.find("button").trigger("click")
    await flushPromises()
    expect(toast.error).toHaveBeenCalledWith("Failed to copy to clipboard")
  })

  it("uses custom label as button title", () => {
    const wrapper = mount(CopyButton, { props: { text: "test", label: "Copy ID" } })
    expect(wrapper.find("button").attributes("title")).toBe("Copy ID")
  })

  it("defaults label to Copy", () => {
    const wrapper = mount(CopyButton, { props: { text: "test" } })
    expect(wrapper.find("button").attributes("title")).toBe("Copy")
  })
})
