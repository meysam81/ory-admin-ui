import { describe, it, expect, beforeEach } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import { useHealthAlive, useHealthReady, useVersion } from '@/composables/useHealth'

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
    },
  })
}

function withSetup<T>(composable: () => T) {
  let result: T
  const TestComponent = defineComponent({
    setup() {
      result = composable()
      return () => h('div')
    },
  })

  const queryClient = createTestQueryClient()
  const wrapper = mount(TestComponent, {
    global: {
      plugins: [createPinia(), [VueQueryPlugin, { queryClient }]],
    },
  })

  return {
    result: result!,
    wrapper,
  }
}

describe('useHealthAlive', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('fetches health alive status', async () => {
    const { result } = withSetup(() => useHealthAlive())

    expect(result.isLoading.value).toBe(true)

    await flushPromises()
    await new Promise((r) => setTimeout(r, 100))

    expect(result.isSuccess.value).toBe(true)
    expect(result.data.value?.status).toBe('ok')
  })
})

describe('useHealthReady', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('fetches health ready status', async () => {
    const { result } = withSetup(() => useHealthReady())

    await flushPromises()
    await new Promise((r) => setTimeout(r, 100))

    expect(result.isSuccess.value).toBe(true)
    expect(result.data.value?.status).toBe('ok')
  })
})

describe('useVersion', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('fetches version information', async () => {
    const { result } = withSetup(() => useVersion())

    await flushPromises()
    await new Promise((r) => setTimeout(r, 100))

    expect(result.isSuccess.value).toBe(true)
    expect(result.data.value?.version).toMatch(/^v\d+\.\d+\.\d+$/)
  })
})
