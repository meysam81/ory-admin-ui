<script setup lang="ts">
import { ChevronLeft, ChevronRight } from "lucide-vue-next"
import Button from "@/components/ui/Button.vue"

interface Props {
  hasNext: boolean
  hasPrev: boolean
  pageSize: number
  itemCount?: number
}

withDefaults(defineProps<Props>(), {
  itemCount: undefined,
})

const emit = defineEmits<{
  next: []
  prev: []
}>()
</script>

<template>
  <div class="flex items-center justify-between">
    <div class="text-sm text-text-muted">
      <template v-if="itemCount !== undefined">
        Showing {{ itemCount }} item{{ itemCount !== 1 ? "s" : "" }}
      </template>
      <template v-else> Page size: {{ pageSize }} </template>
    </div>
    <div class="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        :disabled="!hasPrev"
        title="Previous page"
        @click="emit('prev')"
      >
        <ChevronLeft class="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        :disabled="!hasNext"
        title="Next page"
        @click="emit('next')"
      >
        <ChevronRight class="h-4 w-4" />
      </Button>
    </div>
  </div>
</template>
