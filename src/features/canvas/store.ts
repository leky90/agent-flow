import { create } from "zustand";
import {
  applyNodeChanges,
  applyEdgeChanges,
  type OnNodesChange,
  type OnEdgesChange,
} from "@xyflow/react";
import type { AgentFlowNode, AgentFlowEdge } from "./types";
import type { Agent } from "../agent/types";
import type { AgentTool } from "../tool/types";
import type { AgentSkill } from "../skill/types";
import type { AgentChannel } from "../channel/types";
import { createDefaultAgent } from "../agent/defaults";
import { createDefaultTool } from "../tool/defaults";
import { createDefaultSkill } from "../skill/defaults";
import { createDefaultChannel } from "../channel/defaults";
import { generateId } from "../../shared/utils/id";
import { getChildPosition, countChildrenByType } from "./layout";
import { saveState, loadState } from "./persistence";

type PanelType = "agent" | "tool" | "skill" | "channel" | null;

interface FlowState {
  nodes: AgentFlowNode[];
  edges: AgentFlowEdge[];
  selectedNodeId: string | null;
  panelType: PanelType;

  onNodesChange: OnNodesChange<AgentFlowNode>;
  onEdgesChange: OnEdgesChange<AgentFlowEdge>;

  setSelectedNode: (id: string | null, type: PanelType) => void;
  closePanel: () => void;

  addAgent: (position?: { x: number; y: number }) => string;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  deleteAgent: (id: string) => void;

  addTool: (agentId: string) => string;
  updateTool: (agentId: string, toolId: string, updates: Partial<AgentTool>) => void;
  deleteTool: (agentId: string, toolId: string) => void;

  addSkill: (agentId: string) => string;
  updateSkill: (agentId: string, skillId: string, updates: Partial<AgentSkill>) => void;
  deleteSkill: (agentId: string, skillId: string) => void;

  addChannel: (agentId: string) => string;
  updateChannel: (agentId: string, channelId: string, updates: Partial<AgentChannel>) => void;
  deleteChannel: (agentId: string, channelId: string) => void;

  loadPersistedState: () => void;
}

