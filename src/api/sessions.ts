import { getApiClient } from './client'
import type { Session, PaginationParams } from '@/types/api'

export const sessionsApi = {
  list: async (params?: PaginationParams & { active?: boolean; expand?: string[] }) => {
    const client = getApiClient()
    const searchParams = new URLSearchParams()
    if (params?.page_size) searchParams.set('page_size', String(params.page_size))
    if (params?.page_token) searchParams.set('page_token', params.page_token)
    if (params?.active !== undefined) searchParams.set('active', String(params.active))
    if (params?.expand?.length) {
      params.expand.forEach(e => searchParams.append('expand', e))
    }
    return client
      .get('admin/sessions', {
        searchParams: searchParams.toString() ? searchParams : undefined,
      })
      .json<Session[]>()
  },

  get: async (id: string, expand?: string[]) => {
    const client = getApiClient()
    const searchParams = new URLSearchParams()
    if (expand?.length) {
      expand.forEach(e => searchParams.append('expand', e))
    }
    return client
      .get(`admin/sessions/${id}`, {
        searchParams: searchParams.toString() ? searchParams : undefined,
      })
      .json<Session>()
  },

  disable: async (id: string) => {
    const client = getApiClient()
    return client.delete(`admin/sessions/${id}`)
  },

  extend: async (id: string) => {
    const client = getApiClient()
    return client.patch(`admin/sessions/${id}/extend`).json<Session>()
  },
}
