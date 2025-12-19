<script setup lang="ts">
import { useVersion } from "@/composables/useHealth"

const { data: versionData } = useVersion()
</script>

<template>
  <footer class="border-t border-border-subtle px-6 py-4 text-sm text-text-muted">
    <div class="mx-auto flex max-w-screen-2xl items-center justify-between">
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
          class="transition-colors hover:text-text-secondary"
        >
          GitHub
        </a>
        <a
          href="https://www.ory.sh/docs/kratos"
          target="_blank"
          rel="noopener noreferrer"
          class="transition-colors hover:text-text-secondary"
        >
          Kratos Docs
        </a>
      </div>
    </div>
  </footer>
</template>
