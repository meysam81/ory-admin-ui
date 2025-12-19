<script setup lang="ts">
import { computed } from "vue"
import { cn } from "@/lib/utils"

interface Props {
  class?: string
}

const props = defineProps<Props>()

const classes = computed(() =>
  cn("text-lg font-medium tracking-tight text-text-primary", props.class)
)
</script>

<template>
  <h3 :class="classes">
    <slot />
  </h3>
</template>
