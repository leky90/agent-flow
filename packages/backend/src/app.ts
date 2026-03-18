import cors from "@fastify/cors";
import Fastify from "fastify";
// Application
import { ManageAgentUseCase } from "./application/manage-agent.ts";
import { RunChatUseCase } from "./application/run-chat.ts";
import { config } from "./config.ts";
import { AppError } from "./errors.ts";
// Infrastructure
import { agentStore } from "./infrastructure/db/agent-store.ts";
import {
	EventBus,
	loggingMiddleware,
	metricsMiddleware,
} from "./infrastructure/middleware/event-bus.ts";
import { ClaudeProvider } from "./infrastructure/providers/claude.ts";
import { CodexProvider } from "./infrastructure/providers/codex.ts";
import { CursorProvider } from "./infrastructure/providers/cursor.ts";
import { PiAgentProvider } from "./infrastructure/providers/pi-agent.ts";

// Interface
import { agentRoutes } from "./interface/routes/agents.ts";
import { chatRoutes } from "./interface/routes/chat.ts";

export async function createApp() {
	const app = Fastify({ logger: true });

	// Global error handler
	app.setErrorHandler((error, _request, reply) => {
		if (error instanceof AppError) {
			return reply.code(error.statusCode).send({ error: error.code, message: error.message });
		}
		if (error.validation) {
			return reply.code(400).send({ error: "VALIDATION_ERROR", message: error.message });
		}
		app.log.error(error);
		return reply.code(500).send({
			error: "INTERNAL_ERROR",
			message: config.NODE_ENV === "production" ? "Internal server error" : error.message,
		});
	});

	await app.register(cors, {
		origin: true,
		methods: ["GET", "HEAD", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
	});

	// Wire dependencies
	const providers = [
		new CursorProvider(),
		new ClaudeProvider(),
		new CodexProvider(),
		new PiAgentProvider(),
	];

	const eventBus = new EventBus().use(loggingMiddleware).use(metricsMiddleware());

	const manageAgent = new ManageAgentUseCase(agentStore);
	const runChat = new RunChatUseCase(agentStore, providers, eventBus);

	// Register routes
	await app.register(agentRoutes(manageAgent));
	await app.register(chatRoutes(runChat));

	app.get("/api/health", async () => ({ status: "ok" }));

	return app;
}
