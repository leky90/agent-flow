import { MessageSquare, Plus, Trash2, Wrench, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Agent } from "../agent/types";
import { useFlowStore } from "../canvas/store";
import type { GroupKind } from "../canvas/types";

interface GroupPanelProps {
	agentId: string;
	kind: GroupKind;
}

export function GroupPanel({ agentId, kind }: GroupPanelProps) {
	const nodes = useFlowStore((s) => s.nodes);
	const agent = nodes.find((n) => n.id === agentId && n.type === "agent");
	if (!agent) return null;

	const agentData = (agent.data as { agent: Agent }).agent;

	switch (kind) {
		case "tools":
			return <ToolsList agentId={agentId} agent={agentData} />;
		case "skills":
			return <SkillsList agentId={agentId} agent={agentData} />;
		case "channels":
			return <ChannelsList agentId={agentId} agent={agentData} />;
	}
}

function ToolsList({ agentId, agent }: { agentId: string; agent: Agent }) {
	const { addTool, deleteTool, setSelectedNode } = useFlowStore();
	const nodes = useFlowStore((s) => s.nodes);

	return (
		<ScrollArea className="h-full">
			<div className="space-y-2 p-4">
				{agent.tools.length === 0 && (
					<p className="text-xs text-muted-foreground">No tools added yet.</p>
				)}
				{agent.tools.map((tool) => {
					const toolNode = nodes.find((n) => n.type === "tool" && n.data.tool.id === tool.id);
					return (
						<div
							key={tool.id}
							className="group flex items-center justify-between rounded-md border border-border px-3 py-2"
						>
							<button
								type="button"
								className="flex items-center gap-2 text-left text-sm hover:text-foreground"
								onClick={() => {
									if (toolNode) setSelectedNode(toolNode.id, "tool");
								}}
							>
								<Wrench size={14} className="text-accent-2" />
								{tool.name}
							</button>
							<Button
								variant="ghost-destructive"
								size="icon-xs"
								aria-label={`Remove ${tool.name}`}
								className="hidden group-hover:flex"
								onClick={() => deleteTool(agentId, tool.id)}
							>
								<Trash2 size={12} />
							</Button>
						</div>
					);
				})}

				<Separator />

				<Button
					variant="outline"
					size="sm"
					className="w-full justify-start"
					onClick={() => addTool(agentId)}
				>
					<Plus size={14} />
					Add Tool
				</Button>
			</div>
		</ScrollArea>
	);
}

function SkillsList({ agentId, agent }: { agentId: string; agent: Agent }) {
	const { addSkill, deleteSkill, setSelectedNode } = useFlowStore();
	const nodes = useFlowStore((s) => s.nodes);

	return (
		<ScrollArea className="h-full">
			<div className="space-y-2 p-4">
				{agent.skills.length === 0 && (
					<p className="text-xs text-muted-foreground">No skills added yet.</p>
				)}
				{agent.skills.map((skill) => {
					const skillNode = nodes.find((n) => n.type === "skill" && n.data.skill.id === skill.id);
					return (
						<div
							key={skill.id}
							className="group flex items-center justify-between rounded-md border border-border px-3 py-2"
						>
							<button
								type="button"
								className="flex items-center gap-2 text-left text-sm hover:text-foreground"
								onClick={() => {
									if (skillNode) setSelectedNode(skillNode.id, "skill");
								}}
							>
								<Zap size={14} className="text-accent-3" />
								{skill.name}
							</button>
							<Button
								variant="ghost-destructive"
								size="icon-xs"
								aria-label={`Delete ${skill.name}`}
								className="hidden group-hover:flex"
								onClick={() => deleteSkill(agentId, skill.id)}
							>
								<Trash2 size={12} />
							</Button>
						</div>
					);
				})}

				<Separator />

				<Button
					variant="outline"
					size="sm"
					className="w-full justify-start"
					onClick={() => addSkill(agentId)}
				>
					<Plus size={14} />
					Add Skill
				</Button>
			</div>
		</ScrollArea>
	);
}

function ChannelsList({ agentId, agent }: { agentId: string; agent: Agent }) {
	const { addChannel, deleteChannel, setSelectedNode } = useFlowStore();
	const nodes = useFlowStore((s) => s.nodes);

	return (
		<ScrollArea className="h-full">
			<div className="space-y-2 p-4">
				{agent.channels.length === 0 && (
					<p className="text-xs text-muted-foreground">No channels added yet.</p>
				)}
				{agent.channels.map((channel) => {
					const channelNode = nodes.find(
						(n) => n.type === "channel" && n.data.channel.id === channel.id,
					);
					return (
						<div
							key={channel.id}
							className="group flex items-center justify-between rounded-md border border-border px-3 py-2"
						>
							<button
								type="button"
								className="flex items-center gap-2 text-left text-sm hover:text-foreground"
								onClick={() => {
									if (channelNode) setSelectedNode(channelNode.id, "channel");
								}}
							>
								<MessageSquare size={14} className="text-accent-4" />
								{channel.name}
							</button>
							<Button
								variant="ghost-destructive"
								size="icon-xs"
								aria-label={`Remove ${channel.name}`}
								className="hidden group-hover:flex"
								onClick={() => deleteChannel(agentId, channel.id)}
							>
								<Trash2 size={12} />
							</Button>
						</div>
					);
				})}

				<Separator />

				<Button
					variant="outline"
					size="sm"
					className="w-full justify-start"
					onClick={() => addChannel(agentId)}
				>
					<Plus size={14} />
					Add Channel
				</Button>
			</div>
		</ScrollArea>
	);
}
