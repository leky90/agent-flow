import {
	AssistantRuntimeProvider,
	type ChatModelAdapter,
	type ChatModelRunOptions,
	ThreadPrimitive,
	useLocalRuntime,
} from "@assistant-ui/react";
import { Maximize2, Minimize2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { api } from "@/api/client";
import { Button } from "@/components/ui/button";
import type { Agent } from "../agent/types";
import { useFlowStore } from "../canvas/store";
import { useChatStore } from "./store";
import type { AgentChannel } from "./types";
import { AssistantBubble, UserBubble } from "./ui/ChatBubble";
import { ChatComposer } from "./ui/ChatComposer";

function ChatContent({ agent, channel }: { agent: Agent; channel: AgentChannel }) {
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

				for await (const event of api.chat.stream(agent.id, userText)) {
					if (event.type === "message_delta") {
						yield {
							content: [{ type: "text" as const, text: event.text }],
						};
					}
				}
			},
		}),
		[agent.id],
	);

	const runtime = useLocalRuntime(adapter);

	return (
		<div
			className={`fixed z-50 flex flex-col overflow-hidden rounded-sm border border-border bg-card ${
				maximized ? "inset-4" : "right-4 bottom-4 h-130 w-100"
			}`}
		>
			<div className="flex items-center justify-between border-b border-border bg-primary px-4 py-2.5 text-primary-foreground">
				<div className="flex flex-col">
					<span className="font-heading text-sm font-semibold">{agent.name}</span>
					<span className="text-xs text-primary-foreground/70">
						{channel.provider}/{channel.model}
					</span>
				</div>
				<div className="flex items-center gap-1">
					<Button variant="ghost-on-primary" size="icon-xs" onClick={() => setMaximized((v) => !v)}>
						{maximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
					</Button>
					<Button variant="ghost-on-primary" size="icon-xs" onClick={closeChat}>
						<X size={14} />
					</Button>
				</div>
			</div>

			<AssistantRuntimeProvider runtime={runtime}>
				<ThreadPrimitive.Root className="flex flex-1 flex-col overflow-hidden">
					<ThreadPrimitive.Viewport className="flex-1 overflow-y-auto">
						<ThreadPrimitive.Empty>
							<div className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
								Start a conversation with {agent.name}
							</div>
						</ThreadPrimitive.Empty>

						<ThreadPrimitive.Messages
							components={{
								UserMessage: UserBubble,
								AssistantMessage: AssistantBubble,
							}}
						/>
					</ThreadPrimitive.Viewport>

					<ChatComposer />
				</ThreadPrimitive.Root>
			</AssistantRuntimeProvider>
		</div>
	);
}

export function ChatThread() {
	const { openChannelId, openAgentId } = useChatStore();
	const { nodes } = useFlowStore();

	if (!openChannelId || !openAgentId) return null;

	const agentNode = nodes.find((n) => n.id === openAgentId && n.type === "agent");
	const channelNode = nodes.find(
		(n) => n.type === "channel" && n.data.channel.id === openChannelId,
	);

	if (!agentNode || !channelNode) return null;

	const agent = (agentNode.data as { agent: Agent }).agent;
	const channel = (channelNode.data as { channel: AgentChannel }).channel;

	return <ChatContent key={openChannelId} agent={agent} channel={channel} />;
}
