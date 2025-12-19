import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Input from '@/components/ui/Input.vue'

describe('Input', () => {
  it('renders with default props', () => {
    const wrapper = mount(Input)

    expect(wrapper.find('input').exists()).toBe(true)
    expect(wrapper.attributes('type')).toBe('text')
  })

  it('renders with placeholder', () => {
    const wrapper = mount(Input, {
      props: { placeholder: 'Enter text...' },
    })

    expect(wrapper.attributes('placeholder')).toBe('Enter text...')
  })

  it('binds modelValue correctly', () => {
    const wrapper = mount(Input, {
      props: { modelValue: 'initial value' },
    })

    expect(wrapper.element.value).toBe('initial value')
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(Input)

    await wrapper.setValue('new value')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['new value'])
  })

  it('handles disabled state', () => {
    const wrapper = mount(Input, {
      props: { disabled: true },
    })

    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.classes()).toContain('disabled:opacity-50')
  })

  it('handles readonly state', () => {
    const wrapper = mount(Input, {
      props: { readonly: true },
    })

    expect(wrapper.attributes('readonly')).toBeDefined()
  })

  it('renders with different input types', () => {
    const email = mount(Input, { props: { type: 'email' } })
    const password = mount(Input, { props: { type: 'password' } })
    const number = mount(Input, { props: { type: 'number' } })

    expect(email.attributes('type')).toBe('email')
    expect(password.attributes('type')).toBe('password')
    expect(number.attributes('type')).toBe('number')
  })

  it('applies custom classes', () => {
    const wrapper = mount(Input, {
      props: { class: 'custom-class' },
    })

    expect(wrapper.classes()).toContain('custom-class')
  })

  it('renders with id attribute', () => {
    const wrapper = mount(Input, {
      props: { id: 'my-input' },
    })

    expect(wrapper.attributes('id')).toBe('my-input')
  })

  it('applies focus styles', () => {
    const wrapper = mount(Input)

    expect(wrapper.classes()).toContain('focus-visible:ring-2')
    expect(wrapper.classes()).toContain('focus-visible:ring-accent')
  })
})
