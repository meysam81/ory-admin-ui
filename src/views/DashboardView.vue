<script setup lang="ts">
import { computed, ref } from "vue"
import ReloadButton from "@/components/common/ReloadButton.vue"
import { RouterLink } from "vue-router"
import { useIdentities } from "@/composables/useIdentities"
import { useSessions } from "@/composables/useSessions"
import { useCourierMessages } from "@/composables/useCourier"
import { useHealthAlive } from "@/composables/useHealth"
import { useMediaQuery } from "@/composables/useMediaQuery"
import Card from "@/components/ui/Card.vue"
import CardHeader from "@/components/ui/CardHeader.vue"
import CardTitle from "@/components/ui/CardTitle.vue"
import CardContent from "@/components/ui/CardContent.vue"
import Skeleton from "@/components/ui/Skeleton.vue"
import TimeAgo from "@/components/common/TimeAgo.vue"
import StatusBadge from "@/components/common/StatusBadge.vue"
import ErrorState from "@/components/common/ErrorState.vue"
import EmptyState from "@/components/common/EmptyState.vue"
import { Users, Key, Mail, Activity, ArrowRight } from "lucide-vue-next"

const dashboardParams = ref({ page_size: 10 })
const isDesktop = useMediaQuery("(min-width: 640px)")
const recentCount = computed(() => (isDesktop.value ? 10 : 5))

const {
  data: identities,
  isLoading: identitiesLoading,
  isFetching: identitiesFetching,
  isError: identitiesError,
  error: identitiesErrorObj,
  refetch: refetchIdentities,
} = useIdentities(dashboardParams)
const {
  data: sessions,
  isLoading: sessionsLoading,
  isFetching: sessionsFetching,
  isError: sessionsError,
  error: sessionsErrorObj,
  refetch: refetchSessions,
} = useSessions(dashboardParams)
const {
  data: messages,
  isLoading: messagesLoading,
  isFetching: messagesFetching,
  isError: messagesError,
  error: messagesErrorObj,
  refetch: refetchMessages,
} = useCourierMessages(dashboardParams)
const { isError: healthError } = useHealthAlive()

const isAnyFetching = computed(
  () => identitiesFetching.value || sessionsFetching.value || messagesFetching.value
)

function reloadAll() {
  refetchIdentities()
  refetchSessions()
  refetchMessages()
}
const recentIdentities = computed(() => {
  return identities.value?.data.slice(0, recentCount.value) || []
})
const recentSessions = computed(() => {
  return sessions.value?.data.slice(0, recentCount.value) || []
})
const recentMessages = computed(() => {
  return messages.value?.slice(0, recentCount.value) || []
})

const stats = computed(() => [
  {
    name: "Identities",
    value: identities.value?.data?.length ?? 0,
    icon: Users,
    href: "/identities",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    name: "Active Sessions",
    value: sessions.value?.data?.length ?? 0,
    icon: Key,
    href: "/sessions",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    name: "Messages",
    value: messages.value?.length ?? 0,
    icon: Mail,
    href: "/courier",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    name: "API Status",
    value: healthError.value ? "Offline" : "Online",
    icon: Activity,
    href: "/settings",
    color: healthError.value ? "text-destructive" : "text-success",
    bgColor: healthError.value ? "bg-destructive/10" : "bg-success/10",
  },
])

