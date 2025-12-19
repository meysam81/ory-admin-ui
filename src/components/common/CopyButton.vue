<script setup lang="ts">
import { ref } from "vue"
import { Copy, Check } from "lucide-vue-next"
import Button from "@/components/ui/Button.vue"
import { toast } from "vue-sonner"

interface Props {
  text: string
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: "Copy",
})

const copied = ref(false)

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(props.text)
    copied.value = true
    toast.success("Copied to clipboard")
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    toast.error("Failed to copy to clipboard")
  }
}
</script>

<template>
  <Button variant="ghost" size="icon" @click="copyToClipboard" :title="label">
    <Check v-if="copied" class="h-4 w-4 text-success" />
    <Copy v-else class="h-4 w-4" />
  </Button>
</template>
