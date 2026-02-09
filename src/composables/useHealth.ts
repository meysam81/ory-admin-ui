import { computed } from "vue"
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

export function usePublicHealthAlive() {
  return useQuery({
    queryKey: ["health", "public", "alive"],
    queryFn: () => healthApi.publicAlive(),
    staleTime: 10_000,
    refetchInterval: 30_000,
    retry: 1,
  })
}

export type SystemHealthStatus = "healthy" | "degraded" | "disconnected"

export function useSystemHealth() {
  const { isError: adminError, isLoading: adminLoading } = useHealthAlive()
  const { isError: publicError, isLoading: publicLoading } = usePublicHealthAlive()

  const adminUp = computed(() => !adminError.value)
  const publicUp = computed(() => !publicError.value)
  const isLoading = computed(() => adminLoading.value || publicLoading.value)

  const status = computed<SystemHealthStatus>(() => {
    if (adminUp.value && publicUp.value) return "healthy"
    if (!adminUp.value && !publicUp.value) return "disconnected"
    return "degraded"
  })

  const label = computed(() => {
    if (status.value === "healthy") return "Connected"
    if (status.value === "degraded") return "Degraded"
    return "Disconnected"
  })

  const tooltipText = computed(() => {
    const admin = adminUp.value ? "up" : "down"
    const pub = publicUp.value ? "up" : "down"
    return `Admin API: ${admin} · Public API: ${pub}`
  })

  const colorClass = computed(() => {
    if (status.value === "healthy") return "text-success"
    if (status.value === "degraded") return "text-warning"
    return "text-destructive"
  })

  const bgColorClass = computed(() => {
    if (status.value === "healthy") return "bg-success/10"
    if (status.value === "degraded") return "bg-warning/10"
    return "bg-destructive/10"
  })

  return { status, label, tooltipText, colorClass, bgColorClass, adminUp, publicUp, isLoading }
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
