---
paths:
  - "packages/frontend/src/**/*.tsx"
  - "packages/frontend/src/**/*.ts"
---

# React Patterns

- Don't use `useEffect` for data derivation — use `useMemo` or compute in render
- Don't create global state outside Zustand stores — no React context for app state, no module-level `let`
- Don't mix feature concerns — `features/agent/` must not import from `features/tool/`. Use `@agent-flow/shared` for cross-feature types
- Don't use `index.ts` barrel files in features — import directly from the specific file
- Always define TypeScript interface for component props — no inline `{ prop: type }` in function signature
- Hooks go in `shared/hooks/` — don't define hooks inside component files unless truly local
