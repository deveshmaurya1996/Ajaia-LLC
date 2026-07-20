# AI-Native Workflow Note — Ajaia LLC

This note explains how AI tools were used during the take-home — focused on **practical usage and engineering judgment**, not volume of AI output.

---

## Which AI tools I used

| Tool | Purpose |
|------|---------|
| **Cursor IDE** (Claude agent mode) | Primary coding assistant — scaffolding, implementation, refactoring, debugging |
| **NVIDIA NIM API** (optional) | Document analysis — summary, tasks, tags, health score in insights sidebar |
| **Heuristic fallback** (custom code) | When no API key or timeout — local rules for insights so reviewers pay nothing |
| **Prisma CLI** | Schema and migrations (standard tooling, not generative AI) |
| **Vitest / Playwright** | Test scaffolding and E2E flows |

No paid reviewer dependencies. The live app works without `NVIDIA_API_KEY`.

---

## Where AI materially sped up my work

| Area | How AI helped |
|------|----------------|
| **Project bootstrap** | Next.js 15 app structure, TypeScript config, folder layout |
| **TipTap editor** | Extension setup, markdown import via `@tiptap/markdown`, toolbar wiring |
| **Backend layers** | API routes, controllers, services, repositories, Zod validation |
| **Prisma + seed** | Schema for users, documents, shares, tasks; demo users Alice/Bob/Charlie |
| **File import** | mammoth (.docx) integration, content normalization pipeline |
| **UI iteration** | Dashboard shell, document list, share dialog, AI sidebar layout |
| **Bug fixes** | Share/delete 500s, upload hang on slow AI, markdown display in editor, insights copy-paste summary |
| **Tests** | Vitest cases for content normalization and insight extraction |

AI was most valuable for **boilerplate and iteration speed**. Core product decisions (scope, data model, auth approach) were made deliberately, not delegated.

---

## What AI-generated output I changed or rejected

| AI suggestion | My decision |
|---------------|-------------|
| Large dashboard with stat cards and many widgets | **Rejected** — simplified to document list + editor focus |
| Duplicate upload components (`FileDropzone` + hook) | **Rejected** — consolidated to `useFileUpload` + header/FAB |
| 8+ document templates | **Rejected** — kept 3 (blank, meeting notes, PRD) for scope |
| Auto-analyze on every upload (blocking) | **Rejected** — upload is fast; AI runs separately in sidebar |
| AI summary copying raw markdown headings | **Fixed** — added `document-insights.ts` heuristics + copy-paste detection |
| Over-abstracted content conversion | **Rejected** — use TipTap markdown mode instead of custom parsers |
| API routes returning `undefined` on DELETE/share | **Fixed manually** — return `{ ok: true }` + proper error handling |
| Real-time collab / version history | **Rejected** — out of scope; stated clearly in submission |

I treated AI output as a **draft**, not a merge-ready PR.

---

## How I verified correctness, UX quality, and reliability

### Correctness

- `npm run build` — TypeScript + Next.js production compile
- `npm test` — Vitest (11 tests): content normalization, analysis schema, insight extraction
- Manual API checks — share, delete (owner-only), upload, document CRUD
- Fixed regressions found during review (markdown in titles, empty editor on load, API 500s)

### UX quality

- Manual walkthrough of main flows on localhost and [live deploy](https://ajaia-llc.vercel.app/)
- Editor: toolbar always visible; document body scrolls independently
- Left sidebar fixed; insights panel scrolls separately
- Upload formats labeled in UI; save status (Saving / Saved / Unsaved)
- User switcher makes sharing demo obvious without real login

### Implementation reliability

- Layered backend with consistent `handleApiRoute` error handling
- Zod validation on API inputs
- Prisma migrations + seed for reproducible demo state
- AI provider timeout (8s) with heuristic fallback — upload never blocks on LLM
- `sanitizeAnalysisResult` strips HTML/markdown pollution from AI output

### Deployment

- Vercel + Neon Postgres
- Build: `npx prisma migrate deploy && npm run build`
- Live URL tested: create, edit, share, refresh persistence

---

## Judgment I kept (not outsourced to AI)

1. **Scope** — Core rubric first: editor, upload, sharing, persistence. AI sidebar is additive, not blocking.
2. **Mock auth** — Faster to demo sharing than OAuth; clearly documented for reviewers.
3. **Package choices** — TipTap, mammoth, Prisma — proven libraries over custom parsers.
4. **Insight quality** — Rejected copy-paste summaries; summaries must read as extracted insight, not document text.
5. **What to cut** — No stretch features that would weaken core flows under time pressure.

---

## If I had another 2–4 hours

- Record and link the walkthrough video
- Wire Playwright E2E into CI
- Tune NVIDIA prompts for richer insights on real content (not templates)
- Add export to Markdown (small stretch, TipTap already has markdown support)
