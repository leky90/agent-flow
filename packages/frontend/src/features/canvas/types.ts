import type { Edge, Node } from "@xyflow/react";
import type { Agent } from "../agent/types";
import type { AgentChannel } from "../channel/types";
import type { AgentSkill } from "../skill/types";
import type { AgentTool } from "../tool/types";

export type GroupKind = "tools" | "skills" | "channels";

export type AgentNodeData = {
	label: string;
	agent: Agent;
};

export type GroupNodeData = {
	label: string;
	agentId: string;
	kind: GroupKind;
};

export type ToolNodeData = {
	label: string;
	tool: AgentTool;
	agentId: string;
};

export type SkillNodeData = {
	label: string;
	skill: AgentSkill;
	agentId: string;
};

export type ChannelNodeData = {
	label: string;
	channel: AgentChannel;
	agentId: string;
};

export type AgentFlowNode =
	| Node<AgentNodeData, "agent">
	| Node<GroupNodeData, "group">
	| Node<ToolNodeData, "tool">
	| Node<SkillNodeData, "skill">
	| Node<ChannelNodeData, "channel">;

export type AgentFlowEdge = Edge;
