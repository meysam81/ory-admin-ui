<script setup lang="ts">
import { computed } from 'vue'
import Badge from '@/components/ui/Badge.vue'

interface Props {
  status: 'active' | 'inactive' | 'pending' | 'error' | 'success' | 'warning' | string
}

const props = defineProps<Props>()

const variant = computed(() => {
  switch (props.status.toLowerCase()) {
    case 'active':
    case 'success':
    case 'sent':
    case 'delivered':
      return 'success'
    case 'inactive':
    case 'revoked':
    case 'abandoned':
      return 'secondary'
    case 'pending':
    case 'queued':
    case 'processing':
      return 'warning'
    case 'error':
    case 'failed':
      return 'destructive'
    default:
      return 'default'
  }
})

const label = computed(() => {
  return props.status.charAt(0).toUpperCase() + props.status.slice(1).toLowerCase()
})
</script>

<template>
  <Badge :variant="variant">{{ label }}</Badge>
</template>
