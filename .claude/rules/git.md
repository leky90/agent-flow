# Git Conventions

- Commit messages: `type: description` (feat, fix, refactor, test, docs, chore)
- Branch naming: `feature/description`, `fix/description`, `chore/description`
- Never amend published commits or force-push to main
- Never commit `.env`, credentials, or API keys
- Always stage specific files — avoid `git add .` or `git add -A`
- Review `git diff --staged` before every commit
