import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import Pagination from "../Pagination.vue"

describe("Pagination", () => {
  const baseProps = { hasNext: true, hasPrev: true, pageSize: 20 }

  it("emits next when next button is clicked", async () => {
    const wrapper = mount(Pagination, { props: baseProps })
    const buttons = wrapper.findAll("button")
    const nextBtn = buttons.find((b) => b.attributes("title") === "Next page")!
    await nextBtn.trigger("click")
    expect(wrapper.emitted("next")).toHaveLength(1)
  })

  it("emits prev when prev button is clicked", async () => {
    const wrapper = mount(Pagination, { props: baseProps })
    const buttons = wrapper.findAll("button")
    const prevBtn = buttons.find((b) => b.attributes("title") === "Previous page")!
    await prevBtn.trigger("click")
    expect(wrapper.emitted("prev")).toHaveLength(1)
  })

  it("disables prev button when hasPrev is false", () => {
    const wrapper = mount(Pagination, { props: { ...baseProps, hasPrev: false } })
    const prevBtn = wrapper
      .findAll("button")
      .find((b) => b.attributes("title") === "Previous page")!
    expect(prevBtn.attributes("disabled")).toBeDefined()
  })

  it("disables next button when hasNext is false", () => {
    const wrapper = mount(Pagination, { props: { ...baseProps, hasNext: false } })
    const nextBtn = wrapper.findAll("button").find((b) => b.attributes("title") === "Next page")!
    expect(nextBtn.attributes("disabled")).toBeDefined()
  })

  it("shows item count when provided", () => {
    const wrapper = mount(Pagination, { props: { ...baseProps, itemCount: 15 } })
    expect(wrapper.text()).toContain("Showing 15 items")
  })

  it('shows singular "item" for count of 1', () => {
    const wrapper = mount(Pagination, { props: { ...baseProps, itemCount: 1 } })
    expect(wrapper.text()).toContain("Showing 1 item")
    expect(wrapper.text()).not.toContain("items")
  })

  it("shows page size when itemCount is not provided", () => {
    const wrapper = mount(Pagination, { props: { ...baseProps } })
    expect(wrapper.text()).toContain("Page size: 20")
  })
})
