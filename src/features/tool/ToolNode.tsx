import { Handle, Position } from "@xyflow/react";
import { Wrench } from "lucide-react";
import type { ToolNodeData } from "../canvas/types";

export function ToolNode({ data }: { data: ToolNodeData }) {
  const { tool } = data;

  return (
    <div className="min-w-[180px] rounded-xl bg-emerald-500 text-white shadow-lg">
      <div className="flex items-center gap-2 px-4 py-3">
        <Wrench size={16} />
        <span className="text-sm font-semibold">{tool.name}</span>
      </div>
      <div className="border-t border-emerald-400 px-4 py-2 text-xs text-emerald-100">
        {tool.description || "No description"}
        {tool.parameters.length > 0 && (
          <span className="ml-2 rounded bg-emerald-600 px-1.5 py-0.5">
            {tool.parameters.length} params
          </span>
        )}
      </div>

      <Handle
        type="target"
        position={Position.Left}
        style={{ background: "#10b981" }}
      />
    </div>
  );
}
