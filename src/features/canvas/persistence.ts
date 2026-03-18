import type { AgentFlowNode, AgentFlowEdge } from "./types";

const STORAGE_KEY = "agent-flow-state";

interface PersistedState {
  nodes: AgentFlowNode[];
  edges: AgentFlowEdge[];
}

export function saveState(nodes: AgentFlowNode[], edges: AgentFlowEdge[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges }));
  } catch {
    // localStorage might be full or unavailable
  }
}

export function loadState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}
