<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  class?: string
}

const props = defineProps<Props>()

const classes = computed(() =>
  cn('text-sm text-text-muted', props.class)
)
</script>

<template>
  <p :class="classes">
    <slot />
  </p>
</template>
