import { Handle, Position } from "@xyflow/react";
import { Bot, MessageSquare, Wrench, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useFlowStore } from "../canvas/store";
import { NODE_COLORS } from "../canvas/theme";
import type { AgentNodeData } from "../canvas/types";

const EMPTY_COLLAPSED: Partial<Record<string, boolean>> = {};

export function AgentNode({ data }: { data: AgentNodeData }) {
	const { agent } = data;
	const collapsedGroups = useFlowStore((s) => s.collapsedGroups[agent.id] ?? EMPTY_COLLAPSED);

	const showCounts = collapsedGroups.tools || collapsedGroups.skills || collapsedGroups.channels;

	return (
		<div className="min-w-64 rounded-sm border border-accent-1-border bg-card">
			<div className="flex items-center gap-2 rounded-t-sm bg-accent-1 px-3 py-2.5">
				<Bot size={16} className="text-accent-1-foreground" />
				<span className="font-heading text-base font-bold tracking-wide text-accent-1-foreground">
					{agent.name}
				</span>
			</div>

			<div className="space-y-3 px-3 py-3">
				<Badge variant="mono">{agent.model}</Badge>

				<div className="flex items-center gap-1.5">
					<Badge variant="outline">{agent.thinkingLevel}</Badge>
					<Badge variant="outline">{agent.toolExecution}</Badge>
				</div>

				{showCounts && (
					<div className="flex gap-3 border-t border-border pt-2.5 text-xs text-muted-foreground">
						{collapsedGroups.tools && (
							<span className="flex items-center gap-1">
								<Wrench size={12} /> {agent.tools.length}
							</span>
						)}
						{collapsedGroups.skills && (
							<span className="flex items-center gap-1">
								<Zap size={12} /> {agent.skills.length}
							</span>
						)}
						{collapsedGroups.channels && (
							<span className="flex items-center gap-1">
								<MessageSquare size={12} /> {agent.channels.length}
							</span>
						)}
					</div>
				)}
			</div>

			<Handle
				type="source"
				position={Position.Right}
				id="tools"
				style={{ top: "25%", background: NODE_COLORS.tool }}
			/>
			<Handle
				type="source"
				position={Position.Right}
				id="skills"
				style={{ top: "50%", background: NODE_COLORS.skill }}
			/>
			<Handle
				type="source"
				position={Position.Right}
				id="channels"
				style={{ top: "75%", background: NODE_COLORS.channel }}
			/>
		</div>
	);
}
