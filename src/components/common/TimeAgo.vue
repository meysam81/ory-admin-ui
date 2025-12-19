<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from "vue"

interface Props {
  date: string | Date
}

const props = defineProps<Props>()

const now = ref(Date.now())
let interval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  interval = setInterval(() => {
    now.value = Date.now()
  }, 60000) // Update every minute
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})

const timeAgo = computed(() => {
  const date = new Date(props.date)
  const seconds = Math.floor((now.value - date.getTime()) / 1000)

  if (seconds < 60) return "just now"
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    return `${minutes}m ago`
  }
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600)
    return `${hours}h ago`
  }
  if (seconds < 604800) {
    const days = Math.floor(seconds / 86400)
    return `${days}d ago`
  }
  if (seconds < 2592000) {
    const weeks = Math.floor(seconds / 604800)
    return `${weeks}w ago`
  }
  const months = Math.floor(seconds / 2592000)
  return `${months}mo ago`
})

const fullDate = computed(() => {
  return new Date(props.date).toLocaleString()
})
</script>

<template>
  <time :datetime="new Date(date).toISOString()" :title="fullDate" class="whitespace-nowrap">
    {{ timeAgo }}
  </time>
</template>
