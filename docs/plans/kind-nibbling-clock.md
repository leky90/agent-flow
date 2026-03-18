# Implementation Plan — TODO Features + Backend Gaps

## Context

The agent-flow app has 3 frontend TODO features (F7 collapse/expand, F8 context menu, F10 auto layout) and 3 backend gaps (no tool registration, no Claude CLI ACP, no Codex CLI ACP). This plan covers all 6 items in priority order.

---

## Priority Order

| # | Item | Type | Effort |
|---|------|------|--------|
| B1 | Register default tools with pi-agent-core | Backend | Medium |
| B2 | Add Claude CLI ACP provider | Backend | Medium |
| B3 | Add Codex CLI ACP provider | Backend | Small |
| F8 | Right-click context menu | Frontend | Medium |
| F7 | Collapse/expand child nodes | Frontend | Medium |
| F10 | Auto Layout button | Frontend | Small |

---

## B1: Register Default Tools with Pi-Agent-Core

### Problem
`agent-runner.ts` creates PiAgent but never calls `setTools()`. The `config.tools` array from the Agent schema is metadata-only — it has no `execute` function. Agents can only chat, not use tools.

### Approach
Install `@mariozechner/pi-coding-agent` and use its `createAllTools()` factory to provide default coding tools (read, write, edit, bash, grep, find, ls). Map the shared `AgentTool` metadata to pi-agent-core's `AgentTool` interface.

### Files to Modify
- `packages/backend/package.json` — add `@mariozechner/pi-coding-agent`
- `packages/backend/src/services/agent-runner.ts` — call `setTools()` with default tools

### Implementation
```
1. pnpm --filter @agent-flow/backend add @mariozechner/pi-coding-agent
2. In agent-runner.ts getOrCreatePiAgent():
   - Import createAllTools from @mariozechner/pi-coding-agent
   - Call createAllTools({ cwd: process.cwd() }) to get default tools
   - Call piAgent.setTools(defaultTools)
3. Tool events (tool_start, tool_end) will now fire naturally
```

### Verification
- Create agent, send chat message that requires file reading
- SSE stream should include `tool_start` and `tool_end` events

---

## B2: Add Claude CLI ACP Provider

### Problem
No Claude CLI integration. Claude Code supports ACP via `claude mcp` or direct stdio, but the app only has Cursor ACP.

### Approach
Extract the ACP protocol from `cursor-acp.ts` into a reusable `AcpClient` base class, then create `claude-acp.ts` that spawns `claude` CLI with appropriate flags.

### Files to Create/Modify
- `packages/backend/src/services/acp-client.ts` — **NEW**: generic ACP client (extracted from cursor-acp.ts)
- `packages/backend/src/services/cursor-acp.ts` — refactor to use AcpClient
- `packages/backend/src/services/claude-acp.ts` — **NEW**: Claude CLI ACP
- `packages/backend/src/services/runner-factory.ts` — add `claude/*` routing
- `packages/shared/src/constants/models.ts` — add claude provider

### Implementation
```
1. Create acp-client.ts:
   - Extract CursorAcpClient's JSON-RPC logic into generic AcpClient class
   - Constructor takes: { command, args, env }
   - Same methods: initialize(), newSession(mode), prompt(message), abort()
   - Same notification handling pattern

2. Refactor cursor-acp.ts:
   - CursorAcpClient extends AcpClient
   - Constructor: super({ command: "agent", args: ["acp"], env: { CURSOR_API_KEY, ... } })

3. Create claude-acp.ts:
   - ClaudeAcpClient extends AcpClient
   - Command: "claude" with args for ACP/MCP mode
   - runClaudeAgent() async generator → ChatSSEEvent
   - abortClaudeAgent()

4. Update runner-factory.ts:
   - Add: if (model.startsWith("claude-cli/")) → runClaudeAgent()

5. Update models.ts:
   - Add provider: { provider: "claude-cli", label: "Claude CLI", models: [...] }
```

