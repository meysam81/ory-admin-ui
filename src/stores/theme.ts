import { defineStore } from "pinia"
import { ref, computed, watch } from "vue"

type ThemeMode = "light" | "dark" | "system"

export const useThemeStore = defineStore("theme", () => {
  const theme = ref<ThemeMode>((localStorage.getItem("theme") as ThemeMode) || "dark")
  const isDark = computed(() => {
    if (theme.value === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
    }
    return theme.value === "dark"
  })

  function initTheme() {
    const stored = localStorage.getItem("theme") as ThemeMode | null
    if (stored) {
      theme.value = stored
    }
    applyTheme()
  }

  function applyTheme() {
    if (isDark.value) {
      document.documentElement.classList.remove("light")
    } else {
      document.documentElement.classList.add("light")
    }

    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      meta.setAttribute("content", isDark.value ? "#09090b" : "#fafaf9")
    }
  }

  function setTheme(newTheme: ThemeMode) {
    theme.value = newTheme
    localStorage.setItem("theme", newTheme)
    applyTheme()
  }

  function toggleTheme() {
    setTheme(isDark.value ? "light" : "dark")
  }

  watch(isDark, applyTheme)

  return {
    theme,
    isDark,
    initTheme,
    setTheme,
    toggleTheme,
  }
})
