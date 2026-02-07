<script setup lang="ts">
import { computed } from "vue"
import { cn } from "@/lib/utils"

interface Props {
  class?: string
}

const props = defineProps<Props>()

const classes = computed(() =>
  cn(
    "overflow-hidden rounded-lg border border-border-subtle bg-surface-raised shadow-sm",
    props.class
  )
)
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>
