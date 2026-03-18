import type { ChatSSEEvent } from "@agent-flow/shared";

export interface EventContext {
	agentId: string;
	agentName: string;
	model: string;
	startedAt: number;
}

/**
 * Port: middleware pipeline for event processing.
 * Return event to pass through, null to drop.
 */
export type EventMiddleware = (event: ChatSSEEvent, context: EventContext) => ChatSSEEvent | null;

export interface EventBusPort {
	use(middleware: EventMiddleware): this;
	pipe(source: AsyncGenerator<ChatSSEEvent>, context: EventContext): AsyncGenerator<ChatSSEEvent>;
}
