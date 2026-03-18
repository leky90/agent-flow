import { ReactFlowProvider } from "@xyflow/react";
import { Bot, HelpCircle, LayoutGrid, Plus, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AgentPanel } from "./features/agent/AgentPanel";
import type { Agent } from "./features/agent/types";
import { Canvas } from "./features/canvas/Canvas";
import { useFlowStore } from "./features/canvas/store";
import type { GroupNodeData } from "./features/canvas/types";
import { ChannelPanel } from "./features/channel/ChannelPanel";
import { ChatThread } from "./features/channel/ChatThread";
import type { AgentChannel } from "./features/channel/types";
import { GroupPanel } from "./features/group/GroupPanel";
import { SkillPanel } from "./features/skill/SkillPanel";
import type { AgentSkill } from "./features/skill/types";
import { ToolPanel } from "./features/tool/ToolPanel";
import type { AgentTool } from "./features/tool/types";
import { DeleteConfirm } from "./shared/ui/DeleteConfirm";
import { OnboardingTour, useOnboardingTour } from "./shared/ui/OnboardingTour";
import { ThemeToggle } from "./shared/ui/ThemeToggle";

const PANEL_TITLES: Record<string, string> = {
	agent: "Edit Agent",
	tool: "Edit Tool",
	skill: "Edit Skill",
	channel: "Edit Channel",
};

function AgentListContent({ onClose }: { onClose: () => void }) {
	const nodes = useFlowStore((s) => s.nodes);

	const agents = nodes
		.filter((n) => n.type === "agent")
		.map((n) => ({
			id: n.id,
			agent: (n.data as { agent: Agent }).agent,
			position: n.position,
		}));

	const [deleteAgentId, setDeleteAgentId] = useState<string | null>(null);

	const handleClickAgent = useCallback(
		(id: string) => {
			useFlowStore.getState().setSelectedNode(id, "agent");
			onClose();
		},
		[onClose],
	);

	return (
		<>
			<div className="flex items-center justify-between border-b border-border px-3 pb-2">
				<h3 className="font-heading text-sm font-semibold tracking-wide">Agents</h3>
			</div>

			<ScrollArea className="max-h-64">
				<ul className="list-none">
					{agents.map(({ id, agent }) => (
						<li
							key={id}
							onClick={() => handleClickAgent(id)}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") handleClickAgent(id);
							}}
							className="group flex cursor-pointer items-center justify-between rounded-md px-3 py-2 transition-colors hover:bg-accent"
						>
							<span className="flex items-center gap-2">
								<Bot size={14} className="text-primary" />
								<span className="text-sm">{agent.name}</span>
							</span>
							<Button
								variant="ghost-destructive"
								size="icon-xs"
								aria-label={`Delete ${agent.name}`}
								className="hidden group-hover:flex"
								onClick={(e) => {
									e.stopPropagation();
									setDeleteAgentId(id);
								}}
							>
								<X size={10} />
							</Button>
						</li>
					))}
				</ul>

				{agents.length === 0 && (
					<p className="px-3 py-4 text-center text-xs text-muted-foreground">No agents yet.</p>
				)}
			</ScrollArea>

			<div className="border-t border-border pt-2">
				<Button
					className="w-full"
					size="sm"
					onClick={() => {
						useFlowStore.getState().addAgent();
						onClose();
					}}
				>
					<Plus size={14} />
					New Agent
				</Button>
			</div>

			{deleteAgentId && (
				<DeleteConfirm
					title="Delete Agent?"
					message="This will delete the agent and all its tools, skills, and channels."
					onConfirm={() => {
						useFlowStore.getState().deleteAgent(deleteAgentId);
						setDeleteAgentId(null);
					}}
					onCancel={() => setDeleteAgentId(null)}
				/>
			)}
		</>
	);
}

