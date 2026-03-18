import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

process.env.AGENT_FLOW_DATA = join(tmpdir(), `agent-flow-test-providers-${Date.now()}`);

import type { Agent } from "@agent-flow/shared";
import { ClaudeProvider } from "../infrastructure/providers/claude.ts";
import { CodexProvider } from "../infrastructure/providers/codex.ts";
import { CursorProvider } from "../infrastructure/providers/cursor.ts";
import { PiAgentProvider } from "../infrastructure/providers/pi-agent.ts";

function makeAgent(model: string): Agent {
	return {
		id: "test-id",
		name: "Test",
		model,
		systemPrompt: "",
		thinkingLevel: "medium",
		toolExecution: "parallel",
		tools: [],
		skills: [],
		channels: [],
	};
}

describe("Provider routing", () => {
	const piAgent = new PiAgentProvider();
	const cursor = new CursorProvider();
	const claude = new ClaudeProvider();
	const codex = new CodexProvider();

	it("PiAgentProvider handles standard models", () => {
		expect(piAgent.canHandle("anthropic/claude-sonnet-4")).toBe(true);
		expect(piAgent.canHandle("openai/gpt-4.1")).toBe(true);
		expect(piAgent.canHandle("cursor/cursor-agent")).toBe(false);
		expect(piAgent.canHandle("claude-cli/claude-code")).toBe(false);
		expect(piAgent.canHandle("codex/codex-agent")).toBe(false);
	});

	it("CursorProvider handles cursor/* models", () => {
		expect(cursor.canHandle("cursor/cursor-agent")).toBe(true);
		expect(cursor.canHandle("cursor/cursor-ask")).toBe(true);
		expect(cursor.canHandle("anthropic/claude")).toBe(false);
	});

	it("ClaudeProvider handles claude-cli/* models", () => {
		expect(claude.canHandle("claude-cli/claude-code")).toBe(true);
		expect(claude.canHandle("anthropic/claude")).toBe(false);
	});

	it("CodexProvider handles codex/* models", () => {
		expect(codex.canHandle("codex/codex-agent")).toBe(true);
		expect(codex.canHandle("openai/gpt")).toBe(false);
	});

	it("PiAgentProvider run returns async generator", async () => {
		const gen = piAgent.run(makeAgent("anthropic/claude-sonnet-4-20250514"), "hi");
		expect(gen[Symbol.asyncIterator]).toBeDefined();
		const events = [];
		for await (const e of gen) {
			events.push(e);
			if (e.type === "done") break;
		}
		expect(events[events.length - 1].type).toBe("done");
	});
});
