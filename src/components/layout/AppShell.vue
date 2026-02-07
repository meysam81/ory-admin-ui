<script setup lang="ts">
import { computed } from "vue"
import { RouterView } from "vue-router"
import { useUIStore } from "@/stores/ui"
import { useBreakpoints } from "@/composables/useBreakpoints"
import AppSidebar from "./AppSidebar.vue"
import AppHeader from "./AppHeader.vue"
import AppFooter from "./AppFooter.vue"

const uiStore = useUIStore()
const { isMobile } = useBreakpoints()

const mainMargin = computed(() => {
  if (isMobile.value) return "ml-0"
  return uiStore.sidebarCollapsed ? "ml-16" : "ml-64"
})
</script>

<template>
  <div class="min-h-screen bg-surface">
    <AppSidebar />
    <div :class="[mainMargin, 'flex min-h-screen flex-col transition-all duration-200']">
      <AppHeader />
      <main class="flex-1 p-3 md:p-6">
        <div class="mx-auto max-w-screen-2xl">
          <RouterView />
        </div>
      </main>
      <AppFooter />
    </div>
  </div>
</template>
