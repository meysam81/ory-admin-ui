<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useIdentities, useDeleteIdentity } from '@/composables/useIdentities'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import Badge from '@/components/ui/Badge.vue'
import AlertDialog from '@/components/ui/AlertDialog.vue'
import TimeAgo from '@/components/common/TimeAgo.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import Pagination from '@/components/common/Pagination.vue'
import { Plus, Search, Users, Trash2, Eye } from 'lucide-vue-next'
import type { Identity } from '@/types/api'

const page = ref(1)
const pageSize = ref(20)
const searchQuery = ref('')
const deleteDialogOpen = ref(false)
const identityToDelete = ref<Identity | null>(null)

const { data: identities, isLoading, isError, refetch } = useIdentities()

const { mutate: deleteIdentity, isPending: isDeleting } = useDeleteIdentity()

const filteredIdentities = computed(() => {
  if (!identities.value || !searchQuery.value) return identities.value
  const query = searchQuery.value.toLowerCase()
  return identities.value.filter((identity) => {
    const traits = (identity.traits || {}) as Record<string, string>
    return (
      identity.id.toLowerCase().includes(query) ||
      (traits.email && traits.email.toLowerCase().includes(query)) ||
      (traits.username && traits.username.toLowerCase().includes(query)) ||
      (traits.name && traits.name.toLowerCase().includes(query))
    )
  })
})

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
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-text-primary">Identities</h1>
        <p class="text-sm text-text-muted mt-1">Manage user identities in your Kratos instance</p>
      </div>
      <RouterLink to="/identities/new">
        <Button>
          <Plus class="h-4 w-4 mr-2" />
          Create Identity
        </Button>
      </RouterLink>
    </div>

    <!-- Search and filters -->
    <Card>
      <CardContent class="p-4">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input
            v-model="searchQuery"
            placeholder="Search by email, username, or ID..."
            class="pl-10"
          />
        </div>
      </CardContent>
    </Card>

    <!-- Identities list -->
    <Card>
      <CardContent class="p-0">
        <!-- Loading state -->
        <div v-if="isLoading" class="p-4 space-y-3">
          <Skeleton v-for="i in 10" :key="i" class="h-16" />
        </div>

        <!-- Error state -->
        <ErrorState
          v-else-if="isError"
          title="Failed to load identities"
          description="Could not connect to the Kratos API"
          @retry="refetch"
          class="py-8"
        />

        <!-- Empty state -->
        <EmptyState
          v-else-if="!filteredIdentities?.length"
          title="No identities found"
          :description="searchQuery ? 'Try adjusting your search query' : 'Create your first identity to get started'"
        >
          <template #icon>
            <Users class="h-8 w-8 text-text-muted" />
          </template>
          <template v-if="!searchQuery" #action>
            <RouterLink to="/identities/new">
              <Button>
                <Plus class="h-4 w-4 mr-2" />
                Create Identity
              </Button>
            </RouterLink>
          </template>
        </EmptyState>

        <!-- Identity list -->
        <div v-else class="divide-y divide-border-subtle">
          <div
            v-for="identity in filteredIdentities"
            :key="identity.id"
            class="flex items-center justify-between p-4 hover:bg-surface-raised transition-colors group"
          >
            <RouterLink
              :to="`/identities/${identity.id}`"
              class="flex items-center gap-4 min-w-0 flex-1"
            >
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent font-medium flex-shrink-0">
                {{ getIdentityName(identity).charAt(0).toUpperCase() }}
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <p class="text-sm font-medium text-text-primary truncate">
                    {{ getIdentityName(identity) }}
                  </p>
                  <Badge variant="outline" class="text-xs">
                    {{ identity.schema_id }}
                  </Badge>
                </div>
                <p class="text-xs text-text-muted truncate">
                  {{ identity.id }}
                </p>
              </div>
            </RouterLink>

            <div class="flex items-center gap-4">
              <div class="text-right hidden sm:block">
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
        <div v-if="filteredIdentities?.length" class="p-4 border-t border-border-subtle">
          <Pagination
            v-model:page="page"
            :page-size="pageSize"
            :has-more="identities?.length === pageSize"
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
