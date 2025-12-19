<script setup lang="ts">
import {
  AlertDialogRoot,
  AlertDialogTrigger,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "radix-vue"
import Button from "./Button.vue"

interface Props {
  open?: boolean
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
}

withDefaults(defineProps<Props>(), {
  open: false,
  title: "Are you sure?",
  confirmText: "Confirm",
  cancelText: "Cancel",
  variant: "default",
})

const emit = defineEmits<{
  "update:open": [value: boolean]
  confirm: []
  cancel: []
}>()

function handleConfirm() {
  emit("confirm")
  emit("update:open", false)
}

function handleCancel() {
  emit("cancel")
  emit("update:open", false)
}
</script>

<template>
  <AlertDialogRoot :open="open" @update:open="emit('update:open', $event)">
    <AlertDialogTrigger as-child>
      <slot name="trigger" />
    </AlertDialogTrigger>
    <AlertDialogPortal>
      <AlertDialogOverlay
        class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-fade-in"
      />
      <AlertDialogContent
        class="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-surface-raised p-6 shadow-2xl data-[state=open]:animate-scale-in"
      >
        <AlertDialogTitle class="text-lg font-medium text-text-primary">
          {{ title }}
        </AlertDialogTitle>
        <AlertDialogDescription v-if="description" class="mt-2 text-sm text-text-muted">
          {{ description }}
        </AlertDialogDescription>
        <div class="mt-6 flex justify-end gap-3">
          <AlertDialogCancel as-child>
            <Button variant="outline" @click="handleCancel">
              {{ cancelText }}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction as-child>
            <Button
              :variant="variant === 'destructive' ? 'destructive' : 'default'"
              @click="handleConfirm"
            >
              {{ confirmText }}
            </Button>
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialogPortal>
  </AlertDialogRoot>
</template>
