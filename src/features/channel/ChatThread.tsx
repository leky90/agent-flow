import { useMemo, useState } from "react";
import {
  AssistantRuntimeProvider,
  useLocalRuntime,
  ThreadPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  type ChatModelAdapter,
  type ChatModelRunOptions,
} from "@assistant-ui/react";
import { X, Maximize2, Minimize2, SendHorizonal } from "lucide-react";
import { useChatStore } from "./store";
import { useFlowStore } from "../canvas/store";
import type { Agent } from "../agent/types";
import type { AgentChannel } from "./types";

function UserMessage() {
  return (
    <MessagePrimitive.Root className="flex justify-end px-4 py-2">
      <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-indigo-600 px-4 py-2.5 text-sm text-white">
        <MessagePrimitive.Content />
      </div>
    </MessagePrimitive.Root>
  );
}

function AssistantMessage() {
  return (
    <MessagePrimitive.Root className="flex justify-start px-4 py-2">
      <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-gray-100 px-4 py-2.5 text-sm text-gray-900">
        <MessagePrimitive.Content />
      </div>
    </MessagePrimitive.Root>
  );
}

function Composer() {
  return (
    <ComposerPrimitive.Root className="flex items-end gap-2 border-t border-gray-200 bg-white px-4 py-3">
      <ComposerPrimitive.Input
        placeholder="Type a message..."
        className="flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
        rows={1}
      />
      <ComposerPrimitive.Send className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white transition-colors hover:bg-indigo-700 disabled:bg-gray-300">
        <SendHorizonal size={16} />
      </ComposerPrimitive.Send>
    </ComposerPrimitive.Root>
  );
}

function ChatContent({
  agent,
  channel,
}: {
  agent: Agent;
  channel: AgentChannel;
}) {
  const { closeChat } = useChatStore();
  const [maximized, setMaximized] = useState(false);

  const adapter: ChatModelAdapter = useMemo(
    () => ({
      async *run({ messages }: ChatModelRunOptions) {
        const lastMessage = messages[messages.length - 1];
        let userText = "";
        if (lastMessage?.role === "user") {
          for (const part of lastMessage.content) {
            if (part.type === "text") userText += part.text;
          }
        }

        yield {
          content: [
            {
              type: "text" as const,
              text: `[${channel.provider}/${channel.model}] Echo from **${agent.name}**: ${userText}\n\n_This is a demo response. Connect a real LLM backend to enable actual conversations._`,
            },
          ],
        };
      },
    }),
    [agent.name, channel.provider, channel.model],
  );

  const runtime = useLocalRuntime(adapter);

  return (
    <div
      className={`fixed z-50 flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl transition-all duration-200 ${
        maximized ? "inset-4" : "right-4 bottom-4 h-[520px] w-[400px]"
      }`}
    >
      <div className="flex items-center justify-between border-b border-gray-200 bg-sky-500 px-4 py-2.5 text-white">
        <div className="flex flex-col">
          <span className="text-sm font-semibold">{agent.name}</span>
          <span className="text-[10px] text-sky-100">
            {channel.provider}/{channel.model}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMaximized((v) => !v)}
            className="rounded p-1 hover:bg-sky-400"
          >
            {maximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button onClick={closeChat} className="rounded p-1 hover:bg-sky-400">
            <X size={14} />
          </button>
        </div>
      </div>

      <AssistantRuntimeProvider runtime={runtime}>
        <ThreadPrimitive.Root className="flex flex-1 flex-col overflow-hidden">
          <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto">
            <ThreadPrimitive.Empty>
              <div className="flex h-full items-center justify-center p-8 text-center text-sm text-gray-400">
                Start a conversation with {agent.name}
              </div>
            </ThreadPrimitive.Empty>

            <ThreadPrimitive.Messages
              components={{ UserMessage, AssistantMessage }}
            />
          </ThreadPrimitive.Viewport>

          <Composer />
        </ThreadPrimitive.Root>
      </AssistantRuntimeProvider>
    </div>
  );
}

export function ChatThread() {
  const { openChannelId, openAgentId } = useChatStore();
  const { nodes } = useFlowStore();

  if (!openChannelId || !openAgentId) return null;

  const agentNode = nodes.find(
    (n) => n.id === openAgentId && n.type === "agent",
  );
  const channelNode = nodes.find(
    (n) => n.type === "channel" && n.data.channel.id === openChannelId,
  );

  if (!agentNode || !channelNode) return null;

  const agent = (agentNode.data as { agent: Agent }).agent;
  const channel = (channelNode.data as { channel: AgentChannel }).channel;

  return <ChatContent key={openChannelId} agent={agent} channel={channel} />;
}
