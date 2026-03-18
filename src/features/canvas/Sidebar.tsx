import { Plus, Bot, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useReactFlow } from "@xyflow/react";
import { useFlowStore } from "./store";
import { DeleteConfirm } from "../../shared/ui/DeleteConfirm";
import type { Agent } from "../agent/types";

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
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed right-0 bottom-16 z-50 flex w-64 flex-col rounded-xl border border-gray-200 bg-white shadow-2xl transition-all duration-200 ${
          open
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
        style={{ maxHeight: "min(480px, calc(100vh - 100px))" }}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Agents</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {agents.map(({ id, agent, position }) => (
            <div
              key={id}
              onClick={() => handleClickAgent(id, position)}
              className="group mb-1 flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 hover:bg-gray-100"
            >
              <div className="flex items-center gap-2">
                <Bot size={14} className="text-indigo-600" />
                <span className="text-sm text-gray-700">{agent.name}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteAgentId(id);
                }}
                className="hidden text-red-400 hover:text-red-600 group-hover:block"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {agents.length === 0 && (
            <p className="px-3 py-4 text-center text-xs text-gray-400">
              No agents yet.
            </p>
          )}
        </div>

        <div className="border-t border-gray-200 p-3">
          <button
            onClick={() => addAgent()}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
          >
            <Plus size={16} />
            New Agent
          </button>
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
