import { ref, onMounted, onUnmounted } from "vue"

export function useMediaQuery(query: string) {
  const matches = ref(false)
  let mediaQuery: MediaQueryList | null = null

  function update(e: MediaQueryListEvent | MediaQueryList) {
    matches.value = e.matches
  }

  onMounted(() => {
    mediaQuery = window.matchMedia(query)
    update(mediaQuery)
    mediaQuery.addEventListener("change", update)
  })

  onUnmounted(() => {
    mediaQuery?.removeEventListener("change", update)
  })

  return matches
}
