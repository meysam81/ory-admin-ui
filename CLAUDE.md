# CLAUDE.md - Ory Admin UI

This document provides comprehensive guidance for AI assistants working on this codebase.

## Project Overview

Ory Admin UI is a production-grade single-page application for managing identities and access control in Ory Kratos identity servers. It provides an intuitive interface for CRUD operations on identities, sessions, courier messages, and identity schemas.

**Key Features:**

- Identity management (create, read, update, delete)
- Session management and revocation
- Courier message viewing
- Identity schema browsing
- Dark/light theme support
- Responsive design

## Tech Stack

| Category         | Technology                                      |
| ---------------- | ----------------------------------------------- |
| Framework        | Vue 3.5 (Composition API with `<script setup>`) |
| Language         | TypeScript 5.7 (strict mode)                    |
| Build Tool       | Vite 6                                          |
| Package Manager  | Bun (primary) or npm                            |
| State Management | Pinia                                           |
| Data Fetching    | TanStack Vue Query                              |
| HTTP Client      | ky                                              |
| Styling          | Tailwind CSS 3.4                                |
| UI Components    | Radix Vue primitives                            |
| Icons            | Lucide Vue Next                                 |
| Notifications    | vue-sonner                                      |
| Linting          | oxlint, ESLint                                  |
| Formatting       | Prettier                                        |
| Testing          | Vitest                                          |

## Project Structure

```
src/
├── api/                 # API layer - HTTP clients for Ory Kratos
│   ├── client.ts        # Base ky client configuration
│   ├── identities.ts    # Identity CRUD operations
│   ├── sessions.ts      # Session management
│   ├── courier.ts       # Courier message API
│   ├── schemas.ts       # Identity schemas API
│   └── health.ts        # Health check endpoints
├── assets/
│   └── styles/
│       └── main.css     # Global styles and Tailwind imports
├── components/
│   ├── common/          # Reusable utility components
│   │   ├── CopyButton.vue
│   │   ├── EmptyState.vue
│   │   ├── ErrorState.vue
│   │   ├── JsonViewer.vue
│   │   ├── LoadingSpinner.vue
│   │   ├── Pagination.vue
│   │   ├── StatusBadge.vue
│   │   └── TimeAgo.vue
│   ├── layout/          # App shell components
│   │   ├── AppFooter.vue
│   │   ├── AppHeader.vue
│   │   ├── AppShell.vue
│   │   └── AppSidebar.vue
│   └── ui/              # Base UI primitives (shadcn-vue style)
│       ├── Button.vue
│       ├── Card.vue, CardContent.vue, CardHeader.vue, etc.
│       ├── Dialog.vue
│       ├── Input.vue
│       ├── Select.vue
│       ├── Tabs.vue
│       └── ...
├── composables/         # Vue composables for data fetching
│   ├── useCourier.ts
│   ├── useHealth.ts
│   ├── useIdentities.ts
│   ├── useSchemas.ts
│   └── useSessions.ts
├── lib/
│   └── utils.ts         # Utility functions (cn, formatDate, etc.)
├── router/
│   └── index.ts         # Vue Router configuration
├── stores/              # Pinia stores
│   ├── settings.ts      # API endpoint configuration
│   ├── theme.ts         # Theme (dark/light/system)
│   └── ui.ts            # UI state (sidebar, modals)
├── types/
│   └── api.ts           # TypeScript interfaces for API models
├── views/               # Route-level page components
│   ├── DashboardView.vue
│   ├── IdentitiesView.vue
│   ├── IdentityDetailView.vue
│   ├── IdentityCreateView.vue
│   ├── SessionsView.vue
│   ├── SessionDetailView.vue
│   ├── CourierView.vue
│   ├── SchemasView.vue
│   ├── SettingsView.vue
│   └── NotFoundView.vue
├── App.vue              # Root component
├── main.ts              # Application entry point
└── vite-env.d.ts        # Vite type declarations
```

## Development Workflow

### Commands

```bash
# Install dependencies
bun install           # or: npm install

# Development server (default: http://localhost:5173)
bun run dev           # or: npm run dev

# Type checking
bun run typecheck     # or: npm run typecheck

# Build for production
bun run build         # or: npm run build

# Preview production build
bun run preview       # or: npm run preview

# Linting
bun run lint          # oxlint

# Formatting
bun run format        # Prettier write
bun run format:check  # Prettier check

# Testing
bun run test          # Vitest watch mode
bun run test:coverage # With coverage
```

### Justfile Tasks

```bash
just lint    # Run pre-commit hooks
just serve   # Start dev server
just build   # Production build
just mkdocs  # Serve documentation
```

### Environment Variables

Create `.env` file based on `.env.example`:

```bash
VITE_DEFAULT_API_ENDPOINT=http://localhost:4434  # Kratos Admin API URL
```

The API endpoint can also be configured at runtime in the Settings page.

## Architecture Patterns

### Component Patterns

1. **Composition API with `<script setup>`** - All components use the modern Vue 3 syntax:

   ```vue
   <script setup lang="ts">
   import { ref, computed } from "vue"
   // Component logic here
   </script>
   ```

2. **Props with TypeScript interfaces**:

   ```typescript
   interface Props {
     variant?: "default" | "destructive"
     disabled?: boolean
   }
   const props = withDefaults(defineProps<Props>(), {
     variant: "default",
     disabled: false,
   })
   ```

3. **Class Variance Authority (CVA)** for component variants:
   ```typescript
   const buttonVariants = cva("base-classes", {
     variants: {
       variant: { default: "...", destructive: "..." },
       size: { sm: "...", default: "...", lg: "..." },
     },
     defaultVariants: { variant: "default", size: "default" },
   })
   ```

### Data Fetching Pattern

Uses TanStack Vue Query for server state management:

