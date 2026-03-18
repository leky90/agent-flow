import type { ChatSSEEvent } from "@agent-flow/shared";
import type {
	AgentProvider,
	AgentRepository,
	EventBusPort,
	EventContext,
} from "../domain/ports/index.ts";
import { NotFoundError } from "../errors.ts";

export class RunChatUseCase {
	constructor(
		private repo: AgentRepository,
		private providers: AgentProvider[],
		private eventBus: EventBusPort,
	) {}

	private getProvider(model: string): AgentProvider {
		const provider = this.providers.find((p) => p.canHandle(model));
		if (!provider) throw new Error(`No provider found for model: ${model}`);
		return provider;
	}

	async *execute(agentId: string, message: string): AsyncGenerator<ChatSSEEvent> {
		const agent = this.repo.get(agentId);
		if (!agent) throw new NotFoundError("Agent", agentId);

		const provider = this.getProvider(agent.model);
		const context: EventContext = {
			agentId: agent.id,
			agentName: agent.name,
			model: agent.model,
			startedAt: Date.now(),
		};

		yield* this.eventBus.pipe(provider.run(agent, message), context);
	}

	abort(agentId: string) {
		for (const p of this.providers) p.abort(agentId);
	}
}
