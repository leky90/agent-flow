import { create } from "zustand";

interface ChatState {
  openChannelId: string | null;
  openAgentId: string | null;
  openChat: (channelId: string, agentId: string) => void;
  closeChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  openChannelId: null,
  openAgentId: null,
  openChat: (channelId, agentId) =>
    set({ openChannelId: channelId, openAgentId: agentId }),
  closeChat: () => set({ openChannelId: null, openAgentId: null }),
}));
