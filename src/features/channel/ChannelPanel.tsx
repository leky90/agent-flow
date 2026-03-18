import { X } from "lucide-react";
import { useFlowStore } from "../canvas/store";
import { ModelSelector } from "../../shared/ui/ModelSelector";
import type { AgentChannel } from "./types";

interface ChannelPanelProps {
  channel: AgentChannel;
  agentId: string;
}

export function ChannelPanel({ channel, agentId }: ChannelPanelProps) {
  const { updateChannel, closePanel } = useFlowStore();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">Edit Channel</h2>
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
            value={channel.name}
            onChange={(e) =>
              updateChannel(agentId, channel.id, { name: e.target.value })
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={channel.isDM}
              onChange={(e) =>
                updateChannel(agentId, channel.id, { isDM: e.target.checked })
              }
              className="rounded border-gray-300"
            />
            Direct Message
          </label>
        </div>

        <ModelSelector
          provider={channel.provider}
          model={channel.model}
          onProviderChange={(provider) =>
            updateChannel(agentId, channel.id, { provider })
          }
          onModelChange={(model) =>
            updateChannel(agentId, channel.id, { model })
          }
        />
      </div>
    </div>
  );
}
