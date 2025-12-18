import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { computed, type Ref } from 'vue'
import { sessionsApi } from '@/api/sessions'
import type { PaginationParams } from '@/types/api'
import { toast } from 'vue-sonner'

export function useSessions(params?: Ref<PaginationParams & { active?: boolean }>) {
  return useQuery({
    queryKey: ['sessions', params],
    queryFn: () => sessionsApi.list({ ...params?.value, expand: ['identity', 'devices'] }),
    staleTime: 30_000,
  })
}

export function useSession(id: Ref<string>) {
  return useQuery({
    queryKey: ['session', id],
    queryFn: () => sessionsApi.get(id.value, ['identity', 'devices']),
    enabled: computed(() => !!id.value),
    staleTime: 30_000,
  })
}

export function useDisableSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => sessionsApi.disable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      toast.success('Session disabled successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to disable session: ${error.message}`)
    },
  })
}

export function useExtendSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => sessionsApi.extend(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['session', id] })
      toast.success('Session extended successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to extend session: ${error.message}`)
    },
  })
}

// Alias for revoke session
export const useRevokeSession = useDisableSession
