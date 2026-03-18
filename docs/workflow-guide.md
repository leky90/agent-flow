# Claude Code Workflow Guide — Agent Flow

Hướng dẫn sử dụng Claude Code hiệu quả cho dự án Agent Flow.

---

## Tổng quan công cụ đã cài đặt

### Skills (community — auto-invoke khi context phù hợp)

| Skill | Khi nào active |
|-------|---------------|
| `vercel-react-best-practices` | Viết/review React component |
| `fastify-best-practices` | Viết/debug Fastify route, plugin |
| `tailwind-theme-builder` | Setup theme, CSS variables, dark mode |
| `shadcn-ui` | Thêm/customize shadcn component |
| `zustand` | Tạo/sửa Zustand store |
| `webapp-testing` | Viết test cho web app |
| `playwright-generate-test` | Generate Playwright E2E test |
| `ui-audit` | Đánh giá UX/UI |
| `web-performance-optimization` | Tối ưu performance |
| `find-skills` | Tìm skill mới |

### Plugins (built-in)

| Plugin | Slash command | Mô tả |
|--------|-------------|--------|
| `feature-dev` | `/feature-dev` | Phát triển feature có kiến trúc |
| `frontend-design` | `/frontend-design` | Thiết kế UI chất lượng cao |
| `code-review` | `/code-review` | Review PR |
| `code-simplifier` | `/simplify` | Đơn giản hóa code |
| `commit-commands` | `/commit` | Tạo commit |
| `commit-commands` | `/commit-push-pr` | Commit + push + mở PR |
| `claude-md-management` | `/revise-claude-md` | Cập nhật CLAUDE.md |
| `playwright` | `/playwright-generate-test` | Generate test từ scenario |
| `security-guidance` | — | Auto-review bảo mật |

### Rules (.claude/rules/ — auto-load)

| Rule | Load khi |
|------|----------|
| `safety.md` | Mọi session |
| `scope.md` | Mọi session |
| `verification.md` | Mọi session |
| `git.md` | Mọi session |
| `file-placement.md` | Mọi session |
| `frontend/react-patterns.md` | Touch file `packages/frontend/**` |
| `frontend/styling.md` | Touch file `packages/frontend/**` |
| `frontend/canvas.md` | Touch file `packages/frontend/src/features/canvas/**` hoặc node features |
| `backend/clean-architecture.md` | Touch file `packages/backend/src/**` (bao gồm cả checklists) |
| `testing.md` | Touch file `packages/backend/src/__tests__/**`, `packages/frontend/src/**/*.test.*`, hoặc `e2e/**` |

### MCP Servers

| Server | Mô tả |
|--------|--------|
| `github` | GitHub API — PR, issues, code search |
| `pencil` | Pencil editor — design files |
| `playwright` | Browser automation — screenshot, click, navigate |

---

## Workflow theo ngữ cảnh

### 1. Bắt đầu feature mới

```
/feature-dev thêm node type "trigger" cho canvas
```

**Quy trình tự động:**
- Claude phân tích codebase, đề xuất architecture
- Chờ bạn confirm plan
- Implement theo đúng Clean Architecture + feature-based structure
- Rules `backend/new-feature.md` và `frontend/canvas.md` tự động load

**Khi nào dùng:** Mọi feature cần thiết kế kiến trúc trước khi code.

---

### 2. Vibe coding — build nhanh UI

```
/frontend-design tạo dashboard page hiển thị stats của tất cả agents
```

**Quy trình tự động:**
- Skill `vercel-react-best-practices` + `shadcn-ui` auto-activate
- Rules `frontend/styling.md` enforce design tokens
- Claude build section by section, mô tả thay đổi sau mỗi bước

**Khi nào dùng:** Build UI nhanh, ưu tiên tốc độ, iterate bằng mắt.

---

### 3. Thêm shadcn component

```
Thêm component Dialog cho confirm delete agent
```

**Quy trình tự động:**
- Skill `shadcn-ui` hướng dẫn install order + dependency
- Skill `tailwind-theme-builder` đảm bảo theme consistency
- Rule `frontend/styling.md` ngăn dùng arbitrary values

**Tip:** Nếu cần component mới chưa có:
```
pnpm dlx shadcn@latest add dialog
```

---

### 4. Tạo/sửa Zustand store

```
Thêm store quản lý trạng thái execution của agent (running, paused, error)
```

**Quy trình tự động:**
- Skill `zustand` load patterns (action types, slices, selectors)
- Rule `frontend/react-patterns.md` ngăn global state ngoài Zustand

**Khi nào dùng:** Mọi state management mới hoặc refactor store.

---

### 5. Thêm API endpoint

```
Tạo endpoint POST /agents/:id/execute để chạy agent
```

**Quy trình tự động:**
- Skill `fastify-best-practices` auto-activate
- Rule `backend/clean-architecture.md` enforce dependency direction
- Rule `backend/new-feature.md` cung cấp checklist
- Claude tạo: types → use case → route → schema → test

