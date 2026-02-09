import { createApp } from "vue"
import { createPinia } from "pinia"
import { VueQueryPlugin } from "@tanstack/vue-query"
import App from "./App.vue"
import router from "./router"
import { loadRuntimeProfiles } from "./config/loader"
import { useProfileStore } from "./stores/profile"
import "./assets/styles/main.css"

async function bootstrap() {
  // Load runtime profiles BEFORE initializing stores
  await loadRuntimeProfiles()

  const app = createApp(App)

  app.use(createPinia())
  app.use(router)
  app.use(VueQueryPlugin, {
    queryClientConfig: {
      defaultOptions: {
        queries: {
          staleTime: 30_000,
          retry: 1,
          refetchOnWindowFocus: false,
        },
      },
    },
  })

  // Initialize profile store after Pinia + VueQuery are installed
  const profileStore = useProfileStore()
  profileStore.initialize()

  app.mount("#app")
}

bootstrap()
