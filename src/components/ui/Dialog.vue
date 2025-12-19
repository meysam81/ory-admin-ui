<script setup lang="ts">
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

interface Props {
  open?: boolean
  title?: string
  description?: string
}

withDefaults(defineProps<Props>(), {
  open: false,
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
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-fade-in"
      />
      <DialogContent
        class="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-surface-raised p-6 shadow-2xl data-[state=open]:animate-scale-in"
      >
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
