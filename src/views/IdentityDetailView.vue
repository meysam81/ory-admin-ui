<script setup lang="ts">
import { ref, computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import {
  useIdentity,
  useIdentitySessions,
  useDeleteIdentity,
  useBlockIdentity,
  useCreateRecoveryLink,
} from "@/composables/useIdentities"
import { useRevokeSession } from "@/composables/useSessions"
import Card from "@/components/ui/Card.vue"
import CardHeader from "@/components/ui/CardHeader.vue"
import CardTitle from "@/components/ui/CardTitle.vue"
import CardDescription from "@/components/ui/CardDescription.vue"
import CardContent from "@/components/ui/CardContent.vue"
import Button from "@/components/ui/Button.vue"
import Badge from "@/components/ui/Badge.vue"
import Skeleton from "@/components/ui/Skeleton.vue"
import AlertDialog from "@/components/ui/AlertDialog.vue"
import { TabsRoot as Tabs, TabsList, TabsTrigger, TabsContent } from "radix-vue"
import TimeAgo from "@/components/common/TimeAgo.vue"
import JsonViewer from "@/components/common/JsonViewer.vue"
import CopyButton from "@/components/common/CopyButton.vue"
import ErrorState from "@/components/common/ErrorState.vue"
import EmptyState from "@/components/common/EmptyState.vue"
import StatusBadge from "@/components/common/StatusBadge.vue"
import {
  ArrowLeft,
  Trash2,
  Key,
  Shield,
  ShieldOff,
  Link,
  Clock,
  User,
  FileJson,
  AlertTriangle,
} from "lucide-vue-next"

const route = useRoute()
const router = useRouter()
const identityId = computed(() => route.params.id as string)

const activeTab = ref("overview")
const deleteDialogOpen = ref(false)
const blockDialogOpen = ref(false)
const revokeSessionDialogOpen = ref(false)
const sessionToRevoke = ref<string | null>(null)
const recoveryLink = ref<string | null>(null)

const { data: identity, isLoading, isError, refetch } = useIdentity(identityId)
const {
  data: sessions,
  isLoading: sessionsLoading,
  refetch: refetchSessions,
} = useIdentitySessions(identityId)
const { mutate: deleteIdentity, isPending: isDeleting } = useDeleteIdentity()
const { mutate: blockIdentity, isPending: isBlocking } = useBlockIdentity()
const { mutate: createRecoveryLink, isPending: isCreatingRecovery } = useCreateRecoveryLink()
const { mutate: revokeSession, isPending: isRevoking } = useRevokeSession()

const isBlocked = computed(() => identity.value?.state === "inactive")

function getIdentityName(): string {
  if (!identity.value) return ""
  const traits = (identity.value.traits || {}) as Record<string, string>
  return traits.email || traits.username || traits.name || identity.value.id.slice(0, 8)
}

function handleDelete() {
  deleteIdentity(identityId.value, {
    onSuccess: () => {
      router.push("/identities")
    },
  })
}

function handleBlock() {
  blockIdentity(
    { id: identityId.value, blocked: !isBlocked.value },
    {
      onSuccess: () => {
        blockDialogOpen.value = false
      },
    }
  )
}

function handleCreateRecoveryLink() {
  createRecoveryLink(
    { identityId: identityId.value },
    {
      onSuccess: (data) => {
        recoveryLink.value = data.recovery_link
      },
    }
  )
}

function confirmRevokeSession(sessionId: string) {
  sessionToRevoke.value = sessionId
  revokeSessionDialogOpen.value = true
}

function handleRevokeSession() {
  if (!sessionToRevoke.value) return
  revokeSession(sessionToRevoke.value, {
    onSuccess: () => {
      revokeSessionDialogOpen.value = false
      sessionToRevoke.value = null
      refetchSessions()
    },
  })
}
</script>

<template>
  <div class="space-y-6">
    <!-- Back button -->
    <Button variant="ghost" @click="router.push('/identities')" class="-ml-2">
      <ArrowLeft class="mr-2 h-4 w-4" />
      Back to Identities
    </Button>

    <!-- Loading state -->
    <div v-if="isLoading" class="space-y-6">
      <Skeleton class="h-32" />
      <Skeleton class="h-64" />
    </div>

    <!-- Error state -->
    <ErrorState
      v-else-if="isError"
      title="Failed to load identity"
      description="The identity could not be found or there was an error loading it."
      @retry="refetch"
    />

    <!-- Identity details -->
    <template v-else-if="identity">
      <!-- Header card -->
      <Card>
        <CardContent class="p-6">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div class="flex items-start gap-4">
              <div
                class="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-accent/10 text-xl font-medium text-accent"
              >
                {{ getIdentityName().charAt(0).toUpperCase() }}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h1 class="text-xl font-semibold text-text-primary">
                    {{ getIdentityName() }}
                  </h1>
                  <Badge :variant="isBlocked ? 'destructive' : 'success'">
                    {{ isBlocked ? "Blocked" : "Active" }}
                  </Badge>
                </div>
                <div class="mt-1 flex items-center gap-2">
                  <code class="font-mono text-xs text-text-muted">{{ identity.id }}</code>
                  <CopyButton :text="identity.id" />
                </div>
                <div class="mt-2 flex items-center gap-4 text-sm text-text-muted">
                  <span class="flex items-center gap-1">
                    <Clock class="h-3 w-3" />
                    Created <TimeAgo :date="identity.created_at" />
                  </span>
                  <span class="flex items-center gap-1">
                    <FileJson class="h-3 w-3" />
                    {{ identity.schema_id }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <Button
                variant="outline"
                @click="handleCreateRecoveryLink"
                :disabled="isCreatingRecovery"
              >
                <Link class="mr-2 h-4 w-4" />
                Recovery Link
              </Button>
              <Button :variant="isBlocked ? 'outline' : 'outline'" @click="blockDialogOpen = true">
                <ShieldOff v-if="!isBlocked" class="mr-2 h-4 w-4" />
                <Shield v-else class="mr-2 h-4 w-4" />
                {{ isBlocked ? "Unblock" : "Block" }}
              </Button>
              <Button variant="destructive" @click="deleteDialogOpen = true">
                <Trash2 class="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>

          <!-- Recovery link display -->
          <div
            v-if="recoveryLink"
            class="mt-4 rounded-lg border border-success/30 bg-success/10 p-4"
          >
            <p class="mb-2 text-sm font-medium text-success">Recovery Link Generated</p>
            <div class="flex items-center gap-2">
              <code class="flex-1 break-all font-mono text-xs text-text-primary">
                {{ recoveryLink }}
              </code>
              <CopyButton :text="recoveryLink" />
            </div>
            <p class="mt-2 text-xs text-text-muted">
              This link will expire. Share it securely with the user.
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- Tabs -->
      <Tabs v-model="activeTab">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">
            Sessions
            <Badge v-if="sessions?.length" variant="secondary" class="ml-2">
              {{ sessions.length }}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="credentials">Credentials</TabsTrigger>
          <TabsTrigger value="raw">Raw JSON</TabsTrigger>
        </TabsList>

        <!-- Overview tab -->
        <TabsContent value="overview" class="mt-4">
          <div class="grid gap-4 md:grid-cols-2">
            <!-- Traits -->
            <Card>
              <CardHeader>
                <CardTitle class="flex items-center gap-2 text-base">
                  <User class="h-4 w-4" />
                  Traits
                </CardTitle>
                <CardDescription>User profile information</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  v-if="identity.traits && Object.keys(identity.traits).length"
                  class="space-y-3"
                >
                  <div
                    v-for="(value, key) in identity.traits"
                    :key="key"
                    class="flex items-start justify-between border-b border-border-subtle py-2 last:border-0"
                  >
                    <span class="text-sm capitalize text-text-muted">{{ key }}</span>
                    <span
                      class="max-w-[60%] break-all text-right font-mono text-sm text-text-primary"
                    >
                      {{ typeof value === "object" ? JSON.stringify(value) : value }}
                    </span>
                  </div>
                </div>
                <p v-else class="text-sm text-text-muted">No traits defined</p>
              </CardContent>
            </Card>

            <!-- Metadata -->
            <Card>
              <CardHeader>
                <CardTitle class="flex items-center gap-2 text-base">
                  <FileJson class="h-4 w-4" />
                  Metadata
                </CardTitle>
                <CardDescription>Additional identity metadata</CardDescription>
              </CardHeader>
              <CardContent>
                <div class="space-y-3">
                  <div class="flex items-center justify-between border-b border-border-subtle py-2">
                    <span class="text-sm text-text-muted">Schema</span>
                    <Badge variant="outline">{{ identity.schema_id }}</Badge>
                  </div>
                  <div class="flex items-center justify-between border-b border-border-subtle py-2">
                    <span class="text-sm text-text-muted">State</span>
                    <StatusBadge :status="identity.state || 'active'" />
                  </div>
                  <div class="flex items-center justify-between border-b border-border-subtle py-2">
                    <span class="text-sm text-text-muted">Created</span>
                    <span class="text-sm text-text-primary">
                      {{ new Date(identity.created_at).toLocaleString() }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between py-2">
                    <span class="text-sm text-text-muted">Updated</span>
                    <span class="text-sm text-text-primary">
                      {{ new Date(identity.updated_at).toLocaleString() }}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <!-- Sessions tab -->
        <TabsContent value="sessions" class="mt-4">
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2 text-base">
                <Key class="h-4 w-4" />
                Active Sessions
              </CardTitle>
              <CardDescription>All active sessions for this identity</CardDescription>
            </CardHeader>
            <CardContent>
              <div v-if="sessionsLoading" class="space-y-3">
                <Skeleton v-for="i in 3" :key="i" class="h-16" />
              </div>
              <EmptyState
                v-else-if="!sessions?.length"
                title="No active sessions"
                description="This identity has no active sessions."
              >
                <template #icon>
                  <Key class="h-8 w-8 text-text-muted" />
                </template>
              </EmptyState>
              <div v-else class="space-y-3">
                <div
                  v-for="session in sessions"
                  :key="session.id"
                  class="flex items-center justify-between rounded-lg bg-surface-raised p-3"
                >
                  <div>
                    <div class="flex items-center gap-2">
                      <code class="font-mono text-xs text-text-primary">
                        {{ session.id.slice(0, 8) }}...
                      </code>
                      <StatusBadge :status="session.active ? 'active' : 'inactive'" />
                    </div>
                    <div class="mt-1 flex items-center gap-4 text-xs text-text-muted">
                      <span>Authenticated <TimeAgo :date="session.authenticated_at" /></span>
                      <span v-if="session.expires_at">
                        Expires {{ new Date(session.expires_at).toLocaleDateString() }}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" @click="confirmRevokeSession(session.id)">
                    <AlertTriangle class="mr-1 h-4 w-4 text-destructive" />
                    Revoke
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <!-- Credentials tab -->
        <TabsContent value="credentials" class="mt-4">
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2 text-base">
                <Shield class="h-4 w-4" />
                Credentials
              </CardTitle>
              <CardDescription>Authentication credentials for this identity</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                v-if="identity.credentials && Object.keys(identity.credentials).length"
                class="space-y-4"
              >
                <div
                  v-for="(cred, type) in identity.credentials"
                  :key="type"
                  class="rounded-lg bg-surface-raised p-4"
                >
                  <div class="mb-2 flex items-center justify-between">
                    <Badge variant="outline">{{ type }}</Badge>
                    <span class="text-xs text-text-muted"> Version {{ cred.version }} </span>
                  </div>
                  <div v-if="cred.identifiers?.length" class="mt-2">
                    <p class="mb-1 text-xs text-text-muted">Identifiers:</p>
                    <div class="flex flex-wrap gap-1">
                      <code
                        v-for="identifier in cred.identifiers"
                        :key="identifier"
                        class="rounded bg-surface px-2 py-1 font-mono text-xs"
                      >
                        {{ identifier }}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
              <p v-else class="text-sm text-text-muted">No credentials found</p>
            </CardContent>
          </Card>
        </TabsContent>

        <!-- Raw JSON tab -->
        <TabsContent value="raw" class="mt-4">
          <JsonViewer :data="identity" :initial-expanded="true" max-height="600px" />
        </TabsContent>
      </Tabs>
    </template>

    <!-- Delete confirmation dialog -->
    <AlertDialog
      :open="deleteDialogOpen"
      title="Delete Identity"
      description="Are you sure you want to delete this identity? This action cannot be undone and will remove all associated sessions and credentials."
      confirm-text="Delete"
      :loading="isDeleting"
      @confirm="handleDelete"
      @cancel="deleteDialogOpen = false"
    />

    <!-- Block confirmation dialog -->
    <AlertDialog
      :open="blockDialogOpen"
      :title="isBlocked ? 'Unblock Identity' : 'Block Identity'"
      :description="
        isBlocked
          ? 'This will allow the user to log in again.'
          : 'This will prevent the user from logging in and revoke all active sessions.'
      "
      :confirm-text="isBlocked ? 'Unblock' : 'Block'"
      :loading="isBlocking"
      @confirm="handleBlock"
      @cancel="blockDialogOpen = false"
    />

    <!-- Revoke session dialog -->
    <AlertDialog
      :open="revokeSessionDialogOpen"
      title="Revoke Session"
      description="Are you sure you want to revoke this session? The user will be logged out."
      confirm-text="Revoke"
      :loading="isRevoking"
      @confirm="handleRevokeSession"
      @cancel="revokeSessionDialogOpen = false"
    />
  </div>
</template>
