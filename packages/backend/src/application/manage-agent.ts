import type { Agent } from "@agent-flow/shared";
import { generateId } from "@agent-flow/shared";
import type { AgentRepository } from "../domain/ports/index.ts";
import { NotFoundError } from "../errors.ts";

export class ManageAgentUseCase {
	constructor(private repo: AgentRepository) {}

	list() {
		return this.repo.list();
	}

	get(id: string) {
		const agent = this.repo.get(id);
		if (!agent) throw new NotFoundError("Agent", id);
		return agent;
	}

	create(data: Omit<Agent, "id">): Agent {
		const agent: Agent = { ...data, id: generateId() };
		return this.repo.create(agent);
	}

	update(id: string, updates: Partial<Agent>): Agent {
		const updated = this.repo.update(id, updates);
		if (!updated) throw new NotFoundError("Agent", id);
		return updated;
	}

	remove(id: string): void {
		const removed = this.repo.remove(id);
		if (!removed) throw new NotFoundError("Agent", id);
	}
}
