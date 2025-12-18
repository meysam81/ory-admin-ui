<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useSession, useRevokeSession } from '@/composables/useSessions'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardDescription from '@/components/ui/CardDescription.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import AlertDialog from '@/components/ui/AlertDialog.vue'
import { TabsRoot as Tabs, TabsList, TabsTrigger, TabsContent } from 'radix-vue'
import TimeAgo from '@/components/common/TimeAgo.vue'
import JsonViewer from '@/components/common/JsonViewer.vue'
import CopyButton from '@/components/common/CopyButton.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import {
  ArrowLeft,
  AlertTriangle,
  Key,
  User,
  Clock,
  Monitor,
  Globe,
  Shield,
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const sessionId = computed(() => route.params.id as string)

const activeTab = ref('overview')
const revokeDialogOpen = ref(false)

const { data: session, isLoading, isError, refetch } = useSession(sessionId)
const { mutate: revokeSession, isPending: isRevoking } = useRevokeSession()

function getSessionUser(): string {
  if (!session.value?.identity) return 'Unknown'
  const traits = (session.value.identity.traits || {}) as Record<string, string>
  return traits.email || traits.username || session.value.identity.id.slice(0, 8)
}

function handleRevoke() {
  revokeSession(sessionId.value, {
    onSuccess: () => {
      router.push('/sessions')
    },
  })
}

function formatAuthMethod(method: any): string {
  if (typeof method === 'string') return method
  return method.method || 'unknown'
}
</script>

