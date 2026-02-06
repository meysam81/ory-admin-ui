<script setup lang="ts">
import { TabsContent } from "radix-vue"
import { cn } from "@/lib/utils"

interface Props {
  value: string
  class?: string
}

const props = defineProps<Props>()
</script>

<template>
  <TabsContent :value="props.value" :class="cn('focus-visible:outline-none', props.class)">
    <slot />
  </TabsContent>
</template>
