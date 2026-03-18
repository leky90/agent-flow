import type { NodeTypes } from "@xyflow/react";
import { AgentNode } from "../agent/AgentNode";
import { ChannelNode } from "../channel/ChannelNode";
import { GroupNode } from "../group/GroupNode";
import { SkillNode } from "../skill/SkillNode";
import { ToolNode } from "../tool/ToolNode";

export const nodeTypes: NodeTypes = {
	agent: AgentNode,
	group: GroupNode,
	tool: ToolNode,
	skill: SkillNode,
	channel: ChannelNode,
};
