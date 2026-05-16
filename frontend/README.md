# Aukas — Frontend

React (Vite) SPA for the Opportunities Hub platform.

This README is **the build plan for the frontend**. It describes the file structure to build, the conventions to follow, and the order to ship the pages in. The visual design is already done — every page is mocked up in HTML/CSS/JSX in the design handoff bundle (see [§ Design source](#design-source) below). Your job is to port the prototype into a real Vite + React app following the layout in this doc.

---

## Tech

- React 19
- Vite 8
- ESLint 10 (`react-hooks`, `react-refresh` plugins)
- **react-router-dom** — add it: `npm i react-router-dom`

## Dev

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production build → dist/
npm run preview      # preview the production build
npm run lint         # run ESLint
```

The SPA talks to the backend at `http://localhost:3000/api/*` during local dev. A central `src/lib/api.js` module owns all `fetch` calls.

## Deploy

Hosted on Vercel free tier. `vite build` output (`dist/`) is published; auto-deploys from `main` on push.

---

## Design source

The full design — palette, typography, every page mockup — was produced in Claude Design and exported as a handoff bundle. Unpack it into `frontend/design/` before starting:

```
frontend/design/
├── README.md                    # original handoff readme
├── chats/chat1.md               # iteration history with the designer
└── project/
    ├── Aukas Web.html           # the host page that loads everything
    ├── aukas-tokens.css         # cobalt palette + base component classes
    ├── aukas-ui.jsx             # Icon, Button, Field, Chip, Avatar, Logo, Tabs, Modal, etc.
    ├── aukas-app.jsx            # App shell — Sidebar, TopBar, RoleSwitcher, router
    ├── aukas-data.jsx           # Khmer placeholder data
    ├── aukas-student.jsx        # Landing, Auth, Feed, Search, Detail, Saved, Apply, Applications, Profile, Settings
    ├── aukas-org.jsx            # OrgDashboard, OrgPostings, OrgCreate, OrgApplicants
    └── aukas-admin.jsx          # AdminModeration, AdminUsers, AdminAnalytics
```

To preview the design as a clickable prototype, open `frontend/design/project/Aukas Web.html` in a browser. Use the **VIEW AS · DEMO** switcher in the sidebar to flip between Student / Organisation / Admin views.

The prototype loads React via CDN and uses Babel-in-browser. **Do not copy this approach** — it's a prototype, not production code. Recreate the visual output in proper ES modules following the structure below.

---

## Target folder structure for `src/`

```
src/
├── main.jsx                    # entry (loads tokens.css + global.css, mounts <App/>)
├── App.jsx                     # <BrowserRouter> + <Routes>
├── styles/
│   ├── tokens.css              # copy of design/project/aukas-tokens.css
│   └── global.css              # box-sizing reset + @keyframes aukSpin
├── lib/
│   ├── api.js                  # fetch wrappers → backend (auth header, base URL, error handling)
│   └── format.js               # date/currency/Khmer helpers
├── data/
│   └── placeholders.js         # Khmer mock data — port from design/project/aukas-data.jsx
├── components/                 # shared UI primitives (atoms)
│   ├── Icon.jsx                # 50+ inline lucide-style paths
│   ├── Button.jsx              # variants: primary/secondary/ghost/dark/destructive/outline-danger × xs/sm/md/lg
│   ├── Field.jsx               # input/textarea + icon/suffix/label/hint/error
│   ├── Chip.jsx                # + named export StatusChip(status) for Draft/Pending/Active/Closed/Expired
│   ├── Avatar.jsx              # initial + deterministic colour from name
│   ├── Logo.jsx                # cobalt "a" mark + wordmark
│   ├── Tabs.jsx                # horizontal underline tabs, optional counts
│   ├── Modal.jsx               # backdrop + click-outside + title + footer slots
│   ├── EmptyState.jsx          # icon + title + body + optional action
│   ├── categoryIcons.js        # CAT_ICON map (Internship→briefcase, Job→building, etc.)
│   └── layout/
│       └── Stack.jsx           # HStack, VStack, Grid
├── layouts/
│   ├── AppShell.jsx            # Sidebar + TopBar + <Outlet/> (used as a layout route)
│   ├── Sidebar.jsx             # role-aware nav (NavLink with isActive), counts, sign out
│   ├── TopBar.jsx              # search pill + role chip + bell/settings + avatar dropdown
│   └── RoleSwitcher.jsx        # demo Student/Org/Admin pill (sets role state on AppShell)
└── pages/
    ├── PageStub.jsx            # placeholder banner for unfinished pages
    ├── public/
    │   ├── Landing.jsx         # logged-out hero — renders OUTSIDE AppShell (no chrome)
    │   └── Auth.jsx            # sign-in / sign-up — tabs for Student vs Organisation
    ├── student/
    │   ├── Feed.jsx
    │   ├── Search.jsx
    │   ├── Detail.jsx          # /student/detail/:id
    │   ├── Saved.jsx
    │   ├── Applications.jsx    # 5-step pipeline tracker
    │   ├── Profile.jsx         # view + edit (prop or sub-route)
    │   └── ApplyModal.jsx      # 3-step apply flow
    ├── org/
    │   ├── Dashboard.jsx
    │   ├── Postings.jsx
    │   ├── Create.jsx          # 4-step wizard
    │   └── Applicants.jsx      # /org/applicants AND /org/applicants/:id
    ├── admin/
    │   ├── Moderation.jsx
    │   ├── Users.jsx
    │   └── Analytics.jsx
    ├── Settings.jsx            # shared across roles
    └── states/
        ├── NotFound.jsx
        ├── Loading.jsx
        └── ErrorState.jsx
```

---

## Routing

All routes go through `react-router-dom`. URLs use real paths, not hashes.

| Path                          | Component             | Layout |
|-------------------------------|-----------------------|--------|
| `/`                           | `Landing`             | full-bleed |
| `/auth`                       | `Auth`                | full-bleed |
| `/student/feed`               | `Feed`                | AppShell |
| `/student/search`             | `Search`              | AppShell |
| `/student/detail/:id`         | `Detail`              | AppShell |
| `/student/saved`              | `Saved`               | AppShell |
| `/student/applications`       | `Applications`        | AppShell |
| `/student/profile`            | `Profile`             | AppShell |
| `/student/profile/edit`       | `Profile` (edit mode) | AppShell |
| `/org/dashboard`              | `OrgDashboard`        | AppShell |
| `/org/postings`               | `OrgPostings`         | AppShell |
| `/org/create`                 | `OrgCreate`           | AppShell |
| `/org/applicants`             | `OrgApplicants`       | AppShell |
| `/org/applicants/:id`         | `OrgApplicants`       | AppShell |
| `/admin/moderation`           | `AdminModeration`     | AppShell |
| `/admin/users`                | `AdminUsers`          | AppShell |
| `/admin/analytics`            | `AdminAnalytics`      | AppShell |
| `/settings`                   | `Settings`            | AppShell |
| `*`                           | `NotFound`            | full-bleed |

`AppShell` is used as a [layout route](https://reactrouter.com/start/data/routing#layout-routes) — pages render into its `<Outlet/>`. Landing, Auth, and NotFound render full-bleed (no sidebar/topbar).

---

## Conventions

### Styling

- **CSS variables only.** All colours, fonts, radii live in `styles/tokens.css`. Don't introduce Tailwind, CSS-in-JS, or anything else.
- **Class names from `tokens.css`** for shared patterns: `.btn`, `.card`, `.field`, `.chip`, `.sidebar`, `.topbar`, `.tabs`, `.tbl`, `.skeleton`, `.modal`, `.page`, `.section-title`, `.meta`, `.divider`.
- **Inline `style={}` for one-offs.** The prototype does this everywhere — match it. Don't proliferate new CSS files.

### Components

- Each shared component = one file, default export.
- Components take props the way the prototype defines them — don't restructure the prop shape (e.g., `Button` takes `variant`, `size`, `icon`, `iconRight`, `loading`).
- No `forwardRef` unless you actually need a ref.
- Don't add PropTypes or TypeScript — keep it plain JS.

### Routing

- Use `<Link>` / `<NavLink>` from `react-router-dom`, never `<a href>` for internal navigation.
- `Sidebar` uses `<NavLink>` with `className={({isActive}) => isActive ? 'side-link active' : 'side-link'}`.
- For programmatic navigation, use the `useNavigate()` hook.
- For route params (`:id`), use `useParams()`.

### Data

- During week 1–2, pages read from `data/placeholders.js`. No API calls yet.
- When the backend endpoint for a page exists, swap the import: `import { listOpportunities } from '../lib/api'` instead of `import { OPPORTUNITIES } from '../data/placeholders'`.
- All API calls go through `lib/api.js`. Never `fetch()` inline in a page.

### State

- Keep state local (`useState`) until a second page needs it.
- When `savedSet` and the apply modal need cross-page access, lift to a small `AppStateContext` in `AppShell.jsx`. Don't reach for Redux/Zustand for a 7-week project.

### Icons

- Inline `<Icon name="search" />` from `components/Icon.jsx`. The icon set is copied from the prototype — extend it there if you need a new one.
- Do NOT install `lucide-react`. We don't need the bundle weight.

---

## Implementation order

Split the work like this. Each block is one developer-day or less if you don't over-polish.

### Phase 1 · Foundations (1 day)

1. `npm i react-router-dom`
2. Copy `design/project/aukas-tokens.css` → `src/styles/tokens.css`
3. Create `src/styles/global.css` with box-sizing reset + the `aukSpin` keyframe (used by Button's spinner)
4. Replace `src/main.jsx` to import the two CSS files and mount `<App/>`
5. Build all components in `src/components/` — port them from `design/project/aukas-ui.jsx`. Test by rendering a few in a throwaway `App.jsx`.
6. Build `src/layouts/AppShell.jsx`, `Sidebar.jsx`, `TopBar.jsx`, `RoleSwitcher.jsx` — port from `design/project/aukas-app.jsx`
7. Wire `App.jsx` with `<BrowserRouter>` and every route from the table above. Use `pages/PageStub.jsx` as a placeholder body for every page.
8. ✅ Done when: you can click every sidebar link, the role switcher flips the sidebar nav, and the NavLink active state highlights correctly.

### Phase 2 · Student flow (2 days)

Port from `design/project/aukas-student.jsx`. Build in this order — each builds on the previous:

1. `pages/public/Landing.jsx` — the logged-out hero (Landing function)
2. `pages/public/Auth.jsx` — sign-in / sign-up with tabs
3. `pages/student/Feed.jsx` — opportunity cards grid (StudentFeed function)
4. `pages/student/Detail.jsx` — full opportunity page (Detail function)
5. `pages/student/ApplyModal.jsx` — 3-step submission flow (ApplyModal function)
6. `pages/student/Applications.jsx` — pipeline tracker (Applications function)
7. `pages/student/Search.jsx` + `pages/student/Saved.jsx` — reuse the feed card from Feed
8. `pages/student/Profile.jsx` — view + edit
9. `pages/Settings.jsx`

### Phase 3 · Organisation flow (1.5 days)

Port from `design/project/aukas-org.jsx`:

1. `pages/org/Dashboard.jsx`
2. `pages/org/Postings.jsx`
3. `pages/org/Create.jsx` — 4-step wizard
4. `pages/org/Applicants.jsx`

### Phase 4 · Admin flow (1 day)

Port from `design/project/aukas-admin.jsx`:

1. `pages/admin/Moderation.jsx`
2. `pages/admin/Users.jsx`
3. `pages/admin/Analytics.jsx`

### Phase 5 · Polish (0.5 day)

- `pages/states/Loading.jsx` and `ErrorState.jsx` (port `LoadingState` and `ErrorState` from `aukas-app.jsx`)
- 404 page (`pages/states/NotFound.jsx`) — port `NotFound` from `aukas-app.jsx`
- Mobile breakpoints (sidebar → bottom nav, single-column cards) — not in the prototype, build from scratch

### Phase 6 · Backend wiring

When backend endpoints come online, swap each page's data source from `data/placeholders.js` to `lib/api.js`. Owner: Member 1 (backend). Done page-by-page, not all at once.

---

## Reference — design tokens

(Mirrored from `design/project/aukas-tokens.css` — read that file for the full set.)

- **Primary (cobalt):** `--primary-600: #1F4DDB` · `--primary-tint: #E6ECFB`
- **Neutrals:** `--n-50` through `--n-900`
- **Status:** `--success #1F7A52` · `--warning #B86E00` · `--danger #B83232` · `--info #0D74C2` · `--accent #F59E0B`
- **Fonts:** Inter (body) · Inter Tight (display) · Noto Sans Khmer (bilingual) · JetBrains Mono (metadata)

Load fonts in `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Inter+Tight:wght@500;600;700;800&family=Noto+Sans+Khmer:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
```

---

## Project context

See the root [`README.md`](../README.md), [`AGENTS.md`](../AGENTS.md), and [`docs/`](../docs) for the broader project plan, data model, and ADRs.