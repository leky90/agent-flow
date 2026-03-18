import { Handle, Position } from "@xyflow/react";
import { Bot, Wrench, Zap, MessageSquare } from "lucide-react";
import type { AgentNodeData } from "../canvas/types";

export function AgentNode({ data }: { data: AgentNodeData }) {
  const { agent } = data;

  return (
    <div className="min-w-[260px] rounded-xl bg-indigo-600 text-white shadow-lg">
      <div className="flex items-center gap-2 border-b border-indigo-500 px-4 py-3">
        <Bot size={18} />
        <span className="text-sm font-semibold">{agent.name}</span>
      </div>

      <div className="space-y-2 px-4 py-3">
        <div className="rounded bg-indigo-700/50 px-2 py-1 text-xs">
          {agent.model}
        </div>
        <div className="flex items-center gap-1 text-xs text-indigo-200">
          <span>Thinking: {agent.thinkingLevel}</span>
          <span className="mx-1">·</span>
          <span>{agent.toolExecution}</span>
        </div>
        <div className="flex gap-2 text-xs text-indigo-200">
          <span className="flex items-center gap-1">
            <Wrench size={12} /> {agent.tools.length}
          </span>
          <span className="flex items-center gap-1">
            <Zap size={12} /> {agent.skills.length}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare size={12} /> {agent.channels.length}
          </span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="tools"
        style={{ top: "25%", background: "#10b981" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="skills"
        style={{ top: "50%", background: "#f59e0b" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="channels"
        style={{ top: "75%", background: "#0ea5e9" }}
      />
    </div>
  );
}
