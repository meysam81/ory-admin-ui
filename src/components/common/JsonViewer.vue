<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronDown, ChevronRight, Copy, Check } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import { toast } from 'vue-sonner'

interface Props {
  data: unknown
  initialExpanded?: boolean
  maxHeight?: string
}

const props = withDefaults(defineProps<Props>(), {
  initialExpanded: true,
  maxHeight: '400px',
})

const expanded = ref(props.initialExpanded)
const copied = ref(false)

const formattedJson = computed(() => {
  try {
    return JSON.stringify(props.data, null, 2)
  } catch {
    return String(props.data)
  }
})

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(formattedJson.value)
    copied.value = true
    toast.success('JSON copied to clipboard')
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    toast.error('Failed to copy')
  }
}

function syntaxHighlight(json: string): string {
  return json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (match) => {
        let cls = 'text-warning' // number
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'text-accent' // key
            match = match.replace(/:$/, '')
            return `<span class="${cls}">${match}</span>:`
          } else {
            cls = 'text-success' // string
          }
        } else if (/true|false/.test(match)) {
          cls = 'text-purple-400' // boolean
        } else if (/null/.test(match)) {
          cls = 'text-text-muted' // null
        }
        return `<span class="${cls}">${match}</span>`
      }
    )
}
</script>

<template>
  <div class="rounded-lg border border-border-subtle bg-surface-raised">
    <div class="flex items-center justify-between px-3 py-2 border-b border-border-subtle">
      <button
        @click="expanded = !expanded"
        class="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        <ChevronDown v-if="expanded" class="h-4 w-4" />
        <ChevronRight v-else class="h-4 w-4" />
        <span>JSON</span>
      </button>
      <Button variant="ghost" size="icon" @click="copyToClipboard" title="Copy JSON">
        <Check v-if="copied" class="h-4 w-4 text-success" />
        <Copy v-else class="h-4 w-4" />
      </Button>
    </div>
    <div
      v-if="expanded"
      class="overflow-auto p-3"
      :style="{ maxHeight }"
    >
      <pre
        class="text-xs font-mono leading-relaxed"
        v-html="syntaxHighlight(formattedJson)"
      ></pre>
    </div>
  </div>
</template>
