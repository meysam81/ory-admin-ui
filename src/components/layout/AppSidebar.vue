<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useUIStore } from '@/stores/ui'
import {
  LayoutDashboard,
  Users,
  Key,
  Mail,
  FileJson,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-vue-next'
import Tooltip from '@/components/ui/Tooltip.vue'
import { TooltipProvider } from 'radix-vue'

const route = useRoute()
const uiStore = useUIStore()

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Identities', href: '/identities', icon: Users },
  { name: 'Sessions', href: '/sessions', icon: Key },
  { name: 'Courier', href: '/courier', icon: Mail },
  { name: 'Schemas', href: '/schemas', icon: FileJson },
]

const bottomNavigation = [
  { name: 'Settings', href: '/settings', icon: Settings },
]

function isActive(href: string) {
  if (href === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(href)
}

const sidebarWidth = computed(() => (uiStore.sidebarCollapsed ? 'w-16' : 'w-64'))
</script>

<template>
  <TooltipProvider>
    <aside
      :class="[
        sidebarWidth,
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border-subtle bg-surface transition-all duration-200',
      ]"
    >
      <!-- Logo -->
      <div class="flex h-14 items-center border-b border-border-subtle px-4">
        <RouterLink to="/" class="flex items-center gap-2">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-zinc-950">
            <span class="text-lg font-bold">O</span>
          </div>
          <span
            v-if="!uiStore.sidebarCollapsed"
            class="font-medium text-text-primary whitespace-nowrap"
          >
            Ory Admin
          </span>
        </RouterLink>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 space-y-1 overflow-y-auto p-2">
        <template v-for="item in navigation" :key="item.name">
          <Tooltip v-if="uiStore.sidebarCollapsed" :content="item.name" side="right">
            <RouterLink
              :to="item.href"
              :class="[
                isActive(item.href)
                  ? 'bg-accent/10 text-accent border-accent/30'
                  : 'text-text-secondary hover:bg-surface-raised hover:text-text-primary border-transparent',
                'group flex items-center gap-3 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                uiStore.sidebarCollapsed ? 'justify-center' : '',
              ]"
            >
              <component :is="item.icon" class="h-5 w-5 flex-shrink-0" />
              <span v-if="!uiStore.sidebarCollapsed">{{ item.name }}</span>
            </RouterLink>
          </Tooltip>
          <RouterLink
            v-else
            :to="item.href"
            :class="[
              isActive(item.href)
                ? 'bg-accent/10 text-accent border-accent/30'
                : 'text-text-secondary hover:bg-surface-raised hover:text-text-primary border-transparent',
              'group flex items-center gap-3 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
            ]"
          >
            <component :is="item.icon" class="h-5 w-5 flex-shrink-0" />
            <span>{{ item.name }}</span>
          </RouterLink>
        </template>
      </nav>

      <!-- Bottom navigation -->
      <div class="border-t border-border-subtle p-2">
        <template v-for="item in bottomNavigation" :key="item.name">
          <Tooltip v-if="uiStore.sidebarCollapsed" :content="item.name" side="right">
            <RouterLink
              :to="item.href"
              :class="[
                isActive(item.href)
                  ? 'bg-accent/10 text-accent border-accent/30'
                  : 'text-text-secondary hover:bg-surface-raised hover:text-text-primary border-transparent',
                'group flex items-center gap-3 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                uiStore.sidebarCollapsed ? 'justify-center' : '',
              ]"
            >
              <component :is="item.icon" class="h-5 w-5 flex-shrink-0" />
              <span v-if="!uiStore.sidebarCollapsed">{{ item.name }}</span>
            </RouterLink>
          </Tooltip>
          <RouterLink
            v-else
            :to="item.href"
            :class="[
              isActive(item.href)
                ? 'bg-accent/10 text-accent border-accent/30'
                : 'text-text-secondary hover:bg-surface-raised hover:text-text-primary border-transparent',
              'group flex items-center gap-3 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
            ]"
          >
            <component :is="item.icon" class="h-5 w-5 flex-shrink-0" />
            <span>{{ item.name }}</span>
          </RouterLink>
        </template>

        <!-- Collapse toggle -->
        <button
          @click="uiStore.toggleSidebar"
          class="mt-2 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-text-muted hover:bg-surface-raised hover:text-text-primary transition-colors"
        >
          <ChevronLeft v-if="!uiStore.sidebarCollapsed" class="h-4 w-4" />
          <ChevronRight v-else class="h-4 w-4" />
          <span v-if="!uiStore.sidebarCollapsed">Collapse</span>
        </button>
      </div>
    </aside>
  </TooltipProvider>
</template>
