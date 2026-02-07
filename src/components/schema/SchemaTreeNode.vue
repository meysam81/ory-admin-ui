<script setup lang="ts">
import { computed } from "vue"
import {
  ChevronRight,
  ChevronDown,
  Type,
  Hash,
  ToggleLeft,
  Braces,
  List,
  CircleDot,
} from "lucide-vue-next"
import Badge from "@/components/ui/Badge.vue"
import { cn } from "@/lib/utils"

interface PropertySchema {
  type?: string | string[]
  format?: string
  minLength?: number
  maxLength?: number
  minimum?: number
  maximum?: number
  pattern?: string
  enum?: unknown[]
  items?: PropertySchema
  properties?: Record<string, PropertySchema>
  required?: string[]
  title?: string
  description?: string
  "ory.sh/kratos"?: Record<string, unknown>
  [key: string]: unknown
}

interface Props {
  name: string
  schema: PropertySchema
  required?: boolean
  depth?: number
  path?: string
  isExpanded?: boolean
  isSelected?: boolean
  isFocused?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  depth: 0,
  path: "",
  isExpanded: false,
  isSelected: false,
  isFocused: false,
})

const emit = defineEmits<{
  select: [path: string]
  toggle: [path: string]
  keydown: [event: KeyboardEvent, path: string]
}>()

const currentPath = computed(() => (props.path ? `${props.path}.${props.name}` : props.name))

const isExpandable = computed(() => {
  const type = getType(props.schema)
  return type === "object" || type === "array"
})

const childProperties = computed(() => {
  if (!props.schema.properties) return []
  const required = props.schema.required || []
  return Object.entries(props.schema.properties).map(([name, schema]) => ({
    name,
    schema: schema as PropertySchema,
    required: required.includes(name),
  }))
})

const arrayItemSchema = computed(() => {
  if (props.schema.items) return props.schema.items as PropertySchema
  return null
})

function getType(schema: PropertySchema): string {
  if (Array.isArray(schema.type)) return schema.type[0] || "any"
  return schema.type || "any"
}

const typeIcon = computed(() => {
  const type = getType(props.schema)
  switch (type) {
    case "string":
      return Type
    case "number":
    case "integer":
      return Hash
    case "boolean":
      return ToggleLeft
    case "object":
      return Braces
    case "array":
      return List
    default:
      return CircleDot
  }
})

const typeColor = computed(() => {
  const type = getType(props.schema)
  switch (type) {
    case "string":
      return "text-success"
    case "number":
    case "integer":
      return "text-warning"
    case "boolean":
      return "text-syntax-boolean"
    case "object":
      return "text-accent"
    case "array":
      return "text-syntax-array"
    default:
      return "text-text-muted"
  }
})

const constraints = computed(() => {
  const result: { label: string; variant: "default" | "secondary" | "outline" | "warning" }[] = []

  if (props.schema.format) {
    result.push({ label: `format:${props.schema.format}`, variant: "outline" })
  }
  if (props.schema.minLength !== undefined) {
    result.push({ label: `min:${props.schema.minLength}`, variant: "secondary" })
  }
  if (props.schema.maxLength !== undefined) {
    result.push({ label: `max:${props.schema.maxLength}`, variant: "secondary" })
  }
  if (props.schema.minimum !== undefined) {
    result.push({ label: `≥${props.schema.minimum}`, variant: "secondary" })
  }
  if (props.schema.maximum !== undefined) {
    result.push({ label: `≤${props.schema.maximum}`, variant: "secondary" })
  }
  if (props.schema.pattern) {
    result.push({ label: "pattern", variant: "outline" })
  }
  if (props.schema.enum) {
    result.push({ label: `enum(${props.schema.enum.length})`, variant: "outline" })
  }

  return result
})

const hasOryExtensions = computed(() => {
  return !!props.schema["ory.sh/kratos"]
})

function handleClick() {
  emit("select", currentPath.value)
}

function handleToggle(e: Event) {
  e.stopPropagation()
  emit("toggle", currentPath.value)
}

function handleKeydown(e: KeyboardEvent) {
  emit("keydown", e, currentPath.value)
}
</script>

<template>
  <div class="select-none">
    <div
      :class="
        cn(
          'flex cursor-pointer items-center gap-2 overflow-hidden rounded-md px-2 py-1.5 transition-colors',
          'hover:bg-surface-overlay',
          isSelected && 'border-l-2 border-accent bg-accent/10',
          isFocused && 'ring-1 ring-inset ring-accent'
        )
      "
      :style="{ paddingLeft: `${depth * 16 + 8}px` }"
      role="treeitem"
      :tabindex="isFocused ? 0 : -1"
      :aria-expanded="isExpandable ? isExpanded : undefined"
      :aria-selected="isSelected"
      @click="handleClick"
      @keydown="handleKeydown"
    >
      <!-- Expand/collapse chevron -->
      <button
        v-if="isExpandable"
        class="flex-shrink-0 rounded p-0.5 transition-colors hover:bg-surface-raised"
        @click="handleToggle"
        :aria-label="isExpanded ? 'Collapse' : 'Expand'"
      >
        <ChevronDown v-if="isExpanded" class="h-3.5 w-3.5 text-text-muted" />
        <ChevronRight v-else class="h-3.5 w-3.5 text-text-muted" />
      </button>
      <span v-else class="w-5" />

      <!-- Type icon -->
      <component :is="typeIcon" :class="cn('h-4 w-4 flex-shrink-0', typeColor)" />

      <!-- Property name -->
      <span class="truncate font-mono text-sm text-text-primary">{{ name }}</span>

      <!-- Type label -->
      <span class="text-xs text-text-muted">{{ getType(schema) }}</span>

      <!-- Required badge -->
      <Badge v-if="required" variant="warning" class="px-1.5 py-0 text-[10px]">required</Badge>

      <!-- Ory extension indicator -->
      <span
        v-if="hasOryExtensions"
        class="h-2 w-2 flex-shrink-0 rounded-full bg-accent"
        title="Has Ory extensions"
      />

      <!-- Constraint pills -->
      <div class="ml-auto hidden items-center gap-1 sm:flex">
        <Badge
          v-for="constraint in constraints.slice(0, 3)"
          :key="constraint.label"
          :variant="constraint.variant"
          class="px-1.5 py-0 text-[10px]"
        >
          {{ constraint.label }}
        </Badge>
        <span v-if="constraints.length > 3" class="text-[10px] text-text-muted">
          +{{ constraints.length - 3 }}
        </span>
      </div>
    </div>

    <!-- Children (objects) -->
    <template v-if="isExpanded && childProperties.length">
      <SchemaTreeNode
        v-for="child in childProperties"
        :key="child.name"
        :name="child.name"
        :schema="child.schema"
        :required="child.required"
        :depth="depth + 1"
        :path="currentPath"
        :is-expanded="false"
        @select="emit('select', $event)"
        @toggle="emit('toggle', $event)"
        @keydown="(e, p) => emit('keydown', e, p)"
      />
    </template>

    <!-- Array items -->
    <template v-if="isExpanded && arrayItemSchema">
      <SchemaTreeNode
        name="[items]"
        :schema="arrayItemSchema"
        :depth="depth + 1"
        :path="currentPath"
        :is-expanded="false"
        @select="emit('select', $event)"
        @toggle="emit('toggle', $event)"
        @keydown="(e, p) => emit('keydown', e, p)"
      />
    </template>
  </div>
</template>
