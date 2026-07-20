# FlowDocs AI

Lightweight collaborative document editor — Ajaia LLC Full Stack Product Engineer take-home.

## Features

- Create, rename, edit, and autosave documents (TipTap rich text)
- Upload `.txt`, `.md`, or `.docx` → new editable document
- Share documents between users; **My documents** / **Shared with me** tabs
- Mock auth via user switcher (Alice, Bob, Charlie)

## Quick start

```bash
cd flowdocs-ai
npm install
cp .env.example .env   # set DATABASE_URL
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Temporary database (dev only)

```bash
npx create-db -e .env -t 24h
npx prisma migrate dev
npx prisma db seed
```

## Test users

| Name | User ID | Notes |
|------|---------|-------|
| Alice | `user_alice` | Default; owns seeded documents |
| Bob | `user_bob` | Use to verify shared access |
| Charlie | `user_charlie` | Alternate reviewer |

Switch users via the sidebar (desktop) or header avatar (mobile).

## Sharing demo

1. Stay as **Alice** → open a document → **Share** → select Bob
2. Switch to **Bob** → **Documents** → **Shared with me**
3. Open the shared document

## Upload

- Header **Upload** button (desktop) or floating button (mobile)
- Supported: `.txt`, `.md`, `.docx`

## Environment

```env
DATABASE_URL="postgresql://..."
NVIDIA_API_KEY=""          # optional — AI uses heuristic fallback if empty
NVIDIA_BASE_URL="https://integrate.api.nvidia.com/v1"
NVIDIA_MODEL="meta/llama-3.3-70b-instruct"
```

## Tests

```bash
npm test      # Vitest
npm run e2e   # Playwright (requires dev server + DB)
```

## Deploy (Vercel + Neon)

1. Create Neon Postgres → copy `DATABASE_URL`
2. Import repo to Vercel; set env vars
3. Build command: `npx prisma migrate deploy && npm run build`
4. Add live URL to `LIVE_URL.txt`

## Submission files

- `SUBMISSION.md` — checklist and reviewer guide
- `ARCHITECTURE.md` — priorities and tradeoffs
- `AI_WORKFLOW.md` — AI tool usage note
- `VIDEO_URL.txt` — walkthrough link

## Stack

Next.js 15 · TipTap · Prisma · PostgreSQL · TanStack Query · Zustand
