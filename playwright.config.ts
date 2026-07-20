import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  retries: 0,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev -- -p 3000",
    port: 3000,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
})

