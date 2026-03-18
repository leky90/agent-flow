import type { AgentTool } from "../tool/types";
import type { AgentSkill } from "../skill/types";
import type { AgentChannel } from "../channel/types";

export type ThinkingLevel = "minimal" | "low" | "medium" | "high" | "xhigh";
export type ToolExecution = "sequential" | "parallel";

export interface Agent {
  id: string;
  name: string;
  model: string;
  systemPrompt: string;
  thinkingLevel: ThinkingLevel;
  toolExecution: ToolExecution;
  tools: AgentTool[];
  skills: AgentSkill[];
  channels: AgentChannel[];
}
