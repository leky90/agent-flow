import { X } from "lucide-react";
import { useFlowStore } from "../canvas/store";
import type { AgentSkill } from "./types";

interface SkillPanelProps {
  skill: AgentSkill;
  agentId: string;
}

export function SkillPanel({ skill, agentId }: SkillPanelProps) {
  const { updateSkill, closePanel } = useFlowStore();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">Edit Skill</h2>
        <button
          onClick={closePanel}
          className="rounded p-1 hover:bg-gray-100"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Name
          </label>
          <input
            type="text"
            value={skill.name}
            onChange={(e) =>
              updateSkill(agentId, skill.id, { name: e.target.value })
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Description
          </label>
          <textarea
            value={skill.description}
            onChange={(e) =>
              updateSkill(agentId, skill.id, { description: e.target.value })
            }
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Path (optional)
          </label>
          <input
            type="text"
            value={skill.path ?? ""}
            onChange={(e) =>
              updateSkill(agentId, skill.id, {
                path: e.target.value || undefined,
              })
            }
            placeholder="e.g., ~/.pi/agent/skills/my-skill"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
