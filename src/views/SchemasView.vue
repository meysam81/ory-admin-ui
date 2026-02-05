<script setup lang="ts">
import { ref, computed, watch } from "vue"
import { useSchemas } from "@/composables/useSchemas"
import { useSchemaNavigation } from "@/composables/useSchemaNavigation"
import Card from "@/components/ui/Card.vue"
import CardHeader from "@/components/ui/CardHeader.vue"
import CardTitle from "@/components/ui/CardTitle.vue"
import CardContent from "@/components/ui/CardContent.vue"
import Button from "@/components/ui/Button.vue"
import Input from "@/components/ui/Input.vue"
import Skeleton from "@/components/ui/Skeleton.vue"
import Badge from "@/components/ui/Badge.vue"
import Dialog from "@/components/ui/Dialog.vue"
import EmptyState from "@/components/common/EmptyState.vue"
import ErrorState from "@/components/common/ErrorState.vue"
import JsonViewer from "@/components/common/JsonViewer.vue"
import CopyButton from "@/components/common/CopyButton.vue"
import SchemaTree from "@/components/schema/SchemaTree.vue"
import PropertyInspector from "@/components/schema/PropertyInspector.vue"
import {
  Search,
  FileJson,
  Eye,
  ExternalLink,
  Type,
  Hash,
  ToggleLeft,
  Braces,
  List,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  X,
  Keyboard,
} from "lucide-vue-next"
import type { IdentitySchema } from "@/types/api"
import { cn } from "@/lib/utils"

const listSearchQuery = ref("")
const selectedSchema = ref<IdentitySchema | null>(null)
const detailDialogOpen = ref(false)
const searchInputRef = ref<HTMLInputElement | null>(null)
const schemaTreeRef = ref<InstanceType<typeof SchemaTree> | null>(null)
const showRawJson = ref(false)
const showKeyboardHelp = ref(false)

const { data: schemas, isLoading, isError, refetch } = useSchemas()

const selectedSchemaJson = computed(() => selectedSchema.value?.schema as Record<string, unknown> | null)

const navigation = useSchemaNavigation(selectedSchemaJson as any)

const filteredSchemas = computed(() => {
  if (!schemas.value || !listSearchQuery.value) return schemas.value
  const query = listSearchQuery.value.toLowerCase()
  return schemas.value.filter((schema) => {
    return schema.id.toLowerCase().includes(query)
  })
})

function viewSchema(schema: IdentitySchema) {
  selectedSchema.value = schema
  navigation.selectedPath.value = ""
  navigation.focusedPath.value = ""
  navigation.searchQuery.value = ""
  navigation.expandedPaths.value = new Set()
  detailDialogOpen.value = true
}

function getSchemaTraits(schema: IdentitySchema): string[] {
  const schemaObj = schema.schema as Record<string, any> | undefined
  if (!schemaObj?.properties?.traits?.properties) return []
  return Object.keys(schemaObj.properties.traits.properties)
}

function getRequiredTraits(schema: IdentitySchema): string[] {
  const schemaObj = schema.schema as Record<string, any> | undefined
  if (!schemaObj?.properties?.traits?.required) return []
  return schemaObj.properties.traits.required
}

function getTraitType(schema: IdentitySchema, trait: string): string {
  const schemaObj = schema.schema as Record<string, any> | undefined
  return schemaObj?.properties?.traits?.properties?.[trait]?.type || "any"
}

const typeIcons = {
  string: Type,
  number: Hash,
  integer: Hash,
  boolean: ToggleLeft,
  object: Braces,
  array: List,
}

function getTypeIcon(type: string) {
  return typeIcons[type as keyof typeof typeIcons] || Type
}

function getTypeColor(type: string): string {
  switch (type) {
    case "string":
      return "text-success"
    case "number":
    case "integer":
      return "text-warning"
    case "boolean":
      return "text-purple-400"
    case "object":
      return "text-accent"
    case "array":
      return "text-pink-400"
    default:
      return "text-text-muted"
  }
}

function handleDialogKeydown(event: KeyboardEvent) {
  // Focus search on /
  if (event.key === "/" && !event.ctrlKey && !event.metaKey) {
    event.preventDefault()
    searchInputRef.value?.focus()
    return
  }

  // Don't handle keys when search is focused
  if (document.activeElement === searchInputRef.value) {
    if (event.key === "Escape") {
      searchInputRef.value?.blur()
      event.preventDefault()
    }
    return
  }

  navigation.handleKeydown(event)
}

function handleTreeSelect(path: string) {
  navigation.select(path)
}