```typescript
// In composables/useIdentities.ts
export function useIdentities(params?: Ref<PaginationParams>) {
  return useQuery({
    queryKey: ["identities", params],
    queryFn: () => identitiesApi.list(params?.value),
    staleTime: 30_000,
  })
}

export function useCreateIdentity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateIdentityBody) => identitiesApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["identities"] })
      toast.success("Identity created successfully")
    },
    onError: (error: Error) => {
      toast.error(`Failed to create identity: ${error.message}`)
    },
  })
}
```

### API Client Pattern

HTTP requests use `ky` with centralized configuration:

```typescript
// In api/client.ts
export function createApiClient() {
  const settings = useSettingsStore()
  return ky.create({
    prefixUrl: settings.apiEndpoint,
    timeout: 30000,
    hooks: {
      /* logging hooks */
    },
  })
}
```

### Store Pattern

Pinia stores use the setup syntax:

```typescript
export const useThemeStore = defineStore("theme", () => {
  const theme = ref<ThemeMode>("dark")
  const isDark = computed(() => theme.value === "dark")

  function setTheme(newTheme: ThemeMode) {
    /* ... */
  }

  return { theme, isDark, setTheme }
})
```

## Coding Conventions

### TypeScript

- **Strict mode enabled** - No implicit any, strict null checks
- **Path aliases** - Use `@/` for `src/` imports
- **Interface naming** - Use PascalCase (e.g., `Identity`, `CreateIdentityBody`)
- **Type exports** - Export types from `src/types/api.ts`

### Vue Components

- **File naming** - PascalCase for components (e.g., `IdentityDetailView.vue`)
- **Component structure**:
  1. `<script setup lang="ts">` block first
  2. `<template>` block second
  3. `<style>` block last (if needed, scoped)
- **Emit typing** - Use typed emits with `defineEmits<{...}>()`

### Styling

- **Tailwind CSS** - Use utility classes exclusively
- **Custom colors** - Defined in `tailwind.config.js`:
  - `surface`, `surface-raised`, `surface-overlay` - Background colors
  - `text-primary`, `text-secondary`, `text-muted` - Text colors
  - `accent`, `accent-hover` - Accent colors (cyan)
  - `border`, `border-subtle`, `border-focus` - Border colors
  - `success`, `warning`, `destructive` - Status colors
- **Dark mode** - Class-based (`darkMode: 'class'`), dark is default
- **cn() utility** - Use for conditional class merging:
  ```typescript
  import { cn } from "@/lib/utils"
  const classes = cn("base-class", props.class, { "conditional-class": condition })
  ```

### Routing

- **Lazy loading** - All routes use dynamic imports
- **Named routes** - Always use `name` property for navigation
- **Nested routes** - AppShell wraps all main routes

## Testing

Tests use Vitest with Vue Test Utils:

```bash
bun run test          # Watch mode
bun run test:coverage # Coverage report
```

Test files should be placed alongside source files or in `__tests__/` directories.

## Deployment

### Docker

```bash
# Build image
docker build -t ory-admin-ui .

# Run container
docker run -p 8080:8080 ory-admin-ui
```

The Dockerfile uses:

- `oven/bun:1` for building
- `static-web-server:2` for serving (lightweight, ~2MB)

### CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`):

- Builds Docker images on push to main and PRs
- Uses cosign for image signing
- Kubescape security scanning
- Release Please for automated releases
- Images pushed to Docker Hub and GHCR

## Key Files Reference

| File                     | Purpose                                       |
| ------------------------ | --------------------------------------------- |
| `src/main.ts`            | App initialization (Pinia, Router, Vue Query) |
| `src/router/index.ts`    | Route definitions                             |
| `src/api/client.ts`      | HTTP client factory                           |
| `src/types/api.ts`       | API type definitions                          |
| `src/lib/utils.ts`       | Utility functions                             |
| `src/stores/settings.ts` | API endpoint configuration                    |
| `src/stores/theme.ts`    | Theme management                              |
| `tailwind.config.js`     | Tailwind customization                        |
| `vite.config.ts`         | Vite build configuration                      |
| `tsconfig.json`          | TypeScript configuration                      |

## Common Tasks

### Adding a New API Endpoint

1. Add types to `src/types/api.ts`
2. Create API functions in `src/api/` (e.g., `src/api/newFeature.ts`)
3. Create composable in `src/composables/` using Vue Query
4. Use composable in view components

### Adding a New View/Page

1. Create view component in `src/views/` (e.g., `NewFeatureView.vue`)
2. Add route in `src/router/index.ts`
3. Add navigation link in `src/components/layout/AppSidebar.vue`

### Adding a New UI Component

1. Create component in `src/components/ui/`
2. Use CVA for variants if needed
3. Follow existing component patterns (props interface, cn() utility)

### Modifying the Theme

1. Edit colors in `tailwind.config.js`
2. Update CSS variables in `src/assets/styles/main.css` if needed
3. Theme toggle is handled by `useThemeStore`

## Pre-commit Hooks

The project uses pre-commit with:

- Standard hooks (trailing whitespace, file size, JSON formatting)
- Commitlint (conventional commits required)
- ESLint with auto-fix

Run manually: `pre-commit run -a` or `just lint`

## Notes for AI Assistants

1. **Always use TypeScript** - The codebase is strictly typed
2. **Prefer Composition API** - Don't use Options API
3. **Use existing patterns** - Follow the established composable and component patterns
4. **Tailwind only** - Don't add custom CSS unless absolutely necessary
5. **Keep it simple** - This is an admin UI, prioritize functionality over complexity
6. **Test changes** - Run `bun run typecheck` and `bun run lint` before committing
7. **Conventional commits** - Use prefixes like `feat:`, `fix:`, `refactor:`, etc.
