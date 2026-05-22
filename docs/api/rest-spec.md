# REST API Specification — Opportunities Hub (Aukas)

> **Phase:** Week 2 — Design (System & UI)
> **Owner:** M1 (Backend & Database)
> **Issue:** [#7](https://github.com/so-dawg/Aukas/issues/7)
> **Base URL:** `http://localhost:3000/api` (dev) · production URL set in Week 7
> **Implementation milestone:** Week 4 (Core Build)

---

## 1. Conventions

### 1.1 Versioning and base path

All endpoints are prefixed with `/api`. Version-in-URL (`/api/v1`) is **not** used in v1 — the project ships once and the academic timeline does not include a v2.

### 1.2 Content type

All requests and responses use `application/json; charset=utf-8` unless explicitly noted (file uploads in v1.5 would use `multipart/form-data`; not in scope).

### 1.3 Authentication

Stateless **JWT bearer tokens**, signed with `JWT_SECRET` (HS256). The client sends:

```
Authorization: Bearer <token>
```

Tokens are issued by `POST /auth/login` and `POST /auth/register`. They expire after 7 days. Refresh tokens are out of scope for v1; users re-login when their token expires.

The JWT payload is:

```json
{
  "sub": "<users.id>",
  "role": "student | organization | admin",
  "iat": 1716000000,
  "exp": 1716604800
}
```
**Planned for v1.5:** Refresh token flow with short-lived access tokens (15 min) 
and long-lived refresh tokens (30 days), enabling silent re-authentication.

### 1.4 Roles and authorization

| Role | Token granted on register/login | Authorised for |
|---|---|---|
| `student` | yes | browse, bookmark, apply, manage own profile |
| `organization` | yes (after email verification, Week 5) | post / edit / delete own opportunities |
| `admin` | manually seeded (not via register) | moderate opportunities, manage all users |

Each endpoint below lists its required role(s) under **Auth**. `Public` means no token required.

### 1.5 Pagination

List endpoints accept:

| Query param | Default | Range | Meaning |
|---|---|---|---|
| `page` | 1 | ≥ 1 | 1-indexed page number |
| `limit` | 20 | 1–50 | items per page |

Responses include a `meta` block:

```json
{
  "data": [ /* items */ ],
  "meta": { "page": 1, "limit": 20, "total": 137, "total_pages": 7 }
}
```

### 1.6 Error format

All errors share the same shape:

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Human-readable description.",
    "details": [
      { "field": "email", "rule": "format" }
    ]
  }
}
```

| Code | HTTP status | When |
|---|---|---|
| `VALIDATION_FAILED` | 400 | request body / query params fail validation (see [Automata regex rules](#9-input-validation-regex-automata-tie-in)) |
| `UNAUTHENTICATED` | 401 | missing or invalid token |
| `FORBIDDEN` | 403 | authenticated but wrong role / not the resource owner |
| `NOT_FOUND` | 404 | resource id does not exist |
| `CONFLICT` | 409 | duplicate email; illegal status transition; bookmark already exists |
| `RATE_LIMITED` | 429 | too many requests (Week 6) |
| `INTERNAL` | 500 | unhandled server error |

### 1.7 Date and time

All timestamps in requests and responses are **ISO 8601 in UTC**, e.g. `2026-06-15T17:00:00Z`. Dates without a time component (e.g. `deadline`) use `YYYY-MM-DD`.

---

## 2. Endpoint summary

| # | Method | Path | Auth | Purpose |
|---|---|---|---|---|
| **Auth** | | | | |
| 1 | POST | `/auth/register` | Public | Create a `student` or `organization` account |
| 2 | POST | `/auth/login` | Public | Issue JWT |
| 3 | GET | `/auth/me` | Any role | Current user profile |
| **Users** | | | | |
| 4 | GET | `/users/:id` | Admin | Fetch any user |
| 5 | PATCH | `/users/me` | Any role | Update own profile (base fields) |
| 6 | PATCH | `/students/me` | Student | Update student profile fields |
| 7 | PATCH | `/organizations/me` | Organization | Update org profile fields |
| 8 | DELETE | `/users/me` | Any role | Soft-delete own account |
| **Opportunities** | | | | |
| 9 | GET | `/opportunities` | Public | List approved opportunities (search, filter, paginate) |
| 10 | GET | `/opportunities/:id` | Public | Single opportunity detail |
| 11 | POST | `/opportunities` | Organization | Create a new opportunity (status starts at `draft`) |
| 12 | PATCH | `/opportunities/:id` | Organization (owner) | Edit fields |
| 13 | PATCH | `/opportunities/:id/status` | Organization (owner) or Admin | Fire a status transition |
| 14 | DELETE | `/opportunities/:id` | Organization (owner) or Admin | Hard delete |
| 15 | GET | `/organizations/me/opportunities` | Organization | List own opportunities (any status) |
| **Categories** | | | | |
| 16 | GET | `/categories` | Public | List the 5 categories |
| **Bookmarks** | | | | |
| 17 | GET | `/bookmarks` | Student | List own bookmarks |
| 18 | POST | `/bookmarks` | Student | Bookmark an opportunity |
| 19 | DELETE | `/bookmarks/:opportunity_id` | Student | Remove bookmark |
| **Applications** | | | | |
| 20 | POST | `/applications` | Student | Record "clicked apply" event |
| 21 | GET | `/applications/me` | Student | List own application records |
| **Admin moderation** | | | | |
| 22 | GET | `/admin/opportunities` | Admin | List opportunities filtered by status (e.g. `pending`) |
| 23 | GET | `/admin/users` | Admin | List all users with role / verified filters |
| 24 | PATCH | `/admin/organizations/:user_id/verify` | Admin | Toggle `organizations.verified` |
| **System** | | | | |
| 25 | GET | `/health` | Public | Liveness + DB ping (already implemented Week 1) |

24 endpoints + the existing `/health`. Items 13 (status transitions) and 9 (search/filter) are the two complex ones; everything else is straight CRUD.

---

## 3. Auth endpoints

### 3.1 `POST /auth/register`

**Auth:** Public
**Purpose:** Create a `student` or `organization` account. Admins are seeded directly into the database — not registered via this endpoint.

Request:

```json
{
  "role": "student",
  "email": "vita@example.com",
  "password": "correct horse battery staple",
  "full_name": "Vita Sok",
  "profile": {
    "university": "RUPP",
    "major": "Computer Science",
    "year_of_study": 2
  }
}
```

For `role: "organization"` the `profile` block instead contains `org_name`, `website`, `description`.

Response `201 Created`:

```json
{
  "user": {
    "id": "8f2…",
    "email": "vita@example.com",
    "full_name": "Vita Sok",
    "role": "student",
    "created_at": "2026-05-18T03:11:00Z"
  },
  "token": "eyJhbGciOiJI…"
}
```

Errors: `400 VALIDATION_FAILED`, `409 CONFLICT` (email already taken).

### 3.2 `POST /auth/login`

**Auth:** Public

Request:

```json
{ "email": "vita@example.com", "password": "…" }
```

Response `200 OK`:

```json
{
  "user": { /* same shape as register */ },
  "token": "eyJhbGciOiJI…"
}
```

Errors: `400 VALIDATION_FAILED`, `401 UNAUTHENTICATED` (wrong password or unknown email — same response either way to avoid user enumeration).

### 3.3 `GET /auth/me`

**Auth:** Any role
**Purpose:** Return the current user from the bearer token. Used by the frontend on app boot to rehydrate session state.

Response `200 OK`:

```json
{
  "user": {
    "id": "8f2…",
    "email": "vita@example.com",
    "full_name": "Vita Sok",
    "role": "student",
    "profile": {
      "university": "RUPP",
      "major": "Computer Science",
      "year_of_study": 2,
      "resume_url": null
    }
  }
}
```

For organizations, `profile` contains `org_name`, `website`, `description`, `verified`.
For admins, `profile` is `null`.

---

## 4. User endpoints

### 4.1 `GET /users/:id`

**Auth:** Admin
**Purpose:** Admin lookup by id (used by moderation UI). Returns the same shape as `GET /auth/me`.

Errors: `403 FORBIDDEN` (not admin), `404 NOT_FOUND`.

### 4.2 `PATCH /users/me`

**Auth:** Any role
**Body (any subset):**

```json
{ "full_name": "Vita Sok-Chea", "email": "new@example.com", "password": "new-password" }
```

If `email` is changed, `users.is_verified` would be reset — out of scope for v1 (no email verification).

Response `200 OK`: updated user object.

### 4.3 `PATCH /students/me`

**Auth:** Student
**Body (any subset):**

```json
{ "university": "ITC", "major": "Software Engineering", "year_of_study": 3, "resume_url": "https://…" }
```

Errors: `403` if the caller's role is not `student`.

### 4.4 `PATCH /organizations/me`

**Auth:** Organization
**Body (any subset):**

```json
{ "org_name": "Open Institute", "website": "https://…", "description": "…" }
```

`verified` is **not** writable by the organization itself — only by `PATCH /admin/organizations/:user_id/verify`.

### 4.5 `DELETE /users/me`

**Auth:** Any role
**Behavior:** Soft delete — `UPDATE users SET deleted_at = now() WHERE id = $me`. The row stays in the database; subsequent reads filter on `WHERE deleted_at IS NULL` and treat the account as gone (see [`schema.md` §6.4](../data-model/schema.md#64-soft-delete-convention)). Bookmarks and applications are kept for analytics; an organization's opportunities remain visible until separately unpublished. The partial unique index on `users(email)` frees the address for a new signup.

Response `204 No Content`.

---

## 5. Opportunity endpoints

### 5.1 `GET /opportunities`

**Auth:** Public

Query parameters:

| Param | Type | Default | Notes |
|---|---|---|---|
| `q` | string | — | full-text search on `title` and `description` |
| `type` | string | — | one of `internship`, `job`, `scholarship`, `volunteer`, `competition` |
| `category_id` | uuid | — | alternative to `type` |
| `location` | string | — | partial match, case-insensitive |
| `deadline_before` | date | — | `YYYY-MM-DD` |
| `deadline_after` | date | — | `YYYY-MM-DD` |
| `organization_id` | uuid | — | filter by poster |
| `sort` | string | `deadline_asc` | `deadline_asc` · `deadline_desc` · `newest` |
| `page`, `limit` | int | 1, 20 | see [§1.5](#15-pagination) |

Only `status = 'approved'` rows are returned. Rows in any other status require the admin or organization-owner endpoints (§7 and §5.7).

Response `200 OK`:

```json
{
  "data": [
    {
      "id": "a31…",
      "title": "Backend Internship — Open Institute",
      "type": "internship",
      "category": { "id": "…", "name": "Internship", "slug": "internship" },
      "organization": { "user_id": "…", "org_name": "Open Institute", "verified": true },
      "location": "Phnom Penh",
      "deadline": "2026-07-01",
      "status": "approved",
      "created_at": "2026-05-18T03:11:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 137, "total_pages": 7 }
}
```

### 5.2 `GET /opportunities/:id`

**Auth:** Public for `approved` and `expired` rows; owner or admin for any other status.

Response `200 OK`: same item shape as the list, plus `description` and `approved_by`.

Errors: `404 NOT_FOUND` (also returned when a non-owner asks for a non-public row, to avoid leaking existence).

### 5.3 `POST /opportunities`

**Auth:** Organization (verified)

Request:

```json
{
  "category_id": "…",
  "title": "Frontend Volunteer Developer",
  "description": "We are looking for…",
  "location": "Remote",
  "deadline": "2026-08-15"
}
```

Side effects: `organization_id` is taken from the JWT, not the body. `status` is set to `'draft'` automatically. `type` is populated by the trigger from the category slug (see [normalization §5.1](../data-model/normalization.md#51-opportunitiestype-duplicates-categoriesname)).

Response `201 Created`: the created opportunity (status = `draft`).

Errors: `400 VALIDATION_FAILED`, `403 FORBIDDEN` (caller is not a verified organization).

### 5.4 `PATCH /opportunities/:id`

**Auth:** Organization (owner)

Body (any subset of `title`, `description`, `category_id`, `location`, `deadline`).

Side effect: if the row was in `pending` or `rejected`, status falls back to `draft` (the `edit` event in the [state diagram](../data-model/opportunity-state-diagram.md#4-transition-table--δq-σ)).

Errors: `403` (not owner), `404`, `409 CONFLICT` if the row is in `approved` or `expired` (those cannot be edited — create a new posting instead).

### 5.5 `PATCH /opportunities/:id/status`

**Auth:** Owner organization for `submit` and `edit`; admin for `approve` and `reject`.

Request:

```json
{ "status": "approved" }
```

Or, for rejections:

```json
{ "status": "rejected", "reason": "Deadline is in the past." }
```

The server validates that `(currentStatus, requestedStatus)` is a defined transition per the [state diagram §4](../data-model/opportunity-state-diagram.md#4-transition-table--δq-σ). Illegal pairs return `409 CONFLICT` with code `ILLEGAL_TRANSITION`.

On `approve`, the server sets `approved_by = <admin.id>`.

Response `200 OK`: the updated opportunity.

### 5.6 `DELETE /opportunities/:id`

**Auth:** Owner organization or admin
**Behavior:** Hard delete (cascades to `applications` and `bookmarks`).

Response `204 No Content`.

### 5.7 `GET /organizations/me/opportunities`

**Auth:** Organization
**Purpose:** Dashboard query — list **all** of the caller's opportunities regardless of status. Supports the same pagination as §5.1 plus a `status` filter.

---

## 6. Category, bookmark, application endpoints

### 6.1 `GET /categories`

**Auth:** Public
Response: array of the five `{ id, name, slug }` rows. No pagination — cached for 1 hour with a `Cache-Control: public, max-age=3600` header.

### 6.2 `GET /bookmarks`

**Auth:** Student
Response: paginated list of `{ opportunity, saved_at }` objects for the current student. The full opportunity object is embedded so the frontend's "saved" page doesn't need a second round-trip.

### 6.3 `POST /bookmarks`

**Auth:** Student

Request:

```json
{ "opportunity_id": "a31…" }
```

Response `201 Created`: the bookmark record.
Errors: `409 CONFLICT` if the student has already bookmarked this opportunity (composite unique constraint).

### 6.4 `DELETE /bookmarks/:opportunity_id`

**Auth:** Student
Response: `204 No Content`. Returns `204` even if the bookmark didn't exist — idempotent delete.

### 6.5 `POST /applications`

**Auth:** Student

Request:

```json
{ "opportunity_id": "a31…" }
```

Response `201 Created` with the application record. Always succeeds — each "click apply" is a separate event (see [normalization §3.6](../data-model/normalization.md#36-applications)).

### 6.6 `GET /applications/me`

**Auth:** Student
Response: paginated list of the caller's application records, each embedding the opportunity it points to.

---

## 7. Admin endpoints

### 7.1 `GET /admin/opportunities`

**Auth:** Admin
Query params: same as `/opportunities` plus `status` (defaults to `pending`, which is the moderation queue).

### 7.2 `GET /admin/users`

**Auth:** Admin
Query params: `role`, `verified` (organizations only), `page`, `limit`.

### 7.3 `PATCH /admin/organizations/:user_id/verify`

**Auth:** Admin

Request:

```json
{ "verified": true }
```

Response `200 OK`: the updated organization.

---

## 8. `GET /health`

**Auth:** Public

Already implemented in `backend/src/routes/health.js`. Returns:

```json
{ "status": "ok", "db": "connected" }
```

Returns `503 Service Unavailable` if the database ping fails.

---

## 9. Input validation regex (Automata tie-in)

The Automata course requires the project to demonstrate regular-expression / DFM usage. Input validation reuses the same regular-language toolkit: each text input field is bounded by a regex, and the regex is checked both on the frontend (immediate UX feedback) and on the backend (defense-in-depth).

| Field | Regex | Notes |
|---|---|---|
| `email` | `^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$` | Pragmatic — does not pursue full RFC 5322 |
| `password` | `^[\x20-\x7E]{8,128}$` | 8–128 printable ASCII characters |
| `full_name` | `^[\p{L}\p{M}'\- ]{2,150}$` | Letters, marks, apostrophe, hyphen, space; supports Khmer script |
| `slug` | `^[a-z0-9]+(-[a-z0-9]+)*$` | URL-safe slug |
| `url` | `^https?://[^\s]{1,500}$` | website, resume_url, external_url |
| `year_of_study` | (numeric) `1..6` | bounded check, not a regex |

These regexes are listed here as part of the API contract because they are returned in `VALIDATION_FAILED.details[].rule` — clients can cross-check the rule name against this table.

---

## 10. Rate limits (Week 6)

Per IP, applied in middleware:

| Scope | Limit |
|---|---|
| `/auth/*` | 10 requests / 15 min |
| All other endpoints | 100 requests / 15 min |

A `429 RATE_LIMITED` response includes `Retry-After` (seconds). Not enforced in Weeks 4–5; added in Week 6 alongside error logging.

---

## 11. CORS

The backend allows origins listed in the `CORS_ORIGIN` env var (comma-separated). For dev, the default is `http://localhost:5173` (the Vite dev server).

---

## 12. Out of scope for v1

These are explicitly **not** in the v1 API surface, so they are not designed here:

- Refresh tokens / session revocation
- Email verification flow
- File uploads (resumes, logos) — `resume_url` is a free-form string for now
- Direct in-platform application submission (only "click apply" tracking)
- Realtime / WebSocket endpoints
- Khmer-language content negotiation (`Accept-Language`)

Most are listed in the [proposal §3.2](../proposal.md#32-out-of-scope-for-v1).

---

## 13. Open questions for Week 4

1. **Should `GET /opportunities` allow `status=expired` as a public filter?** Probably yes — students may want to see what they missed. Defaulting to `status=approved` keeps the homepage clean.
2. **Should `DELETE /opportunities/:id` be soft delete?** Resolved — yes. `opportunities.deleted_at` was added in [`schema.md` §6.4](../data-model/schema.md#64-soft-delete-convention); the endpoint sets it instead of removing the row. `status = 'expired'` remains the FSM-driven path for end-of-deadline opportunities. Hard `DELETE` remains for outright spam (admin only).
3. **Where do admin moderation actions get logged?** v1 stores only `approved_by`. If the report needs a full audit, the `opportunity_status_log` table from `entities.md` would need to come back.

---

## 14. Related documents

- [`../data-model/er-diagram.md`](../data-model/er-diagram.md) — schema this API exposes
- [`../data-model/normalization.md`](../data-model/normalization.md) — why the schema is shaped the way it is
- [`../data-model/opportunity-state-diagram.md`](../data-model/opportunity-state-diagram.md) — formal definition of `PATCH /opportunities/:id/status` transitions
- [`../proposal.md`](../proposal.md) — what the API is ultimately for