function handleTreeToggle(path: string) {
  navigation.toggleExpand(path)
}

const selectedPropertySchema = computed(() => {
  if (!navigation.selectedPath.value) return null
  return navigation.getSchemaAtPath(navigation.selectedPath.value)
})

const isSelectedRequired = computed(() => {
  if (!navigation.selectedPath.value) return false
  return navigation.isPathRequired(navigation.selectedPath.value)
})

// Close dialog resets state
watch(detailDialogOpen, (open) => {
  if (!open) {
    navigation.isFullscreen.value = false
    showRawJson.value = false
    showKeyboardHelp.value = false
  }
})

const dialogSize = computed(() => (navigation.isFullscreen.value ? "full" : "5xl"))
</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div>
      <h1 class="text-2xl font-semibold text-text-primary">Identity Schemas</h1>
      <p class="text-sm text-text-muted mt-1">View the identity schemas configured in your Kratos instance</p>
    </div>

    <!-- Search -->
    <Card>
      <CardContent class="p-4">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input
            v-model="listSearchQuery"
            placeholder="Search schemas by ID..."
            class="pl-10"
          />
        </div>
      </CardContent>
    </Card>

    <!-- Schemas list -->
    <div v-if="isLoading" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Skeleton v-for="i in 6" :key="i" class="h-48" />
    </div>

    <ErrorState
      v-else-if="isError"
      title="Failed to load schemas"
      description="Could not connect to the Kratos API"
      @retry="refetch"
    />

    <EmptyState
      v-else-if="!filteredSchemas?.length"
      title="No schemas found"
      :description="listSearchQuery ? 'Try adjusting your search query' : 'No identity schemas are configured'"
    >
      <template #icon>
        <FileJson class="h-8 w-8 text-text-muted" />
      </template>
    </EmptyState>

    <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card
        v-for="schema in filteredSchemas"
        :key="schema.id"
        class="cursor-pointer hover:border-border-default transition-colors"
        @click="viewSchema(schema)"
      >
        <CardHeader class="pb-2">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-2">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <FileJson class="h-5 w-5" />
              </div>
              <div>
                <CardTitle class="text-base">{{ schema.id }}</CardTitle>
              </div>
            </div>
            <Button variant="ghost" size="icon" @click.stop="viewSchema(schema)">
              <Eye class="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <!-- Traits preview with type icons -->
          <div class="space-y-2">
            <p class="text-xs text-text-muted">Traits</p>
            <div class="flex flex-wrap gap-1.5">
              <div
                v-for="trait in getSchemaTraits(schema).slice(0, 5)"
                :key="trait"
                class="flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-overlay border border-border-subtle text-xs"
              >
                <component
                  :is="getTypeIcon(getTraitType(schema, trait))"
                  :class="cn('h-3 w-3', getTypeColor(getTraitType(schema, trait)))"
                />
                <span class="text-text-primary">{{ trait }}</span>
                <span
                  v-if="getRequiredTraits(schema).includes(trait)"
                  class="text-destructive font-bold"
                >*</span>
              </div>
              <Badge
                v-if="getSchemaTraits(schema).length > 5"
                variant="outline"
                class="text-xs"
              >
                +{{ getSchemaTraits(schema).length - 5 }} more
              </Badge>
            </div>
          </div>

          <!-- Schema URL if available -->
          <div v-if="schema.schema?.$id" class="mt-3 pt-3 border-t border-border-subtle">
            <p class="text-xs text-text-muted truncate flex items-center gap-1">
              <ExternalLink class="h-3 w-3 flex-shrink-0" />
              {{ schema.schema.$id }}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Schema detail dialog -->
    <Dialog
      :open="detailDialogOpen"
      @update:open="detailDialogOpen = $event"
      :size="dialogSize"
    >
      <template #title>
        <div class="flex items-center gap-2">
          <FileJson class="h-5 w-5 text-accent" />
          {{ selectedSchema?.id }}
        </div>
      </template>
      <template #description>
        <span class="sr-only">Schema viewer</span>
      </template>

      <div
        v-if="selectedSchema"
        class="flex flex-col h-full"
        :class="navigation.isFullscreen.value ? 'h-[calc(90vh-120px)]' : 'max-h-[70vh]'"
        @keydown="handleDialogKeydown"
        tabindex="0"
      >
        <!-- Toolbar -->
        <div class="flex items-center gap-2 pb-3 border-b border-border-subtle flex-shrink-0">
          <!-- Search -->
          <div class="relative flex-1 max-w-xs">
            <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input
              ref="searchInputRef"
              v-model="navigation.searchQuery.value"
              placeholder="Search properties... (press /)"
              class="pl-8 h-8 text-sm"
            />
            <button
              v-if="navigation.searchQuery.value"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              @click="navigation.searchQuery.value = ''"
            >
              <X class="h-3.5 w-3.5" />
            </button>
          </div>

          <div class="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              @click="schemaTreeRef?.expandAll()"
              title="Expand all"
            >
              <ChevronDown class="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              @click="schemaTreeRef?.collapseAll()"
              title="Collapse all"
            >
              <ChevronUp class="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              @click="showKeyboardHelp = !showKeyboardHelp"
              title="Keyboard shortcuts"
              :class="showKeyboardHelp ? 'bg-surface-overlay' : ''"
            >
              <Keyboard class="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              @click="navigation.toggleFullscreen()"
              :title="navigation.isFullscreen.value ? 'Exit fullscreen' : 'Fullscreen'"
            >
              <Minimize2 v-if="navigation.isFullscreen.value" class="h-4 w-4" />
              <Maximize2 v-else class="h-4 w-4" />
            </Button>
          </div>
        </div>

        <!-- Keyboard help panel -->
        <div
          v-if="showKeyboardHelp"
          class="py-2 px-3 bg-surface-overlay rounded-md mt-2 flex-shrink-0"
        >
          <div class="flex flex-wrap gap-x-6 gap-y-1 text-xs text-text-muted">
            <span><kbd class="px-1.5 py-0.5 bg-surface-raised rounded border border-border-subtle font-mono">↑/k</kbd> Move up</span>
            <span><kbd class="px-1.5 py-0.5 bg-surface-raised rounded border border-border-subtle font-mono">↓/j</kbd> Move down</span>
            <span><kbd class="px-1.5 py-0.5 bg-surface-raised rounded border border-border-subtle font-mono">→</kbd> Expand</span>
            <span><kbd class="px-1.5 py-0.5 bg-surface-raised rounded border border-border-subtle font-mono">←</kbd> Collapse</span>
            <span><kbd class="px-1.5 py-0.5 bg-surface-raised rounded border border-border-subtle font-mono">Enter</kbd> Select</span>
            <span><kbd class="px-1.5 py-0.5 bg-surface-raised rounded border border-border-subtle font-mono">/</kbd> Search</span>
            <span><kbd class="px-1.5 py-0.5 bg-surface-raised rounded border border-border-subtle font-mono">Esc</kbd> Clear/Exit</span>
          </div>
        </div>

        <!-- Main content: Split view -->
        <div class="flex-1 mt-3 flex gap-4 min-h-0 overflow-hidden">
          <!-- Left panel: Schema tree -->
          <div
            :class="cn(
              'flex flex-col border border-border-subtle rounded-lg overflow-hidden bg-surface',
              navigation.selectedPath.value ? 'w-2/5' : 'w-full'
            )"
          >
            <div class="flex-1 overflow-y-auto p-2">
              <SchemaTree
                ref="schemaTreeRef"
                :schema="(selectedSchema.schema as any)"
                :selected-path="navigation.selectedPath.value"
                :focused-path="navigation.focusedPath.value"
                @select="handleTreeSelect"
                @toggle="handleTreeToggle"
              />
            </div>
          </div>

          <!-- Right panel: Property inspector -->
          <div
            v-if="navigation.selectedPath.value"
            class="w-3/5 border border-border-subtle rounded-lg overflow-hidden bg-surface"
          >
            <PropertyInspector
              :schema="selectedPropertySchema"
              :path="navigation.selectedPath.value"
              :required="isSelectedRequired"
            />
          </div>
        </div>

        <!-- Raw JSON toggle -->
        <div class="mt-3 pt-3 border-t border-border-subtle flex-shrink-0">
          <button
            class="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
            @click="showRawJson = !showRawJson"
          >
            <ChevronDown
              :class="cn('h-4 w-4 transition-transform', showRawJson && 'rotate-180')"
            />
            Raw JSON Schema
          </button>
          <div v-if="showRawJson" class="mt-2">
            <JsonViewer :data="selectedSchema.schema" :initial-expanded="true" max-height="300px" />
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center gap-2">
            <CopyButton :text="JSON.stringify(selectedSchema?.schema, null, 2)" label="Copy Schema" />
          </div>
          <Button variant="outline" @click="detailDialogOpen = false">Close</Button>
        </div>
      </template>
    </Dialog>
  </div>
</template>
