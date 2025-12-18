import { getApiClient } from './client'
import type { Message, PaginationParams } from '@/types/api'

type MessageStatus = 'queued' | 'sent' | 'processing' | 'abandoned'

export const courierApi = {
  listMessages: async (params?: PaginationParams & { status?: MessageStatus; recipient?: string }) => {
    const client = getApiClient()
    return client
      .get('admin/courier/messages', {
        searchParams: params as Record<string, string | number>,
      })
      .json<Message[]>()
  },

  getMessage: async (id: string) => {
    const client = getApiClient()
    return client.get(`admin/courier/messages/${id}`).json<Message>()
  },
}
