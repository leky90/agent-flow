import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type { Agent } from "@agent-flow/shared";
import Database from "better-sqlite3";
import { config } from "../../config.ts";

// Ensure data directory exists
mkdirSync(dirname(config.DB_PATH), { recursive: true });

const db = new Database(config.DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma("journal_mode = WAL");

// Create table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL
  )
`);

// Prepared statements
const stmts = {
	list: db.prepare("SELECT data FROM agents"),
	get: db.prepare("SELECT data FROM agents WHERE id = ?"),
	insert: db.prepare("INSERT INTO agents (id, data) VALUES (?, ?)"),
	update: db.prepare("UPDATE agents SET data = ? WHERE id = ?"),
	remove: db.prepare("DELETE FROM agents WHERE id = ?"),
	clear: db.prepare("DELETE FROM agents"),
};

function parseRow(row: { data: string }): Agent {
	return JSON.parse(row.data) as Agent;
}

export const agentStore = {
	list(): Agent[] {
		return stmts.list.all().map((row) => parseRow(row as { data: string }));
	},

	get(id: string): Agent | undefined {
		const row = stmts.get.get(id) as { data: string } | undefined;
		return row ? parseRow(row) : undefined;
	},

	create(agent: Agent): Agent {
		stmts.insert.run(agent.id, JSON.stringify(agent));
		return agent;
	},

	update(id: string, updates: Partial<Agent>): Agent | null {
		const existing = agentStore.get(id);
		if (!existing) return null;
		const updated = { ...existing, ...updates, id };
		stmts.update.run(JSON.stringify(updated), id);
		return updated;
	},

	remove(id: string): boolean {
		const result = stmts.remove.run(id);
		return result.changes > 0;
	},
};

/** @internal Clear all data — for testing only */
export function _resetStore() {
	stmts.clear.run();
}
