import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Pagination from '@/components/common/Pagination.vue'

describe('Pagination', () => {
  it('renders current page information', () => {
    const wrapper = mount(Pagination, {
      props: { page: 1, pageSize: 10, total: 100 },
    })

    expect(wrapper.text()).toContain('1-10 of 100')
    expect(wrapper.text()).toContain('Page 1')
    expect(wrapper.text()).toContain('of 10')
  })

  it('shows correct range without total', () => {
    const wrapper = mount(Pagination, {
      props: { page: 2, pageSize: 10 },
    })

    expect(wrapper.text()).toContain('11-20')
  })

  it('disables previous buttons on first page', () => {
    const wrapper = mount(Pagination, {
      props: { page: 1, pageSize: 10, total: 100 },
    })

    const buttons = wrapper.findAll('button')
    // First and previous buttons should be disabled
    expect(buttons[0].attributes('disabled')).toBeDefined()
    expect(buttons[1].attributes('disabled')).toBeDefined()
  })

  it('enables previous buttons on subsequent pages', () => {
    const wrapper = mount(Pagination, {
      props: { page: 2, pageSize: 10, total: 100 },
    })

    const buttons = wrapper.findAll('button')
    expect(buttons[0].attributes('disabled')).toBeUndefined()
    expect(buttons[1].attributes('disabled')).toBeUndefined()
  })

  it('disables next buttons on last page', () => {
    const wrapper = mount(Pagination, {
      props: { page: 10, pageSize: 10, total: 100 },
    })

    const buttons = wrapper.findAll('button')
    // Next and last buttons should be disabled
    expect(buttons[2].attributes('disabled')).toBeDefined()
    expect(buttons[3].attributes('disabled')).toBeDefined()
  })

  it('enables next buttons when hasMore is true', () => {
    const wrapper = mount(Pagination, {
      props: { page: 1, pageSize: 10, hasMore: true },
    })

    const buttons = wrapper.findAll('button')
    expect(buttons[2].attributes('disabled')).toBeUndefined()
  })

  it('emits update:page when clicking next', async () => {
    const wrapper = mount(Pagination, {
      props: { page: 1, pageSize: 10, total: 100 },
    })

    const buttons = wrapper.findAll('button')
    await buttons[2].trigger('click') // Next button

    expect(wrapper.emitted('update:page')).toBeTruthy()
    expect(wrapper.emitted('update:page')![0]).toEqual([2])
  })

  it('emits update:page when clicking previous', async () => {
    const wrapper = mount(Pagination, {
      props: { page: 3, pageSize: 10, total: 100 },
    })

    const buttons = wrapper.findAll('button')
    await buttons[1].trigger('click') // Previous button

    expect(wrapper.emitted('update:page')![0]).toEqual([2])
  })

  it('emits update:page when clicking first page', async () => {
    const wrapper = mount(Pagination, {
      props: { page: 5, pageSize: 10, total: 100 },
    })

    const buttons = wrapper.findAll('button')
    await buttons[0].trigger('click') // First button

    expect(wrapper.emitted('update:page')![0]).toEqual([1])
  })

  it('emits update:page when clicking last page', async () => {
    const wrapper = mount(Pagination, {
      props: { page: 5, pageSize: 10, total: 100 },
    })

    const buttons = wrapper.findAll('button')
    await buttons[3].trigger('click') // Last button

    expect(wrapper.emitted('update:page')![0]).toEqual([10])
  })

  it('shows last item correctly when on final page', () => {
    const wrapper = mount(Pagination, {
      props: { page: 10, pageSize: 10, total: 95 },
    })

    expect(wrapper.text()).toContain('91-95 of 95')
  })
})
