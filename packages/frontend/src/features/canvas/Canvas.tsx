import {
	Background,
	BackgroundVariant,
	Controls,
	MiniMap,
	type NodeMouseHandler,
	ReactFlow,
} from "@xyflow/react";
import { useCallback, useState } from "react";
import { DeleteConfirm } from "../../shared/ui/DeleteConfirm";
import { ContextMenu } from "./ContextMenu";
import { nodeTypes } from "./nodeTypes";
import { useFlowStore } from "./store";
import { NODE_COLORS } from "./theme";
import type { AgentFlowNode } from "./types";

export function Canvas() {
	const {
		nodes,
		edges,
		onNodesChange,
		onEdgesChange,
		setSelectedNode,
		closePanel,
		deleteAgent,
		deleteTool,
		deleteSkill,
		deleteChannel,
		openContextMenu,
		closeContextMenu,
	} = useFlowStore();

	const [deleteTarget, setDeleteTarget] = useState<AgentFlowNode | null>(null);

	const onNodeClick: NodeMouseHandler<AgentFlowNode> = useCallback(
		(_event, node) => {
			const type = node.type as "agent" | "tool" | "skill" | "channel";
			setSelectedNode(node.id, type);
		},
		[setSelectedNode],
	);

	const onPaneClick = useCallback(() => {
		closePanel();
		closeContextMenu();
	}, [closePanel, closeContextMenu]);

	const onNodeContextMenu: NodeMouseHandler<AgentFlowNode> = useCallback(
		(event, node) => {
			event.preventDefault();
			const type = node.type as "agent" | "tool" | "skill" | "channel";
			openContextMenu(event.clientX, event.clientY, node.id, type);
		},
		[openContextMenu],
	);

	const onPaneContextMenu = useCallback(
		(event: MouseEvent | React.MouseEvent) => {
			event.preventDefault();
			openContextMenu(event.clientX, event.clientY, null, null);
		},
		[openContextMenu],
	);

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent) => {
			if (event.key === "Delete" || event.key === "Backspace") {
				const { selectedNodeId } = useFlowStore.getState();
				if (!selectedNodeId) return;
				const node = nodes.find((n) => n.id === selectedNodeId);
				if (node) setDeleteTarget(node as AgentFlowNode);
			}
		},
		[nodes],
	);

	const handleDelete = useCallback(() => {
		if (!deleteTarget) return;
		const node = deleteTarget;

		if (node.type === "agent") {
			deleteAgent(node.id);
		} else if (node.type === "tool") {
			deleteTool(node.data.agentId, node.data.tool.id);
		} else if (node.type === "skill") {
			deleteSkill(node.data.agentId, node.data.skill.id);
		} else if (node.type === "channel") {
			deleteChannel(node.data.agentId, node.data.channel.id);
		}
		setDeleteTarget(null);
	}, [deleteTarget, deleteAgent, deleteTool, deleteSkill, deleteChannel]);

	return (
		<div className="h-full w-full" onKeyDown={handleKeyDown}>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onNodeClick={onNodeClick}
				onPaneClick={onPaneClick}
				onNodeContextMenu={onNodeContextMenu}
				onPaneContextMenu={onPaneContextMenu}
				nodeTypes={nodeTypes}
				fitView
				fitViewOptions={{ padding: 0.2 }}
				proOptions={{ hideAttribution: true }}
			>
				<Background
					variant={BackgroundVariant.Lines}
					gap={48}
					size={0.5}
					color="rgba(165,32,32,0.15)"
				/>
				<Controls />
				<MiniMap
					nodeColor={(node) => {
						switch (node.type) {
							case "agent":
								return NODE_COLORS.agent;
							case "tool":
								return NODE_COLORS.tool;
							case "skill":
								return NODE_COLORS.skill;
							case "channel":
								return NODE_COLORS.channel;
							default:
								return NODE_COLORS.default;
						}
					}}
				/>
			</ReactFlow>

			<ContextMenu />

			{deleteTarget && (
				<DeleteConfirm
					title={`Delete ${deleteTarget.type}?`}
					message={
						deleteTarget.type === "agent"
							? "This will also delete all connected tools, skills, and channels."
							: `This will remove the ${deleteTarget.type} node.`
					}
					onConfirm={handleDelete}
					onCancel={() => setDeleteTarget(null)}
				/>
			)}
		</div>
	);
}
