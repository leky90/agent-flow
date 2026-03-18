import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ModelSelector } from "@/shared/ui/ModelSelector";
import { useFlowStore } from "../canvas/store";
import type { AgentChannel } from "./types";

interface ChannelPanelProps {
	channel: AgentChannel;
	agentId: string;
}

export function ChannelPanel({ channel, agentId }: ChannelPanelProps) {
	const { updateChannel } = useFlowStore();

	return (
		<ScrollArea className="h-full">
			<div className="space-y-4 p-4">
				<div className="space-y-1.5">
					<Label className="text-xs text-muted-foreground">Name</Label>
					<Input
						value={channel.name}
						onChange={(e) => updateChannel(agentId, channel.id, { name: e.target.value })}
					/>
				</div>

				<Label className="flex items-center gap-2 text-sm">
					<Checkbox
						checked={channel.isDM}
						onCheckedChange={(checked) => updateChannel(agentId, channel.id, { isDM: !!checked })}
					/>
					Direct Message
				</Label>

				<Separator />

				<ModelSelector
					provider={channel.provider}
					model={channel.model}
					onProviderChange={(provider) => updateChannel(agentId, channel.id, { provider })}
					onModelChange={(model) => updateChannel(agentId, channel.id, { model })}
				/>
			</div>
		</ScrollArea>
	);
}
