<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Toaster } from 'vue-sonner'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
themeStore.initTheme()
</script>

<template>
  <div :class="{ light: !themeStore.isDark }">
    <RouterView />
    <Toaster
      position="bottom-right"
      :theme="themeStore.isDark ? 'dark' : 'light'"
      richColors
      closeButton
    />
  </div>
</template>
