<script setup lang="ts">
import { ref, computed } from "vue"
import { useSettingsStore } from "@/stores/settings"
import { useThemeStore } from "@/stores/theme"
import { useHealthAlive, useVersion } from "@/composables/useHealth"
import Card from "@/components/ui/Card.vue"
import CardHeader from "@/components/ui/CardHeader.vue"
import CardTitle from "@/components/ui/CardTitle.vue"
import CardDescription from "@/components/ui/CardDescription.vue"
import CardContent from "@/components/ui/CardContent.vue"
import Button from "@/components/ui/Button.vue"
import Input from "@/components/ui/Input.vue"
import Label from "@/components/ui/Label.vue"
import Badge from "@/components/ui/Badge.vue"
import {
  Settings,
  Server,
  Palette,
  Save,
  RotateCcw,
  CheckCircle,
  XCircle,
  Sun,
  Moon,
  Monitor,
} from "lucide-vue-next"
import { toast } from "vue-sonner"

const settingsStore = useSettingsStore()
const themeStore = useThemeStore()

const { isError: healthError, refetch: checkHealth } = useHealthAlive()
const { data: version } = useVersion()

// Local form state
const apiEndpoint = ref(settingsStore.apiEndpoint)
const theme = ref(themeStore.theme)

// Track if settings have changed
const hasChanges = computed(() => {
  return apiEndpoint.value !== settingsStore.apiEndpoint || theme.value !== themeStore.theme
})

function saveSettings() {
  settingsStore.setApiEndpoint(apiEndpoint.value)
  themeStore.setTheme(theme.value as "light" | "dark" | "system")
  toast.success("Settings saved successfully")
  checkHealth()
}

function resetSettings() {
  settingsStore.resetSettings()
  themeStore.setTheme("dark")
  apiEndpoint.value = settingsStore.apiEndpoint
  theme.value = "dark"
  toast.info("Settings reset to defaults")
  checkHealth()
}

// Validate API endpoint URL
const isValidUrl = computed(() => {
  try {
    new URL(apiEndpoint.value)
    return true
  } catch {
    return false
  }
})

// Test connection
const isTesting = ref(false)
async function testConnection() {
  if (!isValidUrl.value) {
    toast.error("Please enter a valid URL")
    return
  }

  isTesting.value = true
  settingsStore.setApiEndpoint(apiEndpoint.value)

  await new Promise((resolve) => setTimeout(resolve, 500))
  await checkHealth()

  isTesting.value = false

  if (healthError.value) {
    toast.error("Connection failed", {
      description: "Could not connect to the Kratos API at the specified endpoint",
    })
  } else {
    toast.success("Connection successful", {
      description: `Connected to Kratos ${version.value?.version || ""}`,
    })
  }
}
</script>

<template>
  <div class="max-w-2xl space-y-6">
    <!-- Page header -->
    <div>
      <h1 class="text-2xl font-semibold text-text-primary">Settings</h1>
      <p class="mt-1 text-sm text-text-muted">Configure the Ory Admin UI</p>
    </div>

    <!-- API Configuration -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2 text-base">
          <Server class="h-4 w-4" />
          API Configuration
        </CardTitle>
        <CardDescription>Configure the connection to your Ory Kratos instance</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label for="api-endpoint">Kratos Admin API Endpoint</Label>
          <div class="flex gap-2">
            <Input
              id="api-endpoint"
              v-model="apiEndpoint"
              type="url"
              placeholder="http://localhost:4434"
              :class="!isValidUrl && apiEndpoint ? 'border-destructive' : ''"
            />
            <Button variant="outline" @click="testConnection" :disabled="!isValidUrl || isTesting">
              {{ isTesting ? "Testing..." : "Test" }}
            </Button>
          </div>
          <p v-if="!isValidUrl && apiEndpoint" class="text-xs text-destructive">
            Please enter a valid URL
          </p>
          <p class="text-xs text-text-muted">
            The URL of your Kratos Admin API. This is typically port 4434.
          </p>
        </div>

        <!-- Connection status -->
        <div class="flex items-center justify-between rounded-lg bg-surface-raised p-4">
          <div class="flex items-center gap-3">
            <div
              :class="[
                'flex h-10 w-10 items-center justify-center rounded-full',
                healthError ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success',
              ]"
            >
              <CheckCircle v-if="!healthError" class="h-5 w-5" />
              <XCircle v-else class="h-5 w-5" />
            </div>
            <div>
              <p class="text-sm font-medium text-text-primary">
                {{ healthError ? "Disconnected" : "Connected" }}
              </p>
              <p class="text-xs text-text-muted">
                {{
                  healthError
                    ? "Unable to reach the API"
                    : `Kratos ${version?.version || "Unknown version"}`
                }}
              </p>
            </div>
          </div>
          <Badge :variant="healthError ? 'destructive' : 'success'">
            {{ healthError ? "Offline" : "Online" }}
          </Badge>
        </div>
      </CardContent>
    </Card>

    <!-- Appearance -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2 text-base">
          <Palette class="h-4 w-4" />
          Appearance
        </CardTitle>
        <CardDescription>Customize the look and feel of the admin UI</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label>Theme</Label>
          <div class="grid grid-cols-3 gap-2">
            <button
              @click="theme = 'light'"
              :class="[
                'flex items-center justify-center gap-2 rounded-lg border p-3 transition-colors',
                theme === 'light'
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'hover:border-border-default border-border-subtle text-text-secondary',
              ]"
            >
              <Sun class="h-4 w-4" />
              <span class="text-sm">Light</span>
            </button>
            <button
              @click="theme = 'dark'"
              :class="[
                'flex items-center justify-center gap-2 rounded-lg border p-3 transition-colors',
                theme === 'dark'
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'hover:border-border-default border-border-subtle text-text-secondary',
              ]"
            >
              <Moon class="h-4 w-4" />
              <span class="text-sm">Dark</span>
            </button>
            <button
              @click="theme = 'system'"
              :class="[
                'flex items-center justify-center gap-2 rounded-lg border p-3 transition-colors',
                theme === 'system'
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'hover:border-border-default border-border-subtle text-text-secondary',
              ]"
            >
              <Monitor class="h-4 w-4" />
              <span class="text-sm">System</span>
            </button>
          </div>
          <p class="text-xs text-text-muted">
            Choose your preferred color scheme or use system settings
          </p>
        </div>
      </CardContent>
    </Card>

    <!-- About -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2 text-base">
          <Settings class="h-4 w-4" />
          About
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-3">
        <div class="flex justify-between border-b border-border-subtle py-2">
          <span class="text-sm text-text-muted">Admin UI Version</span>
          <span class="font-mono text-sm text-text-primary">1.0.0</span>
        </div>
        <div class="flex justify-between border-b border-border-subtle py-2">
          <span class="text-sm text-text-muted">Kratos Version</span>
          <span class="font-mono text-sm text-text-primary">
            {{ version?.version || "Unknown" }}
          </span>
        </div>
        <div class="flex justify-between py-2">
          <span class="text-sm text-text-muted">Documentation</span>
          <a
            href="https://www.ory.sh/docs/kratos"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm text-accent hover:text-accent-hover"
          >
            Ory Kratos Docs
          </a>
        </div>
      </CardContent>
    </Card>

    <!-- Actions -->
    <div class="flex justify-between">
      <Button variant="outline" @click="resetSettings">
        <RotateCcw class="mr-2 h-4 w-4" />
        Reset to Defaults
      </Button>
      <Button @click="saveSettings" :disabled="!hasChanges">
        <Save class="mr-2 h-4 w-4" />
        Save Settings
      </Button>
    </div>
  </div>
</template>
