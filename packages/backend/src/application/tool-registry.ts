import type { AgentTool } from "@agent-flow/shared";
import type { AgentTool as PiAgentTool } from "@mariozechner/pi-agent-core";
import {
	bashTool,
	codingTools,
	editTool,
	findTool,
	grepTool,
	lsTool,
	readTool,
	writeTool,
} from "@mariozechner/pi-coding-agent";

type Tool = PiAgentTool<any>;

const builtInTools: Record<string, Tool> = {
	read: readTool,
	bash: bashTool,
	edit: editTool,
	write: writeTool,
	grep: grepTool,
	find: findTool,
	ls: lsTool,
};

export function resolveTools(configTools: AgentTool[]): Tool[] {
	if (configTools.length === 0) {
		return [...codingTools];
	}

	const resolved: Tool[] = [];
	for (const meta of configTools) {
		const impl = builtInTools[meta.name];
		if (impl) {
			resolved.push(impl);
		} else {
			console.warn(
				`[tool-registry] Unknown tool "${meta.name}" — skipped. Available: ${Object.keys(builtInTools).join(", ")}`,
			);
		}
	}

	return resolved.length > 0 ? resolved : [builtInTools.read];
}

export function getAvailableToolNames(): string[] {
	return Object.keys(builtInTools);
}
