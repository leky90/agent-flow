import type { AgentFlowEdge } from "./types";

const LAYOUT_KEY = "agent-flow-layout";

interface PersistedLayout {
	positions: Record<string, { x: number; y: number }>;
	edges: AgentFlowEdge[];
}

export function saveLayout(
	positions: Record<string, { x: number; y: number }>,
	edges: AgentFlowEdge[],
) {
	try {
		localStorage.setItem(LAYOUT_KEY, JSON.stringify({ positions, edges }));
	} catch {
		// localStorage might be full or unavailable
	}
}

export function loadLayout(): PersistedLayout | null {
	try {
		const raw = localStorage.getItem(LAYOUT_KEY);
		if (!raw) return null;
		return JSON.parse(raw) as PersistedLayout;
	} catch {
		return null;
	}
}
