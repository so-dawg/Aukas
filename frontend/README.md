# Aukas — Frontend

React (Vite) SPA for the Opportunities Hub platform.

## Tech

- React 19
- Vite 8
- ESLint 10 (`react-hooks`, `react-refresh` plugins)

## Dev

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production build → dist/
npm run preview      # preview the production build
npm run lint         # run ESLint
```

The SPA talks to the backend at `http://localhost:3000/api/*` during local dev. A central `src/api.js` module will own all `fetch` calls — see ADR-0001 §3.3.

## Deploy

Hosted on Vercel free tier. `vite build` output (`dist/`) is published; auto-deploys from `main` on push.

## Project context

See the root [`README.md`](../README.md), [`AGENTS.md`](../AGENTS.md), and [`docs/`](../docs) for the broader project plan, data model, and ADRs.
