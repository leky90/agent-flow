import { expect, test } from "@playwright/test";

// Serial execution to avoid shared backend state conflicts
test.describe.configure({ mode: "serial" });

const API = "http://localhost:3001/api";

// Helper: create an agent with tools/skills/channels via API
async function createFullAgent(request: any) {
	const res = await request.post(`${API}/agents`, {
		data: {
			name: "Test Agent",
			model: "anthropic/claude-sonnet-4-20250514",
			systemPrompt: "You are helpful.",
			thinkingLevel: "high",
			toolExecution: "parallel",
			tools: [
				{ id: "t1", name: "read_file", description: "Read file", parameters: [] },
				{ id: "t2", name: "write_file", description: "Write file", parameters: [] },
			],
			skills: [{ id: "s1", name: "code-review", description: "Review code" }],
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
	return res.json();
}

test.describe("Feature Spec Tests", () => {
	test.beforeEach(async ({ request }) => {
		const agents = await request.get(`${API}/agents`).then((r) => r.json());
		for (const a of agents) await request.delete(`${API}/agents/${a.id}`);
	});

	// === F1: Canvas Board ===
	test.describe("F1: Canvas Board", () => {
		test("canvas renders with React Flow", async ({ page }) => {
			await page.goto("/");
			await expect(page.locator(".react-flow")).toBeVisible();
		});

		test("has zoom controls", async ({ page }) => {
			await page.goto("/");
			await expect(page.getByRole("button", { name: "Zoom In" })).toBeVisible();
			await expect(page.getByRole("button", { name: "Zoom Out" })).toBeVisible();
			await expect(page.getByRole("button", { name: "Fit View" })).toBeVisible();
		});

		test("has minimap", async ({ page }) => {
			await page.goto("/");
			await expect(page.getByRole("img", { name: "Mini Map" })).toBeVisible();
		});
	});

	// === F2: Agent CRUD ===
	test.describe("F2: Agent CRUD", () => {
		test("create agent via sidebar", async ({ page }) => {
			await page.goto("/");
			await page.getByRole("button", { name: "Toggle agent list" }).click();
			await page.getByRole("button", { name: "New Agent" }).click();
			await expect(page.locator(".react-flow__node")).toHaveCount(2, { timeout: 5000 });
		});

		test("agent persists to backend", async ({ page, request }) => {
			await page.goto("/");
			await page.getByRole("button", { name: "Toggle agent list" }).click();
			await page.getByRole("button", { name: "New Agent" }).click();
			await page.waitForTimeout(500);

			const agents = await request.get(`${API}/agents`).then((r) => r.json());
			expect(agents.length).toBeGreaterThanOrEqual(1);
			const hasNewAgent = agents.some((a: { name: string }) => a.name === "New Agent");
			expect(hasNewAgent).toBe(true);
		});

		test("edit agent opens panel", async ({ page }) => {
			await page.goto("/");
			await page.getByRole("button", { name: "Toggle agent list" }).click();
			await page.getByRole("button", { name: "New Agent" }).click();
			await expect(page.locator(".react-flow__node")).toHaveCount(2, { timeout: 5000 });

			// Close sidebar overlay
			await page.locator(".fixed.inset-0.z-40").click();
			await page.waitForTimeout(200);

			await page.locator(".react-flow__node").first().click();
			await expect(page.getByText("Edit Agent")).toBeVisible();
		});

		test("delete agent via API clears canvas", async ({ page, request }) => {
			const agent = await createFullAgent(request);
			await page.goto("/");
			await expect(page.locator(".react-flow__node")).toHaveCount(5, { timeout: 5000 });

			await request.delete(`${API}/agents/${agent.id}`);
			await page.goto("/");
			await expect(page.locator(".react-flow__node")).toHaveCount(0, { timeout: 5000 });
		});
	});

	// === F3-F5: Tool/Skill/Channel CRUD ===
	test.describe("F3-F5: Tool/Skill/Channel CRUD", () => {
		test("agent with tools/skills/channels shows all child nodes", async ({ page, request }) => {
			await createFullAgent(request);
			await page.goto("/");
			// 1 agent + 2 tools + 1 skill + 1 channel = 5 nodes
			await expect(page.locator(".react-flow__node")).toHaveCount(5, { timeout: 5000 });
		});

		test("child nodes are connected via edges", async ({ page, request }) => {
			await createFullAgent(request);
			await page.goto("/");
			await page.waitForTimeout(500);
			// 4 edges: t1, t2, s1, ch1
			const edges = page.locator(".react-flow__edge");
			await expect(edges).toHaveCount(4, { timeout: 5000 });
		});

		test("tool/skill/channel CRUD via API", async ({ request }) => {
			const agent = await createFullAgent(request);

			// Update agent: add a new tool
			const updated = await request.put(`${API}/agents/${agent.id}`, {
				data: {
					tools: [
						...agent.tools,
						{ id: "t3", name: "new_tool", description: "New", parameters: [] },
					],
				},
			});
			const updatedAgent = await updated.json();
			expect(updatedAgent.tools).toHaveLength(3);

			// Remove a skill
			await request.put(`${API}/agents/${agent.id}`, {
				data: { skills: [] },
			});
			const after = await request.get(`${API}/agents/${agent.id}`).then((r) => r.json());
			expect(after.skills).toHaveLength(0);
		});
	});

	// === F6: Node Connections ===
	test.describe("F6: Node Connections", () => {
		test("edges connect agent to children", async ({ page, request }) => {
			await createFullAgent(request);
			await page.goto("/");
			await page.waitForTimeout(500);

			// Each edge should reference the agent as source
			const edgeGroups = page.locator("[data-testid^='rf__edge']");
			const count = await edgeGroups.count();
			expect(count).toBeGreaterThanOrEqual(4);
		});
	});

	// === F7: Collapse/Expand ===
	test.describe("F7: Collapse/Expand", () => {
		test("clicking toggle collapses tool child nodes", async ({ page, request }) => {
			await createFullAgent(request);
			await page.goto("/");
			await expect(page.locator(".react-flow__node")).toHaveCount(5, { timeout: 5000 });

			// Click the tools toggle button on the agent node (first button in counts row)
			const agentNode = page.locator(".react-flow__node-agent").first();
			const toolsToggle = agentNode.locator("button").first();
			await toolsToggle.click();

			// 2 tool nodes should be hidden → 5 - 2 = 3 visible
			await expect(page.locator(".react-flow__node:not([style*='display: none'])")).toHaveCount(3, {
				timeout: 3000,
			});
		});
	});

	// === F8: Right-Click Context Menu ===
	test.describe("F8: Right-Click Context Menu", () => {
		test("right-click agent shows context menu", async ({ page, request }) => {
			await createFullAgent(request);
			await page.goto("/");
			await page.waitForTimeout(500);

			await page.locator(".react-flow__node-agent").first().click({ button: "right" });
			await expect(page.getByRole("button", { name: "Edit" })).toBeVisible();
			await expect(page.getByRole("button", { name: "Add Tool" })).toBeVisible();
			await expect(page.getByRole("button", { name: "Delete" })).toBeVisible();
		});

		test("right-click canvas shows pane menu", async ({ page }) => {
			await page.goto("/");
			await page.locator(".react-flow__pane").click({ button: "right" });
			await expect(page.getByText("Add Agent")).toBeVisible();
			await expect(page.getByText("Auto Layout")).toBeVisible();
		});
	});

	// === F9: Drag & Drop ===
	test.describe("F9: Drag & Drop", () => {
		test("nodes are draggable", async ({ page, request }) => {
			await createFullAgent(request);
			await page.goto("/");
			await expect(page.locator(".react-flow__node")).toHaveCount(5, { timeout: 5000 });

			// React Flow nodes have draggable class by default
			const node = page.locator(".react-flow__node").first();
			const cls = await node.getAttribute("class");
			expect(cls).toContain("draggable");
		});
	});

	// === F10: Auto Layout ===
	test.describe("F10: Auto Layout", () => {
		test("auto layout available via pane context menu", async ({ page }) => {
			await page.goto("/");

			// Right-click empty canvas (no agents needed)
			await page
				.locator(".react-flow__pane")
				.click({ button: "right", position: { x: 100, y: 100 } });
			await expect(page.getByRole("button", { name: "Auto Layout" })).toBeVisible();
			await expect(page.getByRole("button", { name: "Add Agent" })).toBeVisible();
		});
	});

	// === F11: Backend Data Fetching ===
	test.describe("F11: Backend Data Fetching", () => {
		test("agents load from backend on startup", async ({ page, request }) => {
			await createFullAgent(request);
			await page.goto("/");
			await expect(page.locator(".react-flow__node")).toHaveCount(5, { timeout: 5000 });
		});

		test("agent created in backend appears after reload", async ({ page, request }) => {
			await page.goto("/");
			await expect(page.locator(".react-flow__node")).toHaveCount(0);

			await createFullAgent(request);
			await page.goto("/");
			await expect(page.locator(".react-flow__node")).toHaveCount(5, { timeout: 5000 });
		});
	});
});
