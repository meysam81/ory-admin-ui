import { mount, VueWrapper } from "@vue/test-utils"
import { createPinia, setActivePinia, type Pinia } from "pinia"
import { VueQueryPlugin, QueryClient } from "@tanstack/vue-query"
import type { Component } from "vue"
import { createRouter, createWebHistory, type Router } from "vue-router"

interface MountOptions {
  props?: Record<string, unknown>
  slots?: Record<string, unknown>
  global?: Record<string, unknown>
  withRouter?: boolean
  routerOptions?: {
    initialRoute?: string
  }
}

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

export function createTestRouter(initialRoute = "/"): Router {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: "/", name: "dashboard", component: { template: "<div>Dashboard</div>" } },
      { path: "/identities", name: "identities", component: { template: "<div>Identities</div>" } },
      {
        path: "/identities/new",
        name: "identity-create",
        component: { template: "<div>Create Identity</div>" },
      },
      {
        path: "/identities/:id",
        name: "identity-detail",
        component: { template: "<div>Identity Detail</div>" },
      },
      { path: "/sessions", name: "sessions", component: { template: "<div>Sessions</div>" } },
      {
        path: "/sessions/:id",
        name: "session-detail",
        component: { template: "<div>Session Detail</div>" },
      },
      { path: "/courier", name: "courier", component: { template: "<div>Courier</div>" } },
      { path: "/schemas", name: "schemas", component: { template: "<div>Schemas</div>" } },
      { path: "/settings", name: "settings", component: { template: "<div>Settings</div>" } },
    ],
  })
  router.push(initialRoute)
  return router
}

export function mountWithProviders<T extends Component>(
  component: T,
  options: MountOptions = {}
): { wrapper: VueWrapper; pinia: Pinia; queryClient: QueryClient; router?: Router } {
  const pinia = createPinia()
  setActivePinia(pinia)

  const queryClient = createTestQueryClient()

  const globalConfig: Record<string, unknown> = {
    plugins: [pinia, [VueQueryPlugin, { queryClient }]],
    stubs: {
      teleport: true,
    },
    ...options.global,
  }

  let router: Router | undefined

  if (options.withRouter) {
    router = createTestRouter(options.routerOptions?.initialRoute)
    ;(globalConfig.plugins as unknown[]).push(router)
  }

  const wrapper = mount(component, {
    props: options.props,
    slots: options.slots,
    global: globalConfig,
  })

  return { wrapper, pinia, queryClient, router }
}

export async function flushPromises(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0))
}

export function waitFor(
  callback: () => boolean | void,
  { timeout = 1000, interval = 50 } = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()

    const check = () => {
      try {
        const result = callback()
        if (result !== false) {
          resolve()
          return
        }
      } catch {
        // Keep trying
      }

      if (Date.now() - startTime > timeout) {
        reject(new Error("waitFor timeout"))
        return
      }

      setTimeout(check, interval)
    }

    check()
  })
}
