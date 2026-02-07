import { defineConfig, mergeConfig } from "vitest/config"
import viteConfig from "./vite.config"

export default mergeConfig(
  viteConfig({ mode: "test", command: "serve" }),
  defineConfig({
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      include: ["src/**/*.test.ts"],
      coverage: {
        provider: "v8",
        reporter: ["text", "lcov"],
        include: ["src/**/*.{ts,vue}"],
        exclude: [
          "src/components/ui/**",
          "src/test/**",
          "src/vite-env.d.ts",
          "src/main.ts",
          "src/**/*.d.ts",
        ],
        thresholds: {
          statements: 30,
          branches: 25,
          functions: 28,
          lines: 30,
        },
      },
    },
  })
)
