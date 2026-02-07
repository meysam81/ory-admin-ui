<script setup lang="ts">
import { useBackNavigation } from "@/composables/useBackNavigation"
import Button from "@/components/ui/Button.vue"
import { ArrowLeft } from "lucide-vue-next"

interface Props {
  fallback: string
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: "Go back",
})

const { goBack, backLabel } = useBackNavigation(props.fallback, props.label)
</script>

<template>
  <Button variant="ghost" class="-ml-2" @click="goBack">
    <ArrowLeft class="mr-2 h-4 w-4" />
    {{ backLabel }}
  </Button>
</template>
