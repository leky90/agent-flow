import Dagre from "@dagrejs/dagre";
import type { AgentFlowEdge, AgentFlowNode, GroupKind } from "./types";

const NODE_DIMENSIONS: Record<string, { width: number; height: number }> = {
	agent: { width: 260, height: 160 },
	group: { width: 180, height: 40 },
	tool: { width: 180, height: 100 },
	skill: { width: 180, height: 100 },
	channel: { width: 200, height: 120 },
};

// Group node ID convention
export function groupNodeId(agentId: string, kind: GroupKind): string {
	return `group-${agentId}-${kind}`;
}

// Default position for group nodes relative to agent — centered vertically
export function getGroupPosition(
	agentX: number,
	agentY: number,
	kind: GroupKind,
): { x: number; y: number } {
	const xOffset = 350;
	const yOffsets: Record<GroupKind, number> = {
		tools: -100,
		skills: 60,
		channels: 220,
	};
	return { x: agentX + xOffset, y: agentY + yOffsets[kind] };
}

// Default position for child nodes relative to group — centered vertically around group
export function getChildPosition(
	groupX: number,
	groupY: number,
	childIndex: number,
	totalChildren: number,
): { x: number; y: number } {
	const spacing = 130;
	const totalHeight = (totalChildren - 1) * spacing;
	const startY = groupY - totalHeight / 2;
	return {
		x: groupX + 260,
		y: startY + childIndex * spacing,
	};
}

// Two-pass auto layout:
// Pass 1: LR for agent → group nodes
// Pass 2: For each group, center children vertically around the group
export function computeAutoLayout(
	nodes: AgentFlowNode[],
	edges: AgentFlowEdge[],
): Record<string, { x: number; y: number }> {
	const positions: Record<string, { x: number; y: number }> = {};

	// --- Pass 1: Agent + Group nodes, LR ---
	const topLevelTypes = new Set(["agent", "group"]);
	const topNodes = nodes.filter((n) => topLevelTypes.has(n.type ?? ""));
	const topNodeIds = new Set(topNodes.map((n) => n.id));
	const topEdges = edges.filter((e) => topNodeIds.has(e.source) && topNodeIds.has(e.target));

	if (topNodes.length > 0) {
		const g1 = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
		g1.setGraph({ rankdir: "LR", ranksep: 250, nodesep: 80, marginx: 50, marginy: 50 });

		for (const node of topNodes) {
			const dim = NODE_DIMENSIONS[node.type ?? "agent"] ?? NODE_DIMENSIONS.agent;
			g1.setNode(node.id, { width: dim.width, height: dim.height });
		}
		for (const edge of topEdges) {
			g1.setEdge(edge.source, edge.target);
		}

		Dagre.layout(g1);

		for (const node of topNodes) {
			const pos = g1.node(node.id);
			const dim = NODE_DIMENSIONS[node.type ?? "agent"] ?? NODE_DIMENSIONS.agent;
			positions[node.id] = {
				x: pos.x - dim.width / 2,
				y: pos.y - dim.height / 2,
			};
		}
	}

	// --- Pass 2: Center children vertically around each group ---
	const groupNodes = nodes.filter((n) => n.type === "group");

	for (const groupNode of groupNodes) {
		const childEdges = edges.filter((e) => e.source === groupNode.id);
		if (childEdges.length === 0) continue;

		const childIds = new Set(childEdges.map((e) => e.target));
		const childNodes = nodes.filter((n) => childIds.has(n.id));
		if (childNodes.length === 0) continue;

		const groupPos = positions[groupNode.id] ?? groupNode.position;
		const groupDim = NODE_DIMENSIONS.group;
		const groupCenterY = groupPos.y + groupDim.height / 2;

		const spacing = 120;
		const totalHeight = (childNodes.length - 1) * spacing;
		const startY = groupCenterY - totalHeight / 2;
		const childX = groupPos.x + groupDim.width + 80;

		for (let i = 0; i < childNodes.length; i++) {
			const child = childNodes[i];
			const dim = NODE_DIMENSIONS[child.type ?? "tool"] ?? NODE_DIMENSIONS.tool;
			positions[child.id] = {
				x: childX,
				y: startY + i * spacing - dim.height / 2,
			};
		}
	}

	return positions;
}
