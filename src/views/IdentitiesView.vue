<script setup lang="ts">
import { ref, computed, watch } from "vue"
import { RouterLink } from "vue-router"
import { useIdentities, useDeleteIdentity } from "@/composables/useIdentities"
import { useSchemas } from "@/composables/useSchemas"
import Card from "@/components/ui/Card.vue"
import CardContent from "@/components/ui/CardContent.vue"
import Button from "@/components/ui/Button.vue"
import Input from "@/components/ui/Input.vue"
import Select from "@/components/ui/Select.vue"
import Skeleton from "@/components/ui/Skeleton.vue"
import Badge from "@/components/ui/Badge.vue"
import AlertDialog from "@/components/ui/AlertDialog.vue"
import TimeAgo from "@/components/common/TimeAgo.vue"
import EmptyState from "@/components/common/EmptyState.vue"
import ErrorState from "@/components/common/ErrorState.vue"
import Pagination from "@/components/common/Pagination.vue"
import { Plus, Search, Users, Trash2, Eye, Filter, ArrowUpDown } from "lucide-vue-next"
import type { Identity } from "@/types/api"

// Pagination state
const pageSize = ref(20)
const pageToken = ref<string | undefined>()
const prevTokens = ref<string[]>([])

// Filter & sort state
const searchQuery = ref("")
const debouncedSearch = ref("")
const stateFilter = ref("all")
const schemaFilter = ref("all")
const sortField = ref<"created_at" | "name">("created_at")
const sortDir = ref<"asc" | "desc">("desc")

// Debounce search → server-side credentials_identifier
let searchTimeout: ReturnType<typeof setTimeout> | undefined
watch(searchQuery, (val) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    debouncedSearch.value = val
    resetPagination()
  }, 300)
})

// Delete dialog state
const deleteDialogOpen = ref(false)
const identityToDelete = ref<Identity | null>(null)

// API params — reactive
const apiParams = computed(() => ({
  page_size: pageSize.value,
  page_token: pageToken.value,
  credentials_identifier: debouncedSearch.value || undefined,
}))

const { data: result, isLoading, isError, error, refetch } = useIdentities(apiParams)
const { data: schemas } = useSchemas()
const { mutate: deleteIdentity, isPending: isDeleting } = useDeleteIdentity()

// Schema options for filter dropdown
const schemaOptions = computed(() => {
  const options = [{ value: "all", label: "All schemas" }]
  if (schemas.value) {
    for (const s of schemas.value) {
      options.push({ value: s.id, label: s.id })
    }
  }
  return options
})

