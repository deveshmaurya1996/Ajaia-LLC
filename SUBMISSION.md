# FlowDocs AI — Ajaia LLC Take-Home Submission

Candidate: **Devesh Maurya** (deveshmaurya1996@gmail.com)

## What's included

| Item | Location |
|------|----------|
| Source code | `flowdocs-ai/` |
| Setup instructions | `README.md` |
| Architecture note | `ARCHITECTURE.md` |
| AI workflow note | `AI_WORKFLOW.md` |
| Walkthrough video URL | `VIDEO_URL.txt` |
| Live demo URL | `LIVE_URL.txt` |

## Assignment requirements

| # | Requirement | Status | How to verify |
|---|-------------|--------|---------------|
| 1 | Create, rename, edit, save, reopen documents | ✅ | New → template; title edit; TipTap editor; Save + auto-save; refresh page |
| 1 | Rich text (bold, italic, underline, headings, lists) | ✅ | Editor toolbar on `/document/[id]` |
| 2 | File upload (.txt, .md, .docx) | ✅ | Header Upload / mobile FAB; formats shown in UI |
| 3 | Sharing (owner grants access) | ✅ | Share button (owner only) → pick user |
| 3 | Owned vs shared distinction | ✅ | Documents → **My documents** / **Shared with me** |
| 4 | Persistence (Postgres + Prisma) | ✅ | Data survives refresh; seed: `npx prisma db seed` |
| 5 | README + setup | ✅ | `README.md` |
| 5 | Live deployment | ⚠️ **You must fill** `LIVE_URL.txt` |
| 5 | Validation / error handling | ✅ | Zod + `handleApiRoute`; 400/403/404 responses |
| 5 | Automated tests | ✅ | Vitest (7) + Playwright (2) |
| 5 | Architecture note | ✅ | `ARCHITECTURE.md` |
| 5 | AI workflow note | ✅ | `AI_WORKFLOW.md` |
| 5 | Walkthrough video | ⚠️ **You must fill** `VIDEO_URL.txt` |

## Test users

| User | ID | Use for |
|------|-----|---------|
| Alice | `user_alice` | Owner — create, share, delete |
| Bob | `user_bob` | Shared docs tab |
| Charlie | `user_charlie` | Alternate reviewer |

Switch via sidebar (desktop) or header avatar (mobile).

## Demo script (3–5 min video)

1. **Create** — New → Meeting notes → edit title and body → Save
2. **Upload** — Upload a `.md` file → verify formatted preview
3. **Share** — Alice shares doc with Bob → switch to Bob → Shared with me
4. **Persistence** — Refresh → content still there
5. **Scope** — Mention AI insights sidebar (optional), what was cut

## Intentionally deprioritized

- Real-time multi-user editing
- Version history, comments, PDF export
- Enterprise auth / email invites
- Full Google Docs parity

## Partial / before you submit

| Item | Action needed |
|------|----------------|
| Live URL | Deploy Vercel + Neon; paste in `LIVE_URL.txt` |
| Video | Record Loom/YouTube; paste in `VIDEO_URL.txt` |
| Production DB | Run `prisma migrate deploy` + `prisma db seed` on Neon |

## Run locally

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma db seed
npm run dev
```

## Tests

```bash
npm test      # unit tests
npm run e2e   # Playwright (starts dev server)
npm run build
```
