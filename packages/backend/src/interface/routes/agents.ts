import type { Agent } from "@agent-flow/shared";
import type { FastifyInstance } from "fastify";
import type { ManageAgentUseCase } from "../../application/manage-agent.ts";
import { getAvailableToolNames } from "../../application/tool-registry.ts";
import { createAgentSchema, idParamSchema, updateAgentSchema } from "../schemas.ts";

export function agentRoutes(useCase: ManageAgentUseCase) {
	return async (app: FastifyInstance) => {
		app.get("/api/agents", async () => useCase.list());

		app.get<{ Params: { id: string } }>("/api/agents/:id", { schema: idParamSchema }, async (req) =>
			useCase.get(req.params.id),
		);

		app.post<{ Body: Omit<Agent, "id"> }>(
			"/api/agents",
			{ schema: createAgentSchema },
			async (req) => useCase.create(req.body),
		);

		app.put<{ Params: { id: string }; Body: Partial<Agent> }>(
			"/api/agents/:id",
			{ schema: { ...idParamSchema, ...updateAgentSchema } },
			async (req) => useCase.update(req.params.id, req.body),
		);

		app.get("/api/tools", async () => getAvailableToolNames());

		app.delete<{ Params: { id: string } }>(
			"/api/agents/:id",
			{ schema: idParamSchema },
			async (req) => {
				useCase.remove(req.params.id);
				return { ok: true };
			},
		);
	};
}
