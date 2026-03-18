import Dagre from "@dagrejs/dagre";
import type { AgentFlowEdge, AgentFlowNode } from "./types";

const CHILD_OFFSET_X = 350;
const CHILD_SPACING_Y = 130;

export function getChildPosition(
	parentX: number,
	parentY: number,
	childType: "tool" | "skill" | "channel",
	existingChildCount: number,
) {
	const typeOffsets: Record<string, number> = {
		tool: -100,
		skill: 80,
		channel: 260,
	};

	return {
		x: parentX + CHILD_OFFSET_X,
		y: parentY + typeOffsets[childType] + existingChildCount * CHILD_SPACING_Y,
	};
}

export function countChildrenByType(
	nodes: AgentFlowNode[],
	agentId: string,
	type: "tool" | "skill" | "channel",
): number {
	return nodes.filter((n) => n.type === type && "agentId" in n.data && n.data.agentId === agentId)
		.length;
}

const NODE_DIMENSIONS: Record<string, { width: number; height: number }> = {
	agent: { width: 260, height: 160 },
	tool: { width: 180, height: 100 },
	skill: { width: 180, height: 100 },
	channel: { width: 200, height: 120 },
};

export function computeAutoLayout(
	nodes: AgentFlowNode[],
	edges: AgentFlowEdge[],
): Record<string, { x: number; y: number }> {
	const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
	g.setGraph({ rankdir: "LR", ranksep: 300, nodesep: 80, marginx: 50, marginy: 50 });

	for (const node of nodes) {
		const dim = NODE_DIMENSIONS[node.type ?? "agent"] ?? NODE_DIMENSIONS.agent;
		g.setNode(node.id, { width: dim.width, height: dim.height });
	}

	for (const edge of edges) {
		g.setEdge(edge.source, edge.target);
	}

	Dagre.layout(g);

	const positions: Record<string, { x: number; y: number }> = {};
	for (const node of nodes) {
		const pos = g.node(node.id);
		const dim = NODE_DIMENSIONS[node.type ?? "agent"] ?? NODE_DIMENSIONS.agent;
		positions[node.id] = {
			x: pos.x - dim.width / 2,
			y: pos.y - dim.height / 2,
		};
	}

	return positions;
}
