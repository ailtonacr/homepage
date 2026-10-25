import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["line"], ["html", { outputFolder: "playwright-report", open: "never" }]],
  use: { baseURL: "http://127.0.0.1:4321", trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, locale: "pt-BR" } },
    { name: "mobile-chromium", use: { ...devices["Pixel 7"], locale: "pt-BR" } },
    { name: "mobile-webkit", use: { ...devices["iPhone 13"], locale: "pt-BR" } },
  ],
  webServer: {
    command: "npx wrangler dev --ip 127.0.0.1 --port 4321 --local",
    url: "http://127.0.0.1:4321/",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
