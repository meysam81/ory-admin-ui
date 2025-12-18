<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useHealthAlive } from '@/composables/useHealth'
import { Sun, Moon, Github, Settings, Circle } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import Tooltip from '@/components/ui/Tooltip.vue'
import { TooltipProvider } from 'radix-vue'

const route = useRoute()
const themeStore = useThemeStore()
const { isError: healthError } = useHealthAlive()

const breadcrumbs = [
  { path: '/', name: 'Dashboard' },
  { path: '/identities', name: 'Identities' },
  { path: '/sessions', name: 'Sessions' },
  { path: '/courier', name: 'Courier' },
  { path: '/schemas', name: 'Schemas' },
  { path: '/settings', name: 'Settings' },
]

function getCurrentBreadcrumb() {
  const current = breadcrumbs.find((b) => {
    if (b.path === '/') return route.path === '/'
    return route.path.startsWith(b.path)
  })
  return current?.name || 'Dashboard'
}
</script>

<template>
  <TooltipProvider>
    <header
      class="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border-subtle bg-surface/80 backdrop-blur-sm px-6"
    >
      <!-- Breadcrumb -->
      <div class="flex items-center gap-2">
        <nav class="text-sm">
          <span class="text-text-secondary">Ory Admin</span>
          <span class="mx-2 text-text-muted">/</span>
          <span class="font-medium text-text-primary">{{ getCurrentBreadcrumb() }}</span>
        </nav>
      </div>

      <!-- Right side -->
      <div class="flex items-center gap-2">
        <!-- Connection status -->
        <Tooltip
          :content="healthError ? 'Disconnected from API' : 'Connected to API'"
          side="bottom"
        >
          <div class="flex items-center gap-2 px-2 py-1 rounded-md">
            <Circle
              :class="[
                'h-2 w-2 fill-current',
                healthError ? 'text-destructive' : 'text-success',
              ]"
            />
            <span class="text-xs text-text-muted hidden sm:inline">
              {{ healthError ? 'Disconnected' : 'Connected' }}
            </span>
          </div>
        </Tooltip>

        <!-- Theme toggle -->
        <Tooltip :content="themeStore.isDark ? 'Light mode' : 'Dark mode'" side="bottom">
          <Button variant="ghost" size="icon" @click="themeStore.toggleTheme">
            <Sun v-if="themeStore.isDark" class="h-4 w-4" />
            <Moon v-else class="h-4 w-4" />
          </Button>
        </Tooltip>

        <!-- GitHub link -->
        <Tooltip content="Star on GitHub" side="bottom">
          <a
            href="https://github.com/meysam81/ory-admin-ui"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors px-2 py-1"
          >
            <Github class="h-4 w-4" />
            <span class="hidden sm:inline">GitHub</span>
          </a>
        </Tooltip>

        <!-- Settings link -->
        <Tooltip content="Settings" side="bottom">
          <RouterLink to="/settings">
            <Button variant="ghost" size="icon">
              <Settings class="h-4 w-4" />
            </Button>
          </RouterLink>
        </Tooltip>
      </div>
    </header>
  </TooltipProvider>
</template>
