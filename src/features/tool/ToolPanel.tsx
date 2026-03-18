import { X, Plus, Trash2 } from "lucide-react";
import { useFlowStore } from "../canvas/store";
import type { AgentTool, ToolParam } from "./types";

interface ToolPanelProps {
  tool: AgentTool;
  agentId: string;
}

export function ToolPanel({ tool, agentId }: ToolPanelProps) {
  const { updateTool, closePanel } = useFlowStore();

  const handleAddParam = () => {
    updateTool(agentId, tool.id, {
      parameters: [
        ...tool.parameters,
        { name: "", type: "string", description: "", required: false },
      ],
    });
  };

  const handleUpdateParam = (
    index: number,
    field: keyof ToolParam,
    value: string | boolean,
  ) => {
    const updated = tool.parameters.map((p, i) =>
      i === index ? { ...p, [field]: value } : p,
    );
    updateTool(agentId, tool.id, { parameters: updated });
  };

  const handleRemoveParam = (index: number) => {
    updateTool(agentId, tool.id, {
      parameters: tool.parameters.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">Edit Tool</h2>
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
            value={tool.name}
            onChange={(e) =>
              updateTool(agentId, tool.id, { name: e.target.value })
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Description
          </label>
          <textarea
            value={tool.description}
            onChange={(e) =>
              updateTool(agentId, tool.id, { description: e.target.value })
            }
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-medium text-gray-500">
              Parameters
            </label>
            <button
              onClick={handleAddParam}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
            >
              <Plus size={12} /> Add
            </button>
          </div>

          {tool.parameters.map((param, index) => (
            <div
              key={index}
              className="mb-2 rounded-lg border border-gray-200 p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <input
                  type="text"
                  placeholder="Parameter name"
                  value={param.name}
                  onChange={(e) =>
                    handleUpdateParam(index, "name", e.target.value)
                  }
                  className="w-full rounded border border-gray-200 px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none"
                />
                <button
                  onClick={() => handleRemoveParam(index)}
                  className="ml-2 text-red-400 hover:text-red-600"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <div className="flex gap-2">
                <select
                  value={param.type}
                  onChange={(e) =>
                    handleUpdateParam(index, "type", e.target.value)
                  }
                  className="rounded border border-gray-200 px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none"
                >
                  {["string", "number", "boolean", "object", "array"].map(
                    (t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ),
                  )}
                </select>
                <label className="flex items-center gap-1 text-xs text-gray-500">
                  <input
                    type="checkbox"
                    checked={param.required}
                    onChange={(e) =>
                      handleUpdateParam(index, "required", e.target.checked)
                    }
                  />
                  Required
                </label>
              </div>
              <input
                type="text"
                placeholder="Description"
                value={param.description}
                onChange={(e) =>
                  handleUpdateParam(index, "description", e.target.value)
                }
                className="mt-2 w-full rounded border border-gray-200 px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
