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
import { computeAutoLayout, getChildPosition, getGroupPosition, groupNodeId } from "./layout";
import { loadLayout, saveLayout } from "./persistence";
import { GROUP_KIND_COLORS } from "./theme";
import type { AgentFlowEdge, AgentFlowNode, GroupKind } from "./types";

type PanelType = "agent" | "group" | "tool" | "skill" | "channel" | null;

const GROUP_KINDS: GroupKind[] = ["tools", "skills", "channels"];
const GROUP_LABELS: Record<GroupKind, string> = {
	tools: "Tools",
	skills: "Skills",
	channels: "Channels",
};

// Map child node type to group kind
function childTypeToKind(childType: "tool" | "skill" | "channel"): GroupKind {
	return childType === "tool" ? "tools" : childType === "skill" ? "skills" : "channels";
}

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

	contextMenu: { x: number; y: number; nodeId: string | null; nodeType: string | null } | null;
	openContextMenu: (x: number, y: number, nodeId: string | null, nodeType: string | null) => void;
	closeContextMenu: () => void;

	autoLayout: () => void;

	collapsedGroups: Record<string, Partial<Record<GroupKind, boolean>>>;
	toggleCollapse: (agentId: string, group: GroupKind) => void;
}

// Helper: get the Agent object from a node
function getAgentFromNode(nodes: AgentFlowNode[], agentId: string): Agent | null {
	const node = nodes.find((n) => n.id === agentId && n.type === "agent");
	if (!node) return null;
	return (node.data as { agent: Agent }).agent;
}

// Helper: create a styled edge
function makeEdge(
	id: string,
	source: string,
	target: string,
	color: string,
	sourceHandle?: string,
): AgentFlowEdge {
	return {
		id,
		source,
		target,
		type: "smoothstep",
		selectable: false,
		deletable: false,
		style: { stroke: color, strokeWidth: 2 },
		...(sourceHandle && { sourceHandle }),
	};
}

// Helper: persist agent to backend (fire-and-forget)
function syncAgent(nodes: AgentFlowNode[], agentId: string) {
	const agent = getAgentFromNode(nodes, agentId);
	if (agent) {
		api.agents.update(agentId, agent).catch(console.error);
	}
}

