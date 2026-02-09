<script setup lang="ts">
import { useRoute } from "vue-router"
import { useThemeStore } from "@/stores/theme"
import { useUIStore } from "@/stores/ui"
import { useSystemHealth } from "@/composables/useHealth"
import { useBreakpoints } from "@/composables/useBreakpoints"
import { Sun, Moon, Github, Settings, Circle, Menu } from "lucide-vue-next"
import Button from "@/components/ui/Button.vue"
import Tooltip from "@/components/ui/Tooltip.vue"
import ProfileSwitcher from "@/components/layout/ProfileSwitcher.vue"
import { TooltipProvider } from "radix-vue"

const route = useRoute()
const themeStore = useThemeStore()
const uiStore = useUIStore()
const { isMobile } = useBreakpoints()
const {
  label: healthLabel,
  tooltipText: healthTooltip,
  colorClass: healthColor,
} = useSystemHealth()

const breadcrumbs = [
  { path: "/", name: "Dashboard" },
  { path: "/identities", name: "Identities" },
  { path: "/sessions", name: "Sessions" },
  { path: "/courier", name: "Courier" },
  { path: "/schemas", name: "Schemas" },
  { path: "/settings", name: "Settings" },
]

function getCurrentBreadcrumb() {
  const current = breadcrumbs.find((b) => {
    if (b.path === "/") return route.path === "/"
    return route.path.startsWith(b.path)
  })
  return current?.name || "Dashboard"
}
</script>

<template>
  <TooltipProvider>
    <header
      class="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border-subtle bg-surface/80 px-3 backdrop-blur-sm md:px-6"
    >
      <!-- Left side: hamburger + breadcrumb -->
      <div class="flex items-center gap-2">
        <Button v-if="isMobile" variant="ghost" size="icon" @click="uiStore.toggleMobileSidebar">
          <Menu class="h-5 w-5" />
        </Button>
        <nav class="text-sm">
          <span class="text-text-secondary">Ory Admin</span>
          <span class="mx-2 text-text-muted">/</span>
          <span class="font-medium text-text-primary">{{ getCurrentBreadcrumb() }}</span>
        </nav>
      </div>

      <!-- Right side -->
      <div class="flex items-center gap-2">
        <!-- Connection status -->
        <Tooltip :content="healthTooltip" side="bottom">
          <div class="flex items-center gap-2 rounded-md px-2 py-1">
            <Circle :class="['h-2 w-2 fill-current', healthColor]" />
            <span class="hidden text-xs text-text-muted sm:inline">
              {{ healthLabel }}
            </span>
          </div>
        </Tooltip>

        <!-- Profile switcher -->
        <ProfileSwitcher />

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
            href="https://github.com/licenseware/ory-admin-ui"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 px-2 py-1 text-sm text-text-secondary transition-colors hover:text-text-primary"
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
