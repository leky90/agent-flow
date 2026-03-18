import { expect, test } from "@playwright/test";

const API = "http://localhost:3001/api";

test.describe("Agent Flow E2E", () => {
	test.beforeEach(async ({ request }) => {
		// Clean up all agents before each test
		const agents = await request.get(`${API}/agents`).then((r) => r.json());
		for (const agent of agents) {
			await request.delete(`${API}/agents/${agent.id}`);
		}
	});

	test("shows empty canvas on first load", async ({ page }) => {
		await page.goto("/");
		await expect(page.locator(".react-flow__renderer")).toBeVisible();
		// No nodes on canvas
		await expect(page.locator(".react-flow__node")).toHaveCount(0);
	});

	test("create agent via sidebar", async ({ page }) => {
		await page.goto("/");

		// Open sidebar
		await page.getByRole("button", { name: "Toggle agent list" }).click();
		await expect(page.getByRole("heading", { name: "Agents" })).toBeVisible();

		// Click New Agent
		await page.getByRole("button", { name: "New Agent" }).click();

		// Agent node should appear on canvas (agent + default DM channel = 2 nodes)
		await expect(page.locator(".react-flow__node")).toHaveCount(2, {
			timeout: 5000,
		});

		// Agent node should have default name
		await expect(page.locator(".react-flow__node").first()).toContainText("New Agent");
	});

	test("edit agent name via panel", async ({ page }) => {
		await page.goto("/");

		// Create agent via sidebar
		await page.getByRole("button", { name: "Toggle agent list" }).click();
		await page.getByRole("button", { name: "New Agent" }).click();
		await expect(page.locator(".react-flow__node")).toHaveCount(2, {
			timeout: 5000,
		});

		// Close sidebar by clicking overlay to unblock canvas
		await page.locator(".fixed.inset-0.z-40").click();
		await page.waitForTimeout(200);

		// Click on the agent node to open panel
		await page.locator(".react-flow__node").first().click();

		// Panel should show "Edit Agent"
		await expect(page.getByText("Edit Agent")).toBeVisible();

		// Clear and type new name
		const nameInput = page.locator('[data-slot="input"]').first();
		await nameInput.clear();
		await nameInput.fill("My Custom Agent");

		// Node should update with new name
		await expect(page.locator(".react-flow__node").first()).toContainText("My Custom Agent");
	});

	test("delete agent via API and verify canvas", async ({ page, request }) => {
		// Create agent via API
		const createRes = await request.post(`${API}/agents`, {
			data: {
				name: "To Delete",
				model: "anthropic/claude-sonnet-4-20250514",
				systemPrompt: "",
				thinkingLevel: "medium",
				toolExecution: "parallel",
				tools: [],
				skills: [],
				channels: [],
			},
		});
		const agent = await createRes.json();

		await page.goto("/");
		await expect(page.locator(".react-flow__node")).toHaveCount(1, {
			timeout: 5000,
		});

		// Delete via API
		await request.delete(`${API}/agents/${agent.id}`);

		// Reload and verify canvas is empty
		await page.goto("/");
		await expect(page.locator(".react-flow__node")).toHaveCount(0, {
			timeout: 5000,
		});
	});

	test("toggle dark/light mode", async ({ page }) => {
		await page.goto("/");

		// Check initial state (dark mode by default if preference or localStorage)
		const html = page.locator("html");

		// Click theme toggle
		const toggleButton = page.getByRole("button", {
			name: /Switch to (light|dark) mode/,
		});
		await toggleButton.click();

		// Verify the class toggled
		const hasDark = await html.evaluate((el) => el.classList.contains("dark"));

		// Click again to toggle back
		await toggleButton.click();
		const hasDarkAfter = await html.evaluate((el) => el.classList.contains("dark"));

		// Should have toggled
		expect(hasDark).not.toBe(hasDarkAfter);
	});

	test("API CRUD roundtrip", async ({ request }) => {
		// Create
		const createRes = await request.post(`${API}/agents`, {
			data: {
				name: "E2E Agent",
				model: "anthropic/claude-sonnet-4-20250514",
				systemPrompt: "Test prompt",
				thinkingLevel: "medium",
				toolExecution: "parallel",
				tools: [],
				skills: [],
				channels: [
					{
						id: "ch1",
						name: "DM",
						provider: "anthropic",
						model: "claude-sonnet-4-20250514",
						isDM: true,
					},
				],
			},
		});
		expect(createRes.ok()).toBeTruthy();
		const agent = await createRes.json();
		expect(agent.id).toBeDefined();
		expect(agent.name).toBe("E2E Agent");

		// Read
		const getRes = await request.get(`${API}/agents/${agent.id}`);
		expect(getRes.ok()).toBeTruthy();
		expect((await getRes.json()).name).toBe("E2E Agent");

		// Update
		const updateRes = await request.put(`${API}/agents/${agent.id}`, {
			data: { name: "Updated E2E Agent" },
		});
		expect(updateRes.ok()).toBeTruthy();
		expect((await updateRes.json()).name).toBe("Updated E2E Agent");

		// List
		const listRes = await request.get(`${API}/agents`);
		const list = await listRes.json();
		expect(list).toHaveLength(1);
		expect(list[0].name).toBe("Updated E2E Agent");

		// Delete
		const delRes = await request.delete(`${API}/agents/${agent.id}`);
		expect(delRes.ok()).toBeTruthy();

		// Verify gone
		const listAfter = await request.get(`${API}/agents`);
		expect(await listAfter.json()).toHaveLength(0);
	});

	test("chat SSE endpoint streams events", async ({ request }) => {
		// Create agent first
		const createRes = await request.post(`${API}/agents`, {
			data: {
				name: "Chat Agent",
				model: "anthropic/claude-sonnet-4-20250514",
				systemPrompt: "",
				thinkingLevel: "medium",
				toolExecution: "parallel",
				tools: [],
				skills: [],
				channels: [],
			},
		});
		const agent = await createRes.json();

		// Send chat request
		const chatRes = await request.post(`${API}/agents/${agent.id}/chat`, {
			data: { message: "Hello" },
		});
		expect(chatRes.ok()).toBeTruthy();

		const body = await chatRes.text();
		// Should contain SSE data lines
		expect(body).toContain("data: ");
		// Should end with done event
		expect(body).toContain('"type":"done"');
	});
});
