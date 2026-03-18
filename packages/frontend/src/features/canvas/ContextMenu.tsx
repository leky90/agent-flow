import {
	LayoutGrid,
	Maximize,
	MessageCircle,
	MessageSquare,
	Pencil,
	Plus,
	Trash2,
	Wrench,
	Zap,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { useChatStore } from "../channel/store";
import { useFlowStore } from "./store";

interface MenuItem {
	label: string;
	icon: React.ReactNode;
	action: () => void;
	variant?: "destructive";
}

export function ContextMenu() {
	const {
		contextMenu,
		closeContextMenu,
		nodes,
		setSelectedNode,
		addTool,
		addSkill,
		addChannel,
		deleteAgent,
		deleteTool,
		deleteSkill,
		deleteChannel,
	} = useFlowStore();
	const { openChat } = useChatStore();
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!contextMenu) return;
		const handleClick = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				useFlowStore.getState().closeContextMenu();
			}
		};
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") useFlowStore.getState().closeContextMenu();
		};
		document.addEventListener("mousedown", handleClick);
		document.addEventListener("keydown", handleKey);
		return () => {
			document.removeEventListener("mousedown", handleClick);
			document.removeEventListener("keydown", handleKey);
		};
	}, [contextMenu]);

	if (!contextMenu) return null;

	const { x, y, nodeId, nodeType } = contextMenu;
	const items: MenuItem[] = [];

	if (nodeId && nodeType === "agent") {
		items.push({
			label: "Edit",
			icon: <Pencil size={14} />,
			action: () => {
				setSelectedNode(nodeId, "agent");
				closeContextMenu();
			},
		});
		items.push({
			label: "Add Tool",
			icon: <Wrench size={14} />,
			action: () => {
				addTool(nodeId);
				closeContextMenu();
			},
		});
		items.push({
			label: "Add Skill",
			icon: <Zap size={14} />,
			action: () => {
				addSkill(nodeId);
				closeContextMenu();
			},
		});
		items.push({
			label: "Add Channel",
			icon: <MessageSquare size={14} />,
			action: () => {
				addChannel(nodeId);
				closeContextMenu();
			},
		});
		items.push({
			label: "Delete",
			icon: <Trash2 size={14} />,
			action: () => {
				deleteAgent(nodeId);
				closeContextMenu();
			},
			variant: "destructive",
		});
	} else if (nodeId && nodeType === "tool") {
		const node = nodes.find((n) => n.id === nodeId);
		const agentId =
			node?.data && "agentId" in node.data ? (node.data as { agentId: string }).agentId : "";
		const toolId =
			node?.data && "tool" in node.data ? (node.data as { tool: { id: string } }).tool.id : "";
		items.push({
			label: "Edit",
			icon: <Pencil size={14} />,
			action: () => {
				setSelectedNode(nodeId, "tool");
				closeContextMenu();
			},
		});
		items.push({
			label: "Delete",
			icon: <Trash2 size={14} />,
			action: () => {
				deleteTool(agentId, toolId);
				closeContextMenu();
			},
			variant: "destructive",
		});
	} else if (nodeId && nodeType === "skill") {
		const node = nodes.find((n) => n.id === nodeId);
		const agentId =
			node?.data && "agentId" in node.data ? (node.data as { agentId: string }).agentId : "";
		const skillId =
			node?.data && "skill" in node.data ? (node.data as { skill: { id: string } }).skill.id : "";
		items.push({
			label: "Edit",
			icon: <Pencil size={14} />,
			action: () => {
				setSelectedNode(nodeId, "skill");
				closeContextMenu();
			},
		});
		items.push({
			label: "Delete",
			icon: <Trash2 size={14} />,
			action: () => {
				deleteSkill(agentId, skillId);
				closeContextMenu();
			},
			variant: "destructive",
		});
	} else if (nodeId && nodeType === "channel") {
		const node = nodes.find((n) => n.id === nodeId);
		const agentId =
			node?.data && "agentId" in node.data ? (node.data as { agentId: string }).agentId : "";
		const channelId =
			node?.data && "channel" in node.data
				? (node.data as { channel: { id: string } }).channel.id
				: "";
		items.push({
			label: "Edit",
			icon: <Pencil size={14} />,
			action: () => {
				setSelectedNode(nodeId, "channel");
				closeContextMenu();
			},
		});
		items.push({
			label: "Open Chat",
			icon: <MessageCircle size={14} />,
			action: () => {
				openChat(channelId, agentId);
				closeContextMenu();
			},
		});
		items.push({
			label: "Delete",
			icon: <Trash2 size={14} />,
			action: () => {
				deleteChannel(agentId, channelId);
				closeContextMenu();
			},
			variant: "destructive",
		});
	} else {
		// Pane context menu
		items.push({
			label: "Add Agent",
			icon: <Plus size={14} />,
			action: () => {
				useFlowStore.getState().addAgent({ x, y });
				closeContextMenu();
			},
		});
		items.push({
			label: "Auto Layout",
			icon: <LayoutGrid size={14} />,
			action: () => {
				useFlowStore.getState().autoLayout();
				closeContextMenu();
			},
		});
		items.push({
			label: "Fit View",
			icon: <Maximize size={14} />,
			action: () => {
				closeContextMenu();
			},
		});
	}

	return (
		<div
			ref={ref}
			className="fixed z-50 min-w-40 rounded-sm border border-border bg-popover py-1"
			style={{ left: x, top: y }}
		>
			{items.map((item, i) => (
				<button
					key={i}
					onClick={item.action}
					className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-accent ${
						item.variant === "destructive" ? "text-destructive" : "text-popover-foreground"
					}`}
				>
					{item.icon}
					{item.label}
				</button>
			))}
		</div>
	);
}
