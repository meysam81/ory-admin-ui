import { createApp } from "vue"
import { createPinia } from "pinia"
import { VueQueryPlugin } from "@tanstack/vue-query"
import App from "./App.vue"
import router from "./router"
import { loadRuntimeConfig } from "./config/loader"
import "./assets/styles/main.css"

async function bootstrap() {
  // Load runtime config BEFORE initializing stores
  await loadRuntimeConfig()

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

  app.mount("#app")
}

bootstrap()
