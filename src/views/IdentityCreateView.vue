<script setup lang="ts">
import { ref, computed } from "vue"
import { useRouter } from "vue-router"
import { useSchemas } from "@/composables/useSchemas"
import { useCreateIdentity } from "@/composables/useIdentities"
import Card from "@/components/ui/Card.vue"
import CardHeader from "@/components/ui/CardHeader.vue"
import CardTitle from "@/components/ui/CardTitle.vue"
import CardDescription from "@/components/ui/CardDescription.vue"
import CardContent from "@/components/ui/CardContent.vue"
import Button from "@/components/ui/Button.vue"
import Label from "@/components/ui/Label.vue"
import Textarea from "@/components/ui/Textarea.vue"
import Select from "@/components/ui/Select.vue"
import Skeleton from "@/components/ui/Skeleton.vue"
import ErrorState from "@/components/common/ErrorState.vue"
import ReloadButton from "@/components/common/ReloadButton.vue"
import BackButton from "@/components/common/BackButton.vue"
import { useBackNavigation } from "@/composables/useBackNavigation"
import { Save, FileJson, User } from "lucide-vue-next"

const router = useRouter()
const { goBack } = useBackNavigation("/identities", "Back to Identities")

const {
  data: schemas,
  isLoading: schemasLoading,
  isFetching: schemasFetching,
  isError: schemasError,
  error: schemasErrorObj,
  refetch: refetchSchemas,
} = useSchemas()

const schemaOptions = computed(() => {
  if (!schemas.value) return []
  return schemas.value.map((s) => ({ value: s.id, label: s.id }))
})
const { mutate: createIdentity, isPending: isCreating } = useCreateIdentity()

const selectedSchemaId = ref("")
const traitsJson = ref("{}")
const metadataPublicJson = ref("{}")
const metadataAdminJson = ref("{}")
const jsonError = ref<string | null>(null)

const selectedSchema = computed(() => {
  return schemas.value?.find((s) => s.id === selectedSchemaId.value)
})

function validateJson(json: string): boolean {
  try {
    JSON.parse(json)
    jsonError.value = null
    return true
  } catch (e) {
    jsonError.value = e instanceof Error ? e.message : "Invalid JSON"
    return false
  }
}

function handleSubmit() {
  if (!validateJson(traitsJson.value)) return
  if (!validateJson(metadataPublicJson.value)) return
  if (!validateJson(metadataAdminJson.value)) return

  const traits = JSON.parse(traitsJson.value)
  const metadataPublic = JSON.parse(metadataPublicJson.value)
  const metadataAdmin = JSON.parse(metadataAdminJson.value)

  createIdentity(
    {
      schema_id: selectedSchemaId.value,
      traits,
      metadata_public: Object.keys(metadataPublic).length ? metadataPublic : undefined,
      metadata_admin: Object.keys(metadataAdmin).length ? metadataAdmin : undefined,
    },
    {
      onSuccess: (data) => {
        router.push(`/identities/${data.id}`)
      },
    }
  )
}

// Generate a basic traits template based on schema
function generateTraitsTemplate() {
  if (!selectedSchema.value?.schema) return

  const schema = selectedSchema.value.schema as Record<string, any>
  const template: Record<string, any> = {}

  if (schema.properties?.traits?.properties) {
    const traitProps = schema.properties.traits.properties as Record<string, any>
    for (const [key, prop] of Object.entries(traitProps) as [string, any][]) {
      if (prop.type === "string") {
        template[key] = ""
      } else if (prop.type === "number" || prop.type === "integer") {
        template[key] = 0
      } else if (prop.type === "boolean") {
        template[key] = false
      } else if (prop.type === "object") {
        template[key] = {}
      } else if (prop.type === "array") {
        template[key] = []
      }
    }
  }

  traitsJson.value = JSON.stringify(template, null, 2)
}
</script>

<template>
  <div class="max-w-2xl space-y-6">
    <!-- Back button -->
    <BackButton fallback="/identities" label="Back to Identities" />

    <!-- Header -->
    <div>
      <h1 class="text-2xl font-semibold text-text-primary">Create Identity</h1>
      <p class="mt-1 text-sm text-text-muted">Create a new user identity in your Kratos instance</p>
    </div>

    <!-- Loading state -->
    <div v-if="schemasLoading" class="space-y-4">
      <Skeleton class="h-24" />
      <Skeleton class="h-64" />
    </div>

    <!-- Error state -->
    <ErrorState
      v-else-if="schemasError"
      :error="schemasErrorObj"
      title="Failed to load schemas"
      description="Could not load identity schemas from the API"
      @retry="refetchSchemas"
    />

    <!-- Form -->
    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Schema selection -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle class="flex items-center gap-2 text-base">
              <FileJson class="h-4 w-4" />
              Identity Schema
            </CardTitle>
            <ReloadButton :is-fetching="schemasFetching" size="icon" @reload="refetchSchemas" />
          </div>
          <CardDescription
            >Select the schema that defines the structure of this identity</CardDescription
          >
        </CardHeader>
        <CardContent>
          <div class="space-y-2">
            <Label for="schema">Schema</Label>
            <Select
              v-model="selectedSchemaId"
              :options="schemaOptions"
              placeholder="Select a schema"
              @update:model-value="generateTraitsTemplate"
            />
          </div>
        </CardContent>
      </Card>

      <!-- Traits -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-base">
            <User class="h-4 w-4" />
            Traits
          </CardTitle>
          <CardDescription>User profile data as defined by the schema</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-2">
            <Label for="traits">Traits (JSON)</Label>
            <Textarea
              id="traits"
              v-model="traitsJson"
              :rows="8"
              class="font-mono text-sm"
              placeholder="{}"
              @blur="validateJson(traitsJson)"
            />
            <p v-if="jsonError" class="text-xs text-destructive">{{ jsonError }}</p>
          </div>
        </CardContent>
      </Card>

      <!-- Metadata -->
      <Card>
        <CardHeader>
          <CardTitle class="text-base">Metadata (Optional)</CardTitle>
          <CardDescription>Additional metadata for the identity</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label for="metadata-public">Public Metadata (JSON)</Label>
            <Textarea
              id="metadata-public"
              v-model="metadataPublicJson"
              :rows="4"
              class="font-mono text-sm"
              placeholder="{}"
            />
          </div>
          <div class="space-y-2">
            <Label for="metadata-admin">Admin Metadata (JSON)</Label>
            <Textarea
              id="metadata-admin"
              v-model="metadataAdminJson"
              :rows="4"
              class="font-mono text-sm"
              placeholder="{}"
            />
          </div>
        </CardContent>
      </Card>

      <!-- Submit -->
      <div class="flex justify-end gap-4">
        <Button type="button" variant="outline" @click="goBack"> Cancel </Button>
        <Button type="submit" :disabled="!selectedSchemaId || isCreating">
          <Save class="mr-2 h-4 w-4" />
          {{ isCreating ? "Creating..." : "Create Identity" }}
        </Button>
      </div>
    </form>
  </div>
</template>
