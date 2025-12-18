<script setup lang="ts">
import { TooltipRoot, TooltipTrigger, TooltipPortal, TooltipContent, TooltipArrow } from 'radix-vue'

interface Props {
  content: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  delay?: number
}

withDefaults(defineProps<Props>(), {
  side: 'top',
  delay: 200,
})
</script>

<template>
  <TooltipRoot :delay-duration="delay">
    <TooltipTrigger as-child>
      <slot />
    </TooltipTrigger>
    <TooltipPortal>
      <TooltipContent
        :side="side"
        :side-offset="4"
        class="z-50 rounded-md bg-surface-overlay px-3 py-1.5 text-xs text-text-primary shadow-md animate-fade-in border border-border-subtle"
      >
        {{ content }}
        <TooltipArrow class="fill-surface-overlay" />
      </TooltipContent>
    </TooltipPortal>
  </TooltipRoot>
</template>
