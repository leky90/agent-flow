import { generateId } from "@agent-flow/shared";
import {
	applyEdgeChanges,
	applyNodeChanges,
	type OnEdgesChange,
	type OnNodesChange,
} from "@xyflow/react";
import { create } from "zustand";
import { api } from "@/api/client";
import { createDefaultAgent } from "../agent/defaults";
import type { Agent } from "../agent/types";
import { createDefaultChannel } from "../channel/defaults";
import type { AgentChannel } from "../channel/types";
import { createDefaultSkill } from "../skill/defaults";
import type { AgentSkill } from "../skill/types";
import { createDefaultTool } from "../tool/defaults";
import type { AgentTool } from "../tool/types";
import { computeAutoLayout, countChildrenByType, getChildPosition } from "./layout";
import { loadLayout, saveLayout } from "./persistence";
import { NODE_COLORS } from "./theme";
import type { AgentFlowEdge, AgentFlowNode } from "./types";

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

	addAgent: (position?: { x: number; y: number }) => Promise<string>;
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

	loadFromApi: () => Promise<void>;

	// Context menu
	contextMenu: { x: number; y: number; nodeId: string | null; nodeType: string | null } | null;
	openContextMenu: (x: number, y: number, nodeId: string | null, nodeType: string | null) => void;
	closeContextMenu: () => void;

	// Auto layout
	autoLayout: () => void;

	// Collapse/expand
	collapsedGroups: Record<string, Array<"tools" | "skills" | "channels">>;
	toggleCollapse: (agentId: string, group: "tools" | "skills" | "channels") => void;
}

// Helper: get the Agent object from a node
function getAgentFromNode(nodes: AgentFlowNode[], agentId: string): Agent | null {
	const node = nodes.find((n) => n.id === agentId && n.type === "agent");
	if (!node) return null;
	return (node.data as { agent: Agent }).agent;
}

// Helper: persist agent to backend (fire-and-forget)
function syncAgent(nodes: AgentFlowNode[], agentId: string) {
	const agent = getAgentFromNode(nodes, agentId);
	if (agent) {
		api.agents.update(agentId, agent).catch(console.error);
	}
}

let persistTimer: ReturnType<typeof setTimeout> | null = null;

