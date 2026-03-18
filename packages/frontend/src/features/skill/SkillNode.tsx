import { Handle, Position } from "@xyflow/react";
import { Zap } from "lucide-react";
import { NODE_COLORS } from "../canvas/theme";
import type { SkillNodeData } from "../canvas/types";

export function SkillNode({ data }: { data: SkillNodeData }) {
	const { skill } = data;

	return (
		<div className="min-w-44 rounded-sm border border-accent-3-border bg-card">
			<div className="flex items-center gap-2 rounded-t-sm bg-accent-3/70 px-3 py-2.5 text-accent-3-foreground">
				<Zap size={14} />
				<span className="font-heading text-sm font-bold tracking-wide">{skill.name}</span>
			</div>
			<div className="px-3 py-3">
				<p className="text-xs text-muted-foreground">{skill.description || "No description"}</p>
				{skill.path && (
					<p className="mt-1 truncate text-xs text-muted-foreground/70">{skill.path}</p>
				)}
			</div>

			<Handle type="target" position={Position.Left} style={{ background: NODE_COLORS.skill }} />
		</div>
	);
}
