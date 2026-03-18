import { DEFAULT_MODEL, DEFAULT_PROVIDER, generateId } from "@agent-flow/shared";
import type { Agent } from "./types";

export function createDefaultAgent(overrides?: Partial<Agent>): Agent {
	return {
		id: generateId(),
		name: "New Agent",
		model: `${DEFAULT_PROVIDER}/${DEFAULT_MODEL}`,
		systemPrompt: "",
		thinkingLevel: "medium",
		toolExecution: "parallel",
		tools: [],
		skills: [],
		channels: [],
		...overrides,
	};
}
