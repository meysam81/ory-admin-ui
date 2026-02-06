<script setup lang="ts">
import { ref, computed } from "vue"
import { useCourierMessages } from "@/composables/useCourier"
import Card from "@/components/ui/Card.vue"
import CardContent from "@/components/ui/CardContent.vue"
import Button from "@/components/ui/Button.vue"
import Input from "@/components/ui/Input.vue"
import Skeleton from "@/components/ui/Skeleton.vue"
import Badge from "@/components/ui/Badge.vue"
import Dialog from "@/components/ui/Dialog.vue"
import Select from "@/components/ui/Select.vue"
import TimeAgo from "@/components/common/TimeAgo.vue"
import StatusBadge from "@/components/common/StatusBadge.vue"
import EmptyState from "@/components/common/EmptyState.vue"
import ErrorState from "@/components/common/ErrorState.vue"
import Pagination from "@/components/common/Pagination.vue"
import JsonViewer from "@/components/common/JsonViewer.vue"
import { Search, Mail, Eye, Filter } from "lucide-vue-next"
import type { Message } from "@/types/api"

const pageSize = ref(20)
const searchQuery = ref("")
const statusFilter = ref<string>("all")
const selectedMessage = ref<Message | null>(null)
const detailDialogOpen = ref(false)

const { data: messages, isLoading, isError, error, refetch } = useCourierMessages()

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "queued", label: "Queued" },
  { value: "sent", label: "Sent" },
  { value: "processing", label: "Processing" },
  { value: "abandoned", label: "Abandoned" },
]

