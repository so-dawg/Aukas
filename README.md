# Aukas — Opportunities Hub

A web platform where students discover **internships, jobs, scholarships, volunteer work, and competitions** in one place.

> Capstone project — IDT · 

---

## Tech stack

| Layer    | Technology                                      |
| -------- | ----------------------------------------------- |
| Frontend | React (Vite) · axios · lucide-react             |
| Backend  | Node.js · Express · sequelize · jsonwebtoken    |
| Database | PostgreSQL 15+                                  |

## Repository layout


```
.
├── backend/        Node + Express 5 API
│   ├── src/
│   │   ├── index.js             server entry (helmet · cors · morgan · express.json)
│   │   ├── api/client.js        Axios client — baseURL /api, auto-attaches JWT
│   │   ├── config/config.json       PostgreSQL connection config
│   │   ├── db/index.js          Sequelize instance — DATABASE_URL
│   │   ├── migrations/              versioned schema migrations
│   │   ├── routes/              health, auth, opportunities, bookmarks, orgs, admin, etc.
│   │   ├── controllers/         route handlers (validation, business logic)
│   │   ├── models/              data-access layer (raw SQL via Sequelize)
│   │   ├── seeders/                 sample data seeders
│   │   ├── middleware/          auth JWT, error handler
│   │   └── utils/               JWT helpers, password hashing, pagination, regex patterns
│   ├── scripts/                 standalone utilities (e.g. expire-opportunities)
│   └── tests/
├── frontend/       React 19 + Vite SPA
│   └── src/
│       ├── context/AuthContext   Login, register, logout state
│       ├── pages/               Home, Opportunities, OpportunityDetail, Login, Signup, etc.
│       └── components/          Navbar, Footer, Hero, cards
├── db/             Sequelize CLI scaffold
│   ├── schema.sql               reference SQL schema (source of truth)
│   └── seed.sql                 reference SQL seed data
├── docs/           proposal, ADRs, data model, research, workflow plan
├── .sequelizerc    Sequelize CLI config paths
├── .env.example    copy to .env and fill in
├── AGENTS.md       project context for AI coding agents
├── README.md       you are here
└── LICENSE
```

## Getting started

### Prerequisites

- **Node.js** 20+
- **PostgreSQL** 15+
- **npm**

### 1. Clone and install

```bash
git clone https://github.com/so-dawg/Aukas.git
cd Aukas
cp .env.example .env   # then edit values
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

Database schema and seed data land in 
# Arch Linux

```bash
sudo pacman -S postgresql
sudo -u postgres initdb -D /var/lib/postgres/data
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres createuser opportunities -P   # password: changeme
sudo -u postgres createdb opportunities_hub -O opportunities
```
## Team

| Member | Role                     |
| ------ | ------------------------ |
| M1     | Backend & Fullstack      |
| M2     | Frontend & UX            |
| M3     | Database                 |

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