### Verification
- Install Claude CLI, authenticate
- Create agent with `claude-cli/claude-code` model
- Chat should spawn `claude` process and stream responses

---

## B3: Add Codex CLI ACP Provider

### Problem
No Codex CLI integration. Same ACP pattern as Claude/Cursor.

### Approach
Reuse AcpClient base from B2.

### Files to Create/Modify
- `packages/backend/src/services/codex-acp.ts` — **NEW**: Codex CLI ACP
- `packages/backend/src/services/runner-factory.ts` — add `codex/*` routing
- `packages/shared/src/constants/models.ts` — add codex provider

### Implementation
```
1. Create codex-acp.ts:
   - CodexAcpClient extends AcpClient
   - Command: "codex" with args for ACP mode
   - runCodexAgent() / abortCodexAgent()

2. Update runner-factory.ts:
   - Add: if (model.startsWith("codex/")) → runCodexAgent()

3. Update models.ts:
   - Add provider: { provider: "codex", label: "Codex CLI", models: [{ id: "codex-agent", label: "Codex Agent" }] }
```

### Verification
- Create agent with `codex/codex-agent` model
- Chat should spawn codex process via ACP

---

## F8: Right-Click Context Menu

### Problem
No context menu on nodes or canvas. Users can only interact via click → panel or sidebar.

### Approach
Use React Flow's `onNodeContextMenu` and `onPaneContextMenu` props. Create a positioned menu component using shadcn DropdownMenu primitives.

### Files to Create/Modify
- `packages/frontend/src/features/canvas/ContextMenu.tsx` — **NEW**: context menu component
- `packages/frontend/src/features/canvas/Canvas.tsx` — add context menu handlers
- `packages/frontend/src/features/canvas/store.ts` — add context menu state

### Implementation
```
1. Add to store.ts:
   contextMenu: { x: number; y: number; nodeId: string | null; nodeType: string | null } | null
   openContextMenu(x, y, nodeId?, nodeType?)
   closeContextMenu()

2. Create ContextMenu.tsx:
   - Reads contextMenu state from store
   - Positioned at {x, y} via style={{ top, left }}
   - Renders menu items based on nodeType:
     - agent: Edit, Add Tool, Add Skill, Add Channel, Separator, Delete
     - tool/skill: Edit, Delete
     - channel: Edit, Open Chat, Delete
     - null (pane): Add Agent, Fit View, Auto Layout
   - Each item dispatches existing store actions
   - Click outside or Escape closes menu

3. Update Canvas.tsx:
   - Add onNodeContextMenu={(event, node) => {
       event.preventDefault();
       openContextMenu(event.clientX, event.clientY, node.id, node.type);
     }}
   - Add onPaneContextMenu={(event) => {
       event.preventDefault();
       openContextMenu(event.clientX, event.clientY, null, null);
     }}
   - Render <ContextMenu /> inside the canvas wrapper
```

### Verification
- Right-click agent node → menu shows Edit, Add Tool, Add Skill, Add Channel, Delete
- Right-click tool node → menu shows Edit, Delete
- Right-click channel node → menu shows Edit, Open Chat, Delete
- Right-click canvas → menu shows Add Agent, Fit View, Auto Layout
- Click menu item → action executes, menu closes
- E2E test: `features.spec.ts` F8 tests should pass

---

## F7: Collapse/Expand Child Nodes

### Problem
All child nodes always visible. Canvas gets cluttered with many agents.

### Approach
Use React Flow's `hidden` property on nodes/edges. Add collapse state to store. Agent node shows toggle controls on each handle group.

### Files to Modify
- `packages/frontend/src/features/canvas/store.ts` — add collapse state + toggle action
- `packages/frontend/src/features/canvas/persistence.ts` — persist collapse state
- `packages/frontend/src/features/agent/AgentNode.tsx` — add collapse toggle buttons on handles

