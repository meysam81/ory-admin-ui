<script setup lang="ts">
import { computed } from "vue"
import {
  DialogRoot,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "radix-vue"
import { X } from "lucide-vue-next"
import { cn } from "@/lib/utils"

interface Props {
  open?: boolean
  title?: string
  description?: string
  size?: "sm" | "default" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full"
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  size: "default",
})

const sizeClasses = {
  sm: "max-w-sm",
  default: "max-w-lg",
  lg: "max-w-xl",
  xl: "max-w-2xl",
  "2xl": "max-w-3xl",
  "3xl": "max-w-4xl",
  "4xl": "max-w-5xl",
  "5xl": "max-w-6xl",
  full: "max-w-[95vw] h-[90vh]",
}

const contentClasses = computed(() =>
  cn(
    "fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-surface-raised p-6 shadow-2xl data-[state=open]:animate-scale-in flex flex-col",
    sizeClasses[props.size],
    props.class
  )
)

const emit = defineEmits<{
  "update:open": [value: boolean]
}>()
</script>

<template>
  <DialogRoot :open="open" @update:open="emit('update:open', $event)">
    <DialogTrigger as-child>
      <slot name="trigger" />
    </DialogTrigger>
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-fade-in"
      />
      <DialogContent :class="contentClasses">
        <div class="flex flex-col space-y-2">
          <DialogTitle v-if="title" class="text-lg font-medium text-text-primary">
            {{ title }}
          </DialogTitle>
          <DialogDescription v-if="description" class="text-sm text-text-muted">
            {{ description }}
          </DialogDescription>
        </div>
        <div class="mt-4">
          <slot />
        </div>
        <DialogClose
          class="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface"
        >
          <X class="h-4 w-4 text-text-secondary" />
          <span class="sr-only">Close</span>
        </DialogClose>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