export const useFlowStore = create<FlowState>((set, get) => {
	const persistLayout = () => {
		if (persistTimer) clearTimeout(persistTimer);
		persistTimer = setTimeout(() => {
			const { nodes, edges } = get();
			const positions: Record<string, { x: number; y: number }> = {};
			for (const n of nodes) {
				positions[n.id] = n.position;
			}
			saveLayout(positions, edges);
		}, 300);
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
		const handleId = childType === "tool" ? "tools" : childType === "skill" ? "skills" : "channels";

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
						? NODE_COLORS.tool
						: childType === "skill"
							? NODE_COLORS.skill
							: NODE_COLORS.channel,
				strokeWidth: 2,
			},
		};

		set({ nodes: [...nodes, newNode], edges: [...get().edges, newEdge] });
		persistLayout();
		return nodeId;
	};

	return {
		nodes: [],
		edges: [],
		selectedNodeId: null,
		panelType: null,
		contextMenu: null,
		openContextMenu: (x, y, nodeId, nodeType) => set({ contextMenu: { x, y, nodeId, nodeType } }),
		closeContextMenu: () => set({ contextMenu: null }),

		autoLayout: () => {
			const { nodes, edges } = get();
			if (nodes.length === 0) return;
			const visibleNodes = nodes.filter((n) => !n.hidden);
			const visibleEdges = edges.filter((e) => !e.hidden);
			const positions = computeAutoLayout(visibleNodes as AgentFlowNode[], visibleEdges);
			set({
				nodes: nodes.map((n) => ({
					...n,
					position: positions[n.id] ?? n.position,
				})) as AgentFlowNode[],
			});
			persistLayout();
		},

		collapsedGroups: {},

		toggleCollapse: (agentId, group) => {
			const { nodes, edges, collapsedGroups } = get();
			const current = collapsedGroups[agentId] ?? [];
			const isCollapsed = current.includes(group);
			const next = isCollapsed ? current.filter((g) => g !== group) : [...current, group];

			// Find child node IDs for this group via edges
			const handleId = group; // "tools" | "skills" | "channels"
			const childNodeIds = new Set(
				edges
					.filter((e) => e.source === agentId && e.sourceHandle === handleId)
					.map((e) => e.target),
			);

			const hidden = !isCollapsed; // toggling: if was expanded, now hide

			set({
				nodes: nodes.map((n) => (childNodeIds.has(n.id) ? { ...n, hidden } : n)) as AgentFlowNode[],
				edges: edges.map((e) =>
					childNodeIds.has(e.target) && e.source === agentId ? { ...e, hidden } : e,
				),
				collapsedGroups: { ...collapsedGroups, [agentId]: next },
			});
			persistLayout();
		},

		onNodesChange: (changes) => {
			set({ nodes: applyNodeChanges(changes, get().nodes) as AgentFlowNode[] });
			persistLayout();
		},

		onEdgesChange: (changes) => {
			set({ edges: applyEdgeChanges(changes, get().edges) });
			persistLayout();
		},

		setSelectedNode: (id, type) => set({ selectedNodeId: id, panelType: type }),
		closePanel: () => set({ selectedNodeId: null, panelType: null }),

		// --- Load agents from API, reconcile with saved canvas layout ---
		loadFromApi: async () => {
			const agents = await api.agents.list();
			const layout = loadLayout();
			const positions = layout?.positions ?? {};

			const nodes: AgentFlowNode[] = [];
			const edges: AgentFlowEdge[] = [];
			let yOffset = 0;

			for (const agent of agents) {
				const agentPos = positions[agent.id] ?? { x: 250, y: yOffset };
				yOffset += 400;

				nodes.push({
					id: agent.id,
					type: "agent",
					position: agentPos,
					data: { label: agent.name, agent },
				});

				// Rebuild child nodes for tools
				for (let i = 0; i < agent.tools.length; i++) {
					const tool = agent.tools[i];
					const nodeId = `tool-${tool.id}`;
					const pos = positions[nodeId] ?? getChildPosition(agentPos.x, agentPos.y, "tool", i);
					nodes.push({
						id: nodeId,
						type: "tool",
						position: pos,
						data: { label: tool.name, tool, agentId: agent.id },
					} as AgentFlowNode);
					edges.push({
						id: `${agent.id}-${nodeId}`,
						source: agent.id,
						target: nodeId,
						sourceHandle: "tools",
						style: { stroke: NODE_COLORS.tool, strokeWidth: 2 },
					});
				}

				// Rebuild child nodes for skills
				for (let i = 0; i < agent.skills.length; i++) {
					const skill = agent.skills[i];
					const nodeId = `skill-${skill.id}`;
					const pos = positions[nodeId] ?? getChildPosition(agentPos.x, agentPos.y, "skill", i);
					nodes.push({
						id: nodeId,
						type: "skill",
						position: pos,
						data: { label: skill.name, skill, agentId: agent.id },
					} as AgentFlowNode);
					edges.push({
						id: `${agent.id}-${nodeId}`,
						source: agent.id,
						target: nodeId,
						sourceHandle: "skills",
						style: { stroke: NODE_COLORS.skill, strokeWidth: 2 },
					});
				}

				// Rebuild child nodes for channels
				for (let i = 0; i < agent.channels.length; i++) {
					const channel = agent.channels[i];
					const nodeId = `channel-${channel.id}`;
					const pos = positions[nodeId] ?? getChildPosition(agentPos.x, agentPos.y, "channel", i);
					nodes.push({
						id: nodeId,
						type: "channel",
						position: pos,
						data: { label: channel.name, channel, agentId: agent.id },
					} as AgentFlowNode);
					edges.push({
						id: `${agent.id}-${nodeId}`,
						source: agent.id,
						target: nodeId,
						sourceHandle: "channels",
						style: { stroke: NODE_COLORS.channel, strokeWidth: 2 },
					});
				}
			}

			set({ nodes, edges });
			persistLayout();
		},

		addAgent: async (position = { x: 250, y: 200 }) => {
			const draft = createDefaultAgent();
			const channel = createDefaultChannel();
			draft.channels = [channel];

			// Create on backend first to get real ID
			const { id: _ignore, ...body } = draft;
			const agent = await api.agents.create(body as Omit<Agent, "id">);

			const agentNode: AgentFlowNode = {
				id: agent.id,
				type: "agent",
				position,
				data: { label: agent.name, agent },
			};

			set({ nodes: [...get().nodes, agentNode] });

			// Add default channel node
			const chNodeId = `channel-${agent.channels[0].id}`;
			const chPos = getChildPosition(position.x, position.y, "channel", 0);
			const chNode: AgentFlowNode = {
				id: chNodeId,
				type: "channel",
				position: chPos,
				data: { label: agent.channels[0].name, channel: agent.channels[0], agentId: agent.id },
			} as AgentFlowNode;
			const chEdge: AgentFlowEdge = {
				id: `${agent.id}-${chNodeId}`,
				source: agent.id,
				target: chNodeId,
				sourceHandle: "channels",
				style: { stroke: NODE_COLORS.channel, strokeWidth: 2 },
			};

			set({
				nodes: [...get().nodes, chNode],
				edges: [...get().edges, chEdge],
				selectedNodeId: agent.id,
				panelType: "agent",
			});

			persistLayout();
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
			persistLayout();
			// Sync to backend
			syncAgent(get().nodes, id);
		},

		deleteAgent: (id) => {
			const { nodes, edges } = get();
			const childNodeIds = edges.filter((e) => e.source === id).map((e) => e.target);
			const idsToRemove = new Set([id, ...childNodeIds]);

			set({
				nodes: nodes.filter((n) => !idsToRemove.has(n.id)) as AgentFlowNode[],
				edges: edges.filter((e) => !idsToRemove.has(e.source) && !idsToRemove.has(e.target)),
				selectedNodeId: null,
				panelType: null,
			});
			persistLayout();
			api.agents.delete(id).catch(console.error);
		},

		addTool: (agentId) => {
			const tool = createDefaultTool();

			get().updateAgent(agentId, {
				tools: [...(getAgentFromNode(get().nodes, agentId)?.tools ?? []), tool],
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
			persistLayout();
			syncAgent(get().nodes, agentId);
		},

		deleteTool: (agentId, toolId) => {
			const { nodes, edges } = get();
			const toolNode = nodes.find((n) => n.type === "tool" && n.data.tool.id === toolId);
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
				edges: edges.filter((e) => e.target !== toolNode.id && e.source !== toolNode.id),
				selectedNodeId: null,
				panelType: null,
			});
			persistLayout();
			syncAgent(get().nodes, agentId);
		},

		addSkill: (agentId) => {
			const skill = createDefaultSkill();

			get().updateAgent(agentId, {
				skills: [...(getAgentFromNode(get().nodes, agentId)?.skills ?? []), skill],
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
			persistLayout();
			syncAgent(get().nodes, agentId);
		},

		deleteSkill: (agentId, skillId) => {
			const { nodes, edges } = get();
			const skillNode = nodes.find((n) => n.type === "skill" && n.data.skill.id === skillId);
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
				edges: edges.filter((e) => e.target !== skillNode.id && e.source !== skillNode.id),
				selectedNodeId: null,
				panelType: null,
			});
			persistLayout();
			syncAgent(get().nodes, agentId);
		},

		addChannel: (agentId) => {
			const channel = createDefaultChannel({ name: "New Channel", isDM: false });

			get().updateAgent(agentId, {
				channels: [...(getAgentFromNode(get().nodes, agentId)?.channels ?? []), channel],
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
			persistLayout();
			syncAgent(get().nodes, agentId);
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
										channels: agentData.agent.channels.filter((c) => c.id !== channelId),
									},
								},
							};
						}
						return n;
					}) as AgentFlowNode[],
				edges: edges.filter((e) => e.target !== channelNode.id && e.source !== channelNode.id),
				selectedNodeId: null,
				panelType: null,
			});
			persistLayout();
			syncAgent(get().nodes, agentId);
		},
	};
});
