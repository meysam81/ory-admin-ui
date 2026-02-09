<script setup lang="ts">
import { computed, watch } from "vue"
import { useRoute, RouterLink } from "vue-router"
import { useUIStore } from "@/stores/ui"
import { useBreakpoints } from "@/composables/useBreakpoints"
import {
  LayoutDashboard,
  Users,
  Key,
  Mail,
  FileJson,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-vue-next"
import Tooltip from "@/components/ui/Tooltip.vue"
import { TooltipProvider } from "radix-vue"

const route = useRoute()
const uiStore = useUIStore()
const { isMobile, isTablet } = useBreakpoints()

const sections = [
  {
    label: null,
    items: [{ name: "Dashboard", href: "/", icon: LayoutDashboard }],
  },
  {
    label: "Identity",
    items: [
      { name: "Identities", href: "/identities", icon: Users },
      { name: "Sessions", href: "/sessions", icon: Key },
      { name: "Courier", href: "/courier", icon: Mail },
      { name: "Schemas", href: "/schemas", icon: FileJson },
    ],
  },
]

const bottomNavigation = [{ name: "Settings", href: "/settings", icon: Settings }]

function isActive(href: string) {
  if (href === "/") {
    return route.path === "/"
  }
  return route.path.startsWith(href)
}

/** On mobile the sidebar is always full-width when open */
const isCollapsed = computed(() => (isMobile.value ? false : uiStore.sidebarCollapsed))

const sidebarWidth = computed(() => (isCollapsed.value ? "w-16" : "w-64"))

/** Auto-collapse on tablet */
watch(isTablet, (tablet) => {
  if (tablet) uiStore.setSidebarCollapsed(true)
})

function onNavClick() {
  if (isMobile.value) uiStore.closeSidebar()
}
</script>

<template>
  <TooltipProvider>
    <!-- Mobile backdrop -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="isMobile && uiStore.sidebarOpen"
          class="fixed inset-0 z-40 bg-black/50"
          @click="uiStore.closeSidebar"
        />
      </Transition>
    </Teleport>

    <aside
      :class="[
        sidebarWidth,
        'fixed left-0 top-0 flex h-screen flex-col border-r border-border-subtle bg-surface transition-all duration-200',
        isMobile ? ['z-50', uiStore.sidebarOpen ? 'translate-x-0' : '-translate-x-full'] : 'z-40',
      ]"
    >
      <!-- Logo -->
      <div class="flex h-14 items-center border-b border-border-subtle px-4">
        <RouterLink to="/" class="flex items-center gap-2" @click="onNavClick">
          <div
            class="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground"
          >
            <span class="text-lg font-bold">O</span>
          </div>
          <span v-if="!isCollapsed" class="whitespace-nowrap font-medium text-text-primary">
            Ory Admin
          </span>
        </RouterLink>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto p-2">
        <div v-for="section in sections" :key="section.label ?? 'default'" class="space-y-1">
          <p
            v-if="!isCollapsed && section.label"
            class="px-3 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-wider text-text-muted"
          >
            {{ section.label }}
          </p>
          <template v-for="item in section.items" :key="item.name">
            <Tooltip v-if="isCollapsed" :content="item.name" side="right">
              <RouterLink
                :to="item.href"
                :class="[
                  isActive(item.href)
                    ? 'border-accent/30 bg-accent/10 text-accent'
                    : 'border-transparent text-text-secondary hover:bg-surface-raised hover:text-text-primary',
                  'group flex items-center gap-3 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                  isCollapsed ? 'justify-center' : '',
                ]"
                @click="onNavClick"
              >
                <component :is="item.icon" class="h-5 w-5 flex-shrink-0" />
                <span v-if="!isCollapsed">{{ item.name }}</span>
              </RouterLink>
            </Tooltip>
            <RouterLink
              v-else
              :to="item.href"
              :class="[
                isActive(item.href)
                  ? 'border-accent/30 bg-accent/10 text-accent'
                  : 'border-transparent text-text-secondary hover:bg-surface-raised hover:text-text-primary',
                'group flex items-center gap-3 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
              ]"
              @click="onNavClick"
            >
              <component :is="item.icon" class="h-5 w-5 flex-shrink-0" />
              <span>{{ item.name }}</span>
            </RouterLink>
          </template>
        </div>
      </nav>

      <!-- Bottom navigation -->
      <div class="border-t border-border-subtle p-2">
        <template v-for="item in bottomNavigation" :key="item.name">
          <Tooltip v-if="isCollapsed" :content="item.name" side="right">
            <RouterLink
              :to="item.href"
              :class="[
                isActive(item.href)
                  ? 'border-accent/30 bg-accent/10 text-accent'
                  : 'border-transparent text-text-secondary hover:bg-surface-raised hover:text-text-primary',
                'group flex items-center gap-3 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                isCollapsed ? 'justify-center' : '',
              ]"
              @click="onNavClick"
            >
              <component :is="item.icon" class="h-5 w-5 flex-shrink-0" />
              <span v-if="!isCollapsed">{{ item.name }}</span>
            </RouterLink>
          </Tooltip>
          <RouterLink
            v-else
            :to="item.href"
            :class="[
              isActive(item.href)
                ? 'border-accent/30 bg-accent/10 text-accent'
                : 'border-transparent text-text-secondary hover:bg-surface-raised hover:text-text-primary',
              'group flex items-center gap-3 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
            ]"
            @click="onNavClick"
          >
            <component :is="item.icon" class="h-5 w-5 flex-shrink-0" />
            <span>{{ item.name }}</span>
          </RouterLink>
        </template>

        <!-- Collapse toggle (hidden on mobile) -->
        <button
          v-if="!isMobile"
          @click="uiStore.toggleSidebar"
          class="mt-2 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-text-muted transition-colors hover:bg-surface-raised hover:text-text-primary"
        >
          <ChevronLeft v-if="!uiStore.sidebarCollapsed" class="h-4 w-4" />
          <ChevronRight v-else class="h-4 w-4" />
          <span v-if="!uiStore.sidebarCollapsed">Collapse</span>
        </button>
      </div>
    </aside>
  </TooltipProvider>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
