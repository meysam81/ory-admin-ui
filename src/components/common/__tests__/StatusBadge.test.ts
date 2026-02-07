import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import StatusBadge from "../StatusBadge.vue"

describe("StatusBadge", () => {
  const variantCases: [string, string][] = [
    ["active", "success"],
    ["success", "success"],
    ["sent", "success"],
    ["delivered", "success"],
    ["inactive", "secondary"],
    ["revoked", "secondary"],
    ["abandoned", "secondary"],
    ["pending", "warning"],
    ["queued", "warning"],
    ["processing", "warning"],
    ["error", "destructive"],
    ["failed", "destructive"],
    ["unknown", "default"],
  ]

  it.each(variantCases)('status "%s" maps to variant "%s"', (status, expectedVariant) => {
    const wrapper = mount(StatusBadge, { props: { status } })
    const badge = wrapper.find("span")
    const classes = badge.classes().join(" ")

    // Each variant uses a unique CSS class prefix
    const variantClassMap: Record<string, string> = {
      success: "bg-success",
      secondary: "bg-surface-overlay",
      warning: "bg-warning",
      destructive: "bg-destructive",
      default: "bg-accent",
    }
    expect(classes).toContain(variantClassMap[expectedVariant])
  })

  it("capitalizes the label", () => {
    const wrapper = mount(StatusBadge, { props: { status: "active" } })
    expect(wrapper.text()).toBe("Active")
  })

  it("handles mixed-case status input", () => {
    const wrapper = mount(StatusBadge, { props: { status: "PENDING" } })
    expect(wrapper.text()).toBe("Pending")
  })
})
