import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: 'http://localhost:3300', trace: 'retain-on-failure' },
  webServer: {
    command: 'pnpm build && pnpm start -p 3300',
    url: 'http://localhost:3300',
    reuseExistingServer: false,
    timeout: 300_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
  ],
})
