# Agent Flow — Canvas Board Feature Spec

## Overview
A canvas-first monitor board for managing and observing AI agents. Users visually manage agent configurations, their tools/skills/channels, and monitor agent activity — all on an interactive node-graph canvas.

---

## Feature Status

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| F1 | Canvas board (React Flow) | DONE | fitView, controls, minimap, grid |
| F2 | Add/edit/delete agents | DONE | Full CRUD via backend API |
| F3 | Add/edit/delete tools | DONE | Full CRUD with param management |
| F4 | Add/edit/delete skills | DONE | Full CRUD with path field |
| F5 | Add/edit/delete channels | DONE | Full CRUD with provider/model |
| F6 | Agent → tool/skill/channel edges | DONE | Auto-created, color-coded |
| F7 | Collapse/expand child nodes | TODO | Not implemented |
| F8 | Right-click context menu | TODO | Not implemented |
| F9 | Drag & drop node positioning | DONE | Native React Flow, persisted |
| F10 | Auto Layout button | TODO | Not implemented |
| F11 | Backend data fetching | DONE | API + localStorage layout |

---

## F1: Canvas Board

### Description
Full-screen interactive canvas using React Flow. The canvas is the primary workspace — all other UI (sidebar, panels, chat) floats over it.

### Acceptance Criteria
- [x] Canvas occupies full viewport
- [x] Background grid visible (Lines variant, warm-toned)
- [x] Zoom in/out/fit controls
- [x] Minimap with color-coded nodes
- [x] Keyboard: Delete/Backspace removes selected node (with confirmation)
- [x] Click node → opens edit panel on the right
- [x] Click pane → closes panel

### Technical Notes
- `@xyflow/react` v12.10.1
- `Canvas.tsx` wraps `<ReactFlow>` with `<Background>`, `<Controls>`, `<MiniMap>`
- Node types registered in `nodeTypes.ts`: agent, tool, skill, channel

---

## F2: Agent CRUD

### Description
Create, read, update, and delete agent configurations. Each agent has: name, model (provider/modelId), system prompt, thinking level, tool execution mode, and collections of tools/skills/channels.

### Acceptance Criteria
- [x] Create agent via sidebar "New Agent" button
- [x] New agent appears on canvas with default DM channel
- [x] Click agent node → edit panel opens
- [x] Edit name, model, system prompt, thinking level, tool execution
- [x] Delete agent removes node + all child nodes + edges
- [x] All changes persist to backend API
- [x] Agents load from backend on app startup

### API Endpoints
```
GET    /api/agents
GET    /api/agents/:id
POST   /api/agents
PUT    /api/agents/:id
DELETE /api/agents/:id
```

---

## F3–F5: Tool/Skill/Channel CRUD

### Description
Each agent can have tools (with typed parameters), skills (named capabilities), and channels (communication endpoints with provider/model selection).

### Acceptance Criteria
- [x] Add tool/skill/channel from agent panel "Add Children" section
- [x] Child node appears on canvas, connected to parent agent via edge
- [x] Click child node → opens corresponding edit panel
- [x] Edit all fields for each type
- [x] Tool panel: manage parameters (add/remove, name/type/required/description)
- [x] Channel panel: select provider and model from dropdowns
- [x] Channel panel: toggle Direct Message flag
- [x] Delete child node removes node + edge + updates parent agent
- [x] Changes sync to backend (via parent agent update)

### Node Types

**Tool Node** (accent-2 / copper):
- Fields: name, description, parameters[]
- Each parameter: name, type (string|number|boolean|object|array), description, required

**Skill Node** (accent-3 / gold):
- Fields: name, description, path (optional)

**Channel Node** (accent-4 / warm gray):
- Fields: name, provider, model, isDM
- Has "Open chat" button → opens ChatThread

---

## F6: Node Connections (Edges)

### Description
When a child node (tool/skill/channel) is added, an edge is automatically created connecting it to the parent agent node.

### Acceptance Criteria
- [x] Agent node has 3 source handles on the right: tools (25%), skills (50%), channels (75%)
- [x] Child nodes have 1 target handle on the left
- [x] Edges color-coded: tool=accent-2, skill=accent-3, channel=accent-4
- [x] Edge strokeWidth: 2px
- [x] Deleting parent cascades to all children + edges
- [x] Edges stored in localStorage layout persistence

---

## F7: Collapse/Expand Child Nodes

### Status: TODO

### Description
Each agent node has 3 groups of children (tools, skills, channels). Users should be able to collapse/expand each group by clicking on the corresponding handle or a toggle control.

### Acceptance Criteria
- [ ] Each agent has 3 collapsible groups: tools, skills, channels
- [ ] Clicking a handle/toggle hides all child nodes + edges of that group
- [ ] Collapsed state shown visually (e.g., handle dot becomes a count badge: "3 tools")
- [ ] Expanding restores nodes to their previous positions
- [ ] Collapse state persists in localStorage
- [ ] Default: all groups expanded

### Interaction
- **Collapse**: Click handle dot or a toggle icon → child nodes of that group fade out and hide, edges disappear, handle shows count
- **Expand**: Click collapsed handle → child nodes animate back into position

