# ADR-0001 — Tech Stack

> **Project:** Opportunities Hub (Aukas)
> **Status:** Accepted
> **Date:** 2026-05-13
> **Phase:** Week 1 — Discovery
> **Owner:** M1 (Backend & Database)

---

## 1. Context

Opportunities Hub is a 7-week capstone web platform for Cambodian students, built by a 3-person team across the courses Backend Development, Database Administration, Software Engineering, Automata, HCI, and Research Methodology.

The technology stack is specified in the project workflow plan (`docs/opportunities_workflow.pdf`): **React · Node.js · Express · PostgreSQL**. This ADR records that stack and the reasoning that supports each choice.

### Hard constraints

- **No budget.** Every service, library, and tool must be free or open-source.
- **7-week timeline**, part-time, alongside other coursework.
- **Public deployment** required by end of Week 7.
- Stack must align with the syllabi of the six listed courses.

---

## 2. Decision Summary

| Layer    | Choice                                      |
| -------- | ------------------------------------------- |
| Frontend | React (Vite)                                |
| Backend  | Node.js + Express                           |
| Database | PostgreSQL                                  |
| Auth     | JWT (`jsonwebtoken`) + `bcrypt`             |
| Local dev | PostgreSQL (local install)                 |
| Hosting  | Vercel (FE) · Render (API) · Railway (DB)   |

---

## 3. Decisions in Detail

### 3.1 Backend — Node.js + Express

**Why this fits the project:**
- Same language (JavaScript) on frontend and backend reduces context-switching across the stack.
- Express is the standard minimal web framework for Node — small surface area, well-documented.
- Aligns with the Backend Development syllabus (middleware, routing, REST patterns).
- Deploys onto free hosting tiers (Render, Railway, Fly.io).

**Known limitations:**
- JavaScript is dynamically typed — runtime errors that a typed language would catch at compile time can slip through. Mitigated by strict input validation at the API boundary, which also satisfies the Automata course requirement (regex / formal validation).
- Express is unopinionated; project structure is on us. Repository already follows a `routes / controllers / models / middleware / db` layout.

---

### 3.2 Database — PostgreSQL

**Why this fits the project:**
- The data model is highly relational (users ↔ opportunities ↔ categories ↔ tags ↔ bookmarks ↔ applications) — a relational DB is the natural choice.
- The Database Administration syllabus covers normalization, foreign keys, indexes, and transactions — first-class concepts in PostgreSQL.
- Features used directly by this project: enums (`role`, `status`), full-text search (opportunity search), JSONB (future flexible fields).
- Free under Railway / Supabase / Neon free tiers.

**Known limitations:**
- More setup overhead than SQLite. PostgreSQL runs natively, started via systemctl.
- ORM choice deferred — see ADR-0003 (future).

---

### 3.3 Frontend — React (Vite)

**Why this fits the project:**
- Specified in the workflow plan.
- Large ecosystem — easiest to find UI components, hooks, and tutorials.
- Vite is the modern build tool for React (Create React App is no longer maintained).
- Static SPA output deploys to Vercel free tier.

**Known limitations:**
- SPA + separate API means CORS and auth headers must be handled correctly. A single `api.js` module will centralise API calls.

---

### 3.4 Authentication — JWT + bcrypt

**Why this fits the project:**
- Stateless — fits the SPA + separate API architecture without a shared session store.
- `jsonwebtoken` and `bcrypt` are standard, free Node packages.
- The Backend Development syllabus expects implementing auth, not delegating it to a managed provider.

**Known limitations:**
- JWTs cannot be revoked before expiry. Acceptable for a capstone; mitigated by short expiry (7 days).
- Token storage strategy (localStorage vs HttpOnly cookie) is a separate decision — see future ADR.

---

### 3.5 Local development — PostgreSQL

PostgreSQL runs as a native systemd service. Initialize the cluster once, then `sudo systemctl start postgresql` to begin. See project README for setup steps.

**Why this fits the project:**
- PostgreSQL 18 is already installed on the dev machine.
- No additional containerization layer — simpler to debug, fewer moving parts.
- Standard tooling: `psql`, `pg_dump`, `pg_restore` available directly.

**Known limitations:**
- Setup is Linux-native; team members on macOS/Windows would need their own Postgres install or WSL.

---

### 3.6 Hosting

| Service  | Platform | Notes                                                        |
| -------- | -------- | ------------------------------------------------------------ |
| Frontend | Vercel   | Free tier covers static SPAs; HTTPS by default; auto-deploys from GitHub. |
| Backend  | Render   | Free web-service tier for Node; supports env vars. **Free tier sleeps after ~15 min idle — cold start is ~30s on first request.** |
| Database | Railway  | Free Postgres instance with public connection string. Storage cap ~1GB on free tier — well above our needs. |

The cold-start limitation must be acknowledged in the live demo plan: warm up the API before presenting.

---

## 4. Rejected alternatives

| Option       | Why not |
| ------------ | ------- |
| MongoDB      | Data is relational; would force joins in application code; doesn't fit the DB Admin syllabus. |
| Next.js      | No server-side rendering requirement for v1; extra complexity not justified. |
| Auth0 / Clerk | Hides the auth implementation the Backend syllabus expects us to demonstrate. Free tiers also have rate/user limits. |
| Heroku       | No free tier since 2022. |

---

## 5. Consequences

**Positive**
- Single language across frontend and backend.
- Every layer maps to at least one course in the grading rubric.
- Stack runs entirely on free tiers.

**Negative**
- JavaScript's dynamic typing requires disciplined validation at boundaries.
- Render's cold start can affect the live demo if the API isn't warmed up first.
- JWT auth means password reset / email verification flows must be implemented manually.

---

## 6. Follow-up ADRs

- ADR-0002 — UUID vs SERIAL primary keys
- ADR-0003 — ORM choice (Prisma / Knex / raw SQL)
- ADR-0004 — Styling approach
- ADR-0005 — File upload strategy (avatars, logos, CVs)

---

*Stack derived from `docs/opportunities_workflow.pdf`. Future decisions that change any layer here must be recorded as a new ADR that supersedes this one.*
