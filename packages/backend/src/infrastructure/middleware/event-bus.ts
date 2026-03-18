import type { ChatSSEEvent } from "@agent-flow/shared";
import type { EventBusPort, EventContext, EventMiddleware } from "../../domain/ports/index.ts";

/**
 * Event bus that applies middleware to a stream of ChatSSEEvents.
 * Wraps an async generator and yields transformed events.
 */
export class EventBus implements EventBusPort {
	private middlewares: EventMiddleware[] = [];

	use(middleware: EventMiddleware): this {
		this.middlewares.push(middleware);
		return this;
	}

	async *pipe(
		source: AsyncGenerator<ChatSSEEvent>,
		context: EventContext,
	): AsyncGenerator<ChatSSEEvent> {
		for await (const event of source) {
			let current: ChatSSEEvent | null = event;

			for (const mw of this.middlewares) {
				if (!current) break;
				current = mw(current, context);
			}

			if (current) yield current;
		}
	}
}

// ── Built-in middleware ──

/** Logs all events to console with timing */
export const loggingMiddleware: EventMiddleware = (event, ctx) => {
	const elapsed = Date.now() - ctx.startedAt;
	const tag = `[${ctx.agentName}]`;

	switch (event.type) {
		case "message_start":
			console.log(`${tag} message_start (+${elapsed}ms)`);
			break;
		case "message_end":
			console.log(`${tag} message_end (+${elapsed}ms) ${event.text.length} chars`);
			break;
		case "tool_start":
			console.log(`${tag} tool_start: ${event.toolName} (+${elapsed}ms)`);
			break;
		case "tool_end":
			console.log(
				`${tag} tool_end: ${event.toolName} ${event.isError ? "ERROR" : "ok"} (+${elapsed}ms)`,
			);
			break;
		case "error":
			console.error(`${tag} error: ${event.message} (+${elapsed}ms)`);
			break;
		case "done":
			console.log(`${tag} done (+${elapsed}ms)`);
			break;
	}

	return event;
};

/** Tracks metrics: message count, tool calls, errors, duration */
export interface ChatMetrics {
	agentId: string;
	model: string;
	messageCount: number;
	toolCalls: number;
	errors: number;
	durationMs: number;
}

const recentMetrics: ChatMetrics[] = [];
const MAX_METRICS = 100;

export function metricsMiddleware(): EventMiddleware {
	return (event, ctx) => {
		// Lazily create metrics entry
		let metrics = recentMetrics.find((m) => m.agentId === ctx.agentId && m.durationMs === 0);
		if (!metrics && event.type === "message_start") {
			metrics = {
				agentId: ctx.agentId,
				model: ctx.model,
				messageCount: 0,
				toolCalls: 0,
				errors: 0,
				durationMs: 0,
			};
			recentMetrics.push(metrics);
			if (recentMetrics.length > MAX_METRICS) recentMetrics.shift();
		}

		if (metrics) {
			switch (event.type) {
				case "message_end":
					metrics.messageCount++;
					break;
				case "tool_start":
					metrics.toolCalls++;
					break;
				case "error":
					metrics.errors++;
					break;
				case "done":
					metrics.durationMs = Date.now() - ctx.startedAt;
					break;
			}
		}

		return event;
	};
}

/** Get recent chat metrics */
export function getRecentMetrics(): ChatMetrics[] {
	return [...recentMetrics];
}
