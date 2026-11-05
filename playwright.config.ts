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
    // Dummy key: the contact action constructs Resend at module load; validation errors never reach send().
    env: { RESEND_API_KEY: 're_test_dummy' },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
  ],
})
