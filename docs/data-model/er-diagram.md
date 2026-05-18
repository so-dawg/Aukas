# ER Diagram — Opportunities Hub (Aukas)

> **Phase:** Week 2 — Design (System & UI)
> **Owner:** M1 (Backend & Database)
> **Issue:** [#5](https://github.com/so-dawg/Aukas/issues/5)
> **Source file:** [`Aukas-ER-Diagram.drawio.png`](./Aukas-ER-Diagram.drawio.png) (editable in [draw.io](https://app.diagrams.net))

---

## 1. Purpose

This document is the textual companion to the ER diagram PNG. The PNG is the visual reference; this file is the searchable, diff-able specification used during implementation (Week 3+) and the project report.

The schema supports the platform's three core capabilities:

- **Browse and search** five opportunity types (internship, job, scholarship, volunteer, competition).
- **Three roles** — student, organization, admin — with role-specific profile data and permissions.
- **Moderated posting** — organizations submit opportunities; an admin approves or rejects before they appear publicly.

---

## 2. Entities at a glance

| # | Entity | Purpose | Key cardinalities |
|---|---|---|---|
| 1 | `users` | Authentication and role assignment for every account | 1 — 0..1 with `students` or `organizations` |
| 2 | `students` | Student-specific profile fields | 1 — 1 with `users` |
| 3 | `organizations` | Organization-specific profile fields | 1 — 1 with `users` |
| 4 | `categories` | The five opportunity types (lookup table) | 1 — N with `opportunities` |
| 5 | `opportunities` | Core posting (title, description, deadline, status) | N — 1 with `organizations`, `categories`; N — N with `students` via `applications`, `bookmarks` |
| 6 | `applications` | Records that a student applied to (or clicked apply on) an opportunity | N — 1 with `students` and `opportunities` |
| 7 | `bookmarks` | A student's saved opportunities | N — 1 with `students` and `opportunities` |

---

## 3. Entity attributes

### 3.1 `users`

The authentication table. Every account is a row here; role-specific data lives in `students` or `organizations`.

| Attribute | Type | Constraints |
|---|---|---|
| `id` | uuid | PK |
| `email` | string (255) | UNIQUE, NOT NULL |
| `password_hash` | string (255) | NOT NULL |
| `full_name` | string (150) | NOT NULL |
| `role` | enum | NOT NULL — `'student'` · `'organization'` · `'admin'` |
| `created_at` | timestamp | DEFAULT NOW() |

### 3.2 `students`

| Attribute | Type | Constraints |
|---|---|---|
| `user_id` | uuid | PK, FK → `users.id`, ON DELETE CASCADE |
| `university` | string (200) | NULLABLE |
| `major` | string (150) | NULLABLE |
| `year_of_study` | int | NULLABLE — 1..6 |
| `resume_url` | string | NULLABLE |

`user_id` doubles as the primary key and the foreign key (one-to-one with `users`).

### 3.3 `organizations`

| Attribute | Type | Constraints |
|---|---|---|
| `user_id` | uuid | PK, FK → `users.id`, ON DELETE CASCADE |
| `org_name` | string (200) | NOT NULL |
| `website` | string (255) | NULLABLE |
| `description` | text | NULLABLE |
| `verified` | boolean | DEFAULT false |

`verified = true` is required before an organization can post.

### 3.4 `categories`

A fixed lookup table — exactly five rows seeded in Week 3.

| Attribute | Type | Constraints |
|---|---|---|
| `id` | uuid | PK |
| `name` | string (50) | UNIQUE, NOT NULL |
| `slug` | string (50) | UNIQUE, NOT NULL |

Seed: `Internship` · `Job` · `Scholarship` · `Volunteer` · `Competition`.

### 3.5 `opportunities`

| Attribute | Type | Constraints |
|---|---|---|
| `id` | uuid | PK |
| `organization_id` | uuid | FK → `organizations.user_id`, NOT NULL |
| `category_id` | uuid | FK → `categories.id`, NOT NULL |
| `approved_by` | uuid | FK → `users.id`, NULLABLE (admin who approved) |
| `title` | string (255) | NOT NULL |
| `description` | text | NOT NULL |
| `type` | enum | derived label — `'internship'` · `'job'` · `'scholarship'` · `'volunteer'` · `'competition'` |
| `location` | string (150) | NULLABLE |
| `deadline` | date | NULLABLE |
| `status` | enum | DEFAULT `'pending'` — `'draft'` · `'pending'` · `'approved'` · `'rejected'` · `'expired'` |
| `created_at` | timestamp | DEFAULT NOW() |
| `updated_at` | timestamp | DEFAULT NOW() |

**Note on `type` vs `category_id`** — both fields encode the same concept. `category_id` is the relational source of truth; `type` is the denormalized enum value used in API filters where joining `categories` would be wasteful. This duplication is intentional and is justified in the [normalization doc](./normalization.md#5-controlled-denormalization).

### 3.6 `applications`

| Attribute | Type | Constraints |
|---|---|---|
| `id` | uuid | PK |
| `student_id` | uuid | FK → `students.user_id`, NOT NULL |
| `opportunity_id` | uuid | FK → `opportunities.id`, NOT NULL |
| `status` | enum | DEFAULT `'clicked'` — `'clicked'` · `'in_review'` · `'accepted'` · `'rejected'` |
| `applied_at` | timestamp | DEFAULT NOW() |

In v1 this primarily records "student clicked apply" (since the actual application happens on the organization's external site). The status enum is reserved for future in-platform applications.

### 3.7 `bookmarks`

| Attribute | Type | Constraints |
|---|---|---|
| `id` | uuid | PK |
| `student_id` | uuid | FK → `students.user_id`, NOT NULL |
| `opportunity_id` | uuid | FK → `opportunities.id`, NOT NULL |
| `saved_at` | timestamp | DEFAULT NOW() |
| — | — | UNIQUE (`student_id`, `opportunity_id`) — prevents duplicate saves |

---

## 4. Relationships

Crow's-foot notation, read left-to-right as "each X relates to N Y":

```
users (1) ──── (0..1) students                  is-a (specialization)
users (1) ──── (0..1) organizations             is-a (specialization)
organizations (1) ──── (N) opportunities        posts
categories    (1) ──── (N) opportunities        classifies
users         (1) ──── (N) opportunities        approves   (via approved_by)
students      (1) ──── (N) applications         submits
opportunities (1) ──── (N) applications         receives
students      (1) ──── (N) bookmarks            saves
opportunities (1) ──── (N) bookmarks            saved in
```

### 4.1 Specialization (`users` → `students` / `organizations`)

The `users` table holds shared authentication fields; `students` and `organizations` extend it with role-specific data. A user is exactly one of:

- a `student` (1 row in `students`, 0 in `organizations`), or
- an `organization` (0 in `students`, 1 in `organizations`), or
- an `admin` (0 in either profile table — admins only need the base `users` row).

This is enforced in application code, not by the schema. The simpler alternative (one wide table with nullable role-specific columns) was rejected because it would leave most columns NULL for any given row.

### 4.2 Why `approved_by` is on `opportunities`

When an admin approves a posting, the moderating admin's `users.id` is written to `approved_by`. This gives a minimal audit trail without a separate `opportunity_status_log` table. (The Week 1 `entities.md` sketched a fuller log table; for v1 a single `approved_by` column is sufficient — see [normalization §6](./normalization.md#6-deviations-from-week-1-sketch).)

---

## 5. Crow's-foot legend

| Symbol | Meaning |
|---|---|
| `─||─` | exactly one (mandatory) |
| `─o|─` | zero or one (optional) |
| `─|<` | one or many (mandatory) |
| `─o<` | zero or many (optional) |

In the PNG, lines connecting entities use these endpoints to indicate cardinality. Solid lines = identifying relationship (the FK is part of the PK), dashed lines = non-identifying.

---

## 6. Constraints summary

**Primary keys** — every entity has a single-column UUID primary key, except `students` and `organizations` which use `user_id` (also a foreign key).

**Foreign keys**

| Child | Column | Parent | On delete |
|---|---|---|---|
| `students` | `user_id` | `users.id` | CASCADE |
| `organizations` | `user_id` | `users.id` | CASCADE |
| `opportunities` | `organization_id` | `organizations.user_id` | RESTRICT |
| `opportunities` | `category_id` | `categories.id` | RESTRICT |
| `opportunities` | `approved_by` | `users.id` | SET NULL |
| `applications` | `student_id` | `students.user_id` | CASCADE |
| `applications` | `opportunity_id` | `opportunities.id` | CASCADE |
| `bookmarks` | `student_id` | `students.user_id` | CASCADE |
| `bookmarks` | `opportunity_id` | `opportunities.id` | CASCADE |

**Uniqueness**

- `users.email` — UNIQUE
- `categories.name`, `categories.slug` — UNIQUE
- `bookmarks(student_id, opportunity_id)` — composite UNIQUE

**Check constraints (planned, Week 3 migration)**

- `users.role IN ('student', 'organization', 'admin')`
- `opportunities.status IN ('draft', 'pending', 'approved', 'rejected', 'expired')`
- `applications.status IN ('clicked', 'in_review', 'accepted', 'rejected')`
- `students.year_of_study BETWEEN 1 AND 6`

---

## 7. Indexes (planned for Week 3)

| Index | Columns | Used for |
|---|---|---|
| `idx_opportunities_browse` | `(status, category_id, deadline DESC)` | homepage list, filter sidebar |
| `idx_opportunities_org` | `(organization_id)` | organization dashboard |
| `idx_opportunities_search` | `to_tsvector(title || ' ' || description)` | full-text search (Week 4) |
| `idx_applications_student` | `(student_id, applied_at DESC)` | student profile page |
| `idx_bookmarks_student` | `(student_id, saved_at DESC)` | student saved-items list |

These indexes are added in the Week 3 schema migration, not on day one — they exist to make the Week 4 search/filter endpoints fast.

---

## 8. How to edit the diagram

1. Open [`Aukas-ER-Diagram.drawio.png`](./Aukas-ER-Diagram.drawio.png) in [draw.io](https://app.diagrams.net) (the PNG embeds the editable source).
2. Make changes, then **File → Export As → PNG** with "Include a copy of my diagram" enabled, overwriting the existing file.
3. Update this markdown to match before committing.

---

## 9. Related documents

- [`entities.md`](./entities.md) — Week 1 conceptual model (10-entity sketch; this Week 2 diagram is a refined 7-entity subset)
- [`normalization.md`](./normalization.md) — 3NF analysis and denormalization trade-offs (Issue #6)
- [`opportunity-state-diagram.md`](./opportunity-state-diagram.md) — FSM for `opportunities.status` (Issue #8)
- [`../api/rest-spec.md`](../api/rest-spec.md) — endpoints exposing this schema (Issue #7)