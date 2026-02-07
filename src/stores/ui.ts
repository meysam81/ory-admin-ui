import { defineStore } from "pinia"
import { ref } from "vue"

export const useUIStore = defineStore("ui", () => {
  const sidebarCollapsed = ref(localStorage.getItem("sidebarCollapsed") === "true")
  const sidebarOpen = ref(false)
  const commandPaletteOpen = ref(false)

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
    localStorage.setItem("sidebarCollapsed", String(sidebarCollapsed.value))
  }

  function setSidebarCollapsed(collapsed: boolean) {
    sidebarCollapsed.value = collapsed
    localStorage.setItem("sidebarCollapsed", String(collapsed))
  }

  function openSidebar() {
    sidebarOpen.value = true
  }

  function closeSidebar() {
    sidebarOpen.value = false
  }

  function toggleMobileSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function openCommandPalette() {
    commandPaletteOpen.value = true
  }

  function closeCommandPalette() {
    commandPaletteOpen.value = false
  }

  function toggleCommandPalette() {
    commandPaletteOpen.value = !commandPaletteOpen.value
  }

  return {
    sidebarCollapsed,
    sidebarOpen,
    commandPaletteOpen,
    toggleSidebar,
    setSidebarCollapsed,
    openSidebar,
    closeSidebar,
    toggleMobileSidebar,
    openCommandPalette,
    closeCommandPalette,
    toggleCommandPalette,
  }
})
