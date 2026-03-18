import { Handle, Position } from "@xyflow/react";
import { Zap } from "lucide-react";
import type { SkillNodeData } from "../canvas/types";

export function SkillNode({ data }: { data: SkillNodeData }) {
  const { skill } = data;

  return (
    <div className="min-w-[180px] rounded-xl bg-amber-500 text-white shadow-lg">
      <div className="flex items-center gap-2 px-4 py-3">
        <Zap size={16} />
        <span className="text-sm font-semibold">{skill.name}</span>
      </div>
      <div className="border-t border-amber-400 px-4 py-2 text-xs text-amber-100">
        {skill.description || "No description"}
        {skill.path && (
          <div className="mt-1 truncate text-amber-200">{skill.path}</div>
        )}
      </div>

      <Handle
        type="target"
        position={Position.Left}
        style={{ background: "#f59e0b" }}
      />
    </div>
  );
}
