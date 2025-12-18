<script setup lang="ts">
import { useVersion } from '@/composables/useHealth'

const { data: versionData } = useVersion()
</script>

<template>
  <footer class="border-t border-border-subtle py-4 px-6 text-sm text-text-muted">
    <div class="flex items-center justify-between max-w-screen-2xl mx-auto">
      <div class="flex items-center gap-2">
        <span>Ory Kratos Admin UI</span>
        <span v-if="versionData?.version" class="text-text-muted">
          &middot; Kratos {{ versionData.version }}
        </span>
      </div>
      <div class="flex items-center gap-4">
        <a
          href="https://github.com/meysam81/ory-admin-ui"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:text-text-secondary transition-colors"
        >
          GitHub
        </a>
        <a
          href="https://www.ory.sh/docs/kratos"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:text-text-secondary transition-colors"
        >
          Kratos Docs
        </a>
      </div>
    </div>
  </footer>
</template>
