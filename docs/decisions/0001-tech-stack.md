# ADR-0001 — Tech Stack

> **Project:** Opportunities Hub (Aukas)
> **Status:** Accepted
> **Date:** 2026-05-13
> **Phase:** Week 1 — Discovery
> **Owner:** M1 (Backend & Database)

---

## 1. Context

We are building a full-stack web platform — Opportunities Hub — over 7 weeks with a 3-person team. The platform must:

- Serve five types of opportunities (internship, job, scholarship, volunteer, competition)
- Support three user roles with authentication (student, organization, admin)
- Run a moderation workflow (admin approves postings)
- Be reachable publicly on a stable URL by end of Week 7
- Integrate the learning objectives of six courses: Backend Development, Database Administration, Software Engineering, Automata, HCI, and Research Methodology

The team has prior coursework in JavaScript, SQL, and basic React. None of us has shipped a production app in Django, Spring, or .NET. The time budget is tight (7 weeks, part-time alongside other courses), and the grading rubric explicitly references the technologies in the Backend Dev and DB Admin syllabi.

This document records the technology choices for the project and the reasoning behind each, so future-us (and the graders) can understand the trade-offs we accepted.

---

## 2. Decision Summary

| Layer    | Choice                                      |
| -------- | ------------------------------------------- |
| Frontend | **React** (Vite build tool)                 |
| Backend  | **Node.js + Express**                       |
| Database | **PostgreSQL**                              |
| Auth     | **JWT** (jsonwebtoken) + **bcrypt**         |
| Local dev | **Docker + Docker Compose**                |
| Hosting  | **Vercel** (FE) · **Render** (API) · **Railway** (DB) |

---

## 3. Decisions in Detail

### 3.1 Backend — Node.js + Express

**Chosen over:** Django (Python), Spring Boot (Java), Laravel (PHP), .NET, FastAPI.

**Reasons**
- The team already knows JavaScript; choosing Node means one language across frontend and backend, reducing context-switching cost in a tight 7-week window.
- Express is the de-facto Node web framework — minimal, well-documented, with abundant tutorials and StackOverflow coverage in case we get stuck.
- The Backend Development syllabus references Node/Express patterns (middleware, routing, REST).
- Easy to deploy on free tiers (Render, Railway, Fly.io).

**Trade-offs / risks**
- JavaScript's looser typing increases the risk of runtime bugs vs. a typed stack like Spring or .NET. **Mitigation:** strict input validation at the API boundary (regex/joi) — this also covers the Automata course requirement.
- Express is unopinionated, so we own the project structure. **Mitigation:** follow a standard `routes / controllers / models / middleware` layout from day one (see repo layout).

---

### 3.2 Database — PostgreSQL

**Chosen over:** MongoDB, MySQL, SQLite.

**Reasons**
- Our data is highly relational: users ↔ opportunities ↔ categories ↔ tags ↔ bookmarks ↔ applications. A relational DB is the natural fit.
- The Database Administration course explicitly covers normalization, foreign keys, indexes, and transactions — all first-class in PostgreSQL.
- PostgreSQL has features we will actually use: enums (for `role`, `status`), full-text search (for opportunity search), and JSONB (escape hatch for future flexible fields).
- Free, open-source, and supported on every cheap hosting platform (Railway, Supabase, Render).
- MySQL is similar but has weaker enum and full-text-search support; SQLite doesn't fit multi-user web apps; MongoDB would force us into ad-hoc joins in application code, which clashes with the DB Admin syllabus.

**Trade-offs / risks**
- Slightly steeper learning curve than SQLite for setup. **Mitigation:** Docker Compose makes local Postgres a one-command start.
- ORM choice (Prisma vs. Knex vs. raw SQL) is a separate decision — see future ADR.

---

### 3.3 Frontend — React (with Vite)

**Chosen over:** Vue, Svelte, plain HTML+JS, Next.js.

**Reasons**
- React has the largest ecosystem and community — easiest to find UI libraries, hooks, and examples.
- The team has been exposed to React in coursework; learning curve is the shallowest of the realistic options.
- **Vite** over Create React App because CRA is no longer actively maintained as of 2024. Vite is faster, simpler, and the modern default.
- We don't need server-side rendering for v1 — a static SPA is enough, so Next.js's extra complexity isn't justified.

