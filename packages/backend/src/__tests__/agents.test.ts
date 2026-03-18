import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";

// Override data dir for test isolation
process.env.AGENT_FLOW_DATA = join(tmpdir(), `agent-flow-test-${Date.now()}`);

const { createApp } = await import("../app.ts");
const { _resetStore } = await import("../infrastructure/db/agent-store.ts");

const sampleAgent = {
	name: "Test Agent",
	model: "anthropic/claude-sonnet-4-20250514",
	systemPrompt: "You are helpful.",
	thinkingLevel: "medium" as const,
	toolExecution: "parallel" as const,
	tools: [],
	skills: [],
	channels: [],
};

describe("Agent CRUD routes", () => {
	let app: Awaited<ReturnType<typeof createApp>>;

	beforeEach(async () => {
		app = await createApp();
		_resetStore();
	});

	it("GET /api/agents returns empty array initially", async () => {
		const res = await app.inject({ method: "GET", url: "/api/agents" });
		expect(res.statusCode).toBe(200);
		expect(res.json()).toEqual([]);
	});

	it("POST /api/agents creates an agent with generated id", async () => {
		const res = await app.inject({
			method: "POST",
			url: "/api/agents",
			payload: sampleAgent,
		});
		expect(res.statusCode).toBe(200);
		const body = res.json();
		expect(body.id).toBeDefined();
		expect(body.name).toBe("Test Agent");
	});

	it("GET /api/agents lists created agents", async () => {
		await app.inject({ method: "POST", url: "/api/agents", payload: sampleAgent });
		await app.inject({
			method: "POST",
			url: "/api/agents",
			payload: { ...sampleAgent, name: "Agent 2" },
		});

		const res = await app.inject({ method: "GET", url: "/api/agents" });
		expect(res.json()).toHaveLength(2);
	});

	it("GET /api/agents/:id returns a specific agent", async () => {
		const createRes = await app.inject({
			method: "POST",
			url: "/api/agents",
			payload: sampleAgent,
		});
		const id = createRes.json().id;

		const res = await app.inject({ method: "GET", url: `/api/agents/${id}` });
		expect(res.statusCode).toBe(200);
		expect(res.json().name).toBe("Test Agent");
	});

	it("GET /api/agents/:id returns 404 for unknown id", async () => {
		const res = await app.inject({ method: "GET", url: "/api/agents/nonexistent" });
		expect(res.statusCode).toBe(404);
	});

	it("PUT /api/agents/:id updates an agent", async () => {
		const createRes = await app.inject({
			method: "POST",
			url: "/api/agents",
			payload: sampleAgent,
		});
		const id = createRes.json().id;

		const res = await app.inject({
			method: "PUT",
			url: `/api/agents/${id}`,
			payload: { name: "Updated" },
		});
		expect(res.statusCode).toBe(200);
		expect(res.json().name).toBe("Updated");
		expect(res.json().id).toBe(id);
	});

	it("PUT /api/agents/:id returns 404 for unknown id", async () => {
		const res = await app.inject({ method: "PUT", url: "/api/agents/x", payload: { name: "X" } });
		expect(res.statusCode).toBe(404);
	});

	it("DELETE /api/agents/:id removes an agent", async () => {
		const createRes = await app.inject({
			method: "POST",
			url: "/api/agents",
			payload: sampleAgent,
		});
		const id = createRes.json().id;

		const delRes = await app.inject({ method: "DELETE", url: `/api/agents/${id}` });
		expect(delRes.statusCode).toBe(200);

		const getRes = await app.inject({ method: "GET", url: `/api/agents/${id}` });
		expect(getRes.statusCode).toBe(404);
	});

	it("DELETE /api/agents/:id returns 404 for unknown id", async () => {
		const res = await app.inject({ method: "DELETE", url: "/api/agents/x" });
		expect(res.statusCode).toBe(404);
	});
});
