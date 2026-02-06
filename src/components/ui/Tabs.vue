<script setup lang="ts">
import { TabsRoot } from "radix-vue"
import { cn } from "@/lib/utils"
import TabsList from "./TabsList.vue"
import TabsTrigger from "./TabsTrigger.vue"
import TabsContent from "./TabsContent.vue"

interface Tab {
  value: string
  label: string
}

interface Props {
  tabs: Tab[]
  defaultValue?: string
  modelValue?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  defaultValue: undefined,
  modelValue: undefined,
  class: undefined,
})

const emit = defineEmits<{
  "update:modelValue": [value: string]
}>()

const slots = defineSlots()
</script>

<template>
  <TabsRoot
    :default-value="defaultValue || tabs[0]?.value"
    :model-value="modelValue"
    :class="cn('flex flex-col gap-4', props.class)"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <TabsList>
      <TabsTrigger v-for="tab in tabs" :key="tab.value" :value="tab.value">
        <slot v-if="slots[`trigger-${tab.value}`]" :name="`trigger-${tab.value}`" />
        <template v-else>{{ tab.label }}</template>
      </TabsTrigger>
    </TabsList>
    <TabsContent v-for="tab in tabs" :key="tab.value" :value="tab.value">
      <slot :name="tab.value" />
    </TabsContent>
  </TabsRoot>
</template>
