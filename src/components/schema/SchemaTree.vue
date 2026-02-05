<script setup lang="ts">
import { computed, ref } from "vue"
import SchemaTreeNode from "./SchemaTreeNode.vue"

interface PropertySchema {
  type?: string | string[]
  format?: string
  properties?: Record<string, PropertySchema>
  required?: string[]
  items?: PropertySchema
  [key: string]: unknown
}

interface JsonSchema {
  $id?: string
  $schema?: string
  type?: string
  properties?: {
    traits?: {
      type?: string
      properties?: Record<string, PropertySchema>
      required?: string[]
    }
    [key: string]: unknown
  }
  [key: string]: unknown
}

interface Props {
  schema: JsonSchema
  selectedPath?: string
  focusedPath?: string
}

const props = withDefaults(defineProps<Props>(), {
  selectedPath: "",
  focusedPath: "",
})

const emit = defineEmits<{
  select: [path: string]
  toggle: [path: string]
  keydown: [event: KeyboardEvent, path: string]
}>()

const expandedPaths = ref<Set<string>>(new Set(["traits"]))

const rootProperties = computed(() => {
  const traits = props.schema.properties?.traits
  if (!traits?.properties) return []

  const required = traits.required || []
  return Object.entries(traits.properties).map(([name, schema]) => ({
    name,
    schema: schema as PropertySchema,
    required: required.includes(name),
  }))
})

function isExpanded(path: string): boolean {
  return expandedPaths.value.has(path)
}

function handleToggle(path: string) {
  const newSet = new Set(expandedPaths.value)
  if (newSet.has(path)) {
    newSet.delete(path)
  } else {
    newSet.add(path)
  }
  expandedPaths.value = newSet
  emit("toggle", path)
}

function handleSelect(path: string) {
  emit("select", path)
}

function handleKeydown(event: KeyboardEvent, path: string) {
  emit("keydown", event, path)
}

function expandAll() {
  const paths = new Set<string>()
  function collectPaths(properties: Record<string, PropertySchema>, prefix = "") {
    for (const [name, schema] of Object.entries(properties)) {
      const path = prefix ? `${prefix}.${name}` : name
      if (schema.type === "object" || schema.properties) {
        paths.add(path)
        if (schema.properties) {
          collectPaths(schema.properties, path)
        }
      }
      if (schema.type === "array" && schema.items?.properties) {
        paths.add(path)
        collectPaths(schema.items.properties, `${path}.[items]`)
      }
    }
  }

  if (props.schema.properties?.traits?.properties) {
    collectPaths(props.schema.properties.traits.properties)
  }
  expandedPaths.value = paths
}

function collapseAll() {
  expandedPaths.value = new Set()
}

defineExpose({ expandAll, collapseAll, expandedPaths })
</script>

<template>
  <div class="schema-tree" role="tree" aria-label="Schema properties">
    <div v-if="!rootProperties.length" class="px-4 py-8 text-center text-sm text-text-muted">
      No traits defined in this schema
    </div>
    <SchemaTreeNode
      v-for="prop in rootProperties"
      :key="prop.name"
      :name="prop.name"
      :schema="prop.schema"
      :required="prop.required"
      :depth="0"
      :path="''"
      :is-expanded="isExpanded(prop.name)"
      :is-selected="selectedPath === prop.name || selectedPath.startsWith(prop.name + '.')"
      :is-focused="focusedPath === prop.name"
      @select="handleSelect"
      @toggle="handleToggle"
      @keydown="handleKeydown"
    />
  </div>
</template>
