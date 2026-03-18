# Architecture

## Clean Architecture (Backend)

```
src/
├── domain/           # Business rules — zero framework deps
│   └── ports/        # Interfaces: AgentRepository, AgentProvider, EventBusPort
├── application/      # Use cases — orchestrate domain logic
│   ├── manage-agent  # CRUD use case
│   ├── run-chat      # Chat execution use case
│   └── tool-registry # Tool name → implementation resolution
├── infrastructure/   # Adapters — implement ports with real tech
│   ├── db/           # SQLite (AgentRepository implementation)
│   ├── providers/    # Pi-agent, Cursor, Claude, Codex ACP
│   └── middleware/   # Event bus + logging/metrics middleware
├── interface/        # HTTP layer — Fastify routes + schemas
│   ├── routes/
│   └── schemas.ts
├── app.ts            # Composition root — wires all layers
├── config.ts         # Environment configuration
├── errors.ts         # Error classes
└── index.ts          # Entry point
```

## Dependency Rule

```
interface/ → application/ → domain/
                ↑
infrastructure/ ─┘
```

- `domain/` depends on NOTHING (pure interfaces)
- `application/` depends on `domain/ports/` (interfaces only)
- `infrastructure/` implements `domain/ports/` with real tech
- `interface/` calls `application/` use cases
- `app.ts` is the only file that knows about ALL layers

## Frontend Structure

```
src/
├── features/         # Domain-driven modules
│   ├── agent/        # AgentNode, AgentPanel, types, defaults
│   ├── tool/         # ToolNode, ToolPanel, types, defaults
│   ├── skill/        # SkillNode, SkillPanel, types, defaults
│   ├── channel/      # ChannelNode, ChannelPanel, ChatThread, chat store
│   └── canvas/       # Canvas, Sidebar, ContextMenu, flow store, theme, layout
├── shared/           # Cross-cutting concerns
│   ├── ui/           # ThemeToggle, DeleteConfirm, ModelSelector
│   └── hooks/        # useTheme
├── components/ui/    # shadcn/ui primitives (button, badge, input, etc.)
└── api/              # Backend API client
```
