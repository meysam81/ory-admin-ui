import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '@/components/ui/Button.vue'

describe('Button', () => {
  it('renders with default variant', () => {
    const wrapper = mount(Button, {
      slots: { default: 'Click me' },
    })

    expect(wrapper.text()).toBe('Click me')
    expect(wrapper.classes()).toContain('bg-accent')
  })

  it('renders destructive variant', () => {
    const wrapper = mount(Button, {
      props: { variant: 'destructive' },
      slots: { default: 'Delete' },
    })

    expect(wrapper.classes()).toContain('bg-destructive')
  })

  it('renders ghost variant', () => {
    const wrapper = mount(Button, {
      props: { variant: 'ghost' },
      slots: { default: 'Ghost' },
    })

    expect(wrapper.classes()).toContain('hover:bg-surface-raised')
  })

  it('renders outline variant', () => {
    const wrapper = mount(Button, {
      props: { variant: 'outline' },
      slots: { default: 'Outline' },
    })

    expect(wrapper.classes()).toContain('border')
    expect(wrapper.classes()).toContain('bg-transparent')
  })

  it('renders secondary variant', () => {
    const wrapper = mount(Button, {
      props: { variant: 'secondary' },
      slots: { default: 'Secondary' },
    })

    expect(wrapper.classes()).toContain('bg-surface-raised')
  })

  it('renders link variant', () => {
    const wrapper = mount(Button, {
      props: { variant: 'link' },
      slots: { default: 'Link' },
    })

    expect(wrapper.classes()).toContain('text-accent')
  })

  it('handles disabled state', () => {
    const wrapper = mount(Button, {
      props: { disabled: true },
      slots: { default: 'Disabled' },
    })

    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.classes()).toContain('disabled:opacity-50')
  })

  it('handles loading state', () => {
    const wrapper = mount(Button, {
      props: { loading: true },
      slots: { default: 'Loading' },
    })

    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('emits click event', async () => {
    const wrapper = mount(Button, {
      slots: { default: 'Click' },
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('does not emit click when disabled', async () => {
    const wrapper = mount(Button, {
      props: { disabled: true },
      slots: { default: 'Click' },
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('renders different sizes', () => {
    const sm = mount(Button, { props: { size: 'sm' }, slots: { default: 'Small' } })
    const lg = mount(Button, { props: { size: 'lg' }, slots: { default: 'Large' } })
    const icon = mount(Button, { props: { size: 'icon' }, slots: { default: 'Icon' } })

    expect(sm.classes()).toContain('h-8')
    expect(lg.classes()).toContain('h-10')
    expect(icon.classes()).toContain('w-9')
  })

  it('applies custom classes', () => {
    const wrapper = mount(Button, {
      props: { class: 'custom-class' },
      slots: { default: 'Custom' },
    })

    expect(wrapper.classes()).toContain('custom-class')
  })

  it('has correct button type', () => {
    const button = mount(Button, { props: { type: 'button' } })
    const submit = mount(Button, { props: { type: 'submit' } })
    const reset = mount(Button, { props: { type: 'reset' } })

    expect(button.attributes('type')).toBe('button')
    expect(submit.attributes('type')).toBe('submit')
    expect(reset.attributes('type')).toBe('reset')
  })
})
