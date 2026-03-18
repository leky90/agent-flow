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

// Fixed group order matching agent handle positions: tools=25%, skills=50%, channels=75%
const GROUP_ORDER: GroupKind[] = ["tools", "skills", "channels"];

// Default position for group nodes relative to agent
export function getGroupPosition(
	agentX: number,
	agentY: number,
	kind: GroupKind,
): { x: number; y: number } {
	const xOffset = 350;
	const agentHeight = NODE_DIMENSIONS.agent.height;
	const groupHeight = NODE_DIMENSIONS.group.height;
	const handlePositions: Record<GroupKind, number> = {
		tools: 0.25,
		skills: 0.5,
		channels: 0.75,
	};
	// Align group center with handle Y position
	const handleY = agentY + agentHeight * handlePositions[kind];
	return { x: agentX + xOffset, y: handleY - groupHeight / 2 };
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

// Auto layout:
// 1. Stack agents vertically with spacing
// 2. Position groups aligned to agent handles (fixed order: tools/skills/channels)
// 3. Center children vertically around each group
export function computeAutoLayout(
	nodes: AgentFlowNode[],
	edges: AgentFlowEdge[],
): Record<string, { x: number; y: number }> {
	const positions: Record<string, { x: number; y: number }> = {};

	// --- Step 1: Stack agents vertically ---
	const agentNodes = nodes.filter((n) => n.type === "agent");
	let agentY = 50;
	const agentX = 100;
	const agentSpacing = 320;

	for (const agent of agentNodes) {
		positions[agent.id] = { x: agentX, y: agentY };

		// --- Step 2: Position groups aligned to handles ---
		for (const kind of GROUP_ORDER) {
			const gId = groupNodeId(agent.id, kind);
			const groupNode = nodes.find((n) => n.id === gId);
			if (groupNode) {
				positions[gId] = getGroupPosition(agentX, agentY, kind);
			}
		}

		// --- Step 3: Center children around each group ---
		for (const kind of GROUP_ORDER) {
			const gId = groupNodeId(agent.id, kind);
			const groupPos = positions[gId];
			if (!groupPos) continue;

			const childEdges = edges.filter((e) => e.source === gId);
			const childNodes = childEdges
				.map((e) => nodes.find((n) => n.id === e.target))
				.filter(Boolean) as AgentFlowNode[];

			if (childNodes.length === 0) continue;

			const groupCenterY = groupPos.y + NODE_DIMENSIONS.group.height / 2;
			const spacing = 120;
			const totalHeight = (childNodes.length - 1) * spacing;
			const startY = groupCenterY - totalHeight / 2;
			const childX = groupPos.x + NODE_DIMENSIONS.group.width + 80;

			for (let i = 0; i < childNodes.length; i++) {
				const child = childNodes[i];
				const dim = NODE_DIMENSIONS[child.type ?? "tool"] ?? NODE_DIMENSIONS.tool;
				positions[child.id] = {
					x: childX,
					y: startY + i * spacing - dim.height / 2,
				};
			}
		}

		// Calculate total height of this agent cluster for spacing
		const allGroupChildYs: number[] = [];
		for (const kind of GROUP_ORDER) {
			const gId = groupNodeId(agent.id, kind);
			const gPos = positions[gId];
			if (gPos) allGroupChildYs.push(gPos.y);

			const childEdges = edges.filter((e) => e.source === gId);
			for (const ce of childEdges) {
				const cPos = positions[ce.target];
				if (cPos) {
					const dim = NODE_DIMENSIONS.channel; // use largest
					allGroupChildYs.push(cPos.y + dim.height);
				}
			}
		}
		const maxY =
			allGroupChildYs.length > 0
				? Math.max(...allGroupChildYs)
				: agentY + NODE_DIMENSIONS.agent.height;
		agentY = maxY + agentSpacing;
	}

	return positions;
}
