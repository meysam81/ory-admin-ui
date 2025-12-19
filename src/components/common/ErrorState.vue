<script setup lang="ts">
import { AlertTriangle, RefreshCw } from "lucide-vue-next"
import Button from "@/components/ui/Button.vue"

interface Props {
  title?: string
  description?: string
  error?: Error | null
  retryable?: boolean
}

withDefaults(defineProps<Props>(), {
  title: "Something went wrong",
  description: "An error occurred while loading the data.",
  retryable: true,
})

const emit = defineEmits<{
  retry: []
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <div class="mb-4 rounded-full bg-destructive/10 p-4">
      <AlertTriangle class="h-8 w-8 text-destructive" />
    </div>
    <h3 class="mb-1 text-lg font-medium text-text-primary">{{ title }}</h3>
    <p class="mb-2 max-w-sm text-sm text-text-muted">{{ description }}</p>
    <p v-if="error" class="mb-4 font-mono text-xs text-destructive">
      {{ error.message }}
    </p>
    <Button v-if="retryable" variant="outline" @click="emit('retry')">
      <RefreshCw class="mr-2 h-4 w-4" />
      Try again
    </Button>
  </div>
</template>
