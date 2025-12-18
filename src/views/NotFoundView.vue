<script setup lang="ts">
import { RouterLink } from 'vue-router'
import Button from '@/components/ui/Button.vue'
import { Home, ArrowLeft } from 'lucide-vue-next'
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh] text-center">
    <div class="text-8xl font-bold text-accent/20 mb-4">404</div>
    <h1 class="text-2xl font-semibold text-text-primary mb-2">Page not found</h1>
    <p class="text-text-muted max-w-md mb-8">
      The page you're looking for doesn't exist or has been moved.
    </p>
    <div class="flex gap-4">
      <Button variant="outline" @click="$router.back()">
        <ArrowLeft class="h-4 w-4 mr-2" />
        Go back
      </Button>
      <RouterLink to="/">
        <Button>
          <Home class="h-4 w-4 mr-2" />
          Dashboard
        </Button>
      </RouterLink>
    </div>
  </div>
</template>
