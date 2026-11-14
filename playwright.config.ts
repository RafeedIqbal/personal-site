import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./sections",
  testMatch: "**/*.test.ts",
  fullyParallel: true,
  workers: 2,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3035",
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } } }],
  webServer: {
    command: "npm run start -- --hostname 127.0.0.1 --port 3035",
    url: "http://127.0.0.1:3035",
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
