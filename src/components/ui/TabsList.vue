<script setup lang="ts">
import { TabsList } from "radix-vue"
import { cn } from "@/lib/utils"

interface Props {
  class?: string
}

const props = defineProps<Props>()
</script>

<template>
  <TabsList
    :class="
      cn(
        'inline-flex h-9 items-center justify-center rounded-lg border border-border-subtle bg-surface p-1',
        props.class
      )
    "
  >
    <slot />
  </TabsList>
</template>
