# Backend — @agent-flow/backend

Fastify 5 + TypeScript API server with Clean Architecture.

## Dev

```bash
pnpm dev          # tsx watch (http://localhost:3001)
pnpm test         # vitest
pnpm test:watch   # vitest --watch
```

## Architecture

```
src/
  domain/ports/       → Interfaces only (zero dependencies)
  application/        → Use cases (depends on ports only)
  infrastructure/     → Implementations (db, providers, middleware)
  interface/routes/   → Fastify HTTP routes + schemas
  app.ts              → Composition root (wires all layers)
  config.ts           → Env config (PORT, HOST, DATA_DIR, DB_PATH)
```

## Key Patterns

- **Database**: SQLite via better-sqlite3
- **Providers**: pi-agent, Claude, Cursor, Codex ACP
- **Config**: Env vars in `config.ts` — see `.env.example`
