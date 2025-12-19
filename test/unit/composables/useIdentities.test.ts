import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref, defineComponent, h, nextTick } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import {
  useIdentities,
  useIdentity,
  useCreateIdentity,
  useDeleteIdentity,
  useUpdateIdentity,
  useIdentitySessions,
  useCreateRecoveryLink,
} from '@/composables/useIdentities'
import { mockIdentities, mockIdentity } from '@test/fixtures/identities'

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

describe('useIdentities', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('fetches identities list', async () => {
    const { result } = withSetup(() => useIdentities())

    expect(result.isLoading.value).toBe(true)

    await flushPromises()
    await new Promise((r) => setTimeout(r, 200))

    expect(result.isSuccess.value).toBe(true)
    expect(result.data.value).toHaveLength(mockIdentities.length)
  })

  it('accepts pagination params as ref', async () => {
    const params = ref({ page_size: 10 })
    const { result } = withSetup(() => useIdentities(params))

    await flushPromises()
    await new Promise((r) => setTimeout(r, 200))

    expect(result.isSuccess.value).toBe(true)
    expect(Array.isArray(result.data.value)).toBe(true)
  })
})

describe('useIdentity', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('fetches single identity by id', async () => {
    const id = ref(mockIdentity.id)
    const { result } = withSetup(() => useIdentity(id))

    await flushPromises()
    await new Promise((r) => setTimeout(r, 150))

    expect(result.isSuccess.value).toBe(true)
    expect(result.data.value?.id).toBe(mockIdentity.id)
  })

  it('is disabled when id is empty', async () => {
    const id = ref('')
    const { result } = withSetup(() => useIdentity(id))

    await flushPromises()

    expect(result.fetchStatus.value).toBe('idle')
  })
})

describe('useIdentitySessions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('fetches sessions for an identity', async () => {
    const id = ref(mockIdentity.id)
    const { result } = withSetup(() => useIdentitySessions(id))

    await flushPromises()
    await new Promise((r) => setTimeout(r, 150))

    expect(result.isSuccess.value).toBe(true)
    expect(Array.isArray(result.data.value)).toBe(true)
  })
})

describe('useCreateIdentity', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('creates a new identity', async () => {
    const { result, queryClient } = withSetup(() => useCreateIdentity())

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    await result.mutateAsync({
      schema_id: 'default',
      traits: { email: 'new@example.com' },
    })

    await flushPromises()

    expect(result.isSuccess.value).toBe(true)
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['identities'] })
  })
})

describe('useUpdateIdentity', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('updates an existing identity', async () => {
    const { result, queryClient } = withSetup(() => useUpdateIdentity())

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    await result.mutateAsync({
      id: mockIdentity.id,
      body: {
        schema_id: 'default',
        traits: { email: 'updated@example.com' },
        state: 'active',
      },
    })

    await flushPromises()

    expect(result.isSuccess.value).toBe(true)
    expect(invalidateSpy).toHaveBeenCalled()
  })
})

describe('useDeleteIdentity', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('deletes an identity', async () => {
    const { result, queryClient } = withSetup(() => useDeleteIdentity())

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    await result.mutateAsync(mockIdentity.id)

    await flushPromises()

    expect(result.isSuccess.value).toBe(true)
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['identities'] })
  })
})

describe('useCreateRecoveryLink', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('creates a recovery link', async () => {
    const { result } = withSetup(() => useCreateRecoveryLink())

    const response = await result.mutateAsync({ identityId: mockIdentity.id })

    await flushPromises()

    expect(result.isSuccess.value).toBe(true)
    expect(response).toHaveProperty('recovery_link')
  })
})