**Trade-offs / risks**
- SPA + separate API means we manage CORS, auth headers, and routing on both sides. **Mitigation:** centralise API calls in one `api.js` module from day one.

---

### 3.4 Authentication — JWT + bcrypt

**Chosen over:** session cookies, OAuth-only, Auth0/Clerk.

**Reasons**
- JWT is stateless — fits a SPA + separate API cleanly, no shared session store needed.
- `jsonwebtoken` + `bcrypt` are the standard Node packages, well-documented and easy to teach in the report.
- Auth0/Clerk would simplify implementation but hide the learning we're meant to demonstrate (the Backend syllabus expects we *understand* auth, not outsource it).

**Trade-offs / risks**
- JWTs can't be revoked easily before expiry. **Mitigation:** short expiry (7 days) — acceptable for a capstone.
- Storing JWT in `localStorage` is XSS-prone. **Mitigation:** sanitise all user-generated content rendered in React (React's default escaping handles most cases).

---

### 3.5 Local development — Docker + Docker Compose

**Reasons**
- One command (`docker compose up`) brings up Postgres + backend + frontend on any team member's machine, regardless of OS.
- Avoids the "works on my machine" problem early — all three of us are on different setups.
- Docker is referenced in the Backend Dev syllabus and looks professional in the final report.

**Trade-offs / risks**
- Adds a layer of abstraction beginners can find confusing. **Mitigation:** keep the `docker-compose.yml` minimal — just three services — and document it in the root README.

---

### 3.6 Hosting

| Service  | Platform          | Why                                                          |
| -------- | ----------------- | ------------------------------------------------------------ |
| Frontend | **Vercel**        | Free tier covers SPAs; instant deploys from GitHub; HTTPS by default. |
| Backend  | **Render**        | Free web-service tier for Node apps; supports env vars; sleeps when idle (acceptable for demo). |
| Database | **Railway** *(or Supabase)* | Free Postgres instance with public connection string; easy to seed. |

**Trade-offs / risks**
- Render's free tier cold-starts after 15 min idle — first request after sleep takes ~30 seconds. **Mitigation:** acknowledged in the demo plan; presenter will warm up the API before the live demo.
- Free-tier databases have small storage caps (~1GB). **Mitigation:** we'll seed ~20–50 opportunities, far under the limit.

---

## 4. What we explicitly rejected

| Option                  | Why we rejected it |
| ----------------------- | ------------------ |
| Django (Python)         | Team has weaker Python web experience; would slow Week 3–4. |
| MongoDB                 | Our data is relational; would force joins in app code; clashes with DB Admin syllabus. |
| Next.js                 | No SSR needs; extra complexity not justified for v1. |
| Auth0 / Clerk           | Hides the auth concepts the grading rubric expects us to demonstrate. |
| Heroku                  | No longer has a free tier as of late 2022. |
| Tailwind CSS *(undecided)* | Open question — see future ADR on styling. |

---

## 5. Consequences

**Positive**
- A single-language stack (JS everywhere) cuts cognitive overhead in a tight timeline.
- Everything we chose has free hosting tiers — total project cost is $0.
- Every tech choice maps to at least one course in the rubric, giving the report clear talking points.

**Negative**
- We accept JavaScript's weaker typing and the discipline cost that comes with it.
- Render's cold-start could embarrass us in the live demo if we forget to warm it up.
- We commit early to JWT auth, meaning we'll have to do password reset / verification flows manually rather than getting them free from an Auth provider.

---

## 6. Open questions (future ADRs)

- **ADR-0002** — UUID vs SERIAL primary keys
- **ADR-0003** — ORM choice (Prisma vs Knex vs raw SQL)
- **ADR-0004** — Styling approach (Tailwind vs CSS modules vs vanilla CSS)
- **ADR-0005** — File upload strategy (avatars, logos, CVs) — local disk vs S3-compatible

---

*This ADR is the foundational decision document for the Aukas project. Subsequent design choices in Weeks 2–7 will be recorded as ADR-0002 onward, and any decision that supersedes this one must reference it explicitly.*
