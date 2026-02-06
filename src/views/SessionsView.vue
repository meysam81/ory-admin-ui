<script setup lang="ts">
import { ref, computed } from "vue"
import { RouterLink } from "vue-router"
import { useSessions, useRevokeSession } from "@/composables/useSessions"
import Card from "@/components/ui/Card.vue"
import CardContent from "@/components/ui/CardContent.vue"
import Button from "@/components/ui/Button.vue"
import Input from "@/components/ui/Input.vue"
import Skeleton from "@/components/ui/Skeleton.vue"
import AlertDialog from "@/components/ui/AlertDialog.vue"
import TimeAgo from "@/components/common/TimeAgo.vue"
import StatusBadge from "@/components/common/StatusBadge.vue"
import EmptyState from "@/components/common/EmptyState.vue"
import ErrorState from "@/components/common/ErrorState.vue"
import Pagination from "@/components/common/Pagination.vue"
import { Search, Key, Eye, AlertTriangle, User } from "lucide-vue-next"
import type { Session } from "@/types/api"

const page = ref(1)
const pageSize = ref(20)
const searchQuery = ref("")
const revokeDialogOpen = ref(false)
const sessionToRevoke = ref<Session | null>(null)

const { data: sessions, isLoading, isError, error, refetch } = useSessions()

const { mutate: revokeSession, isPending: isRevoking } = useRevokeSession()

const filteredSessions = computed(() => {
  if (!sessions.value) return []
  if (!searchQuery.value) return sessions.value
  const query = searchQuery.value.toLowerCase()
  return sessions.value.filter((session) => {
    const identity = session.identity
    const traits = (identity?.traits || {}) as Record<string, string>
    return (
      session.id.toLowerCase().includes(query) ||
      identity?.id?.toLowerCase().includes(query) ||
      (traits.email && traits.email.toLowerCase().includes(query))
    )
  })
})

function getSessionUser(session: Session): string {
  const identity = session.identity
  if (!identity) return "Unknown"
  const traits = (identity.traits || {}) as Record<string, string>
  return traits.email || traits.username || identity.id.slice(0, 8)
}

function confirmRevoke(session: Session) {
  sessionToRevoke.value = session
  revokeDialogOpen.value = true
}

function handleRevoke() {
  if (!sessionToRevoke.value) return
  revokeSession(sessionToRevoke.value.id, {
    onSuccess: () => {
      revokeDialogOpen.value = false
      sessionToRevoke.value = null
      refetch()
    },
  })
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div>
      <h1 class="text-2xl font-semibold text-text-primary">Sessions</h1>
      <p class="mt-1 text-sm text-text-muted">View and manage active user sessions</p>
    </div>

    <!-- Search -->
    <Card>
      <CardContent class="p-4">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input
            v-model="searchQuery"
            placeholder="Search by session ID, user email, or identity ID..."
            class="pl-10"
          />
        </div>
      </CardContent>
    </Card>

    <!-- Sessions list -->
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
          title="Failed to load sessions"
          description="Could not connect to the Kratos API"
          @retry="refetch"
          class="py-8"
        />

        <!-- Empty state -->
        <EmptyState
          v-else-if="!filteredSessions?.length"
          title="No sessions found"
          :description="
            searchQuery ? 'Try adjusting your search query' : 'There are no active sessions'
          "
        >
          <template #icon>
            <Key class="h-8 w-8 text-text-muted" />
          </template>
        </EmptyState>

        <!-- Session list -->
        <div v-else class="divide-y divide-border-subtle">
          <div
            v-for="session in filteredSessions"
            :key="session.id"
            class="flex items-center justify-between p-4 transition-colors hover:bg-surface-raised"
          >
            <RouterLink
              :to="`/sessions/${session.id}`"
              class="flex min-w-0 flex-1 items-center gap-4"
            >
              <div
                class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-success/10 text-success"
              >
                <Key class="h-5 w-5" />
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <p class="truncate text-sm font-medium text-text-primary">
                    {{ session.id.slice(0, 12) }}...
                  </p>
                  <StatusBadge :status="session.active ? 'active' : 'inactive'" />
                </div>
                <div class="flex items-center gap-2 text-xs text-text-muted">
                  <User class="h-3 w-3" />
                  <span class="truncate">{{ getSessionUser(session) }}</span>
                </div>
              </div>
            </RouterLink>

            <div class="flex items-center gap-4">
              <div class="hidden text-right sm:block">
                <p class="text-xs text-text-muted">Authenticated</p>
                <p class="text-xs text-text-secondary">
                  <TimeAgo :date="session.authenticated_at" />
                </p>
              </div>
              <div class="hidden text-right md:block">
                <p class="text-xs text-text-muted">Expires</p>
                <p class="text-xs text-text-secondary">
                  {{
                    session.expires_at ? new Date(session.expires_at).toLocaleDateString() : "Never"
                  }}
                </p>
              </div>

              <div class="flex items-center gap-1">
                <RouterLink :to="`/sessions/${session.id}`">
                  <Button variant="ghost" size="icon" title="View">
                    <Eye class="h-4 w-4" />
                  </Button>
                </RouterLink>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Revoke"
                  @click.prevent="confirmRevoke(session)"
                >
                  <AlertTriangle class="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="filteredSessions?.length" class="border-t border-border-subtle p-4">
          <Pagination
            v-model:page="page"
            :page-size="pageSize"
            :has-more="sessions?.length === pageSize"
          />
        </div>
      </CardContent>
    </Card>

    <!-- Revoke confirmation dialog -->
    <AlertDialog
      :open="revokeDialogOpen"
      title="Revoke Session"
      :description="`Are you sure you want to revoke this session? The user will be logged out immediately.`"
      confirm-text="Revoke"
      :loading="isRevoking"
      @confirm="handleRevoke"
      @cancel="revokeDialogOpen = false"
    />
  </div>
</template>