const filteredMessages = computed(() => {
  if (!messages.value) return []
  let result = messages.value

  if (statusFilter.value !== "all") {
    result = result.filter((m) => m.status === statusFilter.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter((message) => {
      return (
        message.id.toLowerCase().includes(query) ||
        message.recipient.toLowerCase().includes(query) ||
        (message.subject && message.subject.toLowerCase().includes(query)) ||
        (message.template_type && message.template_type.toLowerCase().includes(query))
      )
    })
  }

  return result
})

function viewMessage(message: Message) {
  selectedMessage.value = message
  detailDialogOpen.value = true
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div>
      <h1 class="text-2xl font-semibold text-text-primary">Courier Messages</h1>
      <p class="mt-1 text-sm text-text-muted">View email and SMS messages sent by Kratos</p>
    </div>

    <!-- Search and filters -->
    <Card>
      <CardContent class="p-4">
        <div class="flex flex-col gap-4 sm:flex-row">
          <div class="relative flex-1">
            <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <Input
              v-model="searchQuery"
              placeholder="Search by recipient, subject, or template..."
              class="pl-10"
            />
          </div>
          <div class="flex w-full items-center gap-2 sm:w-48">
            <Filter class="h-4 w-4 flex-shrink-0 text-text-muted" />
            <Select
              v-model="statusFilter"
              :options="statusOptions"
              placeholder="All statuses"
              class="flex-1"
            />
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Messages list -->
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
          title="Failed to load messages"
          description="Could not connect to the Kratos API"
          @retry="refetch"
          class="py-8"
        />

        <!-- Empty state -->
        <EmptyState
          v-else-if="!filteredMessages?.length"
          title="No messages found"
          :description="
            searchQuery || statusFilter
              ? 'Try adjusting your filters'
              : 'No courier messages have been sent yet'
          "
        >
          <template #icon>
            <Mail class="h-8 w-8 text-text-muted" />
          </template>
        </EmptyState>

        <!-- Message list -->
        <div v-else class="divide-y divide-border-subtle">
          <div
            v-for="message in filteredMessages"
            :key="message.id"
            class="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-surface-raised"
            @click="viewMessage(message)"
          >
            <div class="flex min-w-0 flex-1 items-center gap-4">
              <div
                class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-warning/10 text-warning"
              >
                <Mail class="h-5 w-5" />
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <p class="truncate text-sm font-medium text-text-primary">
                    {{ message.recipient }}
                  </p>
                  <Badge variant="outline" class="text-xs">
                    {{ message.type || "email" }}
                  </Badge>
                </div>
                <p class="truncate text-xs text-text-muted">
                  {{ message.subject || message.template_type || "No subject" }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-4">
              <div class="hidden text-right sm:block">
                <p class="text-xs text-text-muted">Sent</p>
                <p class="text-xs text-text-secondary">
                  <TimeAgo :date="message.created_at" />
                </p>
              </div>
              <StatusBadge :status="message.status" />
              <Button
                variant="ghost"
                size="icon"
                title="View details"
                @click.stop="viewMessage(message)"
              >
                <Eye class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="filteredMessages?.length" class="border-t border-border-subtle p-4">
          <Pagination
            :has-next="false"
            :has-prev="false"
            :page-size="pageSize"
            :item-count="filteredMessages.length"
          />
        </div>
      </CardContent>
    </Card>

    <!-- Message detail dialog -->
    <Dialog :open="detailDialogOpen" @update:open="detailDialogOpen = $event">
      <template #title>Message Details</template>
      <template #description> View the full details of this courier message </template>

      <div v-if="selectedMessage" class="space-y-4">
        <!-- Message header -->
        <div class="flex items-center justify-between rounded-lg bg-surface-raised p-4">
          <div>
            <p class="text-sm font-medium text-text-primary">{{ selectedMessage.recipient }}</p>
            <p class="text-xs text-text-muted">{{ selectedMessage.subject || "No subject" }}</p>
          </div>
          <StatusBadge :status="selectedMessage.status" />
        </div>

        <!-- Message info -->
        <div class="space-y-2">
          <div class="flex justify-between border-b border-border-subtle py-2">
            <span class="text-sm text-text-muted">Type</span>
            <Badge variant="outline">{{ selectedMessage.type || "email" }}</Badge>
          </div>
          <div class="flex justify-between border-b border-border-subtle py-2">
            <span class="text-sm text-text-muted">Template</span>
            <span class="text-sm text-text-primary">{{
              selectedMessage.template_type || "N/A"
            }}</span>
          </div>
          <div class="flex justify-between border-b border-border-subtle py-2">
            <span class="text-sm text-text-muted">Created</span>
            <span class="text-sm text-text-primary">
              {{ new Date(selectedMessage.created_at).toLocaleString() }}
            </span>
          </div>
          <div
            v-if="selectedMessage.updated_at"
            class="flex justify-between border-b border-border-subtle py-2"
          >
            <span class="text-sm text-text-muted">Updated</span>
            <span class="text-sm text-text-primary">
              {{ new Date(selectedMessage.updated_at).toLocaleString() }}
            </span>
          </div>
          <div v-if="selectedMessage.send_count !== undefined" class="flex justify-between py-2">
            <span class="text-sm text-text-muted">Send attempts</span>
            <span class="text-sm text-text-primary">{{ selectedMessage.send_count }}</span>
          </div>
        </div>

        <!-- Message body preview -->
        <div v-if="selectedMessage.body">
          <h4 class="mb-2 text-sm font-medium text-text-secondary">Message Body</h4>
          <div class="max-h-48 overflow-auto rounded-lg bg-surface-raised p-4">
            <pre class="whitespace-pre-wrap text-xs text-text-primary">{{
              selectedMessage.body
            }}</pre>
          </div>
        </div>

        <!-- Raw JSON -->
        <div>
          <h4 class="mb-2 text-sm font-medium text-text-secondary">Raw Data</h4>
          <JsonViewer :data="selectedMessage" :initial-expanded="false" max-height="200px" />
        </div>
      </div>

      <template #footer>
        <Button variant="outline" @click="detailDialogOpen = false">Close</Button>
      </template>
    </Dialog>
  </div>
</template>
