<script setup lang="ts">
import { Inbox } from "lucide-vue-next"

interface Props {
  title?: string
  description?: string
}

withDefaults(defineProps<Props>(), {
  title: "No data",
  description: "There are no items to display.",
})
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <div class="mb-4 rounded-full bg-surface-raised p-4">
      <slot name="icon">
        <Inbox class="h-8 w-8 text-text-muted" />
      </slot>
    </div>
    <h3 class="mb-1 text-lg font-medium text-text-primary">{{ title }}</h3>
    <p class="max-w-sm text-sm text-text-muted">{{ description }}</p>
    <div v-if="$slots.action" class="mt-4">
      <slot name="action" />
    </div>
  </div>
</template>
