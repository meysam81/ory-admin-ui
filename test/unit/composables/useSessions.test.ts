import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref, defineComponent, h } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import {
  useSessions,
  useSession,
  useDisableSession,
  useExtendSession,
} from '@/composables/useSessions'
import { mockSession, mockSessions } from '@test/fixtures/sessions'

// Mock vue-sonner
vi.mock('vue-sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
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
    queryClient,
  }
}

describe('useSessions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('fetches sessions list', async () => {
    const { result } = withSetup(() => useSessions())

    expect(result.isLoading.value).toBe(true)

    await flushPromises()
    await new Promise((r) => setTimeout(r, 200))

    expect(result.isSuccess.value).toBe(true)
    expect(result.data.value).toHaveLength(mockSessions.length)
  })

  it('accepts filter params as ref', async () => {
    const params = ref({ active: true })
    const { result } = withSetup(() => useSessions(params))

    await flushPromises()
    await new Promise((r) => setTimeout(r, 200))

    expect(result.isSuccess.value).toBe(true)
    expect(Array.isArray(result.data.value)).toBe(true)
  })
})

describe('useSession', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('fetches single session by id', async () => {
    const id = ref(mockSession.id)
    const { result } = withSetup(() => useSession(id))

    await flushPromises()
    await new Promise((r) => setTimeout(r, 150))

    expect(result.isSuccess.value).toBe(true)
    expect(result.data.value?.id).toBe(mockSession.id)
  })

  it('is disabled when id is empty', async () => {
    const id = ref('')
    const { result } = withSetup(() => useSession(id))

    await flushPromises()

    expect(result.fetchStatus.value).toBe('idle')
  })
})

describe('useDisableSession', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('disables a session', async () => {
    const { result, queryClient } = withSetup(() => useDisableSession())

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    await result.mutateAsync(mockSession.id)

    await flushPromises()

    expect(result.isSuccess.value).toBe(true)
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['sessions'] })
  })
})

describe('useExtendSession', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('extends a session', async () => {
    const { result, queryClient } = withSetup(() => useExtendSession())

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    await result.mutateAsync(mockSession.id)

    await flushPromises()

    expect(result.isSuccess.value).toBe(true)
    expect(invalidateSpy).toHaveBeenCalled()
  })
})
