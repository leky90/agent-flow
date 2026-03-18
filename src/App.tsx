import { useEffect, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { Bot } from "lucide-react";
import { useFlowStore } from "./features/canvas/store";
import { Canvas } from "./features/canvas/Canvas";
import { Sidebar } from "./features/canvas/Sidebar";
import { ChatThread } from "./features/channel/ChatThread";
import { AgentPanel } from "./features/agent/AgentPanel";
import { ToolPanel } from "./features/tool/ToolPanel";
import { SkillPanel } from "./features/skill/SkillPanel";
import { ChannelPanel } from "./features/channel/ChannelPanel";
import type { Agent } from "./features/agent/types";
import type { AgentTool } from "./features/tool/types";
import type { AgentSkill } from "./features/skill/types";
import type { AgentChannel } from "./features/channel/types";

function AppContent() {
  const { nodes, selectedNodeId, panelType, loadPersistedState } =
    useFlowStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadPersistedState();
  }, [loadPersistedState]);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  const renderPanel = () => {
    if (!selectedNode || !panelType) return null;

    switch (panelType) {
      case "agent":
        return (
          <AgentPanel
            agent={(selectedNode.data as { agent: Agent }).agent}
          />
        );
      case "tool":
        return (
          <ToolPanel
            tool={(selectedNode.data as { tool: AgentTool }).tool}
            agentId={(selectedNode.data as { agentId: string }).agentId}
          />
        );
      case "skill":
        return (
          <SkillPanel
            skill={(selectedNode.data as { skill: AgentSkill }).skill}
            agentId={(selectedNode.data as { agentId: string }).agentId}
          />
        );
      case "channel":
        return (
          <ChannelPanel
            channel={
              (selectedNode.data as { channel: AgentChannel }).channel
            }
            agentId={(selectedNode.data as { agentId: string }).agentId}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative h-screen w-screen">
      <Canvas />

      {panelType && (
        <div className="absolute top-0 right-0 h-full w-80 border-l border-gray-200 bg-white shadow-xl">
          {renderPanel()}
        </div>
      )}

      <ChatThread />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <button
        onClick={() => setSidebarOpen((v) => !v)}
        className="fixed right-4 bottom-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition-transform hover:scale-105 hover:bg-indigo-700 active:scale-95"
        title="Agents"
      >
        <Bot size={22} />
      </button>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <AppContent />
    </ReactFlowProvider>
  );
}
