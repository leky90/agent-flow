---
paths:
  - "packages/frontend/src/features/canvas/**"
  - "packages/frontend/src/features/agent/**"
  - "packages/frontend/src/features/tool/**"
  - "packages/frontend/src/features/skill/**"
  - "packages/frontend/src/features/channel/**"
---

# Canvas & Node Rules

- New node types MUST be registered in `features/canvas/nodeTypes.ts`
- Each node type needs: `*Node.tsx`, `*Panel.tsx`, `types.ts`, `defaults.ts`
- Node colors come from `theme.ts` accent mapping — don't hardcode colors in node components
- Canvas state lives in `features/canvas/store.ts` (Zustand) — don't create separate stores for canvas-related state
- Layout changes go through `features/canvas/layout.ts` (dagre) — don't manually position nodes
- Persistence is in `features/canvas/persistence.ts` (localStorage) — keep serialization logic there
