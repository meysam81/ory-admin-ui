import { getApiClient } from './client'
import type { IdentitySchema, PaginationParams } from '@/types/api'

export const schemasApi = {
  list: async (params?: PaginationParams) => {
    const client = getApiClient()
    return client
      .get('schemas', {
        searchParams: params as Record<string, string | number>,
      })
      .json<IdentitySchema[]>()
  },

  get: async (id: string) => {
    const client = getApiClient()
    return client.get(`schemas/${id}`).json<Record<string, unknown>>()
  },
}
