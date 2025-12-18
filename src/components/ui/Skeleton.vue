<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  class?: string
}

const props = defineProps<Props>()

const classes = computed(() =>
  cn(
    'animate-pulse rounded-md bg-surface-overlay',
    props.class
  )
)
</script>

<template>
  <div :class="classes" />
</template>