### Implementation
```
1. Add to store.ts:
   collapsedGroups: Record<string, Set<string>>  // agentId → Set<"tools"|"skills"|"channels">

   toggleCollapse(agentId: string, group: "tools" | "skills" | "channels"):
     - Toggle group in collapsedGroups
     - Find all child nodes of that group (by edge sourceHandle)
     - Set node.hidden = true/false
     - Set corresponding edges hidden = true/false
     - Persist collapse state

2. Update persistence.ts:
   - Add collapsedGroups to PersistedLayout interface
   - Save/load collapse state alongside positions

3. Update loadFromApi():
   - After building nodes, apply saved collapse state (set hidden on collapsed children)

4. Update AgentNode.tsx:
   - Each handle area shows a clickable toggle:
     - Expanded: handle dot + icon (wrench/zap/chat)
     - Collapsed: count badge "2" replacing the handle area
   - onClick calls toggleCollapse(agentId, group)
   - Use store.getState() since node components can't use hooks for store actions
     (or pass toggleCollapse via node data)
```

### Verification
- Click tool handle area → tool child nodes hide, handle shows count
- Click again → tool nodes reappear
- Reload page → collapse state preserved
- E2E test: `features.spec.ts` F7 tests should pass

---

## F10: Auto Layout Button

### Problem
No way to automatically organize nodes. Users must manually position everything.

### Approach
Use `@dagrejs/dagre` for hierarchical tree layout (LR direction). Add button to bottom-left controls or floating toolbar.

### Files to Create/Modify
- `packages/frontend/package.json` — add `@dagrejs/dagre`
- `packages/frontend/src/features/canvas/layout.ts` — add `computeAutoLayout()` function
- `packages/frontend/src/features/canvas/store.ts` — add `autoLayout()` action
- `packages/frontend/src/features/canvas/Canvas.tsx` — add Auto Layout button

### Implementation
```
1. pnpm --filter @agent-flow/frontend add @dagrejs/dagre

2. In layout.ts, add computeAutoLayout(nodes, edges):
   - Create dagre graph (rankdir: "LR")
   - Set node dimensions: agent 260x160, tool/skill 180x100, channel 200x120
   - Set edge spacing: ranksep 300, nodesep 80
   - Run dagre.layout()
   - Return new positions Record<string, {x, y}>

3. In store.ts, add autoLayout():
   - Call computeAutoLayout(nodes, edges)
   - Apply new positions to all nodes
   - Persist layout
   - Trigger fitView via React Flow API

4. In Canvas.tsx:
   - Add button in controls area (bottom-left, above zoom controls)
   - Or add floating button near existing controls
   - onClick → store.autoLayout(); reactFlowInstance.fitView()
```

### Verification
- Create multiple agents with tools/skills/channels
- Click Auto Layout → nodes arrange in tree (agents left, children right)
- Positions persist on reload
- E2E test: `features.spec.ts` F10 tests should pass

---

## Execution Order

```
Phase 1: Backend (B1 → B2 → B3)
  ├─ B1: Register default tools — standalone, no dependencies
  ├─ B2: Extract AcpClient + Claude CLI — refactors cursor-acp
  └─ B3: Codex CLI — trivial after B2

Phase 2: Frontend (F8 → F7 → F10)
  ├─ F8: Context menu — no dependencies, adds interaction layer
  ├─ F7: Collapse/expand — needs store changes, AgentNode changes
  └─ F10: Auto Layout — needs dagre, standalone utility

Phase 3: Tests
  └─ Un-skip all 6 E2E tests in features.spec.ts, verify they pass
```

---

## Verification

After all items:
```bash
# Unit tests
pnpm --filter @agent-flow/backend test

# E2E tests (all 20 should pass, 0 skipped)
npx playwright test e2e/features.spec.ts

# Manual verification
pnpm dev
# 1. Create agent → right-click → Add Tool → verify tool node appears
# 2. Click agent handle → child nodes collapse → reload → still collapsed
# 3. Click Auto Layout → nodes rearrange into tree
# 4. Create agent with cursor/claude-cli/codex model → chat streams real responses
```
