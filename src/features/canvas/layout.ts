import type { AgentFlowNode } from "./types";

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
  return nodes.filter(
    (n) => n.type === type && "agentId" in n.data && n.data.agentId === agentId,
  ).length;
}
