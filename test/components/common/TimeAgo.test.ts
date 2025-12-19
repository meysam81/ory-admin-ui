import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import TimeAgo from '@/components/common/TimeAgo.vue'

describe('TimeAgo', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders "just now" for recent times', () => {
    const now = new Date('2024-01-15T10:30:00Z')
    vi.setSystemTime(now)

    const wrapper = mount(TimeAgo, {
      props: { date: new Date('2024-01-15T10:29:30Z') },
    })

    expect(wrapper.text()).toBe('just now')
  })

  it('renders minutes ago for times under an hour', () => {
    const now = new Date('2024-01-15T10:30:00Z')
    vi.setSystemTime(now)

    const wrapper = mount(TimeAgo, {
      props: { date: new Date('2024-01-15T10:25:00Z') },
    })

    expect(wrapper.text()).toBe('5m ago')
  })

  it('renders hours ago for times under a day', () => {
    const now = new Date('2024-01-15T10:30:00Z')
    vi.setSystemTime(now)

    const wrapper = mount(TimeAgo, {
      props: { date: new Date('2024-01-15T07:30:00Z') },
    })

    expect(wrapper.text()).toBe('3h ago')
  })

  it('renders days ago for times under a week', () => {
    const now = new Date('2024-01-15T10:30:00Z')
    vi.setSystemTime(now)

    const wrapper = mount(TimeAgo, {
      props: { date: new Date('2024-01-13T10:30:00Z') },
    })

    expect(wrapper.text()).toBe('2d ago')
  })

  it('renders weeks ago for times under a month', () => {
    const now = new Date('2024-01-30T10:30:00Z')
    vi.setSystemTime(now)

    const wrapper = mount(TimeAgo, {
      props: { date: new Date('2024-01-09T10:30:00Z') },
    })

    expect(wrapper.text()).toBe('3w ago')
  })

  it('renders months ago for older times', () => {
    const now = new Date('2024-04-15T10:30:00Z')
    vi.setSystemTime(now)

    const wrapper = mount(TimeAgo, {
      props: { date: new Date('2024-01-15T10:30:00Z') },
    })

    expect(wrapper.text()).toBe('3mo ago')
  })

  it('accepts ISO date string', () => {
    const now = new Date('2024-01-15T10:30:00Z')
    vi.setSystemTime(now)

    const wrapper = mount(TimeAgo, {
      props: { date: '2024-01-15T10:25:00Z' },
    })

    expect(wrapper.text()).toBe('5m ago')
  })

  it('has datetime attribute with ISO format', () => {
    const wrapper = mount(TimeAgo, {
      props: { date: new Date('2024-01-15T10:30:00Z') },
    })

    expect(wrapper.find('time').attributes('datetime')).toBe('2024-01-15T10:30:00.000Z')
  })

  it('has title attribute with full date', () => {
    const wrapper = mount(TimeAgo, {
      props: { date: new Date('2024-01-15T10:30:00Z') },
    })

    expect(wrapper.find('time').attributes('title')).toBeTruthy()
  })
})
