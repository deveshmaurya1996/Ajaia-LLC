# Ajaia LLC — Take-Home Submission

**Candidate:** Devesh Maurya  
**Email:** deveshmaurya1996@gmail.com  
**GitHub repository:** [https://github.com/deveshmaurya1996/Ajaia-LLC](https://github.com/deveshmaurya1996/Ajaia-LLC)  
**Live product:** [https://ajaia-llc.vercel.app/](https://ajaia-llc.vercel.app/)  
**Walkthrough video:** [Loom walkthrough](https://www.loom.com/share/287aae8d452a4599aff609234c8787fd) (`VIDEO_URL.txt`)  
**Google Drive folder:** [Ajaia-LLC-Submission](https://drive.google.com/drive/folders/1jCa5cBk4OdW-3fMhZFOKMvUUB-F2bdWs?usp=sharing)  

---

## Deliverables checklist

| Deliverable | Included | Location |
|-------------|----------|----------|
| Source code | ✅ | [GitHub](https://github.com/deveshmaurya1996/Ajaia-LLC) · repository root |
| README with local setup | ✅ | `README.md` |
| Architecture note | ✅ | `ARCHITECTURE.md` |
| AI workflow note | ✅ | `AI_WORKFLOW.md` |
| This submission index | ✅ | `SUBMISSION.md` |
| Live deployment URL | ✅ | `LIVE_URL.txt` → [https://ajaia-llc.vercel.app/](https://ajaia-llc.vercel.app/) |
| Walkthrough video URL | ✅ | [Loom](https://www.loom.com/share/287aae8d452a4599aff609234c8787fd) · `VIDEO_URL.txt` |
| Google Drive bundle | ✅ | [Drive folder](https://drive.google.com/drive/folders/1jCa5cBk4OdW-3fMhZFOKMvUUB-F2bdWs?usp=sharing) |
| Screenshots / demo GIF | — | Not required; live URL + video cover setup |

---

## How to review quickly

### Live demo (no install)

1. Open [https://ajaia-llc.vercel.app/](https://ajaia-llc.vercel.app/)
2. Default user is **Alice** (sidebar user switcher on desktop, avatar on mobile)
3. **Create:** Header **New** → Meeting notes → edit title and body
4. **Upload:** Header **Upload** → `.md`, `.txt`, or `.docx`
5. **Share:** Open a doc → **Share** (owner only) → pick Bob → switch to Bob → **Documents → Shared with me**
6. **Persistence:** Refresh the page — content remains
7. **AI insights:** Right sidebar updates after a few seconds of editing (heuristic fallback if no API key)

### Local run

```bash
npm install
cp .env.example .env   # set DATABASE_URL
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Test accounts (no passwords — mock auth)

| User | ID | Role in demo |
|------|-----|--------------|
| Alice | `user_alice` | Owner — create, share, delete |
| Bob | `user_bob` | Recipient — **Shared with me** tab |
| Charlie | `user_charlie` | Alternate reviewer |

Switch users via sidebar (desktop) or header avatar (mobile). No credentials required.

### Automated checks

```bash
npm test        # Vitest — 11 unit tests
npm run e2e     # Playwright — dashboard + editor flows
npm run build   # Production build
```

---

## Assignment requirements — status

| Requirement | Status | How to verify |
|-------------|--------|---------------|
| Create, rename, edit, save, reopen documents | ✅ Working | New → template; edit title/body; Save + auto-save; refresh |
| Rich text (bold, italic, underline, headings, lists) | ✅ Working | Editor toolbar on `/document/[id]` |
| File upload (.txt, .md, .docx) | ✅ Working | Header Upload / mobile FAB |
| Sharing (owner grants access) | ✅ Working | Share button → pick user |
| Owned vs shared distinction | ✅ Working | **My documents** / **Shared with me** tabs |
| Postgres + Prisma persistence | ✅ Working | Data survives refresh; `npx prisma db seed` |
| README + setup | ✅ | `README.md` |
| Live deployment | ✅ | [https://ajaia-llc.vercel.app/](https://ajaia-llc.vercel.app/) |
| Validation / error handling | ✅ | Zod + `handleApiRoute`; 400/403/404 |
| Automated tests | ✅ | Vitest + Playwright |
| Architecture note | ✅ | `ARCHITECTURE.md` |
| AI workflow note | ✅ | `AI_WORKFLOW.md` |
| Walkthrough video (3–5 min) | ✅ | [Loom walkthrough](https://www.loom.com/share/287aae8d452a4599aff609234c8787fd) |

---

## Main user flow (end to end)

```
Home → New document (template) → Edit in TipTap → Auto-save
     → Upload file → New document from import
     → Share (Alice → Bob) → Bob sees doc under Shared with me
     → AI insights sidebar (summary, tasks, health score)
```

All of the above works end to end on the live deployment.

---

## Walkthrough video outline (3–5 minutes)

Recorded on Loom: [Agilea Full Stack Document Workspace Walkthrough](https://www.loom.com/share/287aae8d452a4599aff609234c8787fd) (also in `VIDEO_URL.txt`).

| Segment | What to show |
|---------|--------------|
| 1. Main flow | Create meeting notes → edit title/body → save → refresh |
| 2. Upload | Import a `.md` file → open editor with formatted content |
| 3. Sharing | Alice shares with Bob → switch user → Shared with me |
| 4. What works | Persistence, toolbar, tabs, insights sidebar |
| 5. Scope cuts | No real-time collab, no version history, mock auth |
| 6. Decisions | TipTap + Prisma + layered API; why mock users |
| 7. AI usage | Cursor for scaffolding; human review of scope and API logic |

---

## Key implementation decisions

| Decision | Rationale |
|----------|-----------|
| **TipTap + `@tiptap/markdown`** | WYSIWYG editor with native markdown import — avoids hand-rolled HTML conversion |
| **Layered API** (Route → Controller → Service → Repository) | Clear separation for review and future growth |
| **Mock auth via `x-user-id`** | Fast sharing demo without OAuth; user switcher makes flows obvious |
| **Auto-save + manual Save + Ctrl+S** | Google Docs–like save UX within scope |
| **Upload without blocking AI** | Import is fast; AI analysis runs separately in sidebar |
| **Heuristic AI fallback** | Works without paid NVIDIA key; reviewers can test insights for free |
| **Vercel + Neon** | Simple deploy path; no paid services required for reviewers |

See `ARCHITECTURE.md` for data model, API routes, and tradeoffs.

---

## Intentionally deprioritized

These were cut deliberately to protect depth in core flows:

- Real-time multi-user editing (WebSockets / CRDT)
- Version history and commenting
- PDF export
- Enterprise auth / email invites
- Full Google Docs feature parity
- Role-based permissions beyond owner share + editor access

---

## Partial / incomplete items

| Item | Working | Incomplete | Next 2–4 hours |
|------|---------|------------|----------------|
| **Walkthrough video** | ✅ [Loom link](https://www.loom.com/share/287aae8d452a4599aff609234c8787fd) in `VIDEO_URL.txt` | — | — |
| **Google Drive bundle** | ✅ [Drive folder](https://drive.google.com/drive/folders/1jCa5cBk4OdW-3fMhZFOKMvUUB-F2bdWs?usp=sharing) uploaded | — | — |
| **Production seed** | App deployed | Confirm `prisma db seed` on Neon if demo users missing | Run seed on production DB |
| **AI insights** | Heuristic + optional NVIDIA API | Not LLM-grade for complex docs | Tune prompts; cache invalidation |
| **E2E in CI** | Tests pass locally | Not wired to GitHub Actions | Add CI job with test DB |

Everything in the **core assignment rubric** (CRUD, editor, upload, sharing, persistence, deploy) is working on the live URL.

---

## AI-native workflow note (summary)

Full detail in `AI_WORKFLOW.md`. Summary for reviewers:

| Question | Answer |
|----------|--------|
| **Which AI tools?** | Cursor IDE (Claude agent), NVIDIA NIM API (optional, for document analysis) |
| **Where AI sped up work?** | App scaffolding, TipTap/API routes, Prisma schema, UI layout, test setup, bug fixes |
| **What was changed or rejected?** | Rejected over-built dashboard and duplicate upload UI; reduced templates; fixed API routes returning `undefined`; replaced copy-paste AI summaries with extracted insights |
| **How verified?** | `npm run build`, Vitest, Playwright, manual sharing/upload flows, live deploy smoke test |

Practical AI usage — scoped assistance with human judgment on architecture, scope, and correctness.

---

## Optional stretch (not implemented)

Did not pursue stretch features to keep core flows solid:

- Real-time collaboration indicators
- Commenting / suggestion mode
- Document version history
- Export to PDF or Markdown
- Role-based sharing beyond basic editor access

---

## Project structure (reviewer map)

```
src/
  app/              Next.js routes + API
  components/       Editor, dashboard, AI sidebar, layout
  features/         Hooks (documents, AI, tasks, search)
  server/           Controllers, services, repositories, AI providers
  lib/              Document content normalization, insights heuristics
prisma/             Schema, migrations, seed
e2e/                Playwright tests
README.md           Setup and run
ARCHITECTURE.md     Stack, priorities, tradeoffs
AI_WORKFLOW.md      AI tools and verification
LIVE_URL.txt        Live deployment link
VIDEO_URL.txt       Walkthrough video link
```

---

## Submission format (for Google Drive)

Upload **one folder** containing:

1. Full source code — [GitHub repo](https://github.com/deveshmaurya1996/Ajaia-LLC) or this repository folder
2. `README.md`
3. `ARCHITECTURE.md`
4. `AI_WORKFLOW.md`
5. `SUBMISSION.md` (this file)
6. `LIVE_URL.txt`
7. `VIDEO_URL.txt`
8. `.env.example` (no secrets)

Share the folder link with reviewers and include the live URL ([https://ajaia-llc.vercel.app/](https://ajaia-llc.vercel.app/)), GitHub repo ([https://github.com/deveshmaurya1996/Ajaia-LLC](https://github.com/deveshmaurya1996/Ajaia-LLC)), and Google Drive folder ([Ajaia-LLC-Submission](https://drive.google.com/drive/folders/1jCa5cBk4OdW-3fMhZFOKMvUUB-F2bdWs?usp=sharing)).

---

## Contact

Devesh Maurya — deveshmaurya1996@gmail.com
