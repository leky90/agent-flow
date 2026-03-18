import { DEFAULT_MODEL, DEFAULT_PROVIDER, generateId } from "@agent-flow/shared";
import type { AgentChannel } from "./types";

export function createDefaultChannel(overrides?: Partial<AgentChannel>): AgentChannel {
	return {
		id: generateId(),
		name: "Direct Message",
		provider: DEFAULT_PROVIDER,
		model: DEFAULT_MODEL,
		isDM: true,
		...overrides,
	};
}
