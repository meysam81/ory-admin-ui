<script setup lang="ts">
import { ref, computed } from "vue"
import { useProfileStore } from "@/stores/profile"
import { useBreakpoints } from "@/composables/useBreakpoints"
import Popover from "@/components/ui/Popover.vue"
import Button from "@/components/ui/Button.vue"
import Badge from "@/components/ui/Badge.vue"
import Input from "@/components/ui/Input.vue"
import { Server, ChevronDown, Check, Settings } from "lucide-vue-next"

const profileStore = useProfileStore()
const { isMobile } = useBreakpoints()

const open = ref(false)
const search = ref("")

const showSearch = computed(() => profileStore.allProfiles.length > 5)

const filteredProfiles = computed(() => {
  if (!search.value) return profileStore.allProfiles
  const q = search.value.toLowerCase()
  return profileStore.allProfiles.filter(
    (p) => p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q)
  )
})

function selectProfile(slug: string) {
  profileStore.switchProfile(slug)
  open.value = false
  search.value = ""
}
</script>

<template>
  <Popover v-model:open="open" side="bottom" align="end">
    <template #trigger>
      <Button variant="ghost" :size="isMobile ? 'icon' : 'default'" class="gap-1.5">
        <Server v-if="isMobile" class="h-4 w-4" />
        <template v-else>
          <span class="max-w-[120px] truncate text-xs">
            {{ profileStore.activeProfile?.name || profileStore.activeSlug }}
          </span>
          <ChevronDown class="h-3 w-3 text-text-muted" />
        </template>
      </Button>
    </template>

    <div class="p-2">
      <!-- Search (only if many profiles) -->
      <div v-if="showSearch" class="pb-2">
        <Input v-model="search" placeholder="Search profiles..." class="h-8 text-xs" />
      </div>

      <!-- Profile list -->
      <div class="max-h-60 space-y-0.5 overflow-y-auto">
        <button
          v-for="profile in filteredProfiles"
          :key="profile.slug"
          class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-surface-raised"
          @click="selectProfile(profile.slug)"
        >
          <Check
            :class="[
              'h-3.5 w-3.5 flex-shrink-0',
              profile.slug === profileStore.activeSlug ? 'text-accent' : 'text-transparent',
            ]"
          />
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5">
              <span class="truncate text-text-primary">{{ profile.name }}</span>
              <Badge
                :variant="
                  profileStore.getProfileSource(profile.slug) === 'config' ? 'secondary' : 'outline'
                "
                class="px-1 py-0 text-[10px]"
              >
                {{ profileStore.getProfileSource(profile.slug) }}
              </Badge>
            </div>
            <p class="truncate text-xs text-text-muted">{{ profile.slug }}</p>
          </div>
        </button>
        <p
          v-if="filteredProfiles.length === 0"
          class="px-2 py-4 text-center text-xs text-text-muted"
        >
          No profiles found
        </p>
      </div>

      <!-- Divider + Manage link -->
      <div class="mt-2 border-t border-border-subtle pt-2">
        <RouterLink
          to="/settings"
          class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary"
          @click="open = false"
        >
          <Settings class="h-3.5 w-3.5" />
          Manage Profiles
        </RouterLink>
      </div>
    </div>
  </Popover>
</template>
