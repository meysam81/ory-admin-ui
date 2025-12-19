<script setup lang="ts">
import { RouterLink } from "vue-router"
import Button from "@/components/ui/Button.vue"
import { Home, ArrowLeft } from "lucide-vue-next"
</script>

<template>
  <div class="flex min-h-[60vh] flex-col items-center justify-center text-center">
    <div class="mb-4 text-8xl font-bold text-accent/20">404</div>
    <h1 class="mb-2 text-2xl font-semibold text-text-primary">Page not found</h1>
    <p class="mb-8 max-w-md text-text-muted">
      The page you're looking for doesn't exist or has been moved.
    </p>
    <div class="flex gap-4">
      <Button variant="outline" @click="$router.back()">
        <ArrowLeft class="mr-2 h-4 w-4" />
        Go back
      </Button>
      <RouterLink to="/">
        <Button>
          <Home class="mr-2 h-4 w-4" />
          Dashboard
        </Button>
      </RouterLink>
    </div>
  </div>
</template>
