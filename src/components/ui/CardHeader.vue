<script setup lang="ts">
import { computed } from "vue"
import { cn } from "@/lib/utils"

interface Props {
  class?: string
}

const props = defineProps<Props>()

const classes = computed(() => cn("flex flex-col space-y-1.5 p-5 pb-0", props.class))
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>
