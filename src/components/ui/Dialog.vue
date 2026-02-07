<script setup lang="ts">
import { computed, ref, onBeforeUnmount, useSlots } from "vue"
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

const slots = useSlots()

const sizeClasses = {
  sm: "max-w-[calc(100vw-2rem)] sm:max-w-sm",
  default: "max-w-[calc(100vw-2rem)] sm:max-w-lg",
  lg: "max-w-[calc(100vw-2rem)] sm:max-w-xl",
  xl: "max-w-[calc(100vw-2rem)] sm:max-w-2xl",
  "2xl": "max-w-[calc(100vw-2rem)] sm:max-w-3xl",
  "3xl": "max-w-[calc(100vw-2rem)] sm:max-w-4xl",
  "4xl": "max-w-[calc(100vw-2rem)] sm:max-w-5xl",
  "5xl": "max-w-[calc(100vw-2rem)] sm:max-w-6xl",
  full: "max-w-[95vw] h-[90vh]",
}

const contentClasses = computed(() =>
  cn(
    "fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-surface-raised p-4 shadow-2xl data-[state=open]:animate-scale-in flex flex-col max-h-[90vh] sm:p-6",
    sizeClasses[props.size],
    props.class
  )
)

// Check if title/description are provided via slots or props
const hasTitle = computed(() => props.title || slots.title)
const hasDescription = computed(() => props.description || slots.description)
const hasFooter = computed(() => !!slots.footer)

// Track mount state for safe portal cleanup
const isMounted = ref(true)
onBeforeUnmount(() => {
  isMounted.value = false
})

const emit = defineEmits<{
  "update:open": [value: boolean]
}>()
</script>

<template>
  <DialogRoot :open="open" @update:open="emit('update:open', $event)">
    <DialogTrigger as-child>
      <slot name="trigger" />
    </DialogTrigger>
    <DialogPortal v-if="isMounted">
      <DialogOverlay
        class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-fade-in"
      />
      <DialogContent :class="contentClasses">
        <div v-if="hasTitle || hasDescription" class="flex flex-col space-y-2">
          <DialogTitle v-if="hasTitle" class="text-lg font-medium text-text-primary">
            <slot name="title">{{ title }}</slot>
          </DialogTitle>
          <DialogDescription v-if="hasDescription" class="text-sm text-text-muted">
            <slot name="description">{{ description }}</slot>
          </DialogDescription>
        </div>
        <div
          :class="hasTitle || hasDescription ? 'mt-4 flex-1 overflow-auto' : 'flex-1 overflow-auto'"
        >
          <slot />
        </div>
        <div v-if="hasFooter" class="mt-4 flex justify-end gap-2">
          <slot name="footer" />
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
