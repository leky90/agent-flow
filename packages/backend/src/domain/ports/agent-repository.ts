import type { Agent } from "@agent-flow/shared";

/** Port: persistence layer for agent configurations */
export interface AgentRepository {
	list(): Agent[];
	get(id: string): Agent | undefined;
	create(agent: Agent): Agent;
	update(id: string, updates: Partial<Agent>): Agent | null;
	remove(id: string): boolean;
}
