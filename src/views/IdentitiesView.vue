<script setup lang="ts">
import { ref, computed, watch } from "vue"
import { RouterLink } from "vue-router"
import { useQueryClient } from "@tanstack/vue-query"
import {
  useIdentities,
  useDeleteIdentity,
  useFuzzyIdentitySearch,
  useIdentityByIdSearch,
} from "@/composables/useIdentities"
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
import {
  Plus,
  Search,
  Users,
  Trash2,
  Eye,
  Filter,
  ArrowUpDown,
  SearchX,
  Sparkles,
  Hash,
} from "lucide-vue-next"
import { matchesIdentitySearch, isUuid } from "@/lib/utils"
import type { Identity, PaginatedResponse } from "@/types/api"
import { toast } from "vue-sonner"

const queryClient = useQueryClient()

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

// Reset fuzzy/ID search when debounced search changes
watch(debouncedSearch, () => {
  fuzzySearch.reset()
  idSearch.reset()
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

// Tier 3: user-triggered searches
const fuzzySearch = useFuzzyIdentitySearch(debouncedSearch, pageSize)
const idSearch = useIdentityByIdSearch(debouncedSearch, pageSize)

// Watch for fuzzy search errors
watch(
  () => fuzzySearch.isError.value,
  (isErr) => {
    if (isErr) toast.error(`Fuzzy search failed: ${fuzzySearch.error.value?.message}`)
  }
)
watch(
  () => idSearch.isError.value,
  (isErr) => {
    if (isErr) toast.error(`ID search failed: ${idSearch.error.value?.message}`)
  }
)

// Read cached unfiltered first page (for tier 2 client-side fallback)
function getCachedUnfilteredPage(): PaginatedResponse<Identity> | undefined {
  return queryClient.getQueryData<PaginatedResponse<Identity>>([
    "identities",
    { page_size: pageSize.value, page_token: undefined, credentials_identifier: undefined },
  ])
}

// Client-side fallback: filter cached first page by search query
const clientFallbackResults = computed(() => {
  if (!debouncedSearch.value) return []
  const cached = getCachedUnfilteredPage()
  if (!cached) return []
  return cached.data.filter((identity) => matchesIdentitySearch(identity, debouncedSearch.value))
})

type SearchTier =
  | "idle"
  | "server-results"
  | "client-fallback"
  | "empty-with-actions"
  | "fuzzy-results"
  | "fuzzy-empty"
  | "id-results"

const searchTier = computed<SearchTier>(() => {
  // No active search
  if (!debouncedSearch.value) return "idle"

  // Still loading server results
  if (isLoading.value) return "server-results"

  // Tier 1: server returned results
  if (result.value && result.value.data.length > 0) return "server-results"

  // Tier 3 active: fuzzy search triggered and has data
  if (fuzzySearch.enabled.value) {
    if (fuzzySearch.isLoading.value) return "fuzzy-results" // loading state
    if (fuzzySearch.data.value && fuzzySearch.data.value.data.length > 0) return "fuzzy-results"
    return "fuzzy-empty"
  }

  // Tier 3 active: ID search triggered and has data
  if (idSearch.enabled.value) {
    if (idSearch.isLoading.value) return "id-results" // loading state
    if (idSearch.data.value && idSearch.data.value.data.length > 0) return "id-results"
    return "empty-with-actions"
  }

  // Tier 2: client-side fallback on cached page
  if (clientFallbackResults.value.length > 0) return "client-fallback"

  // Tier 3: nothing found, show action buttons
  return "empty-with-actions"
})

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

// Unified display pipeline: picks data source based on tier, then applies filters + sort
const displayIdentities = computed(() => {
  let items: Identity[]

  switch (searchTier.value) {
    case "client-fallback":
      items = [...clientFallbackResults.value]
      break
    case "fuzzy-results":
      items = fuzzySearch.data.value ? [...fuzzySearch.data.value.data] : []
      break
    case "id-results":
      items = idSearch.data.value ? [...idSearch.data.value.data] : []
      break
    default:
      items = result.value ? [...result.value.data] : []
      break
  }

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

// Whether tier-3 loading is in progress
const isTier3Loading = computed(
  () =>
    (fuzzySearch.enabled.value && fuzzySearch.isLoading.value) ||
    (idSearch.enabled.value && idSearch.isLoading.value)
)

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

// Show standard pagination only for idle/server-results tiers
const showPagination = computed(
  () => searchTier.value === "idle" || searchTier.value === "server-results"
)

// Reset pagination when filters change
watch([stateFilter, schemaFilter], () => resetPagination())

function getIdentityName(identity: Identity): string {
  const traits = identity.traits || {}
  return (
    String(traits.email || "") ||
    String(traits.username || "") ||
    String(traits.name || "") ||
    `ID: ${identity.id.slice(0, 8)}`
  )
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
              clearable
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
        <div v-if="isLoading || isTier3Loading" class="space-y-3 p-4">
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

        <!-- Empty state: tier 3 action buttons -->
        <EmptyState
          v-else-if="searchTier === 'empty-with-actions'"
          title="No identities found"
          description="Server search returned no results. Try an alternative search method."
        >
          <template #icon>
            <SearchX class="h-8 w-8 text-text-muted" />
          </template>
          <template #action>
            <div class="flex flex-col items-center gap-2 sm:flex-row">
              <Button variant="outline" @click="fuzzySearch.trigger()">
                <Sparkles class="mr-2 h-4 w-4" />
                Fuzzy search (experimental)
              </Button>
              <Button v-if="isUuid(debouncedSearch)" variant="outline" @click="idSearch.trigger()">
                <Hash class="mr-2 h-4 w-4" />
                Search by exact ID
              </Button>
            </div>
          </template>
        </EmptyState>

        <!-- Empty state: fuzzy returned nothing -->
        <EmptyState
          v-else-if="searchTier === 'fuzzy-empty'"
          title="No fuzzy matches found"
          description="The experimental fuzzy search also returned no results. Try a different search term."
        >
          <template #icon>
            <SearchX class="h-8 w-8 text-text-muted" />
          </template>
        </EmptyState>

        <!-- Empty state: generic (no search active) -->
        <EmptyState
          v-else-if="!displayIdentities.length"
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
            v-for="identity in displayIdentities"
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
                <div class="mb-1 flex items-center gap-2">
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

        <!-- Pagination (only for idle/server-results tiers) -->
        <div
          v-if="showPagination && displayIdentities.length"
          class="border-t border-border-subtle p-4"
        >
          <Pagination
            :has-next="hasNext"
            :has-prev="hasPrev"
            :page-size="pageSize"
            :item-count="displayIdentities.length"
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
