# Global Claude Code Rules

## Package Manager

- Always use pnpm (never npm or yarn)
- Install: `pnpm add <package>`
- Dev deps: `pnpm add -D <package>`
- Run scripts: `pnpm run <script>`

## Dependencies

- Always install the latest version of libraries
- Never pin to old versions unless explicitly asked
- Check latest version before installing

## Project Scaffolding

- Always use official CLI tools to scaffold projects, never create files manually
- Always use `@latest` tag when scaffolding
- Never manually create files that CLI tools generate automatically (package.json, tsconfig.json, config files)
- After scaffolding, navigate into the project directory before doing anything else
- If unsure which CLI to use, ask me before proceeding

## CLI Commands by Framework

- Next.js: `pnpm create next-app@latest`
- React: `pnpm create vite@latest`
- Fastify/Node: `pnpm init` then `pnpm add fastify@latest`
- Expo (React Native): `pnpm create expo-app@latest`

## Frontend Rules

- Mobile first, always check responsive at 375px, 768px, 1280px
- Never use inline styles, always use Tailwind classes
- Components go in /components, pages in /app
- One component per file
- Use TypeScript interfaces for all props
- Use shadcn/ui for UI components: `pnpm dlx shadcn@latest add <component>`
- Always run `pnpm dev` after scaffolding to verify it works

## Frontend Workflow

- Always start with /plan before coding, wait for confirmation before proceeding
- Run dev server in a separate terminal alongside Claude Code
- Build UI section by section, not everything at once
- After each UI change, describe what changed and where to look in the browser
- Use screenshots to show UI bugs instead of describing them in words
- Use shadcn/ui components when available instead of building from scratch

## Coding Style

- Always use TypeScript
- Always write clean, readable code with meaningful variable names
- Add comments for complex logic
- Don't ask questions, just build — I will iterate after
