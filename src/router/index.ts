import { createRouter, createWebHistory } from "vue-router"

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: () => import("@/components/layout/AppShell.vue"),
      children: [
        {
          path: "",
          name: "dashboard",
          component: () => import("@/views/DashboardView.vue"),
        },
        {
          path: "identities",
          name: "identities",
          component: () => import("@/views/IdentitiesView.vue"),
        },
        {
          path: "identities/new",
          name: "identity-create",
          component: () => import("@/views/IdentityCreateView.vue"),
        },
        {
          path: "identities/:id",
          name: "identity-detail",
          component: () => import("@/views/IdentityDetailView.vue"),
        },
        {
          path: "sessions",
          name: "sessions",
          component: () => import("@/views/SessionsView.vue"),
        },
        {
          path: "sessions/:id",
          name: "session-detail",
          component: () => import("@/views/SessionDetailView.vue"),
        },
        {
          path: "courier",
          name: "courier",
          component: () => import("@/views/CourierView.vue"),
        },
        {
          path: "schemas",
          name: "schemas",
          component: () => import("@/views/SchemasView.vue"),
        },
        {
          path: "settings",
          name: "settings",
          component: () => import("@/views/SettingsView.vue"),
        },
      ],
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("@/views/NotFoundView.vue"),
    },
  ],
})

export default router
