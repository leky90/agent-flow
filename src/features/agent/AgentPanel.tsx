import { X, Plus, Wrench, Zap, MessageSquare } from "lucide-react";
import { useFlowStore } from "../canvas/store";
import type { Agent, ThinkingLevel, ToolExecution } from "./types";

interface AgentPanelProps {
  agent: Agent;
}

export function AgentPanel({ agent }: AgentPanelProps) {
  const { updateAgent, addTool, addSkill, addChannel, closePanel } =
    useFlowStore();

  const handleChange = (field: keyof Agent, value: string) => {
    updateAgent(agent.id, { [field]: value });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">Edit Agent</h2>
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
            value={agent.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Model
          </label>
          <input
            type="text"
            value={agent.model}
            onChange={(e) => handleChange("model", e.target.value)}
            placeholder="provider/model"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            System Prompt
          </label>
          <textarea
            value={agent.systemPrompt}
            onChange={(e) => handleChange("systemPrompt", e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Thinking Level
          </label>
          <select
            value={agent.thinkingLevel}
            onChange={(e) =>
              handleChange("thinkingLevel", e.target.value as ThinkingLevel)
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          >
            {(
              ["minimal", "low", "medium", "high", "xhigh"] as ThinkingLevel[]
            ).map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Tool Execution
          </label>
          <select
            value={agent.toolExecution}
            onChange={(e) =>
              handleChange("toolExecution", e.target.value as ToolExecution)
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="parallel">Parallel</option>
            <option value="sequential">Sequential</option>
          </select>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="mb-2 text-xs font-semibold text-gray-500 uppercase">
            Add Children
          </h3>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => addTool(agent.id)}
              className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-100"
            >
              <Wrench size={14} />
              <Plus size={14} />
              Add Tool
            </button>
            <button
              onClick={() => addSkill(agent.id)}
              className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 hover:bg-amber-100"
            >
              <Zap size={14} />
              <Plus size={14} />
              Add Skill
            </button>
            <button
              onClick={() => addChannel(agent.id)}
              className="flex items-center gap-2 rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-700 hover:bg-sky-100"
            >
              <MessageSquare size={14} />
              <Plus size={14} />
              Add Channel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
