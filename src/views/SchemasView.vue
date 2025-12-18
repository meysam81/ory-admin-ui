<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSchemas } from '@/composables/useSchemas'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import Badge from '@/components/ui/Badge.vue'
import Dialog from '@/components/ui/Dialog.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import JsonViewer from '@/components/common/JsonViewer.vue'
import CopyButton from '@/components/common/CopyButton.vue'
import { Search, FileJson, Eye, ExternalLink } from 'lucide-vue-next'
import type { IdentitySchema } from '@/types/api'

const searchQuery = ref('')
const selectedSchema = ref<IdentitySchema | null>(null)
const detailDialogOpen = ref(false)

const { data: schemas, isLoading, isError, refetch } = useSchemas()

const filteredSchemas = computed(() => {
  if (!schemas.value || !searchQuery.value) return schemas.value
  const query = searchQuery.value.toLowerCase()
  return schemas.value.filter((schema) => {
    return schema.id.toLowerCase().includes(query)
  })
})

function viewSchema(schema: IdentitySchema) {
  selectedSchema.value = schema
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
            v-model="searchQuery"
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
      :description="searchQuery ? 'Try adjusting your search query' : 'No identity schemas are configured'"
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
          <!-- Traits preview -->
          <div class="space-y-2">
            <p class="text-xs text-text-muted">Traits</p>
            <div class="flex flex-wrap gap-1">
              <Badge
                v-for="trait in getSchemaTraits(schema).slice(0, 5)"
                :key="trait"
                :variant="getRequiredTraits(schema).includes(trait) ? 'default' : 'secondary'"
                class="text-xs"
              >
                {{ trait }}
                <span v-if="getRequiredTraits(schema).includes(trait)" class="ml-1 text-destructive">*</span>
              </Badge>
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
    <Dialog :open="detailDialogOpen" @update:open="detailDialogOpen = $event" class="max-w-4xl">
      <template #title>
        <div class="flex items-center gap-2">
          <FileJson class="h-5 w-5 text-accent" />
          {{ selectedSchema?.id }}
        </div>
      </template>
      <template #description>
        View the full JSON schema definition
      </template>

      <div v-if="selectedSchema" class="space-y-4">
        <!-- Schema info -->
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="p-4 bg-surface-raised rounded-lg">
            <p class="text-xs text-text-muted mb-1">Schema ID</p>
            <div class="flex items-center gap-2">
              <code class="text-sm text-text-primary font-mono">{{ selectedSchema.id }}</code>
              <CopyButton :text="selectedSchema.id" />
            </div>
          </div>
          <div class="p-4 bg-surface-raised rounded-lg">
            <p class="text-xs text-text-muted mb-1">Traits Count</p>
            <p class="text-sm text-text-primary font-medium">
              {{ getSchemaTraits(selectedSchema).length }} traits
              <span class="text-text-muted font-normal">
                ({{ getRequiredTraits(selectedSchema).length }} required)
              </span>
            </p>
          </div>
        </div>

        <!-- Traits table -->
        <div>
          <h4 class="text-sm font-medium text-text-secondary mb-2">Trait Definitions</h4>
          <div class="border border-border-subtle rounded-lg overflow-hidden">
            <table class="w-full text-sm">
              <thead class="bg-surface-raised">
                <tr>
                  <th class="px-4 py-2 text-left text-text-muted font-medium">Name</th>
                  <th class="px-4 py-2 text-left text-text-muted font-medium">Type</th>
                  <th class="px-4 py-2 text-left text-text-muted font-medium">Required</th>
                  <th class="px-4 py-2 text-left text-text-muted font-medium">Format</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border-subtle">
                <tr
                  v-for="trait in getSchemaTraits(selectedSchema)"
                  :key="trait"
                  class="hover:bg-surface-raised/50"
                >
                  <td class="px-4 py-2 font-mono text-text-primary">{{ trait }}</td>
                  <td class="px-4 py-2 text-text-secondary">
                    {{ (selectedSchema.schema as Record<string, any>)?.properties?.traits?.properties?.[trait]?.type || 'any' }}
                  </td>
                  <td class="px-4 py-2">
                    <Badge
                      :variant="getRequiredTraits(selectedSchema).includes(trait) ? 'destructive' : 'secondary'"
                      class="text-xs"
                    >
                      {{ getRequiredTraits(selectedSchema).includes(trait) ? 'Yes' : 'No' }}
                    </Badge>
                  </td>
                  <td class="px-4 py-2 text-text-muted">
                    {{ (selectedSchema.schema as Record<string, any>)?.properties?.traits?.properties?.[trait]?.format || '-' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Raw JSON -->
        <div>
          <h4 class="text-sm font-medium text-text-secondary mb-2">Raw Schema</h4>
          <JsonViewer :data="selectedSchema.schema" :initial-expanded="true" max-height="400px" />
        </div>
      </div>

      <template #footer>
        <Button variant="outline" @click="detailDialogOpen = false">Close</Button>
      </template>
    </Dialog>
  </div>
</template>
