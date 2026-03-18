import { useReactFlow } from "@xyflow/react";
import { Bot, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DeleteConfirm } from "@/shared/ui/DeleteConfirm";
import type { Agent } from "../agent/types";
import { useFlowStore } from "./store";

interface SidebarProps {
	open: boolean;
	onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
	const { nodes, addAgent, deleteAgent, setSelectedNode } = useFlowStore();
	const { setCenter } = useReactFlow();
	const [deleteAgentId, setDeleteAgentId] = useState<string | null>(null);

	const agents = nodes
		.filter((n) => n.type === "agent")
		.map((n) => ({
			id: n.id,
			agent: (n.data as { agent: Agent }).agent,
			position: n.position,
		}));

	const handleClickAgent = (id: string, position: { x: number; y: number }) => {
		setSelectedNode(id, "agent");
		setCenter(position.x + 130, position.y + 80, { zoom: 1, duration: 500 });
		onClose();
	};

	return (
		<>
			{open && <div className="fixed inset-0 z-40" onClick={onClose} />}

			<div
				className={`fixed top-14 right-4 z-50 flex w-64 flex-col overflow-hidden rounded-sm border-[0.5px] border-border bg-card ${
					open ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-4 opacity-0"
				}`}
				style={{ maxHeight: "min(480px, calc(100vh - 80px))" }}
			>
				<div className="flex items-center justify-between border-b border-border px-4 py-3">
					<h2 className="font-heading text-sm font-semibold tracking-wide">Agents</h2>
					<Button variant="ghost" size="icon-xs" onClick={onClose}>
						<X size={14} />
					</Button>
				</div>

				<ScrollArea className="flex-1">
					<div className="p-2">
						{agents.map(({ id, agent, position }) => (
							<div
								key={id}
								onClick={() => handleClickAgent(id, position)}
								className="group mb-0.5 flex cursor-pointer items-center justify-between rounded-md px-3 py-2 transition-colors hover:bg-accent"
							>
								<div className="flex items-center gap-2">
									<Bot size={14} className="text-primary" />
									<span className="text-sm">{agent.name}</span>
								</div>
								<Button
									variant="ghost-destructive"
									size="icon-sm"
									aria-label="Delete agent"
									className="hidden group-hover:flex"
									onClick={(e) => {
										e.stopPropagation();
										setDeleteAgentId(id);
									}}
								>
									<Trash2 size={12} />
								</Button>
							</div>
						))}

						{agents.length === 0 && (
							<p className="px-3 py-4 text-center text-xs text-muted-foreground">No agents yet.</p>
						)}
					</div>
				</ScrollArea>

				<div className="border-t border-border p-3">
					<Button className="w-full" size="sm" onClick={() => addAgent()}>
						<Plus size={16} />
						New Agent
					</Button>
				</div>

				{deleteAgentId && (
					<DeleteConfirm
						title="Delete Agent?"
						message="This will delete the agent and all its tools, skills, and channels."
						onConfirm={() => {
							deleteAgent(deleteAgentId);
							setDeleteAgentId(null);
						}}
						onCancel={() => setDeleteAgentId(null)}
					/>
				)}
			</div>
		</>
	);
}
