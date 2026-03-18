import type { FastifyInstance } from "fastify";
import type { RunChatUseCase } from "../../application/run-chat.ts";
import { getRecentMetrics } from "../../infrastructure/middleware/event-bus.ts";
import { chatSchema, idParamSchema } from "../schemas.ts";

export function chatRoutes(useCase: RunChatUseCase) {
	return async (app: FastifyInstance) => {
		app.post<{
			Params: { id: string };
			Body: { message: string; sessionId?: string };
		}>(
			"/api/agents/:id/chat",
			{ schema: { ...idParamSchema, ...chatSchema } },
			async (req, reply) => {
				reply.raw.writeHead(200, {
					"Content-Type": "text/event-stream",
					"Cache-Control": "no-cache",
					Connection: "keep-alive",
				});

				try {
					for await (const event of useCase.execute(req.params.id, req.body.message)) {
						reply.raw.write(`data: ${JSON.stringify(event)}\n\n`);
						if (event.type === "done") break;
					}
				} catch (err) {
					const message = err instanceof Error ? err.message : "Unknown error";
					reply.raw.write(`data: ${JSON.stringify({ type: "error", message })}\n\n`);
				}

				reply.raw.end();
			},
		);

		app.post<{ Params: { id: string } }>(
			"/api/agents/:id/abort",
			{ schema: idParamSchema },
			async (req) => {
				useCase.abort(req.params.id);
				return { ok: true };
			},
		);

		app.get("/api/metrics", async () => getRecentMetrics());
	};
}
