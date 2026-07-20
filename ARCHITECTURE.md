# Architecture Note — FlowDocs AI

## Goal

Deliver a focused Google Docs–inspired slice within 4–6 hours: create/edit documents, import files, share between users, persist reliably.

## Stack

| Layer | Choice |
|-------|--------|
| Frontend | Next.js 15, React, TipTap, `@tiptap/markdown`, TanStack Query, Zustand |
| Backend | Route → Controller → Service → Repository |
| Database | PostgreSQL + Prisma 7 |
| Import | `mammoth` (.docx), raw markdown + TipTap markdown (.md/.txt) |
| Auth | Mock users via `x-user-id` header + UI switcher |

## Priorities (why this shape)

1. **Editor** — TipTap WYSIWYG with toolbar; `@tiptap/markdown` for import preview (no hand-rolled HTML conversion)
2. **Save UX** — Auto-save (2s) + manual Save + Ctrl+S
3. **Sharing** — `DocumentShare` table; owner-only share/delete; My vs Shared tabs
4. **Upload** — Global header/FAB; `.txt`, `.md`, `.docx` only (stated in UI)
5. **AI insights** — Optional sidebar; heuristic fallback without API key

## Data model

```
User ──< Document >── DocumentShare >── User
Document ──< ExtractedTask
```

## Content pipeline

```
.md upload  → store markdown → TipTap contentType: "markdown"
.docx upload → mammoth → HTML → TipTap HTML mode
Save         → HTML in Postgres
Title / AI   → plain text only (document-content.ts)
```

## API (core)

| Method | Route | Purpose |
|--------|-------|---------|
| GET/POST | `/api/documents` | List (mine/shared/recent) |
| GET/PATCH/DELETE | `/api/documents/[id]` | Read/update/delete (delete: owner only) |
| POST | `/api/documents/[id]/share` | Owner grants access |
| POST | `/api/upload` | Import file → document |
| POST | `/api/ai/template` | Create from template |
| POST | `/api/ai/analyze` | AI insights (optional) |

## Tradeoffs

- **Mock auth** — Fast demo; user switcher makes sharing obvious
- **HTML after first save** — TipTap native; markdown preserved on import until edited
- **No real-time collab** — Out of scope; would need WebSockets/Yjs
- **Layered backend** — More files, clearer review story

## Deploy

Vercel + Neon. Build: `npx prisma migrate deploy && npm run build`. Seed production for demo users.
