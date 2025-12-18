import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { computed, type Ref } from 'vue'
import { identitiesApi } from '@/api/identities'
import type { CreateIdentityBody, UpdateIdentityBody, PaginationParams } from '@/types/api'
import { toast } from 'vue-sonner'

export function useIdentities(params?: Ref<PaginationParams & { credentials_identifier?: string }>) {
  return useQuery({
    queryKey: ['identities', params],
    queryFn: () => identitiesApi.list(params?.value),
    staleTime: 30_000,
  })
}

export function useIdentity(id: Ref<string>, includeCredentials?: string[]) {
  return useQuery({
    queryKey: ['identity', id, includeCredentials],
    queryFn: () => identitiesApi.get(id.value, includeCredentials),
    enabled: computed(() => !!id.value),
    staleTime: 30_000,
  })
}

export function useIdentitySessions(id: Ref<string>) {
  return useQuery({
    queryKey: ['identity-sessions', id],
    queryFn: () => identitiesApi.getSessions(id.value),
    enabled: computed(() => !!id.value),
    staleTime: 30_000,
  })
}

export function useCreateIdentity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateIdentityBody) => identitiesApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['identities'] })
      toast.success('Identity created successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to create identity: ${error.message}`)
    },
  })
}

export function useUpdateIdentity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateIdentityBody }) =>
      identitiesApi.update(id, body),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['identities'] })
      queryClient.invalidateQueries({ queryKey: ['identity', id] })
      toast.success('Identity updated successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to update identity: ${error.message}`)
    },
  })
}

export function useDeleteIdentity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => identitiesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['identities'] })
      toast.success('Identity deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete identity: ${error.message}`)
    },
  })
}

export function useDeleteIdentitySessions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => identitiesApi.deleteSessions(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['identity-sessions', id] })
      toast.success('All sessions revoked successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to revoke sessions: ${error.message}`)
    },
  })
}

export function useCreateRecoveryLink() {
  return useMutation({
    mutationFn: ({ identityId, expiresIn }: { identityId: string; expiresIn?: string }) =>
      identitiesApi.createRecoveryLink(identityId, expiresIn),
    onSuccess: () => {
      toast.success('Recovery link created')
    },
    onError: (error: Error) => {
      toast.error(`Failed to create recovery link: ${error.message}`)
    },
  })
}

export function useCreateRecoveryCode() {
  return useMutation({
    mutationFn: ({ identityId, expiresIn }: { identityId: string; expiresIn?: string }) =>
      identitiesApi.createRecoveryCode(identityId, expiresIn),
    onSuccess: () => {
      toast.success('Recovery code created')
    },
    onError: (error: Error) => {
      toast.error(`Failed to create recovery code: ${error.message}`)
    },
  })
}

export function useBlockIdentity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, blocked }: { id: string; blocked: boolean }) =>
      identitiesApi.patch(id, { state: blocked ? 'inactive' : 'active' }),
    onSuccess: (_, { id, blocked }) => {
      queryClient.invalidateQueries({ queryKey: ['identities'] })
      queryClient.invalidateQueries({ queryKey: ['identity', id] })
      toast.success(blocked ? 'Identity blocked' : 'Identity unblocked')
    },
    onError: (error: Error) => {
      toast.error(`Failed to update identity state: ${error.message}`)
    },
  })
}
