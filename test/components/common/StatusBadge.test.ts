import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StatusBadge from '@/components/common/StatusBadge.vue'
import Badge from '@/components/ui/Badge.vue'

describe('StatusBadge', () => {
  it('renders active status with success variant', () => {
    const wrapper = mount(StatusBadge, {
      props: { status: 'active' },
      global: {
        components: { Badge },
      },
    })

    expect(wrapper.text()).toBe('Active')
    const badge = wrapper.findComponent(Badge)
    expect(badge.props('variant')).toBe('success')
  })

  it('renders inactive status with secondary variant', () => {
    const wrapper = mount(StatusBadge, {
      props: { status: 'inactive' },
      global: {
        components: { Badge },
      },
    })

    expect(wrapper.text()).toBe('Inactive')
    const badge = wrapper.findComponent(Badge)
    expect(badge.props('variant')).toBe('secondary')
  })

  it('renders sent status with success variant', () => {
    const wrapper = mount(StatusBadge, {
      props: { status: 'sent' },
      global: {
        components: { Badge },
      },
    })

    expect(wrapper.text()).toBe('Sent')
    const badge = wrapper.findComponent(Badge)
    expect(badge.props('variant')).toBe('success')
  })

  it('renders queued status with warning variant', () => {
    const wrapper = mount(StatusBadge, {
      props: { status: 'queued' },
      global: {
        components: { Badge },
      },
    })

    expect(wrapper.text()).toBe('Queued')
    const badge = wrapper.findComponent(Badge)
    expect(badge.props('variant')).toBe('warning')
  })

  it('renders processing status with warning variant', () => {
    const wrapper = mount(StatusBadge, {
      props: { status: 'processing' },
      global: {
        components: { Badge },
      },
    })

    expect(wrapper.text()).toBe('Processing')
    const badge = wrapper.findComponent(Badge)
    expect(badge.props('variant')).toBe('warning')
  })

  it('renders failed status with destructive variant', () => {
    const wrapper = mount(StatusBadge, {
      props: { status: 'failed' },
      global: {
        components: { Badge },
      },
    })

    expect(wrapper.text()).toBe('Failed')
    const badge = wrapper.findComponent(Badge)
    expect(badge.props('variant')).toBe('destructive')
  })

  it('renders error status with destructive variant', () => {
    const wrapper = mount(StatusBadge, {
      props: { status: 'error' },
      global: {
        components: { Badge },
      },
    })

    expect(wrapper.text()).toBe('Error')
    const badge = wrapper.findComponent(Badge)
    expect(badge.props('variant')).toBe('destructive')
  })

  it('renders success status with success variant', () => {
    const wrapper = mount(StatusBadge, {
      props: { status: 'success' },
      global: {
        components: { Badge },
      },
    })

    expect(wrapper.text()).toBe('Success')
    const badge = wrapper.findComponent(Badge)
    expect(badge.props('variant')).toBe('success')
  })

  it('renders delivered status with success variant', () => {
    const wrapper = mount(StatusBadge, {
      props: { status: 'delivered' },
      global: {
        components: { Badge },
      },
    })

    expect(wrapper.text()).toBe('Delivered')
    const badge = wrapper.findComponent(Badge)
    expect(badge.props('variant')).toBe('success')
  })

  it('renders pending status with warning variant', () => {
    const wrapper = mount(StatusBadge, {
      props: { status: 'pending' },
      global: {
        components: { Badge },
      },
    })

    expect(wrapper.text()).toBe('Pending')
    const badge = wrapper.findComponent(Badge)
    expect(badge.props('variant')).toBe('warning')
  })

  it('renders revoked status with secondary variant', () => {
    const wrapper = mount(StatusBadge, {
      props: { status: 'revoked' },
      global: {
        components: { Badge },
      },
    })

    expect(wrapper.text()).toBe('Revoked')
    const badge = wrapper.findComponent(Badge)
    expect(badge.props('variant')).toBe('secondary')
  })

  it('renders abandoned status with secondary variant', () => {
    const wrapper = mount(StatusBadge, {
      props: { status: 'abandoned' },
      global: {
        components: { Badge },
      },
    })

    expect(wrapper.text()).toBe('Abandoned')
    const badge = wrapper.findComponent(Badge)
    expect(badge.props('variant')).toBe('secondary')
  })

  it('handles unknown status with default variant', () => {
    const wrapper = mount(StatusBadge, {
      props: { status: 'unknown' },
      global: {
        components: { Badge },
      },
    })

    expect(wrapper.text()).toBe('Unknown')
    const badge = wrapper.findComponent(Badge)
    expect(badge.props('variant')).toBe('default')
  })

  it('capitalizes status text correctly', () => {
    const wrapper = mount(StatusBadge, {
      props: { status: 'ACTIVE' },
      global: {
        components: { Badge },
      },
    })

    expect(wrapper.text()).toBe('Active')
  })
})