<template>
  <div class="space-y-6">
    <!-- Back button -->
    <Button variant="ghost" @click="router.push('/sessions')" class="-ml-2">
      <ArrowLeft class="h-4 w-4 mr-2" />
      Back to Sessions
    </Button>

    <!-- Loading state -->
    <div v-if="isLoading" class="space-y-6">
      <Skeleton class="h-32" />
      <Skeleton class="h-64" />
    </div>

    <!-- Error state -->
    <ErrorState
      v-else-if="isError"
      title="Failed to load session"
      description="The session could not be found or there was an error loading it."
      @retry="refetch"
    />

    <!-- Session details -->
    <template v-else-if="session">
      <!-- Header card -->
      <Card>
        <CardContent class="p-6">
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div class="flex items-start gap-4">
              <div class="flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success flex-shrink-0">
                <Key class="h-6 w-6" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h1 class="text-xl font-semibold text-text-primary">
                    Session
                  </h1>
                  <StatusBadge :status="session.active ? 'active' : 'inactive'" />
                </div>
                <div class="flex items-center gap-2 mt-1">
                  <code class="text-xs text-text-muted font-mono">{{ session.id }}</code>
                  <CopyButton :text="session.id" />
                </div>
                <div class="flex items-center gap-4 mt-2 text-sm text-text-muted">
                  <RouterLink
                    v-if="session.identity"
                    :to="`/identities/${session.identity.id}`"
                    class="flex items-center gap-1 hover:text-accent transition-colors"
                  >
                    <User class="h-3 w-3" />
                    {{ getSessionUser() }}
                  </RouterLink>
                  <span class="flex items-center gap-1">
                    <Clock class="h-3 w-3" />
                    Authenticated <TimeAgo :date="session.authenticated_at" />
                  </span>
                </div>
              </div>
            </div>

            <div class="flex gap-2">
              <Button variant="destructive" @click="revokeDialogOpen = true">
                <AlertTriangle class="h-4 w-4 mr-2" />
                Revoke Session
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Tabs -->
      <Tabs v-model="activeTab">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="identity">Identity</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="raw">Raw JSON</TabsTrigger>
        </TabsList>

        <!-- Overview tab -->
        <TabsContent value="overview" class="mt-4">
          <div class="grid gap-4 md:grid-cols-2">
            <!-- Session Info -->
            <Card>
              <CardHeader>
                <CardTitle class="text-base flex items-center gap-2">
                  <Key class="h-4 w-4" />
                  Session Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div class="space-y-3">
                  <div class="flex justify-between items-center py-2 border-b border-border-subtle">
                    <span class="text-sm text-text-muted">Status</span>
                    <StatusBadge :status="session.active ? 'active' : 'inactive'" />
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-border-subtle">
                    <span class="text-sm text-text-muted">Authenticated At</span>
                    <span class="text-sm text-text-primary">
                      {{ new Date(session.authenticated_at).toLocaleString() }}
                    </span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-border-subtle">
                    <span class="text-sm text-text-muted">Issued At</span>
                    <span class="text-sm text-text-primary">
                      {{ new Date(session.issued_at).toLocaleString() }}
                    </span>
                  </div>
                  <div class="flex justify-between items-center py-2">
                    <span class="text-sm text-text-muted">Expires At</span>
                    <span class="text-sm text-text-primary">
                      {{ session.expires_at ? new Date(session.expires_at).toLocaleString() : 'Never' }}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <!-- Authentication Methods -->
            <Card>
              <CardHeader>
                <CardTitle class="text-base flex items-center gap-2">
                  <Shield class="h-4 w-4" />
                  Authentication Methods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div v-if="session.authentication_methods?.length" class="space-y-2">
                  <div
                    v-for="(method, index) in session.authentication_methods"
                    :key="index"
                    class="flex items-center justify-between p-3 rounded-lg bg-surface-raised"
                  >
                    <div class="flex items-center gap-2">
                      <Badge variant="outline">{{ formatAuthMethod(method) }}</Badge>
                    </div>
                    <span v-if="method.completed_at" class="text-xs text-text-muted">
                      {{ new Date(method.completed_at).toLocaleString() }}
                    </span>
                  </div>
                </div>
                <p v-else class="text-sm text-text-muted">No authentication methods recorded</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <!-- Identity tab -->
        <TabsContent value="identity" class="mt-4">
          <Card>
            <CardHeader>
              <CardTitle class="text-base flex items-center gap-2">
                <User class="h-4 w-4" />
                Associated Identity
              </CardTitle>
              <CardDescription>The user identity associated with this session</CardDescription>
            </CardHeader>
            <CardContent>
              <div v-if="session.identity" class="space-y-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent font-medium">
                      {{ getSessionUser().charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <p class="text-sm font-medium text-text-primary">{{ getSessionUser() }}</p>
                      <code class="text-xs text-text-muted">{{ session.identity.id }}</code>
                    </div>
                  </div>
                  <RouterLink :to="`/identities/${session.identity.id}`">
                    <Button variant="outline" size="sm">
                      View Identity
                    </Button>
                  </RouterLink>
                </div>

                <!-- Identity traits -->
                <div class="mt-4">
                  <h4 class="text-sm font-medium text-text-secondary mb-2">Traits</h4>
                  <div class="p-3 rounded-lg bg-surface-raised">
                    <div
                      v-for="(value, key) in session.identity.traits"
                      :key="key"
                      class="flex justify-between items-center py-1"
                    >
                      <span class="text-sm text-text-muted capitalize">{{ key }}</span>
                      <span class="text-sm text-text-primary font-mono">
                        {{ typeof value === 'object' ? JSON.stringify(value) : value }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <p v-else class="text-sm text-text-muted">No identity information available</p>
            </CardContent>
          </Card>
        </TabsContent>

        <!-- Devices tab -->
        <TabsContent value="devices" class="mt-4">
          <Card>
            <CardHeader>
              <CardTitle class="text-base flex items-center gap-2">
                <Monitor class="h-4 w-4" />
                Device Information
              </CardTitle>
              <CardDescription>Devices associated with this session</CardDescription>
            </CardHeader>
            <CardContent>
              <div v-if="session.devices?.length" class="space-y-3">
                <div
                  v-for="(device, index) in session.devices"
                  :key="index"
                  class="p-4 rounded-lg bg-surface-raised"
                >
                  <div class="flex items-start gap-3">
                    <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-surface text-text-muted">
                      <Monitor class="h-5 w-5" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-text-primary">
                        {{ device.user_agent || 'Unknown Device' }}
                      </p>
                      <div class="flex items-center gap-4 mt-1 text-xs text-text-muted">
                        <span v-if="device.ip_address" class="flex items-center gap-1">
                          <Globe class="h-3 w-3" />
                          {{ device.ip_address }}
                        </span>
                        <span v-if="device.location">{{ device.location }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p v-else class="text-sm text-text-muted">No device information available</p>
            </CardContent>
          </Card>
        </TabsContent>

        <!-- Raw JSON tab -->
        <TabsContent value="raw" class="mt-4">
          <JsonViewer :data="session" :initial-expanded="true" max-height="600px" />
        </TabsContent>
      </Tabs>
    </template>

    <!-- Revoke confirmation dialog -->
    <AlertDialog
      :open="revokeDialogOpen"
      title="Revoke Session"
      description="Are you sure you want to revoke this session? The user will be logged out immediately."
      confirm-text="Revoke"
      :loading="isRevoking"
      @confirm="handleRevoke"
      @cancel="revokeDialogOpen = false"
    />
  </div>
</template>