export const useFlowStore = create<FlowState>((set, get) => {
  const persist = () => {
    const { nodes, edges } = get();
    saveState(nodes, edges);
  };

  const addChildNode = (
    agentId: string,
    childType: "tool" | "skill" | "channel",
    nodeData: AgentFlowNode["data"],
  ): string => {
    const { nodes } = get();
    const agentNode = nodes.find((n) => n.id === agentId);
    if (!agentNode) return "";

    const childCount = countChildrenByType(nodes, agentId, childType);
    const position = getChildPosition(
      agentNode.position.x,
      agentNode.position.y,
      childType,
      childCount,
    );

    const nodeId = generateId();
    const handleId =
      childType === "tool"
        ? "tools"
        : childType === "skill"
          ? "skills"
          : "channels";

    const newNode: AgentFlowNode = {
      id: nodeId,
      type: childType,
      position,
      data: nodeData,
    } as AgentFlowNode;

    const newEdge: AgentFlowEdge = {
      id: `${agentId}-${nodeId}`,
      source: agentId,
      target: nodeId,
      sourceHandle: handleId,
      style: {
        stroke:
          childType === "tool"
            ? "#10b981"
            : childType === "skill"
              ? "#f59e0b"
              : "#0ea5e9",
        strokeWidth: 2,
      },
    };

    set({ nodes: [...nodes, newNode], edges: [...get().edges, newEdge] });
    persist();
    return nodeId;
  };

  return {
    nodes: [],
    edges: [],
    selectedNodeId: null,
    panelType: null,

    onNodesChange: (changes) => {
      set({ nodes: applyNodeChanges(changes, get().nodes) as AgentFlowNode[] });
      persist();
    },

    onEdgesChange: (changes) => {
      set({ edges: applyEdgeChanges(changes, get().edges) });
      persist();
    },

    setSelectedNode: (id, type) => set({ selectedNodeId: id, panelType: type }),
    closePanel: () => set({ selectedNodeId: null, panelType: null }),

    addAgent: (position = { x: 250, y: 200 }) => {
      const agent = createDefaultAgent();
      const channel = createDefaultChannel();
      agent.channels = [channel];

      const agentNode: AgentFlowNode = {
        id: agent.id,
        type: "agent",
        position,
        data: { label: agent.name, agent },
      };

      set({ nodes: [...get().nodes, agentNode] });

      const channelNodeId = addChildNode(agent.id, "channel", {
        label: channel.name,
        channel,
        agentId: agent.id,
      });

      set({
        selectedNodeId: agent.id,
        panelType: "agent",
      });

      persist();
      void channelNodeId;
      return agent.id;
    },

    updateAgent: (id, updates) => {
      set({
        nodes: get().nodes.map((node) => {
          if (node.id === id && node.type === "agent") {
            const agentData = node.data as { label: string; agent: Agent };
            const updatedAgent = { ...agentData.agent, ...updates };
            return {
              ...node,
              data: {
                ...agentData,
                label: updatedAgent.name,
                agent: updatedAgent,
              },
            };
          }
          return node;
        }) as AgentFlowNode[],
      });
      persist();
    },

    deleteAgent: (id) => {
      const { nodes, edges } = get();
      const childNodeIds = edges
        .filter((e) => e.source === id)
        .map((e) => e.target);
      const idsToRemove = new Set([id, ...childNodeIds]);

      set({
        nodes: nodes.filter((n) => !idsToRemove.has(n.id)) as AgentFlowNode[],
        edges: edges.filter(
          (e) => !idsToRemove.has(e.source) && !idsToRemove.has(e.target),
        ),
        selectedNodeId: null,
        panelType: null,
      });
      persist();
    },

    addTool: (agentId) => {
      const tool = createDefaultTool();

      get().updateAgent(agentId, {
        tools: [
          ...(
            get().nodes.find((n) => n.id === agentId)?.data as {
              agent: Agent;
            }
          ).agent.tools,
          tool,
        ],
      });

      const nodeId = addChildNode(agentId, "tool", {
        label: tool.name,
        tool,
        agentId,
      });

      set({ selectedNodeId: nodeId, panelType: "tool" });
      return nodeId;
    },

    updateTool: (agentId, toolId, updates) => {
      set({
        nodes: get().nodes.map((node) => {
          if (node.type === "tool" && node.data.tool.id === toolId) {
            const updatedTool = { ...node.data.tool, ...updates };
            return {
              ...node,
              data: { ...node.data, label: updatedTool.name, tool: updatedTool },
            };
          }
          if (node.id === agentId && node.type === "agent") {
            const agentData = node.data as { label: string; agent: Agent };
            return {
              ...node,
              data: {
                ...agentData,
                agent: {
                  ...agentData.agent,
                  tools: agentData.agent.tools.map((t) =>
                    t.id === toolId ? { ...t, ...updates } : t,
                  ),
                },
              },
            };
          }
          return node;
        }) as AgentFlowNode[],
      });
      persist();
    },

    deleteTool: (agentId, toolId) => {
      const { nodes, edges } = get();
      const toolNode = nodes.find(
        (n) => n.type === "tool" && n.data.tool.id === toolId,
      );
      if (!toolNode) return;

      set({
        nodes: nodes
          .filter((n) => n.id !== toolNode.id)
          .map((n) => {
            if (n.id === agentId && n.type === "agent") {
              const agentData = n.data as { label: string; agent: Agent };
              return {
                ...n,
                data: {
                  ...agentData,
                  agent: {
                    ...agentData.agent,
                    tools: agentData.agent.tools.filter((t) => t.id !== toolId),
                  },
                },
              };
            }
            return n;
          }) as AgentFlowNode[],
        edges: edges.filter(
          (e) => e.target !== toolNode.id && e.source !== toolNode.id,
        ),
        selectedNodeId: null,
        panelType: null,
      });
      persist();
    },

    addSkill: (agentId) => {
      const skill = createDefaultSkill();

      get().updateAgent(agentId, {
        skills: [
          ...(
            get().nodes.find((n) => n.id === agentId)?.data as {
              agent: Agent;
            }
          ).agent.skills,
          skill,
        ],
      });

      const nodeId = addChildNode(agentId, "skill", {
        label: skill.name,
        skill,
        agentId,
      });

      set({ selectedNodeId: nodeId, panelType: "skill" });
      return nodeId;
    },

    updateSkill: (agentId, skillId, updates) => {
      set({
        nodes: get().nodes.map((node) => {
          if (node.type === "skill" && node.data.skill.id === skillId) {
            const updatedSkill = { ...node.data.skill, ...updates };
            return {
              ...node,
              data: { ...node.data, label: updatedSkill.name, skill: updatedSkill },
            };
          }
          if (node.id === agentId && node.type === "agent") {
            const agentData = node.data as { label: string; agent: Agent };
            return {
              ...node,
              data: {
                ...agentData,
                agent: {
                  ...agentData.agent,
                  skills: agentData.agent.skills.map((s) =>
                    s.id === skillId ? { ...s, ...updates } : s,
                  ),
                },
              },
            };
          }
          return node;
        }) as AgentFlowNode[],
      });
      persist();
    },

    deleteSkill: (agentId, skillId) => {
      const { nodes, edges } = get();
      const skillNode = nodes.find(
        (n) => n.type === "skill" && n.data.skill.id === skillId,
      );
      if (!skillNode) return;

      set({
        nodes: nodes
          .filter((n) => n.id !== skillNode.id)
          .map((n) => {
            if (n.id === agentId && n.type === "agent") {
              const agentData = n.data as { label: string; agent: Agent };
              return {
                ...n,
                data: {
                  ...agentData,
                  agent: {
                    ...agentData.agent,
                    skills: agentData.agent.skills.filter((s) => s.id !== skillId),
                  },
                },
              };
            }
            return n;
          }) as AgentFlowNode[],
        edges: edges.filter(
          (e) => e.target !== skillNode.id && e.source !== skillNode.id,
        ),
        selectedNodeId: null,
        panelType: null,
      });
      persist();
    },

    addChannel: (agentId) => {
      const channel = createDefaultChannel({ name: "New Channel", isDM: false });

      get().updateAgent(agentId, {
        channels: [
          ...(
            get().nodes.find((n) => n.id === agentId)?.data as {
              agent: Agent;
            }
          ).agent.channels,
          channel,
        ],
      });

      const nodeId = addChildNode(agentId, "channel", {
        label: channel.name,
        channel,
        agentId,
      });

      set({ selectedNodeId: nodeId, panelType: "channel" });
      return nodeId;
    },

    updateChannel: (agentId, channelId, updates) => {
      set({
        nodes: get().nodes.map((node) => {
          if (node.type === "channel" && node.data.channel.id === channelId) {
            const updatedChannel = { ...node.data.channel, ...updates };
            return {
              ...node,
              data: {
                ...node.data,
                label: updatedChannel.name,
                channel: updatedChannel,
              },
            };
          }
          if (node.id === agentId && node.type === "agent") {
            const agentData = node.data as { label: string; agent: Agent };
            return {
              ...node,
              data: {
                ...agentData,
                agent: {
                  ...agentData.agent,
                  channels: agentData.agent.channels.map((c) =>
                    c.id === channelId ? { ...c, ...updates } : c,
                  ),
                },
              },
            };
          }
          return node;
        }) as AgentFlowNode[],
      });
      persist();
    },

    deleteChannel: (agentId, channelId) => {
      const { nodes, edges } = get();
      const channelNode = nodes.find(
        (n) => n.type === "channel" && n.data.channel.id === channelId,
      );
      if (!channelNode) return;

      set({
        nodes: nodes
          .filter((n) => n.id !== channelNode.id)
          .map((n) => {
            if (n.id === agentId && n.type === "agent") {
              const agentData = n.data as { label: string; agent: Agent };
              return {
                ...n,
                data: {
                  ...agentData,
                  agent: {
                    ...agentData.agent,
                    channels: agentData.agent.channels.filter(
                      (c) => c.id !== channelId,
                    ),
                  },
                },
              };
            }
            return n;
          }) as AgentFlowNode[],
        edges: edges.filter(
          (e) => e.target !== channelNode.id && e.source !== channelNode.id,
        ),
        selectedNodeId: null,
        panelType: null,
      });
      persist();
    },

    loadPersistedState: () => {
      const state = loadState();
      if (state) {
        set({ nodes: state.nodes, edges: state.edges });
      }
    },
  };
});
