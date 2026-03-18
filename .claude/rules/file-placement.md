# New File Placement

- Frontend components → `packages/frontend/src/features/<domain>/`
- Shared UI → `packages/frontend/src/shared/ui/`
- shadcn/ui primitives → `packages/frontend/src/components/ui/` (auto-generated only)
- Backend routes → `packages/backend/src/interface/routes/`
- Backend providers → `packages/backend/src/infrastructure/providers/`
- Shared types → `packages/shared/src/types/`
- E2E tests → `e2e/`
- Screenshots/images → `docs/images/` (never at project root)
- Env config → `packages/backend/src/config.ts` (single source of truth)
