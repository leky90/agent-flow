import type { Agent, ChatSSEEvent } from "@agent-flow/shared";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";

async function json<T>(res: Response): Promise<T> {
	if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
	return res.json() as Promise<T>;
}

export const api = {
	agents: {
		list: () => fetch(`${API}/agents`).then((r) => json<Agent[]>(r)),

		get: (id: string) => fetch(`${API}/agents/${id}`).then((r) => json<Agent>(r)),

		create: (data: Omit<Agent, "id">) =>
			fetch(`${API}/agents`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			}).then((r) => json<Agent>(r)),

		update: (id: string, data: Partial<Agent>) =>
			fetch(`${API}/agents/${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			}).then((r) => json<Agent>(r)),

		delete: (id: string) =>
			fetch(`${API}/agents/${id}`, { method: "DELETE" }).then((r) => json<{ ok: boolean }>(r)),
	},

	chat: {
		stream: async function* (agentId: string, message: string): AsyncGenerator<ChatSSEEvent> {
			const res = await fetch(`${API}/agents/${agentId}/chat`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ message }),
			});

			if (!res.ok || !res.body) {
				throw new Error(`Chat API ${res.status}`);
			}

			const reader = res.body.getReader();
			const decoder = new TextDecoder();
			let buffer = "";

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split("\n");
				buffer = lines.pop() ?? "";

				for (const line of lines) {
					if (line.startsWith("data: ")) {
						const data = line.slice(6).trim();
						if (data) {
							yield JSON.parse(data) as ChatSSEEvent;
						}
					}
				}
			}
		},
	},
};