**Khi nào dùng:** Mọi API endpoint mới.

---

### 6. Viết test

**Unit test cho backend:**
```
Viết test cho use case run-chat
```

**E2E test từ scenario:**
```
/playwright-generate-test user tạo agent mới, thêm tool, kết nối, rồi chạy
```

**Quy trình tự động:**
- Skill `webapp-testing` (Anthropic) cung cấp testing toolkit
- Skill `playwright-generate-test` dùng Playwright MCP để record + generate
- Rule `testing.md` enforce: real DB, no .skip, independent tests

**Khi nào dùng:**
- Sau khi hoàn thành feature → viết test
- Trước khi fix bug → viết failing test trước

---

### 7. Code review

**Review PR hiện tại:**
```
/code-review
```

**Review PR cụ thể trên GitHub:**
```
/code-review 42
```

**Quy trình tự động:**
- Plugin `code-review` phân tích tất cả changes
- Plugin `security-guidance` auto-check vulnerabilities
- Báo cáo: bugs, logic errors, security issues, quality

**Khi nào dùng:** Trước khi merge bất kỳ PR nào.

---

### 8. Tối ưu performance

```
Trang canvas bị lag khi có 50+ nodes, optimize
```

**Quy trình tự động:**
- Skill `web-performance-optimization` cung cấp Core Web Vitals guide
- Skill `vercel-react-best-practices` suggest React-specific optimizations
- Claude analyze, benchmark, fix

**Khi nào dùng:** Khi UI chậm, bundle size lớn, hoặc cần audit performance.

---

### 9. UI/UX audit

```
Audit UX cho canvas sidebar
```

**Quy trình tự động:**
- Skill `ui-audit` đánh giá: visual hierarchy, a11y, cognitive load, navigation
- Có thể dùng Playwright MCP để chụp screenshot verify

**Khi nào dùng:** Sau khi build xong UI, trước khi ship.

---

### 10. Commit & PR

**Commit thay đổi:**
```
/commit
```

**Commit + push + tạo PR:**
```
/commit-push-pr
```

**Quy trình tự động:**
- Rule `git.md` enforce commit format: `feat: description`
- Rule `verification.md` nhắc chạy lint + test trước
- Plugin tự tạo commit message, PR title + body

**Khi nào dùng:** Khi hoàn thành một logical unit of work.

---

### 11. Đơn giản hóa code

```
/simplify
```

**Quy trình tự động:**
- Plugin `code-simplifier` review code vừa thay đổi
- Tìm reuse opportunities, quality issues, efficiency
- Fix trực tiếp

**Khi nào dùng:** Sau khi feature hoàn thành, trước khi commit.

---

### 12. Fix bug nhanh

```
Click vào node không mở panel, fix
```

**Quy trình tự động:**
- Rules auto-load theo file được touch
- Rule `scope.md` giữ changes nhỏ nhất
- Rule `verification.md` yêu cầu chạy test sau fix

**Khi nào dùng:** Bug cụ thể, cần fix nhanh không refactor.

---

### 13. Khám phá codebase

```
Giải thích flow từ khi user gửi message đến khi nhận response từ agent
```

**Claude sẽ:**
- Trace execution path qua tất cả layers
- Output file:line references
- Không thay đổi code

**Khi nào dùng:** Onboarding, debug, hiểu code trước khi sửa.

---

### 14. Cập nhật CLAUDE.md

```
/revise-claude-md
```

**Quy trình tự động:**
- Scan tất cả CLAUDE.md files
- So sánh với best practices
- Cập nhật nếu cần

**Khi nào dùng:** Sau sprint, sau thay đổi kiến trúc lớn, hoặc định kỳ.

---

### 15. Tìm skill mới

```
/find-skills animation cho React
```

**Khi nào dùng:** Khi cần capability mà chưa có skill nào cover.

---

## Workflow kết hợp — Feature từ A đến Z

```
# 1. Lên plan
/feature-dev thêm hệ thống notification cho agent execution

# 2. Claude đề xuất architecture → bạn confirm

# 3. Build backend
# (fastify-best-practices + clean-architecture rules tự load)

# 4. Build frontend
# (vercel-react + shadcn-ui + zustand skills tự load)

# 5. Đơn giản hóa
/simplify

# 6. Viết test
/playwright-generate-test user chạy agent và nhận notification

# 7. Audit
# "audit UX cho notification panel"

# 8. Review
/code-review

# 9. Ship
/commit-push-pr
```

---

## Tips

- **Dùng `/clear` giữa các task không liên quan** — giữ context sạch
- **Skills auto-invoke** — không cần gọi thủ công, Claude tự biết khi nào dùng
- **Rules scoped by path** — chỉ load khi cần, không chiếm context thừa
- **Plans lưu ở `docs/plans/`** — review lại architecture decisions sau này
- **Khi bị stuck:** mô tả vấn đề + paste screenshot, Claude sẽ debug bằng Playwright MCP
