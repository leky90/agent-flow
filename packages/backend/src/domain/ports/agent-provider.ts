import type { Agent, ChatSSEEvent } from "@agent-flow/shared";

/** Port: agent execution provider */
export interface AgentProvider {
	canHandle(model: string): boolean;
	run(config: Agent, message: string): AsyncGenerator<ChatSSEEvent>;
	abort(agentId: string): void;
}
