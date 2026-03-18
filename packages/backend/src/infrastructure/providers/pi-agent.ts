import type { Agent, ChatSSEEvent } from "@agent-flow/shared";
import { Agent as PiAgent } from "@mariozechner/pi-agent-core";
import { getModel, registerBuiltInApiProviders } from "@mariozechner/pi-ai";
import { resolveTools } from "../../application/tool-registry.ts";
import type { AgentProvider } from "../../domain/ports/index.ts";

registerBuiltInApiProviders();

const agents = new Map<string, PiAgent>();

function getOrCreatePiAgent(config: Agent): PiAgent {
	let piAgent = agents.get(config.id);
	if (!piAgent) {
		piAgent = new PiAgent();
		agents.set(config.id, piAgent);
	}

	const [provider, ...modelParts] = config.model.split("/");
	const modelId = modelParts.join("/");

	try {
		const model = getModel(provider as any, modelId as any);
		piAgent.setModel(model);
	} catch (err) {
		console.warn(
			`Model ${config.model} not found in registry:`,
			err instanceof Error ? err.message : err,
		);
	}

	if (config.systemPrompt) piAgent.setSystemPrompt(config.systemPrompt);
	piAgent.setThinkingLevel(config.thinkingLevel);
	piAgent.setToolExecution(config.toolExecution);
	piAgent.setTools(resolveTools(config.tools));

	return piAgent;
}

export class PiAgentProvider implements AgentProvider {
	private acpPrefixes = ["cursor/", "claude-cli/", "codex/"];

	canHandle(model: string) {
		return !this.acpPrefixes.some((p) => model.startsWith(p));
	}

	async *run(config: Agent, message: string): AsyncGenerator<ChatSSEEvent> {
		const piAgent = getOrCreatePiAgent(config);

		const events: ChatSSEEvent[] = [];
		let done = false;
		let resolveWait: (() => void) | null = null;

		const extractText = (content: { type: string; text?: string }[]) =>
			content
				.filter((c): c is { type: "text"; text: string } => c.type === "text")
				.map((c) => c.text)
				.join("");

		const unsubscribe = piAgent.subscribe((event) => {
			switch (event.type) {
				case "message_start":
					events.push({ type: "message_start" });
					break;
				case "message_update": {
					const text = extractText(event.message.content);
					if (text) events.push({ type: "message_delta", text });
					break;
				}
				case "message_end": {
					events.push({ type: "message_end", text: extractText(event.message.content) });
					break;
				}
				case "tool_execution_start":
					events.push({ type: "tool_start", toolName: event.toolName });
					break;
				case "tool_execution_end":
					events.push({ type: "tool_end", toolName: event.toolName, isError: event.isError });
					break;
				case "agent_end":
					events.push({ type: "done" });
					done = true;
					break;
			}
			if (resolveWait) {
				resolveWait();
				resolveWait = null;
			}
		});

		const promptPromise = piAgent.prompt(message).catch((err) => {
			events.push({ type: "error", message: err instanceof Error ? err.message : String(err) });
			events.push({ type: "done" });
			done = true;
			if (resolveWait) {
				resolveWait();
				resolveWait = null;
			}
		});

		try {
			while (!done) {
				if (events.length > 0) {
					const batch = events.splice(0, events.length);
					for (const event of batch) {
						yield event;
						if (event.type === "done") return;
					}
				} else {
					await new Promise<void>((resolve) => {
						resolveWait = resolve;
						setTimeout(resolve, 100);
					});
				}
			}
			for (const event of events) yield event;
		} finally {
			unsubscribe();
			await promptPromise;
		}
	}

	abort(agentId: string) {
		const piAgent = agents.get(agentId);
		if (piAgent) piAgent.abort();
	}
}
