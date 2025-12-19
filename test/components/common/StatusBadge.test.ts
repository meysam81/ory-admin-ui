import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StatusBadge from '@/components/common/StatusBadge.vue'

describe('StatusBadge', () => {
  it('renders active status with success variant', () => {
    const wrapper = mount(StatusBadge, {
      props: { status: 'active' },
    })

    expect(wrapper.text()).toBe('Active')
    expect(wrapper.find('span').classes()).toContain('bg-success/20')
  })

  it('renders inactive status with secondary variant', () => {
    const wrapper = mount(StatusBadge, {
      props: { status: 'inactive' },
    })

    expect(wrapper.text()).toBe('Inactive')
    expect(wrapper.find('span').classes()).toContain('bg-surface-overlay')
  })

  it('renders pending status with warning variant', () => {
    const wrapper = mount(StatusBadge, {
      props: { status: 'pending' },
    })

    expect(wrapper.text()).toBe('Pending')
    expect(wrapper.find('span').classes()).toContain('bg-warning/20')
  })

  it('renders error status with destructive variant', () => {
    const wrapper = mount(StatusBadge, {
      props: { status: 'error' },
    })

    expect(wrapper.text()).toBe('Error')
    expect(wrapper.find('span').classes()).toContain('bg-destructive/20')
  })

  it('renders sent status with success variant', () => {
    const wrapper = mount(StatusBadge, {
      props: { status: 'sent' },
    })

    expect(wrapper.text()).toBe('Sent')
    expect(wrapper.find('span').classes()).toContain('bg-success/20')
  })

  it('renders queued status with warning variant', () => {
    const wrapper = mount(StatusBadge, {
      props: { status: 'queued' },
    })

    expect(wrapper.text()).toBe('Queued')
    expect(wrapper.find('span').classes()).toContain('bg-warning/20')
  })

  it('renders failed status with destructive variant', () => {
    const wrapper = mount(StatusBadge, {
      props: { status: 'failed' },
    })

    expect(wrapper.text()).toBe('Failed')
    expect(wrapper.find('span').classes()).toContain('bg-destructive/20')
  })

  it('renders revoked status with secondary variant', () => {
    const wrapper = mount(StatusBadge, {
      props: { status: 'revoked' },
    })

    expect(wrapper.text()).toBe('Revoked')
    expect(wrapper.find('span').classes()).toContain('bg-surface-overlay')
  })

  it('handles unknown status with default variant', () => {
    const wrapper = mount(StatusBadge, {
      props: { status: 'unknown' },
    })

    expect(wrapper.text()).toBe('Unknown')
    expect(wrapper.find('span').classes()).toContain('bg-accent/20')
  })

  it('capitalizes status label correctly', () => {
    const wrapper = mount(StatusBadge, {
      props: { status: 'ACTIVE' },
    })

    expect(wrapper.text()).toBe('Active')
  })
})
