import path from "node:path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    setupFiles: [],
    include: ["src/**/*.test.ts", "src/**/*.spec.ts"],
    exclude: ["e2e/**", "node_modules/**"],
  },
})