function getIdentityName(identity: any): string {
  const traits = identity.traits || {}
  return traits.email || traits.username || traits.name || identity.id.slice(0, 8)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-text-primary">Dashboard</h1>
        <p class="mt-1 text-sm text-text-muted">Overview of your Ory Kratos instance</p>
      </div>
      <ReloadButton :is-fetching="isAnyFetching" @reload="reloadAll" />
    </div>

    <!-- Stats grid -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <RouterLink v-for="stat in stats" :key="stat.name" :to="stat.href" class="group">
        <Card class="hover:border-border-default transition-colors">
          <CardContent class="p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-text-muted">{{ stat.name }}</p>
                <p class="mt-1 text-2xl font-semibold text-text-primary">
                  {{ stat.value }}
                </p>
              </div>
              <div :class="[stat.bgColor, 'rounded-lg p-2']">
                <component :is="stat.icon" :class="['h-5 w-5', stat.color]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </RouterLink>
    </div>

    <!-- Recent items grid -->
    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Recent identities -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-base">Recent Identities</CardTitle>
          <RouterLink
            to="/identities"
            class="flex items-center gap-1 text-sm text-accent hover:text-accent-hover"
          >
            View all
            <ArrowRight class="h-3 w-3" />
          </RouterLink>
        </CardHeader>
        <CardContent>
          <div v-if="identitiesLoading" class="space-y-3">
            <Skeleton v-for="i in 5" :key="i" class="h-12" />
          </div>
          <ErrorState
            v-else-if="identitiesError"
            :error="identitiesErrorObj"
            title="Failed to load identities"
            @retry="refetchIdentities"
          />
          <div v-else-if="identities?.data?.length" class="space-y-2">
            <RouterLink
              v-for="identity in recentIdentities"
              :key="identity.id"
              :to="`/identities/${identity.id}`"
              class="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-surface-raised"
            >
              <div class="flex min-w-0 items-center gap-3">
                <div
                  class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-medium text-accent"
                >
                  {{ getIdentityName(identity).charAt(0).toUpperCase() }}
                </div>
                <div class="min-w-0">
                  <p class="mb-1 truncate text-sm font-medium text-text-primary">
                    {{ getIdentityName(identity) }}
                  </p>
                  <p class="truncate text-xs text-text-muted">
                    {{ identity.id }}
                  </p>
                </div>
              </div>
              <div class="flex-shrink-0 text-xs text-text-muted">
                <TimeAgo :date="identity.created_at" />
              </div>
            </RouterLink>
          </div>
          <EmptyState
            v-else
            title="No identities"
            description="No identities have been created yet"
          >
            <template #icon>
              <Users class="h-8 w-8 text-text-muted" />
            </template>
          </EmptyState>
        </CardContent>
      </Card>

      <!-- Recent sessions -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-base">Recent Sessions</CardTitle>
          <RouterLink
            to="/sessions"
            class="flex items-center gap-1 text-sm text-accent hover:text-accent-hover"
          >
            View all
            <ArrowRight class="h-3 w-3" />
          </RouterLink>
        </CardHeader>
        <CardContent>
          <div v-if="sessionsLoading" class="space-y-3">
            <Skeleton v-for="i in 5" :key="i" class="h-12" />
          </div>
          <ErrorState
            v-else-if="sessionsError"
            :error="sessionsErrorObj"
            title="Failed to load sessions"
            @retry="refetchSessions"
          />
          <div v-else-if="sessions?.data?.length" class="space-y-2">
            <RouterLink
              v-for="session in recentSessions"
              :key="session.id"
              :to="`/sessions/${session.id}`"
              class="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-surface-raised"
            >
              <div class="flex min-w-0 items-center gap-3">
                <div
                  class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-success/10 text-success"
                >
                  <Key class="h-4 w-4" />
                </div>
                <div class="min-w-0">
                  <p class="mb-1 truncate text-sm font-medium text-text-primary">
                    {{ session.id.slice(0, 8) }}...
                  </p>
                  <p class="text-xs text-text-muted">
                    {{ session.identity?.traits?.email || "Unknown user" }}
                  </p>
                </div>
              </div>
              <div class="flex flex-shrink-0 items-center gap-2">
                <StatusBadge :status="session.active ? 'active' : 'inactive'" />
              </div>
            </RouterLink>
          </div>
          <EmptyState v-else title="No sessions" description="No active sessions at the moment">
            <template #icon>
              <Key class="h-8 w-8 text-text-muted" />
            </template>
          </EmptyState>
        </CardContent>
      </Card>

      <!-- Recent messages -->
      <Card class="lg:col-span-2">
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-base">Recent Courier Messages</CardTitle>
          <RouterLink
            to="/courier"
            class="flex items-center gap-1 text-sm text-accent hover:text-accent-hover"
          >
            View all
            <ArrowRight class="h-3 w-3" />
          </RouterLink>
        </CardHeader>
        <CardContent>
          <div v-if="messagesLoading" class="space-y-3">
            <Skeleton v-for="i in 5" :key="i" class="h-12" />
          </div>
          <ErrorState
            v-else-if="messagesError"
            :error="messagesErrorObj"
            title="Failed to load messages"
            @retry="refetchMessages"
          />
          <div v-else-if="messages?.length" class="space-y-2">
            <div
              v-for="message in recentMessages"
              :key="message.id"
              class="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-surface-raised"
            >
              <div class="flex min-w-0 items-center gap-3">
                <div
                  class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-warning/10 text-warning"
                >
                  <Mail class="h-4 w-4" />
                </div>
                <div class="min-w-0">
                  <p class="truncate text-sm font-medium text-text-primary">
                    {{ message.recipient }}
                  </p>
                  <p class="truncate text-xs text-text-muted">
                    {{ message.subject || message.template_type || "No subject" }}
                  </p>
                </div>
              </div>
              <div class="flex flex-shrink-0 items-center gap-2">
                <StatusBadge :status="message.status" />
                <span class="text-xs text-text-muted">
                  <TimeAgo :date="message.created_at" />
                </span>
              </div>
            </div>
          </div>
          <EmptyState
            v-else
            title="No messages"
            description="No courier messages have been sent yet"
          >
            <template #icon>
              <Mail class="h-8 w-8 text-text-muted" />
            </template>
          </EmptyState>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
