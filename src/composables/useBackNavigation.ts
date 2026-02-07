import { computed } from "vue"
import { useRouter } from "vue-router"

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  identities: "Identities",
  "identity-detail": "Identity",
  "identity-create": "Create Identity",
  sessions: "Sessions",
  "session-detail": "Session",
  courier: "Courier",
  schemas: "Schemas",
  settings: "Settings",
}

export function useBackNavigation(fallback: string, fallbackLabel: string) {
  const router = useRouter()

  const hasHistory = computed(() => !!window.history.state?.back)

  const backLabel = computed(() => {
    const backPath = window.history.state?.back as string | null
    if (!backPath) return fallbackLabel

    const resolved = router.resolve(backPath)
    const name = String(resolved.name ?? "")
    return `Back to ${routeLabels[name] ?? fallbackLabel}`
  })

  function goBack() {
    if (hasHistory.value) {
      router.back()
    } else {
      router.push(fallback)
    }
  }

  return { goBack, backLabel }
}
