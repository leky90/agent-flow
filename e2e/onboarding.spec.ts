import { expect, test } from "@playwright/test";

const API = "http://localhost:3001/api";

test.describe("Onboarding Tour", () => {
	test.beforeEach(async ({ page, request }) => {
		// Clean agents + tour flag
		const agents = await request.get(`${API}/agents`).then((r) => r.json());
		for (const a of agents) await request.delete(`${API}/agents/${a.id}`);
		await page.goto("http://localhost:5173");
		await page.evaluate(() => localStorage.clear());
	});

	test("guided tour: welcome → create agent → configure → chat", async ({ page }) => {
		await page.goto("http://localhost:5173");

		// Step 1: Welcome
		await expect(page.getByText("Welcome to Agent Flow")).toBeVisible({ timeout: 3000 });
		await page.getByRole("button", { name: "Next" }).click();

		// Step 2: Open agent list
		await expect(page.getByText("Step 1: Open the Agent List")).toBeVisible();
		// Open sidebar first, then advance
		await page.getByRole("button", { name: "Toggle agent list" }).click();
		await page.getByRole("button", { name: "Next" }).click();

		// Step 3: Create agent — waits for agent to appear
		await expect(page.getByText("Step 2: Create Your First Agent")).toBeVisible();
		await page.getByRole("button", { name: "New Agent" }).click();

		// Auto-advances after agent created
		await expect(page.getByText("Your Agent is Ready!")).toBeVisible({ timeout: 5000 });
		await page.getByRole("button", { name: "Next" }).click();

		// Step 5: Configure channel
		await expect(page.getByText("Step 3: Configure the Channel")).toBeVisible();

		// Skip to end for speed
		await page.getByRole("button", { name: "Skip" }).click();
		await expect(page.getByText("Welcome to Agent Flow")).not.toBeVisible();
	});

	test("does not show again after completing", async ({ page }) => {
		await page.goto("http://localhost:5173");
		await expect(page.getByText("Welcome to Agent Flow")).toBeVisible({ timeout: 3000 });
		await page.getByRole("button", { name: "Skip" }).click();

		await page.goto("http://localhost:5173");
		await page.waitForTimeout(1000);
		await expect(page.getByText("Welcome to Agent Flow")).not.toBeVisible();
	});

	test("Help button replays the tour", async ({ page }) => {
		await page.evaluate(() => localStorage.setItem("agent-flow-tour-seen", "true"));
		await page.goto("http://localhost:5173");
		await page.waitForTimeout(1000);
		await expect(page.getByText("Welcome to Agent Flow")).not.toBeVisible();

		await page.getByRole("button", { name: "Show tutorial" }).click();
		await expect(page.getByText("Welcome to Agent Flow")).toBeVisible();
	});
});
