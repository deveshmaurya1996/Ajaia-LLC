# AI Workflow Note — FlowDocs AI

## Tools used

- **Cursor IDE** with Claude (agent mode) for implementation, refactoring, and debugging
- **Prisma** CLI for schema/migrations
- **Playwright / Vitest** for test scaffolding

## Where AI sped up work

- Scaffolding Next.js app structure, TipTap editor, and API route handlers
- Prisma schema and seed data for mock users/documents
- UI iteration (layout shell, header upload, document list)
- Fixing TypeScript errors (Prisma client generation, debounce generics, API JSON serialization)

## What AI output was changed or rejected

- **Rejected:** Over-built dashboard (stat cards, colored icon badges, 9-file import matrix) — simplified for clarity
- **Rejected:** Duplicate upload components (`FileDropzone` + hook) — consolidated to `useFileUpload`
- **Changed:** AI auto-analyze kept but sidebar simplified; not required for core assignment
- **Changed:** Template list reduced from 8+ to 3 for scope discipline
- **Fixed:** API routes returning `undefined` (DELETE/share) — added `{ ok: true }` + error handler

## How correctness was verified

- `npm run build` — TypeScript + Next.js production build
- `npm run lint` — ESLint
- `npm test` — Vitest schema tests
- `npm run e2e` — Playwright dashboard → editor flow
- Manual: user switcher sharing flow, upload, rename, delete, refresh persistence

## Judgment retained (not outsourced)

- Scope cuts aligned to assignment rubric (sharing tabs > AI dashboard widgets)
- Persistence and sharing logic reviewed in repository layer
- Package choices: lodash debounce, mammoth for docx, TipTap for editor — not custom parsers
