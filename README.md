# Aukas — Opportunities Hub

A Cambodia-first web platform where students discover **internships, jobs, scholarships, volunteer work, and competitions** in one place.

> Capstone project — IDT · Computer Science Gen 11 · Year 2 Term 3 · Group 3 · 7-week build

---

## Status

Week 1 of 7 — *Discovery: Research & Planning*. Track progress on the [Issues](https://github.com/so-dawg/Aukas/issues) board, grouped by weekly milestones.

## Tech stack

| Layer    | Technology                                 |
| -------- | ------------------------------------------ |
| Frontend | React (Vite)                               |
| Backend  | Node.js · Express                          |
| Database | PostgreSQL                                 |
| DevOps   | Docker · Docker Compose                    |
| Hosting  | Vercel (frontend) · Render (API) · Railway (DB) |

## Repository layout

```
.
├── backend/        Node + Express API
│   ├── src/        routes · controllers · models · middleware · db
│   ├── migrations/ versioned SQL migrations
│   └── tests/
├── frontend/       React app
├── db/             schema.sql + seed.sql
├── docs/           workflow plan, research, UML diagrams, API spec
├── .env.example    copy to .env and fill in
└── LICENSE
```

## Getting started

```bash
git clone https://github.com/so-dawg/Aukas.git
cd Aukas
cp .env.example .env        # then edit values (generate a real JWT_SECRET)
```

Local dev workflow lands in **Week 3 (Foundation)**, when the database, Express server, and React skeleton are wired up.

## Team

| Member | Role                     |
| ------ | ------------------------ |
| M1     | Backend & Database       |
| M2     | Frontend & UX            |
| M3     | Research & Documentation |

## Course coverage

Backend Development · Database Administration · Software Engineering · Automata · Human-Computer Interaction · Research Methodology

## Documentation

- [`docs/opportunities_workflow.pdf`](./docs/opportunities_workflow.pdf) — full 7-week workflow plan
- [`docs/research/competitor-analysis.md`](./docs/research/competitor-analysis.md) — competitor landscape (Week 1)
- [`docs/`](./docs) — UML diagrams, API spec, and further notes as they land

## Workflow

All work is tracked as **GitHub Issues** under weekly milestones (Week 1 → Week 7). Before starting a task, check or open an issue, then reference it in commits (`fix: validate email (#7)`) and close it via the PR (`Closes #7`).

## License

See [LICENSE](./LICENSE).