const stateOptions = [
  { value: "all", label: "All states" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
]

const sortOptions = [
  { value: "created_at:desc", label: "Newest first" },
  { value: "created_at:asc", label: "Oldest first" },
  { value: "name:asc", label: "Name A-Z" },
  { value: "name:desc", label: "Name Z-A" },
]

const sortValue = computed({
  get: () => `${sortField.value}:${sortDir.value}`,
  set: (val: string) => {
    const [field, dir] = val.split(":") as ["created_at" | "name", "asc" | "desc"]
    sortField.value = field
    sortDir.value = dir
  },
})

// Client-side pipeline: filter → sort on current page data
const processedIdentities = computed(() => {
  if (!result.value) return []
  let items = [...result.value.data]

  // Filter by state
  if (stateFilter.value !== "all") {
    items = items.filter((i) => i.state === stateFilter.value)
  }

  // Filter by schema
  if (schemaFilter.value !== "all") {
    items = items.filter((i) => i.schema_id === schemaFilter.value)
  }

  // Sort
  items.sort((a, b) => {
    let cmp = 0
    if (sortField.value === "created_at") {
      cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    } else {
      cmp = getIdentityName(a).localeCompare(getIdentityName(b))
    }
    return sortDir.value === "asc" ? cmp : -cmp
  })

  return items
})

// Pagination helpers
function resetPagination() {
  pageToken.value = undefined
  prevTokens.value = []
}

function goNext() {
  if (!result.value?.pagination.nextToken) return
  prevTokens.value = [...prevTokens.value, pageToken.value ?? ""]
  pageToken.value = result.value.pagination.nextToken
}

function goPrev() {
  if (!prevTokens.value.length) return
  const prev = prevTokens.value[prevTokens.value.length - 1]
  prevTokens.value = prevTokens.value.slice(0, -1)
  pageToken.value = prev || undefined
}

const hasNext = computed(() => !!result.value?.pagination.nextToken)
const hasPrev = computed(() => prevTokens.value.length > 0)

// Reset pagination when filters change
watch([stateFilter, schemaFilter], () => resetPagination())

function getIdentityName(identity: Identity): string {
  const traits = (identity.traits || {}) as Record<string, string>
  return traits.email || traits.username || traits.name || `ID: ${identity.id.slice(0, 8)}`
}

function confirmDelete(identity: Identity) {
  identityToDelete.value = identity
  deleteDialogOpen.value = true
}

function handleDelete() {
  if (!identityToDelete.value) return
  deleteIdentity(identityToDelete.value.id, {
    onSuccess: () => {
      deleteDialogOpen.value = false
      identityToDelete.value = null
    },
  })
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-text-primary">Identities</h1>
        <p class="mt-1 text-sm text-text-muted">Manage user identities in your Kratos instance</p>
      </div>
      <RouterLink to="/identities/new">
        <Button>
          <Plus class="mr-2 h-4 w-4" />
          Create Identity
        </Button>
      </RouterLink>
    </div>

    <!-- Search and filters -->
    <Card>
      <CardContent class="p-4">
        <div class="flex flex-col gap-4">
          <!-- Search -->
          <div class="relative">
            <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <Input
              v-model="searchQuery"
              placeholder="Search by email, username, or ID..."
              class="pl-10"
            />
          </div>
          <!-- Filters row -->
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div class="flex items-center gap-2 sm:w-44">
              <Filter class="h-4 w-4 flex-shrink-0 text-text-muted" />
              <Select
                v-model="stateFilter"
                :options="stateOptions"
                placeholder="All states"
                class="flex-1"
              />
            </div>
            <div class="flex items-center gap-2 sm:w-44">
              <Filter class="h-4 w-4 flex-shrink-0 text-text-muted" />
              <Select
                v-model="schemaFilter"
                :options="schemaOptions"
                placeholder="All schemas"
                class="flex-1"
              />
            </div>
            <div class="flex items-center gap-2 sm:ml-auto sm:w-44">
              <ArrowUpDown class="h-4 w-4 flex-shrink-0 text-text-muted" />
              <Select
                v-model="sortValue"
                :options="sortOptions"
                placeholder="Sort by"
                class="flex-1"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Identities list -->
    <Card>
      <CardContent class="p-0">
        <!-- Loading state -->
        <div v-if="isLoading" class="space-y-3 p-4">
          <Skeleton v-for="i in 10" :key="i" class="h-16" />
        </div>

        <!-- Error state -->
        <ErrorState
          v-else-if="isError"
          :error="error"
          title="Failed to load identities"
          description="Could not connect to the Kratos API"
          @retry="refetch"
          class="py-8"
        />

        <!-- Empty state -->
        <EmptyState
          v-else-if="!processedIdentities?.length"
          title="No identities found"
          :description="
            searchQuery || stateFilter !== 'all' || schemaFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Create your first identity to get started'
          "
        >
          <template #icon>
            <Users class="h-8 w-8 text-text-muted" />
          </template>
          <template v-if="!searchQuery && stateFilter === 'all' && schemaFilter === 'all'" #action>
            <RouterLink to="/identities/new">
              <Button>
                <Plus class="mr-2 h-4 w-4" />
                Create Identity
              </Button>
            </RouterLink>
          </template>
        </EmptyState>

        <!-- Identity list -->
        <div v-else class="divide-y divide-border-subtle">
          <div
            v-for="identity in processedIdentities"
            :key="identity.id"
            class="group flex items-center justify-between p-4 transition-colors hover:bg-surface-raised"
          >
            <RouterLink
              :to="`/identities/${identity.id}`"
              class="flex min-w-0 flex-1 items-center gap-4"
            >
              <div
                class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent/10 font-medium text-accent"
              >
                {{ getIdentityName(identity).charAt(0).toUpperCase() }}
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <p class="truncate text-sm font-medium text-text-primary">
                    {{ getIdentityName(identity) }}
                  </p>
                  <Badge variant="outline" class="text-xs">
                    {{ identity.schema_id }}
                  </Badge>
                </div>
                <p class="truncate text-xs text-text-muted">
                  {{ identity.id }}
                </p>
              </div>
            </RouterLink>

            <div class="flex items-center gap-4">
              <div class="hidden text-right sm:block">
                <p class="text-xs text-text-muted">Created</p>
                <p class="text-xs text-text-secondary">
                  <TimeAgo :date="identity.created_at" />
                </p>
              </div>

              <div class="flex items-center gap-1">
                <RouterLink :to="`/identities/${identity.id}`">
                  <Button variant="ghost" size="icon" title="View">
                    <Eye class="h-4 w-4" />
                  </Button>
                </RouterLink>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Delete"
                  @click.prevent="confirmDelete(identity)"
                >
                  <Trash2 class="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="processedIdentities?.length" class="border-t border-border-subtle p-4">
          <Pagination
            :has-next="hasNext"
            :has-prev="hasPrev"
            :page-size="pageSize"
            :item-count="processedIdentities.length"
            @next="goNext"
            @prev="goPrev"
          />
        </div>
      </CardContent>
    </Card>

    <!-- Delete confirmation dialog -->
    <AlertDialog
      :open="deleteDialogOpen"
      title="Delete Identity"
      :description="`Are you sure you want to delete ${identityToDelete ? getIdentityName(identityToDelete) : 'this identity'}? This action cannot be undone.`"
      confirm-text="Delete"
      :loading="isDeleting"
      @confirm="handleDelete"
      @cancel="deleteDialogOpen = false"
    />
  </div>
</template>
