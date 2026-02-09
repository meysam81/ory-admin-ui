import { mount, type ComponentMountingOptions, type VueWrapper } from "@vue/test-utils"
import { createPinia, setActivePinia, type Pinia } from "pinia"
import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query"
import { createRouter, createMemoryHistory, type Router } from "vue-router"
import type { Component } from "vue"
import { useProfileStore } from "@/stores/profile"

const stubRoutes = [
  { path: "/", name: "dashboard", component: { template: "<div>Dashboard</div>" } },
  { path: "/identities", name: "identities", component: { template: "<div>Identities</div>" } },
  {
    path: "/identities/new",
    name: "identity-create",
    component: { template: "<div>Create</div>" },
  },
  {
    path: "/identities/:id",
    name: "identity-detail",
    component: { template: "<div>Detail</div>" },
  },
  { path: "/sessions", name: "sessions", component: { template: "<div>Sessions</div>" } },
  {
    path: "/sessions/:id",
    name: "session-detail",
    component: { template: "<div>SessionDetail</div>" },
  },
  { path: "/courier", name: "courier", component: { template: "<div>Courier</div>" } },
  { path: "/schemas", name: "schemas", component: { template: "<div>Schemas</div>" } },
  { path: "/settings", name: "settings", component: { template: "<div>Settings</div>" } },
]

interface RenderResult {
  wrapper: VueWrapper
  router: Router
  pinia: Pinia
  queryClient: QueryClient
}

export function renderComponent(
  component: Component,
  options: ComponentMountingOptions<any> & { initialRoute?: string } = {}
): RenderResult {
  const { initialRoute, ...mountOptions } = options

  const pinia = createPinia()
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })

  const router = createRouter({
    history: createMemoryHistory(),
    routes: stubRoutes,
  })

  // Initialize profile store (replaces auto-resolving settings store)
  setActivePinia(pinia)
  const profileStore = useProfileStore()
  profileStore.initialize()

  if (initialRoute) {
    router.push(initialRoute)
  }

  const wrapper = mount(component, {
    ...mountOptions,
    global: {
      ...mountOptions.global,
      plugins: [
        pinia,
        [VueQueryPlugin, { queryClient }],
        router,
        ...(mountOptions.global?.plugins ?? []),
      ],
      stubs: {
        Teleport: true,
        ...mountOptions.global?.stubs,
      },
    },
  })

  return { wrapper, router, pinia, queryClient }
}
