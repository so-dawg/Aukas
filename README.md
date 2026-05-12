# Opportunities Hub

A web platform where Cambodian students discover **internships, jobs, scholarships, volunteer work, and competitions** in one place.

> Capstone project — IDT, Computer Science Gen 11, Year 2 Term 3, Group 3 (7 weeks)

## Tech Stack

| Layer    | Technology                  |
| -------- | --------------------------- |
| Frontend | React                       |
| Backend  | Node.js + Express           |
| Database | PostgreSQL                  |
| DevOps   | Docker, Docker Compose      |
| Hosting  | Vercel (FE) · Render (BE) · Railway (DB) |

## Repository Layout

```
.
├── backend/        Node + Express API
│   ├── src/        Routes, controllers, models, middleware, db
│   ├── migrations/ Versioned SQL migrations
│   └── tests/
├── frontend/       React app
├── db/             schema.sql + seed.sql
├── docs/           Workflow plan, UML diagrams, API spec, requirements
├── .env.example    Copy to .env and fill in
└── docker-compose.yml  (added Week 1)
```

Each subfolder has its own README describing what belongs there.

## Getting Started

> Full setup is in progress — Week 1 deliverable.

```bash
# 1. Clone
git clone <repo-url> && cd Aukas

# 2. Copy env template and fill in values
cp .env.example .env

# 3. (Week 1+) Start the stack with Docker
docker compose up
```

## Team

| Member   | Role                    |
| -------- | ----------------------- |
| Member 1 | Backend & Database      |
| Member 2 | Frontend & UX           |
| Member 3 | Research & Documentation |

## Course Coverage

This project is graded across multiple courses:

- Backend Development
- Database Administration
- Software Engineering (UML, Software Process)
- Automata
- Human-Computer Interaction
- Research Methodology

## Documentation

See [`docs/`](./docs) for the full 7-week workflow plan, UML diagrams, API spec, and research notes.

## License

See [LICENSE](./LICENSE).
