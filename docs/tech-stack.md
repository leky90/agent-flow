# Tech Stack

## Frontend (`@agent-flow/frontend`)

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React + TypeScript | 19 |
| Bundler | Vite | 8 |
| Canvas | @xyflow/react | 12 |
| State | Zustand | 5 |
| UI Kit | shadcn/ui (base-ui) + CVA | latest |
| Chat | @assistant-ui/react | 0.12 |
| Styling | Tailwind CSS | 4 |
| Icons | lucide-react | latest |
| Fonts | Space Grotesk + JetBrains Mono | variable |

## Backend (`@agent-flow/backend`)

| Layer | Technology | Version |
|-------|-----------|---------|
| Server | Fastify | 5 |
| Database | better-sqlite3 | latest |
| Agent Core | @mariozechner/pi-agent-core | 0.60 |
| LLM API | @mariozechner/pi-ai | 0.60 |
| Tools | @mariozechner/pi-coding-agent | 0.60 |
| ACP | Custom JSON-RPC 2.0 client | — |

## Shared (`@agent-flow/shared`)

| Layer | Technology |
|-------|-----------|
| Types | TypeScript interfaces |
| IDs | nanoid |

## Testing

| Type | Technology |
|------|-----------|
| Unit | Vitest 4 |
| E2E | Playwright 1.58 |

## Monorepo

| Tool | Purpose |
|------|---------|
| pnpm | Package manager + workspaces |
| TypeScript | Type checking |
