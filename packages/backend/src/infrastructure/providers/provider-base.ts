import type { Agent, ChatSSEEvent } from "@agent-flow/shared";
import type { AgentProvider } from "../../domain/ports/index.ts";
import type { AcpClient, JsonRpcResponse } from "./acp-client.ts";

/**
 * Base class for ACP-based providers (Cursor, Claude, Codex).
 * Subclasses only need to provide command/args/env and optional mode logic.
 */
export abstract class AcpProvider implements AgentProvider {
	private clients = new Map<string, AcpClient>();

	abstract canHandle(model: string): boolean;
	protected abstract createClient(): AcpClient;
	protected getMode(_modelId: string): "agent" | "ask" {
		return "agent";
	}

	private getClient(agentId: string): AcpClient {
		let client = this.clients.get(agentId);
		if (!client) {
			client = this.createClient();
			this.clients.set(agentId, client);
		}
		return client;
	}

	async *run(config: Agent, message: string): AsyncGenerator<ChatSSEEvent> {
		const client = this.getClient(config.id);
		const modelId = config.model.split("/")[1] ?? "";
		const mode = this.getMode(modelId);

		try {
			await client.newSession(mode);
			yield { type: "message_start" };

			const unsubscribe = client.onNotification((msg: JsonRpcResponse) => {
				if (msg.method === "session/request_permission") {
					client.sendNotification("session/permission_response", {
						approved: true,
						...(msg.params ?? {}),
					});
				}
			});

			try {
				const response = await client.prompt(message);

				if (response.error) {
					yield { type: "error", message: response.error.message };
					yield { type: "done" };
					return;
				}

				const result = response.result as
					| { content?: string; text?: string; message?: string }
					| string
					| null;

				let text = "";
				if (typeof result === "string") text = result;
				else if (result)
					text = result.content ?? result.text ?? result.message ?? JSON.stringify(result);

				if (text) {
					yield { type: "message_delta", text };
					yield { type: "message_end", text };
				} else {
					yield { type: "message_end", text: "" };
				}
			} finally {
				unsubscribe();
			}

			yield { type: "done" };
		} catch (err) {
			yield { type: "error", message: err instanceof Error ? err.message : String(err) };
			yield { type: "done" };
		}
	}

	abort(agentId: string) {
		const client = this.clients.get(agentId);
		if (client) {
			client.abort();
			this.clients.delete(agentId);
		}
	}
}
