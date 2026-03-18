# Safety

- Never delete test files, config files, lock files, or documentation without explicit confirmation
- Never modify `pnpm-lock.yaml` manually — only via `pnpm install`
- Never use `rm -rf` — use `rm` on specific files only
- Never suppress type errors (`// @ts-ignore`, `as any`, `eslint-disable`) — fix root cause
- Never hardcode secrets, API keys, or credentials — use env vars via `config.ts`
