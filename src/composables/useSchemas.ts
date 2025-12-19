import { useQuery } from "@tanstack/vue-query"
import { computed, type Ref } from "vue"
import { schemasApi } from "@/api/schemas"
import type { PaginationParams } from "@/types/api"

export function useSchemas(params?: Ref<PaginationParams>) {
  return useQuery({
    queryKey: ["schemas", params],
    queryFn: () => schemasApi.list(params?.value),
    staleTime: 60_000,
  })
}

export function useSchema(id: Ref<string>) {
  return useQuery({
    queryKey: ["schema", id],
    queryFn: () => schemasApi.get(id.value),
    enabled: computed(() => !!id.value),
    staleTime: 60_000,
  })
}
