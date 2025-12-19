import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import CopyButton from '@/components/common/CopyButton.vue'

// Mock vue-sonner
vi.mock('vue-sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('CopyButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders copy icon initially', () => {
    const wrapper = mount(CopyButton, {
      props: { text: 'test-value' },
    })

    // Should have a button with icon
    expect(wrapper.find('button').exists()).toBe(true)
    // Initially shows Copy icon (not Check)
    expect(wrapper.html()).not.toContain('text-success')
  })

  it('copies value to clipboard on click', async () => {
    const wrapper = mount(CopyButton, {
      props: { text: 'test-value' },
    })

    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test-value')
  })

  it('shows check icon after copying', async () => {
    const wrapper = mount(CopyButton, {
      props: { text: 'test-value' },
    })

    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(wrapper.html()).toContain('text-success')
  })

  it('reverts to copy icon after timeout', async () => {
    vi.useFakeTimers()

    const wrapper = mount(CopyButton, {
      props: { text: 'test-value' },
    })

    await wrapper.find('button').trigger('click')
    await flushPromises()

    // Should show check icon
    expect(wrapper.html()).toContain('text-success')

    // Advance timers past the 2000ms timeout
    vi.advanceTimersByTime(2500)
    await flushPromises()

    // Should revert to copy icon
    expect(wrapper.html()).not.toContain('text-success')

    vi.useRealTimers()
  })

  it('has correct title attribute', () => {
    const wrapper = mount(CopyButton, {
      props: { text: 'test-value', label: 'Copy ID' },
    })

    expect(wrapper.find('button').attributes('title')).toBe('Copy ID')
  })

  it('uses default label when not provided', () => {
    const wrapper = mount(CopyButton, {
      props: { text: 'test-value' },
    })

    expect(wrapper.find('button').attributes('title')).toBe('Copy')
  })
})
