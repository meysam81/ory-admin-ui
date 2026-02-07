<script setup lang="ts">
import { RefreshCw } from "lucide-vue-next"
import { TooltipProvider } from "radix-vue"
import Button from "@/components/ui/Button.vue"
import Tooltip from "@/components/ui/Tooltip.vue"

interface Props {
  isFetching: boolean
  size?: "sm" | "icon"
  label?: string
}

withDefaults(defineProps<Props>(), {
  size: "sm",
  label: "Reload",
})

defineEmits<{
  reload: []
}>()
</script>

<template>
  <TooltipProvider>
    <Tooltip content="Refresh data" side="bottom">
      <Button variant="ghost" :size="size" @click="$emit('reload')">
        <RefreshCw :class="['h-4 w-4', isFetching && 'animate-spin']" />
        <span v-if="size !== 'icon'">{{ label }}</span>
      </Button>
    </Tooltip>
  </TooltipProvider>
</template>
