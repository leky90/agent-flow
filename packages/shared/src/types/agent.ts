import type { AgentChannel } from "./channel.ts";
import type { AgentSkill } from "./skill.ts";
import type { AgentTool } from "./tool.ts";

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