### Technical Approach
- Add `collapsedGroups: Record<string, Set<"tools" | "skills" | "channels">>` to store
- When collapsed, set child nodes to `hidden: true` in React Flow
- Store collapse state in layout persistence
- Update AgentNode component to show collapse/expand controls on handles

---

## F8: Right-Click Context Menu

### Status: TODO

### Description
Right-clicking on any node opens a contextual menu with actions specific to that node type.

### Acceptance Criteria
- [ ] Right-click agent node → menu: Edit, Add Tool, Add Skill, Add Channel, Delete
- [ ] Right-click tool node → menu: Edit, Delete
- [ ] Right-click skill node → menu: Edit, Delete
- [ ] Right-click channel node → menu: Edit, Open Chat, Delete
- [ ] Right-click canvas (pane) → menu: Add Agent, Fit View, Auto Layout
- [ ] Menu closes on click outside or Escape
- [ ] Delete actions show confirmation dialog
- [ ] Menu positioned at cursor location

### Technical Approach
- Use `onNodeContextMenu` and `onPaneContextMenu` props on `<ReactFlow>`
- Create `<ContextMenu>` component (or use shadcn `DropdownMenu` positioned at mouse)
- Store context menu state: `{ x, y, nodeId?, nodeType?, visible }`
- Menu items dispatch existing store actions

---

## F9: Drag & Drop Node Positioning

### Description
Users can drag nodes to rearrange them on the canvas. Positions persist across sessions.

### Acceptance Criteria
- [x] All node types are draggable
- [x] Dragging a node updates its position in real-time
- [x] Position changes persist to localStorage
- [x] On reload, nodes restore to their last saved positions
- [x] Edges follow nodes during drag (React Flow native behavior)

---

## F10: Auto Layout Button

### Status: TODO

### Description
A button that automatically arranges all nodes in an organized layout. Useful when the canvas becomes messy after manual rearranging or when many nodes are added.

### Acceptance Criteria
- [ ] Auto Layout button visible in canvas controls area
- [ ] Click → all nodes rearrange into a tree layout (agents left, children right)
- [ ] Layout respects node types: agents in a column, children grouped by type
- [ ] Edges don't overlap
- [ ] Animation: nodes transition smoothly to new positions
- [ ] Layout positions persist after auto-layout

### Layout Algorithm
- Use `@dagrejs/dagre` (or `elkjs`) for hierarchical/tree layout
- Direction: Left-to-Right (LR)
- Grouping: Agent nodes → Tool/Skill/Channel nodes branching right
- Node spacing: horizontal 300px, vertical 100px
- After layout: call `fitView()` to center

### Technical Approach
- Install `@dagrejs/dagre`
- Add `autoLayout()` function to store or a `layout.ts` utility
- Function: reads current nodes/edges → runs dagre → sets new positions → persists
- Add button to Canvas.tsx controls area (or a floating button)

---

## F11: Backend Data Fetching

### Description
All agent configuration data is fetched from the backend API. The frontend does not store agent data — only canvas layout (positions, edges) is in localStorage.

### Acceptance Criteria
- [x] On app load, agents are fetched via `GET /api/agents`
- [x] Canvas nodes are reconstructed from backend data + saved layout positions
- [x] Creating an agent calls `POST /api/agents` before adding to canvas
- [x] Updating an agent calls `PUT /api/agents/:id` (fire-and-forget)
- [x] Deleting an agent calls `DELETE /api/agents/:id`
- [x] Child CRUD updates parent agent via `PUT /api/agents/:id`
- [x] If backend is unavailable, canvas shows empty state (no crash)

---

## Data Model

### Agent (stored in backend)
```typescript
interface Agent {
  id: string;
  name: string;
  model: string;               // "provider/modelId"
  systemPrompt: string;
  thinkingLevel: "minimal" | "low" | "medium" | "high" | "xhigh";
  toolExecution: "sequential" | "parallel";
  tools: AgentTool[];
  skills: AgentSkill[];
  channels: AgentChannel[];
}
```

### Canvas Layout (stored in localStorage)
```typescript
interface PersistedLayout {
  positions: Record<string, { x: number; y: number }>;
  edges: AgentFlowEdge[];
}
```

---

## Test Coverage

### Unit Tests (vitest) — 12 tests
- Agent CRUD routes: 9 tests (create, read, update, delete, 404 cases)
- Runner factory routing: 3 tests (cursor vs standard provider routing)

### E2E Tests (Playwright) — 7 tests
- Empty canvas on first load
- Create agent via sidebar
- Edit agent name via panel
- Delete agent via API + verify canvas
- Theme toggle (dark/light mode)
- API CRUD roundtrip (create → read → update → list → delete)
- Chat SSE endpoint streaming

### Missing Tests (for TODO features)
- [ ] F7: Collapse/expand child nodes (no tests — feature not built)
- [ ] F8: Right-click context menu (no tests — feature not built)
- [ ] F10: Auto layout (no tests — feature not built)
