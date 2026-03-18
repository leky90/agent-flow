import { Handle, Position } from "@xyflow/react";
import { Bot, ChevronDown, ChevronRight, MessageSquare, Wrench, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useFlowStore } from "../canvas/store";
import { NODE_COLORS } from "../canvas/theme";
import type { AgentNodeData } from "../canvas/types";

const EMPTY_COLLAPSED: Partial<Record<string, boolean>> = {};

export function AgentNode({ data }: { data: AgentNodeData }) {
	const { agent } = data;
	const collapsedGroups = useFlowStore((s) => s.collapsedGroups[agent.id] ?? EMPTY_COLLAPSED);
	const toggleCollapse = useFlowStore((s) => s.toggleCollapse);

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

				<div className="flex gap-3 border-t border-border pt-2.5 text-xs text-muted-foreground">
					<button
						type="button"
						aria-label={`${agent.tools.length} tools, ${collapsedGroups.tools ? "expand" : "collapse"}`}
						className="flex items-center gap-0.5 p-1 hover:text-foreground"
						onClick={(e) => {
							e.stopPropagation();
							toggleCollapse(agent.id, "tools");
						}}
					>
						{collapsedGroups.tools ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
						<Wrench size={12} /> {agent.tools.length}
					</button>
					<button
						type="button"
						aria-label={`${agent.skills.length} skills, ${collapsedGroups.skills ? "expand" : "collapse"}`}
						className="flex items-center gap-0.5 p-1 hover:text-foreground"
						onClick={(e) => {
							e.stopPropagation();
							toggleCollapse(agent.id, "skills");
						}}
					>
						{collapsedGroups.skills ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
						<Zap size={12} /> {agent.skills.length}
					</button>
					<button
						type="button"
						aria-label={`${agent.channels.length} channels, ${collapsedGroups.channels ? "expand" : "collapse"}`}
						className="flex items-center gap-0.5 p-1 hover:text-foreground"
						onClick={(e) => {
							e.stopPropagation();
							toggleCollapse(agent.id, "channels");
						}}
					>
						{collapsedGroups.channels ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
						<MessageSquare size={12} /> {agent.channels.length}
					</button>
				</div>
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
