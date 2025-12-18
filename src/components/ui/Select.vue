<script setup lang="ts">
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectPortal,
  SelectContent,
  SelectViewport,
  SelectItem,
  SelectItemText,
  SelectItemIndicator,
} from 'radix-vue'
import { ChevronDown, Check } from 'lucide-vue-next'

interface Option {
  value: string
  label: string
}

interface Props {
  modelValue?: string
  options: Option[]
  placeholder?: string
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  placeholder: 'Select an option',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <SelectRoot :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <SelectTrigger
      :disabled="disabled"
      class="flex h-9 w-full items-center justify-between rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-50"
    >
      <SelectValue :placeholder="placeholder" />
      <ChevronDown class="h-4 w-4 text-text-muted" />
    </SelectTrigger>
    <SelectPortal>
      <SelectContent
        class="relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-surface-raised shadow-lg animate-fade-in"
        position="popper"
        :side-offset="4"
      >
        <SelectViewport class="p-1">
          <SelectItem
            v-for="option in options"
            :key="option.value"
            :value="option.value"
            class="relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm text-text-primary outline-none focus:bg-surface-overlay data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-surface-overlay"
          >
            <SelectItemIndicator class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
              <Check class="h-4 w-4 text-accent" />
            </SelectItemIndicator>
            <SelectItemText>{{ option.label }}</SelectItemText>
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>
