# Frontend — @agent-flow/frontend

React 19 + Vite 8 + TypeScript canvas app for visual agent orchestration.

## Dev

```bash
pnpm dev        # http://localhost:5173
pnpm build      # tsc + vite build
```

## Architecture

```
src/
  features/       → Domain modules (agent, tool, skill, channel, canvas)
  shared/         → Cross-cutting: ui/, hooks/
  components/ui/  → shadcn/ui primitives (auto-generated, don't edit)
  api/            → Backend API client
  lib/            → Utilities (cn, etc.)
```

## Import Aliases

- `@/*` → `src/*` (vite.config.ts + tsconfig.json)
- `@agent-flow/shared` → `packages/shared/src/index.ts`

## Key Patterns

- **State**: Zustand stores per feature
- **Canvas**: @xyflow/react — node types in `features/canvas/nodeTypes.ts`
- **Theme**: CSS custom properties + `features/canvas/theme.ts`
- **Chat**: @assistant-ui/react
