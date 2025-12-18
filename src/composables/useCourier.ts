import { useQuery } from '@tanstack/vue-query'
import { computed, type Ref } from 'vue'
import { courierApi } from '@/api/courier'
import type { PaginationParams } from '@/types/api'

type MessageStatus = 'queued' | 'sent' | 'processing' | 'abandoned'

export function useMessages(params?: Ref<PaginationParams & { status?: MessageStatus; recipient?: string }>) {
  return useQuery({
    queryKey: ['messages', params],
    queryFn: () => courierApi.listMessages(params?.value),
    staleTime: 30_000,
  })
}

// Alias for backward compatibility
export const useCourierMessages = useMessages

export function useMessage(id: Ref<string>) {
  return useQuery({
    queryKey: ['message', id],
    queryFn: () => courierApi.getMessage(id.value),
    enabled: computed(() => !!id.value),
    staleTime: 30_000,
  })
}
