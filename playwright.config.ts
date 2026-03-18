import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "./e2e",
	timeout: 30_000,
	retries: 0,
	workers: 1,
	use: {
		baseURL: "http://localhost:5173",
		headless: true,
	},
	webServer: [
		{
			command: "pnpm dev:backend",
			port: 3001,
			reuseExistingServer: true,
		},
		{
			command: "pnpm dev:frontend",
			port: 5173,
			reuseExistingServer: true,
		},
	],
});
