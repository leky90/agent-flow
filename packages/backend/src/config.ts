import { homedir } from "node:os";
import { join } from "node:path";

interface EnvConfig {
	PORT: number;
	HOST: string;
	DATA_DIR: string;
	DB_PATH: string;
	NODE_ENV: "development" | "production" | "test";
}

function loadConfig(): EnvConfig {
	const NODE_ENV = (process.env.NODE_ENV ?? "development") as EnvConfig["NODE_ENV"];
	const DATA_DIR = process.env.AGENT_FLOW_DATA ?? join(homedir(), ".agent-flow");

	const port = Number(process.env.PORT ?? 3001);
	if (Number.isNaN(port) || port < 0 || port > 65535) {
		throw new Error(`Invalid PORT: ${process.env.PORT}`);
	}

	return {
		PORT: port,
		HOST: process.env.HOST ?? "0.0.0.0",
		DATA_DIR,
		DB_PATH: join(DATA_DIR, "agents.db"),
		NODE_ENV,
	};
}

export const config = loadConfig();

// Legacy exports for backward compatibility with tests
export const PORT = config.PORT;
export const HOST = config.HOST;
export const DATA_PATH = config.DATA_DIR;
export const AGENTS_FILE = join(config.DATA_DIR, "agents.json");
