import type { NodeTypes } from "@xyflow/react";
import { AgentNode } from "../agent/AgentNode";
import { ToolNode } from "../tool/ToolNode";
import { SkillNode } from "../skill/SkillNode";
import { ChannelNode } from "../channel/ChannelNode";

export const nodeTypes: NodeTypes = {
  agent: AgentNode,
  tool: ToolNode,
  skill: SkillNode,
  channel: ChannelNode,
};
