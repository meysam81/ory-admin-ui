import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Pagination from '@/components/common/Pagination.vue'
import Button from '@/components/ui/Button.vue'

describe('Pagination', () => {
  const defaultProps = {
    page: 1,
    pageSize: 10,
    total: 100,
  }

  const iconStubs = {
    ChevronLeft: { template: '<svg />' },
    ChevronRight: { template: '<svg />' },
    ChevronsLeft: { template: '<svg />' },
    ChevronsRight: { template: '<svg />' },
  }

  it('displays correct range for first page', () => {
    const wrapper = mount(Pagination, {
      props: defaultProps,
      global: {
        components: { Button },
        stubs: iconStubs,
      },
    })

    expect(wrapper.text()).toContain('1-10 of 100')
  })

  it('displays correct range for middle page', () => {
    const wrapper = mount(Pagination, {
      props: { ...defaultProps, page: 5 },
      global: {
        components: { Button },
        stubs: iconStubs,
      },
    })

    expect(wrapper.text()).toContain('41-50 of 100')
  })

  it('displays correct range for last page', () => {
    const wrapper = mount(Pagination, {
      props: { ...defaultProps, page: 10 },
      global: {
        components: { Button },
        stubs: iconStubs,
      },
    })

    expect(wrapper.text()).toContain('91-100 of 100')
  })

  it('displays range without total when total is undefined', () => {
    const wrapper = mount(Pagination, {
      props: { page: 1, pageSize: 10 },
      global: {
        components: { Button },
        stubs: iconStubs,
      },
    })

    expect(wrapper.text()).toContain('1-10')
    expect(wrapper.text()).not.toContain('of')
  })

  it('displays current page and total pages', () => {
    const wrapper = mount(Pagination, {
      props: defaultProps,
      global: {
        components: { Button },
        stubs: iconStubs,
      },
    })

    expect(wrapper.text()).toContain('Page 1')
    expect(wrapper.text()).toContain('of 10')
  })

  it('disables previous buttons on first page', () => {
    const wrapper = mount(Pagination, {
      props: defaultProps,
      global: {
        components: { Button },
        stubs: iconStubs,
      },
    })

    const buttons = wrapper.findAllComponents(Button)
    expect(buttons[0].props('disabled')).toBe(true) // First page button
    expect(buttons[1].props('disabled')).toBe(true) // Previous button
  })

  it('disables next buttons on last page', () => {
    const wrapper = mount(Pagination, {
      props: { ...defaultProps, page: 10 },
      global: {
        components: { Button },
        stubs: iconStubs,
      },
    })

    const buttons = wrapper.findAllComponents(Button)
    expect(buttons[2].props('disabled')).toBe(true) // Next button
    expect(buttons[3].props('disabled')).toBe(true) // Last page button
  })

  it('enables all buttons on middle page', () => {
    const wrapper = mount(Pagination, {
      props: { ...defaultProps, page: 5 },
      global: {
        components: { Button },
        stubs: iconStubs,
      },
    })

    const buttons = wrapper.findAllComponents(Button)
    expect(buttons[0].props('disabled')).toBe(false)
    expect(buttons[1].props('disabled')).toBe(false)
    expect(buttons[2].props('disabled')).toBe(false)
    expect(buttons[3].props('disabled')).toBe(false)
  })

  it('emits update:page when clicking next', async () => {
    const wrapper = mount(Pagination, {
      props: defaultProps,
      global: {
        components: { Button },
        stubs: iconStubs,
      },
    })

    const buttons = wrapper.findAllComponents(Button)
    await buttons[2].trigger('click') // Next button

    expect(wrapper.emitted('update:page')).toBeTruthy()
    expect(wrapper.emitted('update:page')![0]).toEqual([2])
  })

  it('emits update:page when clicking previous', async () => {
    const wrapper = mount(Pagination, {
      props: { ...defaultProps, page: 5 },
      global: {
        components: { Button },
        stubs: iconStubs,
      },
    })

    const buttons = wrapper.findAllComponents(Button)
    await buttons[1].trigger('click') // Previous button

    expect(wrapper.emitted('update:page')).toBeTruthy()
    expect(wrapper.emitted('update:page')![0]).toEqual([4])
  })

  it('emits update:page when clicking first page', async () => {
    const wrapper = mount(Pagination, {
      props: { ...defaultProps, page: 5 },
      global: {
        components: { Button },
        stubs: iconStubs,
      },
    })

    const buttons = wrapper.findAllComponents(Button)
    await buttons[0].trigger('click') // First page button

    expect(wrapper.emitted('update:page')).toBeTruthy()
    expect(wrapper.emitted('update:page')![0]).toEqual([1])
  })

  it('emits update:page when clicking last page', async () => {
    const wrapper = mount(Pagination, {
      props: { ...defaultProps, page: 5 },
      global: {
        components: { Button },
        stubs: iconStubs,
      },
    })

    const buttons = wrapper.findAllComponents(Button)
    await buttons[3].trigger('click') // Last page button

    expect(wrapper.emitted('update:page')).toBeTruthy()
    expect(wrapper.emitted('update:page')![0]).toEqual([10])
  })

  it('handles hasMore prop for infinite pagination', () => {
    const wrapper = mount(Pagination, {
      props: { page: 1, pageSize: 10, hasMore: true },
      global: {
        components: { Button },
        stubs: iconStubs,
      },
    })

    const buttons = wrapper.findAllComponents(Button)
    // Next button should be enabled due to hasMore
    expect(buttons[2].props('disabled')).toBe(false)
  })

  it('calculates correct total pages', () => {
    const wrapper = mount(Pagination, {
      props: { page: 1, pageSize: 25, total: 100 },
      global: {
        components: { Button },
        stubs: iconStubs,
      },
    })

    expect(wrapper.text()).toContain('of 4')
  })

  it('handles partial last page correctly', () => {
    const wrapper = mount(Pagination, {
      props: { page: 3, pageSize: 10, total: 25 },
      global: {
        components: { Button },
        stubs: iconStubs,
      },
    })

    expect(wrapper.text()).toContain('21-25 of 25')
  })
})
