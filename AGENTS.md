# Opportunities Hub Project

- 7-week project for CS Gen 11 Group 3
- React + Node + PostgreSQL + Docker
- See `docs/opportunities_workflow.pdf` for the full 7-week plan

## Required reading

Before starting any work on this repo, read **every file under `docs/`** (including `docs/api/`, `docs/data-model/`, `docs/decisions/`, `docs/research/`, plus `docs/proposal.md` and `docs/README.md`). The PDF `docs/opportunities_workflow.pdf` is also required context. These documents are the source of truth for scope, schema, API contracts, and architectural decisions — do not infer them from code alone.

## Codebase state

**Backend** (`backend/`) — Express 5 scaffolded:
- `src/index.js` — `helmet`, `cors`, `morgan('dev')`, `express.json()`; mounts `/api`
- `src/db/index.js` — `pg.Pool` over `DATABASE_URL`; exports `query` and `pool`
- `src/routes/health.js` — `GET /api/health` pings the DB
- `npm run dev` (uses `node --watch`) on `PORT` (default 3000)
- CommonJS (`"type": "commonjs"`)
- `migrations/` and `tests/` are empty placeholders (Week 3+)

**Frontend** (`frontend/`) — Vite 8 + React 19 from the default Vite template; no project-specific pages yet.

**Database** — schema not created; `db/` at repo root is an empty placeholder. `.env.example` documents the expected `DATABASE_URL`.

## Work tracking — GitHub Issues

All work on this repo is tracked in **GitHub Issues** on `so-dawg/Aukas`, organised by weekly **milestones** (Week 1 → Week 7).

Before starting any task:

1. Check open issues with `gh issue list --repo so-dawg/Aukas` (filter by milestone or label as needed).
2. If the task isn't already an issue, create one first with `gh issue create`, attach it to the correct week milestone, and label it (`documentation`, `enhancement`, `bug`, etc.).
3. Reference the issue number in commits and PRs (e.g. `fix: validate email regex (#7)`).
4. Close the issue when the work is done — either via the PR body (`Closes #7`) or `gh issue close 7`.

This keeps progress visible to the team and to grading.
