# Aukas — Opportunities Hub

A Cambodia-first web platform where students discover **internships, jobs, scholarships, volunteer work, and competitions** in one place.

> Capstone project — IDT · Computer Science Gen 11 · Year 2 Term 3 · Group 3 · 7-week build

---

## Tech stack

| Layer    | Technology                                      |
| -------- | ----------------------------------------------- |
| Frontend | React (Vite)                                    |
| Backend  | Node.js · Express · axios                       |
| Database | PostgreSQL · sequelize                          |

## Repository layout

```
.
├── backend/        Node + Express 5 API
│   ├── src/
│   │   ├── index.js         server entry (helmet · cors · morgan · express.json)
│   │   ├── db/index.js      pg Pool — DATABASE_URL
│   │   └── routes/health.js GET /api/health
│   ├── migrations/          versioned SQL migrations (Week 3+)
│   └── tests/
├── frontend/       React 19 + Vite SPA
├── db/             schema.sql + seed.sql (Week 3+)
├── docs/           proposal, ADRs, data model, research, workflow plan
├── .env.example    copy to .env and fill in
├── AGENTS.md       project context for AI coding agents
└── LICENSE
```

## Getting started

```bash
git clone https://github.com/so-dawg/Aukas.git
cd Aukas
cp .env.example .env        # then edit values (generate a real JWT_SECRET)
```

Backend (Express 5):

```bash
cd backend
npm install
npm run dev                 # http://localhost:3000
# GET /api/health → { status: 'ok', db: 'connected' }
```

Frontend (React 19 + Vite):

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

Database schema and seed data land in **Week 3 (Foundation)**.

## Team

| Member | Role                     |
| ------ | ------------------------ |
| M1     | Backend & Database       |
| M2     | Frontend & UX            |
| M3     | Research & Documentation |

## Course coverage

Backend Development · Database Administration · Software Engineering · Automata · Human-Computer Interaction · Research Methodology

## Documentation

- [`docs/proposal.md`](./docs/proposal.md) — project proposal (problem, objectives, scope, success criteria)
- [`docs/decisions/0001-tech-stack.md`](./docs/decisions/0001-tech-stack.md) — ADR for the React · Node · PostgreSQL stack
- [`docs/data-model/entities.md`](./docs/data-model/entities.md) — 10 entities, status state machine
- [`docs/research/competitor-analysis.md`](./docs/research/competitor-analysis.md) — Cambodian opportunity-platform landscape
- [`docs/opportunities_workflow.pdf`](./docs/opportunities_workflow.pdf) — full 7-week workflow plan
- [`docs/`](./docs) — UML diagrams, API spec, and further notes as they land

## Workflow

All work is tracked as **GitHub Issues** under weekly milestones (Week 1 → Week 7). Before starting a task, check or open an issue, then reference it in commits (`fix: validate email (#7)`) and close it via the PR (`Closes #7`).

## License

See [LICENSE](./LICENSE).
