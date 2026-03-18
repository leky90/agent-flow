import { useCallback, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type NodeMouseHandler,
} from "@xyflow/react";
import { useFlowStore } from "./store";
import { nodeTypes } from "./nodeTypes";
import { DeleteConfirm } from "../../shared/ui/DeleteConfirm";
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
  }, [closePanel]);

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
    <div className="h-full w-full" onKeyDown={handleKeyDown} tabIndex={0}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case "agent":
                return "#6366f1";
              case "tool":
                return "#10b981";
              case "skill":
                return "#f59e0b";
              case "channel":
                return "#0ea5e9";
              default:
                return "#94a3b8";
            }
          }}
        />
      </ReactFlow>

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
