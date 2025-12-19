<script setup lang="ts">
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from "radix-vue"

interface Tab {
  value: string
  label: string
}

interface Props {
  tabs: Tab[]
  defaultValue?: string
  modelValue?: string
}

withDefaults(defineProps<Props>(), {
  defaultValue: undefined,
})

const emit = defineEmits<{
  "update:modelValue": [value: string]
}>()
</script>

<template>
  <TabsRoot
    :default-value="defaultValue || tabs[0]?.value"
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <TabsList
      class="inline-flex h-9 items-center justify-center rounded-lg border border-border-subtle bg-surface p-1"
    >
      <TabsTrigger
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
        class="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium text-text-muted transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-surface-raised data-[state=active]:text-text-primary data-[state=active]:shadow-sm"
      >
        {{ tab.label }}
      </TabsTrigger>
    </TabsList>
    <div class="mt-4">
      <TabsContent
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
        class="focus-visible:outline-none"
      >
        <slot :name="tab.value" />
      </TabsContent>
    </div>
  </TabsRoot>
</template>
