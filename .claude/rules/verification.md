# Verification — Run After Every Change

- `pnpm lint` — biome check (0 errors required)
- `pnpm test` — vitest unit tests
- `pnpm build` — tsc type-check + build
- Run all 3 before considering a task done
- If lint fails, run `pnpm lint:fix` first, then verify remaining issues manually
- If a test fails, fix the implementation — don't modify the test to pass
- If type-check fails, fix the types — don't suppress
