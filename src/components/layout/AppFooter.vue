<script setup lang="ts">
import { useVersion } from "@/composables/useHealth"

const appVersion = __APP_VERSION__
const { data: versionData } = useVersion()
</script>

<template>
  <footer class="border-t border-border-subtle px-3 py-3 text-sm text-text-muted md:px-6 md:py-4">
    <div
      class="mx-auto flex max-w-screen-2xl flex-col items-center gap-2 text-center sm:flex-row sm:justify-between sm:text-left"
    >
      <div class="flex items-center gap-2">
        <a
          :href="`https://github.com/licenseware/ory-admin-ui/releases/tag/v${appVersion}`"
          target="_blank"
          rel="noopener noreferrer"
          class="transition-colors hover:text-text-secondary"
        >
          Ory Admin UI v{{ appVersion }}
        </a>
        <span v-if="versionData?.version" class="text-text-muted">
          &middot;
          <a
            :href="`https://github.com/ory/kratos/releases/tag/${versionData.version}`"
            target="_blank"
            rel="noopener noreferrer"
            class="transition-colors hover:text-text-secondary"
          >
            Kratos {{ versionData.version }}
          </a>
        </span>
      </div>
      <div class="flex items-center gap-4">
        <a
          href="https://github.com/licenseware/ory-admin-ui"
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
