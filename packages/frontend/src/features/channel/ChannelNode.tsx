import { Handle, Position } from "@xyflow/react";
import { MessageCircle, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NODE_COLORS } from "../canvas/theme";
import type { ChannelNodeData } from "../canvas/types";
import { useChatStore } from "./store";

export function ChannelNode({ data }: { data: ChannelNodeData }) {
	const { channel, agentId } = data;
	const { openChat } = useChatStore();

	return (
		<div className="min-w-48 rounded-sm border border-accent-4-border bg-card">
			<div className="flex items-center gap-2 rounded-t-sm bg-accent-4 px-3 py-2.5 text-accent-4-foreground">
				<MessageSquare size={14} />
				<span className="font-heading flex-1 text-sm font-bold tracking-wide">{channel.name}</span>
				{channel.isDM && (
					<Badge
						variant="outline"
						className="border-accent-4-foreground/30 text-accent-4-foreground"
					>
						DM
					</Badge>
				)}
			</div>
			<div className="flex items-center justify-between gap-2 px-3 py-3">
				<span className="text-xs text-muted-foreground">
					{channel.provider} / {channel.model}
				</span>
				<Button
					variant="outline"
					size="icon-sm"
					aria-label="Open chat"
					onClick={(e) => {
						e.stopPropagation();
						openChat(channel.id, agentId);
					}}
				>
					<MessageCircle size={14} />
				</Button>
			</div>

			<Handle type="target" position={Position.Left} style={{ background: NODE_COLORS.channel }} />
		</div>
	);
}