// Helper: build group nodes + agent→group edges for one agent
function buildGroupNodesForAgent(
	agentId: string,
	agentPos: { x: number; y: number },
	positions: Record<string, { x: number; y: number }>,
): { nodes: AgentFlowNode[]; edges: AgentFlowEdge[] } {
	const gNodes: AgentFlowNode[] = [];
	const gEdges: AgentFlowEdge[] = [];

	for (const kind of GROUP_KINDS) {
		const gId = groupNodeId(agentId, kind);
		const pos = positions[gId] ?? getGroupPosition(agentPos.x, agentPos.y, kind);

		gNodes.push({
			id: gId,
			type: "group",
			position: pos,
			draggable: false,
			connectable: false,
			data: { label: GROUP_LABELS[kind], agentId, kind },
		} as AgentFlowNode);

		gEdges.push(makeEdge(`${agentId}-${gId}`, agentId, gId, GROUP_KIND_COLORS[kind], kind));
	}

	return { nodes: gNodes, edges: gEdges };
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

	// Add a child node under its group node
	const addChildNode = (
		agentId: string,
		childType: "tool" | "skill" | "channel",
		nodeData: AgentFlowNode["data"],
	): string => {
		const { nodes, edges, collapsedGroups } = get();
		const kind = childTypeToKind(childType);
		const gId = groupNodeId(agentId, kind);
		const groupNode = nodes.find((n) => n.id === gId);
		if (!groupNode) return "";

		// Count existing children of this group
		const childCount = edges.filter((e) => e.source === gId).length;
		const position = getChildPosition(groupNode.position.x, groupNode.position.y, childCount);

		const nodeId = generateId();
		const isCollapsed = collapsedGroups[agentId]?.[kind] ?? false;

		const newNode: AgentFlowNode = {
			id: nodeId,
			type: childType,
			position,
			draggable: false,
			connectable: false,
			data: nodeData,
			hidden: isCollapsed,
		} as AgentFlowNode;

		const newEdge: AgentFlowEdge = {
			...makeEdge(`${gId}-${nodeId}`, gId, nodeId, GROUP_KIND_COLORS[kind]),
			hidden: isCollapsed,
		};

		set({ nodes: [...nodes, newNode], edges: [...edges, newEdge] });
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
			const current = collapsedGroups[agentId] ?? {};
			const isCollapsed = current[group] ?? false;
			const next = { ...current, [group]: !isCollapsed };

			// Hide/show: group node + agent→group edge + child nodes + group→child edges
			const gId = groupNodeId(agentId, group);
			const childNodeIds = new Set(edges.filter((e) => e.source === gId).map((e) => e.target));
			const allHiddenIds = new Set([gId, ...childNodeIds]);

			const hidden = !isCollapsed; // toggling

			set({
				nodes: nodes.map((n) => (allHiddenIds.has(n.id) ? { ...n, hidden } : n)) as AgentFlowNode[],
				edges: edges.map((e) => {
					// Hide agent→group edge
					if (e.target === gId && e.source === agentId) return { ...e, hidden };
					// Hide group→child edges
					if (e.source === gId && childNodeIds.has(e.target)) return { ...e, hidden };
					return e;
				}),
				collapsedGroups: { ...collapsedGroups, [agentId]: next },
			});
			persistLayout();
		},

		onNodesChange: (changes) => {
			const { nodes, edges } = get();

			// Detect agent node position changes and move descendants together
			const agentDelta = new Map<string, { dx: number; dy: number }>();
			for (const change of changes) {
				if (change.type === "position" && change.position) {
					const node = nodes.find((n) => n.id === change.id);
					if (node?.type === "agent") {
						agentDelta.set(change.id, {
							dx: change.position.x - node.position.x,
							dy: change.position.y - node.position.y,
						});
					}
				}
			}

			let updated = applyNodeChanges(changes, nodes) as AgentFlowNode[];

			// Move group nodes + child nodes along with their agent
			if (agentDelta.size > 0) {
				// Build map: agentId → set of descendant node IDs (groups + children)
				const descendants = new Map<string, Set<string>>();
				for (const [agentId] of agentDelta) {
					const groupIds = GROUP_KINDS.map((k) => groupNodeId(agentId, k));
					const childIds = edges.filter((e) => groupIds.includes(e.source)).map((e) => e.target);
					descendants.set(agentId, new Set([...groupIds, ...childIds]));
				}

				updated = updated.map((n) => {
					for (const [agentId, delta] of agentDelta) {
						if (descendants.get(agentId)?.has(n.id)) {
							return {
								...n,
								position: {
									x: n.position.x + delta.dx,
									y: n.position.y + delta.dy,
								},
							};
						}
					}
					return n;
				}) as AgentFlowNode[];
			}

			set({ nodes: updated });
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

			const allNodes: AgentFlowNode[] = [];
			const allEdges: AgentFlowEdge[] = [];
			let yOffset = 0;

			for (const agent of agents) {
				const agentPos = positions[agent.id] ?? { x: 250, y: yOffset };
				yOffset += 400;

				// Agent node
				allNodes.push({
					id: agent.id,
					type: "agent",
					position: agentPos,
					data: { label: agent.name, agent },
				});

				// Group nodes + agent→group edges
				const groups = buildGroupNodesForAgent(agent.id, agentPos, positions);
				allNodes.push(...groups.nodes);
				allEdges.push(...groups.edges);

				// Child nodes for tools
				const toolsGroupId = groupNodeId(agent.id, "tools");
				const toolsGroupPos =
					positions[toolsGroupId] ?? getGroupPosition(agentPos.x, agentPos.y, "tools");
				for (let i = 0; i < agent.tools.length; i++) {
					const tool = agent.tools[i];
					const nodeId = `tool-${tool.id}`;
					const pos = positions[nodeId] ?? getChildPosition(toolsGroupPos.x, toolsGroupPos.y, i);
					allNodes.push({
						id: nodeId,
						type: "tool",
						position: pos,
						draggable: false,
						connectable: false,
						data: { label: tool.name, tool, agentId: agent.id },
					} as AgentFlowNode);
					allEdges.push(
						makeEdge(`${toolsGroupId}-${nodeId}`, toolsGroupId, nodeId, GROUP_KIND_COLORS.tools),
					);
				}

				// Child nodes for skills
				const skillsGroupId = groupNodeId(agent.id, "skills");
				const skillsGroupPos =
					positions[skillsGroupId] ?? getGroupPosition(agentPos.x, agentPos.y, "skills");
				for (let i = 0; i < agent.skills.length; i++) {
					const skill = agent.skills[i];
					const nodeId = `skill-${skill.id}`;
					const pos = positions[nodeId] ?? getChildPosition(skillsGroupPos.x, skillsGroupPos.y, i);
					allNodes.push({
						id: nodeId,
						type: "skill",
						position: pos,
						draggable: false,
						connectable: false,
						data: { label: skill.name, skill, agentId: agent.id },
					} as AgentFlowNode);
					allEdges.push(
						makeEdge(`${skillsGroupId}-${nodeId}`, skillsGroupId, nodeId, GROUP_KIND_COLORS.skills),
					);
				}

				// Child nodes for channels
				const channelsGroupId = groupNodeId(agent.id, "channels");
				const channelsGroupPos =
					positions[channelsGroupId] ?? getGroupPosition(agentPos.x, agentPos.y, "channels");
				for (let i = 0; i < agent.channels.length; i++) {
					const channel = agent.channels[i];
					const nodeId = `channel-${channel.id}`;
					const pos =
						positions[nodeId] ?? getChildPosition(channelsGroupPos.x, channelsGroupPos.y, i);
					allNodes.push({
						id: nodeId,
						type: "channel",
						position: pos,
						draggable: false,
						connectable: false,
						data: { label: channel.name, channel, agentId: agent.id },
					} as AgentFlowNode);
					allEdges.push(
						makeEdge(
							`${channelsGroupId}-${nodeId}`,
							channelsGroupId,
							nodeId,
							GROUP_KIND_COLORS.channels,
						),
					);
				}
			}

			set({ nodes: allNodes, edges: allEdges });

			// Auto-layout if no saved positions
			if (!layout?.positions || Object.keys(layout.positions).length === 0) {
				get().autoLayout();
			}
			persistLayout();
		},

		addAgent: async (position?: { x: number; y: number }) => {
			// Calculate non-overlapping position if not specified
			if (!position) {
				const { nodes } = get();
				const agentNodes = nodes.filter((n) => n.type === "agent");
				if (agentNodes.length === 0) {
					position = { x: 250, y: 200 };
				} else {
					const maxY = Math.max(...agentNodes.map((n) => n.position.y));
					position = { x: 250, y: maxY + 500 };
				}
			}
			const draft = createDefaultAgent();
			const channel = createDefaultChannel();
			draft.channels = [channel];

			const { id: _ignore, ...body } = draft;
			const agent = await api.agents.create(body as Omit<Agent, "id">);

			const agentNode: AgentFlowNode = {
				id: agent.id,
				type: "agent",
				position,
				data: { label: agent.name, agent },
			};

			const currentNodes = get().nodes;
			const currentEdges = get().edges;

			// Build group nodes
			const groups = buildGroupNodesForAgent(agent.id, position, {});

			// Build default channel child node
			const channelsGroupId = groupNodeId(agent.id, "channels");
			const channelsGroupPos = getGroupPosition(position.x, position.y, "channels");
			const chNodeId = `channel-${agent.channels[0].id}`;
			const chPos = getChildPosition(channelsGroupPos.x, channelsGroupPos.y, 0);
			const chNode: AgentFlowNode = {
				id: chNodeId,
				type: "channel",
				position: chPos,
				draggable: false,
				connectable: false,
				data: { label: agent.channels[0].name, channel: agent.channels[0], agentId: agent.id },
			} as AgentFlowNode;
			const chEdge = makeEdge(
				`${channelsGroupId}-${chNodeId}`,
				channelsGroupId,
				chNodeId,
				GROUP_KIND_COLORS.channels,
			);

			set({
				nodes: [...currentNodes, agentNode, ...groups.nodes, chNode],
				edges: [...currentEdges, ...groups.edges, chEdge],
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
			syncAgent(get().nodes, id);
		},

		deleteAgent: (id) => {
			const { nodes, edges } = get();
			// Cascade: agent → groups → children
			const groupIds = GROUP_KINDS.map((k) => groupNodeId(id, k));
			const childNodeIds = edges.filter((e) => groupIds.includes(e.source)).map((e) => e.target);
			const idsToRemove = new Set([id, ...groupIds, ...childNodeIds]);

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
