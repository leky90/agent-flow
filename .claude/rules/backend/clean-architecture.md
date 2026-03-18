---
paths:
  - "packages/backend/src/**/*.ts"
---

# Backend Rules

## Dependency Direction (NEVER violate)
- `domain/` → depends on NOTHING
- `application/` → depends on `domain/ports/` only
- `infrastructure/` → implements `domain/ports/`
- `interface/` → calls `application/` use cases
- `app.ts` → ONLY file that knows all layers

## Don'ts
- Don't import from `infrastructure/` in `domain/` or `application/`
- Don't import Fastify types in `domain/` or `application/`
- Don't put business logic in route handlers — delegate to `application/`
- Don't catch errors in use cases just to re-throw
- Don't use `console.log` — use structured logging
- Don't add env vars in random files — add to `config.ts`, update `.env.example`
- Don't create DB tables outside `infrastructure/db/`

## New Provider Checklist
1. Create in `infrastructure/providers/`, implement `AgentProvider` port
2. Register in `app.ts`, add model IDs to `@agent-flow/shared`
3. Write test in `__tests__/providers.test.ts`

## New Route Checklist
1. Create in `interface/routes/` with JSON schemas in `schemas.ts`
2. Use application use cases — don't access infrastructure directly
3. Register in `app.ts`, write test in `__tests__/`

## New Use Case Checklist
1. Create in `application/`, accept ports via function parameters
2. Only import from `domain/ports/`, write test with in-memory ports
