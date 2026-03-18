import { Handle, Position } from "@xyflow/react";
import { Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NODE_COLORS } from "../canvas/theme";
import type { ToolNodeData } from "../canvas/types";

export function ToolNode({ data }: { data: ToolNodeData }) {
	const { tool } = data;

	return (
		<div className="min-w-44 rounded-sm border border-accent-2-border bg-card">
			<div className="flex items-center gap-2 rounded-t-sm bg-accent-2/80 px-3 py-2.5 text-accent-2-foreground">
				<Wrench size={14} />
				<span className="font-heading text-sm font-bold tracking-wide">{tool.name}</span>
			</div>
			<div className="px-3 py-3">
				<p className="text-xs text-muted-foreground">{tool.description || "No description"}</p>
				{tool.parameters.length > 0 && (
					<Badge variant="accent-2" className="mt-2">
						{tool.parameters.length} params
					</Badge>
				)}
			</div>

			<Handle type="target" position={Position.Left} style={{ background: NODE_COLORS.tool }} />
		</div>
	);
}
