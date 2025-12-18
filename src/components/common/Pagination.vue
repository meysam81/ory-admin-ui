<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'

interface Props {
  page: number
  pageSize: number
  total?: number
  hasMore?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  total: undefined,
  hasMore: false,
})

const emit = defineEmits<{
  'update:page': [page: number]
}>()

const totalPages = computed(() => {
  if (props.total === undefined) return undefined
  return Math.ceil(props.total / props.pageSize)
})

const canGoPrev = computed(() => props.page > 1)
const canGoNext = computed(() => {
  if (props.hasMore) return true
  if (totalPages.value) return props.page < totalPages.value
  return false
})

const displayRange = computed(() => {
  const start = (props.page - 1) * props.pageSize + 1
  const end = props.page * props.pageSize
  if (props.total !== undefined) {
    return `${start}-${Math.min(end, props.total)} of ${props.total}`
  }
  return `${start}-${end}`
})

function goToPage(page: number) {
  if (page >= 1 && (totalPages.value === undefined || page <= totalPages.value)) {
    emit('update:page', page)
  }
}
</script>

<template>
  <div class="flex items-center justify-between">
    <div class="text-sm text-text-muted">
      {{ displayRange }}
    </div>
    <div class="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        :disabled="!canGoPrev"
        @click="goToPage(1)"
        title="First page"
      >
        <ChevronsLeft class="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        :disabled="!canGoPrev"
        @click="goToPage(page - 1)"
        title="Previous page"
      >
        <ChevronLeft class="h-4 w-4" />
      </Button>
      <span class="px-3 text-sm text-text-secondary">
        Page {{ page }}<span v-if="totalPages"> of {{ totalPages }}</span>
      </span>
      <Button
        variant="ghost"
        size="icon"
        :disabled="!canGoNext"
        @click="goToPage(page + 1)"
        title="Next page"
      >
        <ChevronRight class="h-4 w-4" />
      </Button>
      <Button
        v-if="totalPages"
        variant="ghost"
        size="icon"
        :disabled="!canGoNext"
        @click="goToPage(totalPages)"
        title="Last page"
      >
        <ChevronsRight class="h-4 w-4" />
      </Button>
    </div>
  </div>
</template>
