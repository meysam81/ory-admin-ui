<script setup lang="ts">
import { computed } from "vue"
import { X } from "lucide-vue-next"
import { cn } from "@/lib/utils"

interface Props {
  modelValue?: string | number
  type?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  clearable?: boolean
  class?: string
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: "text",
  modelValue: "",
  clearable: false,
})

const emit = defineEmits<{
  "update:modelValue": [value: string]
}>()

const classes = computed(() =>
  cn(
    "flex h-9 w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-50",
    props.clearable ? "pr-8" : "",
    props.class
  )
)

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit("update:modelValue", target.value)
}

function clear() {
  emit("update:modelValue", "")
}
</script>

<template>
  <div v-if="clearable" class="relative">
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :class="classes"
      @input="handleInput"
    />
    <button
      v-if="modelValue"
      type="button"
      class="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text-primary"
      aria-label="Clear input"
      @click="clear"
    >
      <X class="h-3.5 w-3.5" />
    </button>
  </div>
  <input
    v-else
    :id="id"
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :class="classes"
    @input="handleInput"
  />
</template>
