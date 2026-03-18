import type { Agent } from "./agent.ts";

export type CreateAgentRequest = Omit<Agent, "id">;
export type UpdateAgentRequest = Partial<Omit<Agent, "id">>;
export type AgentResponse = Agent;

export interface ChatRequest {
	message: string;
	sessionId?: string;
}

export type ChatSSEEvent =
	| { type: "message_start" }
	| { type: "message_delta"; text: string }
	| { type: "message_end"; text: string }
	| { type: "tool_start"; toolName: string }
	| { type: "tool_end"; toolName: string; isError: boolean }
	| { type: "error"; message: string }
	| { type: "done" };
