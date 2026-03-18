import { Handle, Position } from "@xyflow/react";
import { MessageSquare, Wrench, Zap } from "lucide-react";
import { useMemo } from "react";
import { useFlowStore } from "../canvas/store";
import { GROUP_KIND_COLORS } from "../canvas/theme";
import type { GroupKind, GroupNodeData } from "../canvas/types";

const KIND_ICONS: Record<GroupKind, typeof Wrench> = {
	tools: Wrench,
	skills: Zap,
	channels: MessageSquare,
};

export function GroupNode({ id, data }: { id: string; data: GroupNodeData }) {
	const { kind, label } = data;
	const edges = useFlowStore((s) => s.edges);

	const childCount = useMemo(() => edges.filter((e) => e.source === id).length, [edges, id]);

	const Icon = KIND_ICONS[kind];
	const color = GROUP_KIND_COLORS[kind];

	return (
		<div className="min-w-40 rounded-sm border border-border bg-card">
			<div className="flex items-center gap-2 px-3 py-2.5" style={{ backgroundColor: color }}>
				<Icon size={14} className="text-white" />
				<span className="font-heading text-sm font-semibold tracking-wide text-white">{label}</span>
				<span className="ml-auto rounded-sm bg-white/20 px-1.5 py-0.5 font-mono text-xs text-white">
					{childCount}
				</span>
			</div>

			<Handle type="target" position={Position.Left} style={{ background: color }} />
			<Handle type="source" position={Position.Right} style={{ background: color }} />
		</div>
	);
}
