import vue from "@vitejs/plugin-vue"
import { resolve } from "path"
import { defineConfig, loadEnv } from "vite"
import compression from "vite-plugin-compression2"
import { createHtmlPlugin } from "vite-plugin-html"
import { version } from "./package.json"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  return {
    define: {
      __APP_VERSION__: JSON.stringify(version),
    },
    plugins: [
      vue(),
      createHtmlPlugin({
        minify: true,
      }),
      compression({
        threshold: 1024,
        algorithms: ["gzip", "brotli"],
      }),
    ],
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
    },
    server: {
      port: parseInt(env.PORT || "3000", 10),
      host: true,
      cors: false,
    },
    build: {
      target: "esnext",
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
        format: {
          comments: false,
        },
      },
      cssMinify: "lightningcss",
      rollupOptions: {
        output: {
          manualChunks: {
            vue: ["vue", "vue-router", "pinia"],
            query: ["@tanstack/vue-query"],
            ui: ["radix-vue", "lucide-vue-next"],
          },
        },
      },
    },
    optimizeDeps: {
      include: ["vue", "vue-router", "pinia", "@tanstack/vue-query"],
    },
  }
})
