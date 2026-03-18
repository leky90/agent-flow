import { Handle, Position } from "@xyflow/react";
import { MessageSquare, MessageCircle } from "lucide-react";
import { useChatStore } from "./store";
import type { ChannelNodeData } from "../canvas/types";

export function ChannelNode({ data }: { data: ChannelNodeData }) {
  const { channel, agentId } = data;
  const { openChat } = useChatStore();

  return (
    <div className="min-w-[200px] rounded-xl bg-sky-500 text-white shadow-lg">
      <div className="flex items-center gap-2 px-4 py-3">
        <MessageSquare size={16} />
        <span className="flex-1 text-sm font-semibold">{channel.name}</span>
        {channel.isDM && (
          <span className="rounded bg-sky-600 px-1.5 py-0.5 text-[10px] font-medium">
            DM
          </span>
        )}
      </div>
      <div className="flex items-center justify-between border-t border-sky-400 px-4 py-2">
        <span className="text-xs text-sky-100">
          {channel.provider} / {channel.model}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            openChat(channel.id, agentId);
          }}
          className="rounded bg-sky-600 p-1.5 transition-colors hover:bg-sky-700"
          title="Open chat"
        >
          <MessageCircle size={12} />
        </button>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        style={{ background: "#0ea5e9" }}
      />
    </div>
  );
}