function AppContent() {
	const { nodes, selectedNodeId, panelType, loadFromApi, closePanel, addAgent, autoLayout } =
		useFlowStore();
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const tour = useOnboardingTour();

	useEffect(() => {
		loadFromApi();
	}, [loadFromApi]);

	// Close sidebar when panel opens or context menu opens
	const contextMenu = useFlowStore((s) => s.contextMenu);
	useEffect(() => {
		if (panelType || contextMenu) setSidebarOpen(false);
	}, [panelType, contextMenu]);

	const selectedNode = nodes.find((n) => n.id === selectedNodeId);

	const renderPanel = () => {
		if (!selectedNode || !panelType) return null;

		switch (panelType) {
			case "agent":
				return <AgentPanel agent={(selectedNode.data as { agent: Agent }).agent} />;
			case "group": {
				const groupData = selectedNode.data as GroupNodeData;
				return <GroupPanel agentId={groupData.agentId} kind={groupData.kind} />;
			}
			case "tool":
				return (
					<ToolPanel
						tool={(selectedNode.data as { tool: AgentTool }).tool}
						agentId={(selectedNode.data as { agentId: string }).agentId}
					/>
				);
			case "skill":
				return (
					<SkillPanel
						skill={(selectedNode.data as { skill: AgentSkill }).skill}
						agentId={(selectedNode.data as { agentId: string }).agentId}
					/>
				);
			case "channel":
				return (
					<ChannelPanel
						channel={(selectedNode.data as { channel: AgentChannel }).channel}
						agentId={(selectedNode.data as { agentId: string }).agentId}
					/>
				);
			default:
				return null;
		}
	};

	const panelTitle =
		panelType === "group" && selectedNode
			? (selectedNode.data as GroupNodeData).label
			: (PANEL_TITLES[panelType ?? ""] ?? "");

	return (
		<div className="relative h-screen w-screen bg-background">
			<Canvas />

			{panelType && (
				<div className="absolute top-0 right-0 flex h-full w-80 flex-col border-l-[0.5px] border-border bg-card">
					<div className="flex items-center justify-between border-b border-border px-4 py-3">
						<h2 className="font-heading text-sm font-semibold tracking-wide">{panelTitle}</h2>
						<Button variant="ghost" size="icon-xs" onClick={closePanel}>
							<X size={14} />
						</Button>
					</div>
					<div className="flex-1 overflow-hidden">{renderPanel()}</div>
				</div>
			)}

			<ChatThread />

			<OnboardingTour active={tour.active} onFinish={tour.finish} />

			{/* FAB toolbar — left center */}
			<div className="fixed left-4 top-1/2 z-50 flex -translate-y-1/2 flex-col gap-2">
				<Popover open={sidebarOpen} onOpenChange={setSidebarOpen}>
					<PopoverTrigger
						render={
							<Button
								size="icon"
								variant={sidebarOpen ? "default" : "outline"}
								aria-label="Toggle agent list"
								title="Agent List"
							/>
						}
					>
						<Bot size={18} />
					</PopoverTrigger>
					<PopoverContent side="right" sideOffset={12} align="start" className="w-64">
						<AgentListContent onClose={() => setSidebarOpen(false)} />
					</PopoverContent>
				</Popover>

				<Button
					size="icon"
					variant="outline"
					aria-label="Add agent"
					title="Add Agent"
					onClick={() => {
						setSidebarOpen(false);
						addAgent();
					}}
				>
					<Plus size={18} />
				</Button>

				<Button
					size="icon"
					variant="outline"
					aria-label="Auto layout"
					title="Auto Layout"
					onClick={() => {
						setSidebarOpen(false);
						autoLayout();
					}}
				>
					<LayoutGrid size={18} />
				</Button>

				<div className="my-1 h-px w-full bg-border" />

				<Button
					size="icon"
					variant="ghost"
					aria-label="Show tutorial"
					title="Tutorial"
					onClick={() => {
						setSidebarOpen(false);
						tour.start();
					}}
				>
					<HelpCircle size={16} />
				</Button>

				<ThemeToggle />
			</div>
		</div>
	);
}

export default function App() {
	return (
		<ReactFlowProvider>
			<TooltipProvider>
				<AppContent />
			</TooltipProvider>
		</ReactFlowProvider>
	);
}
