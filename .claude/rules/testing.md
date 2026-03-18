---
paths:
  - "packages/backend/src/__tests__/**"
  - "packages/frontend/src/**/*.test.*"
  - "e2e/**"
---

# Testing Rules

- Unit tests: Vitest (`pnpm test` in each package)
- E2E tests: Playwright (`pnpm test:e2e` at root)
- Backend tests use in-memory SQLite — never mock the database
- Test file naming: `*.test.ts` for unit, `*.spec.ts` for E2E
- When fixing a bug, write a failing test FIRST, then fix the code
- Don't use `.skip`, `.only`, or commented-out tests in committed code
- E2E tests should be independent — don't rely on state from other tests
- Prefer `getByRole`, `getByText` over CSS selectors in E2E tests
