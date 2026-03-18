# Agent Flow

Visual canvas for orchestrating AI agent workflows — drag-and-drop agents, tools, skills, and channels into connected pipelines.

## Monorepo Structure

```
packages/
  frontend/   → React 19 + Vite 8 + Tailwind 4 + @xyflow/react (canvas)
  backend/    → Fastify 5 + SQLite + pi-agent providers
  shared/     → TypeScript types + nanoid utils (no build step, raw .ts exports)
```

## Quick Start

```bash
pnpm install
pnpm dev              # starts both FE and BE in parallel
pnpm dev:frontend     # frontend only (port 5173)
pnpm dev:backend      # backend only (port 3001)
pnpm test             # unit tests (vitest) across all packages
pnpm test:e2e         # playwright e2e tests
pnpm lint             # biome check
pnpm lint:fix         # biome auto-fix
```

## Code Conventions

- TypeScript strict mode, Biome for formatting (tabs, double quotes, semicolons)
- Workspace references: `"@agent-flow/shared": "workspace:*"`
- Feature-based structure in frontend, Clean Architecture in backend
- Design system: CSS custom properties only — see `docs/design-system.md`
- Backend utilities: check Servercn first — https://servercn.vercel.app/docs
