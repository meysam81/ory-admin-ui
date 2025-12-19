import { useQuery } from "@tanstack/vue-query"
import { healthApi } from "@/api/health"

export function useHealthAlive() {
  return useQuery({
    queryKey: ["health", "alive"],
    queryFn: () => healthApi.alive(),
    staleTime: 10_000,
    refetchInterval: 30_000,
    retry: 1,
  })
}

export function useHealthReady() {
  return useQuery({
    queryKey: ["health", "ready"],
    queryFn: () => healthApi.ready(),
    staleTime: 10_000,
    retry: 1,
  })
}

export function useVersion() {
  return useQuery({
    queryKey: ["version"],
    queryFn: () => healthApi.version(),
    staleTime: 60_000 * 5,
  })
}
