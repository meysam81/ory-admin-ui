/// <reference types="vite/client" />

declare const __APP_VERSION__: string

declare module "*.vue" {
  import type { DefineComponent } from "vue"
  const component: DefineComponent<object, object, unknown>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_DEFAULT_API_ENDPOINT: string
  readonly VITE_DEFAULT_PUBLIC_API_ENDPOINT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
