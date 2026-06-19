import { defineConfig, devices } from '@playwright/test'

const PORT = 4321
const baseURL = `http://127.0.0.1:${PORT}`

export default defineConfig({
	testDir: './apps/web/e2e',
	fullyParallel: true,
	forbidOnly: Boolean(process.env.CI),
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	use: {
		baseURL,
		trace: 'on-first-retry',
	},
	webServer: {
		command: `bun run astro dev --host 127.0.0.1 --port ${PORT}`,
		cwd: 'apps/web',
		url: baseURL,
		reuseExistingServer: false,
		timeout: 120000,
		env: {
			SANITY_E2E_FIXTURES: '1',
			PUBLIC_SANITY_PROJECT_ID: 'e2e-fixtures',
			PUBLIC_SANITY_DATASET: 'e2e',
			PUBLIC_SERVER_URL: baseURL,
		},
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
	],
})
