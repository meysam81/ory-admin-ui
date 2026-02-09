<script setup lang="ts">
import { ref, onBeforeUnmount } from "vue"
import { PopoverRoot, PopoverTrigger, PopoverPortal, PopoverContent } from "radix-vue"

interface Props {
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
}

withDefaults(defineProps<Props>(), {
  side: "bottom",
  align: "start",
})

const open = defineModel<boolean>("open", { default: undefined })

const isMounted = ref(true)
onBeforeUnmount(() => {
  isMounted.value = false
})
</script>

<template>
  <PopoverRoot v-model:open="open">
    <PopoverTrigger as-child>
      <slot name="trigger" />
    </PopoverTrigger>
    <PopoverPortal v-if="isMounted">
      <PopoverContent
        :side="side"
        :align="align"
        :side-offset="4"
        class="z-50 w-72 animate-fade-in rounded-lg border border-border-subtle bg-surface-overlay shadow-md"
      >
        <slot />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
