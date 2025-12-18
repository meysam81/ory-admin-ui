<script setup lang="ts">
import { AlertTriangle, RefreshCw } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'

interface Props {
  title?: string
  description?: string
  error?: Error | null
  retryable?: boolean
}

withDefaults(defineProps<Props>(), {
  title: 'Something went wrong',
  description: 'An error occurred while loading the data.',
  retryable: true,
})

const emit = defineEmits<{
  retry: []
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <div class="rounded-full bg-destructive/10 p-4 mb-4">
      <AlertTriangle class="h-8 w-8 text-destructive" />
    </div>
    <h3 class="text-lg font-medium text-text-primary mb-1">{{ title }}</h3>
    <p class="text-sm text-text-muted max-w-sm mb-2">{{ description }}</p>
    <p v-if="error" class="text-xs text-destructive font-mono mb-4">
      {{ error.message }}
    </p>
    <Button v-if="retryable" variant="outline" @click="emit('retry')">
      <RefreshCw class="h-4 w-4 mr-2" />
      Try again
    </Button>
  </div>
</template>
