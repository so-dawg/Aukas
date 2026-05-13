# Data Entities — Opportunities Hub (Aukas)

> **Project:** Opportunities Hub
> **Phase:** Week 1 — Discovery (feeds into Week 2 ER diagram)
> **Owner:** M1 (Backend & Database)
> **Last updated:** May 2026

---

## 1. Overview

This document lists all data entities (tables) required for the Opportunities Hub platform. Each entity is described with its fields, data types, constraints, and relationships to other entities. This is a **conceptual model** — it will be normalized to 3NF and turned into an ER diagram in Week 2.

The schema supports:
- **5 opportunity types** (internship, job, scholarship, volunteer, competition)
- **3 user roles** (student, organization, admin)
- **Core workflows** — browse, search, bookmark, post, moderate

---

## 2. Entity List (at a glance)

| # | Entity | Purpose |
|---|---|---|
| 1 | `user` | All accounts — students, organizations, admins |
| 2 | `organization` | Profile details for organization accounts |
| 3 | `student_profile` | Profile details for student accounts |
| 4 | `opportunity` | Core posting (job, scholarship, etc.) |
| 5 | `category` | Opportunity type (internship / job / scholarship / volunteer / competition) |
| 6 | `tag` | Free-form tags (e.g., "remote", "tech", "paid") |
| 7 | `opportunity_tag` | Many-to-many between opportunity and tag |
| 8 | `bookmark` | Saved opportunities per student |
| 9 | `application` | Student application records *(v1: external link tracking)* |
| 10 | `opportunity_status_log` | Audit trail for status changes (draft → pending → approved → expired) |

---

## 3. Entity Details

### 3.1 `user`

The base authentication table. Every account is a `user`, regardless of role.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID / SERIAL | PK | Primary key |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Login credential |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt hash |
| `role` | ENUM | NOT NULL | `'student'` · `'organization'` · `'admin'` |
| `full_name` | VARCHAR(150) | NOT NULL | Display name |
| `phone` | VARCHAR(20) | NULLABLE | Optional contact |
| `avatar_url` | TEXT | NULLABLE | Profile picture URL |
| `is_verified` | BOOLEAN | DEFAULT false | Email verification |
| `is_active` | BOOLEAN | DEFAULT true | Soft-delete flag |
| `created_at` | TIMESTAMP | DEFAULT NOW() | |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | |

**Relationships**
- One-to-one with `student_profile` (if role = student)
- One-to-one with `organization` (if role = organization)
- One-to-many with `opportunity` (organizations post)
- One-to-many with `bookmark`, `application` (students)

---

### 3.2 `organization`

Extended profile for organization accounts.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID / SERIAL | PK | |
| `user_id` | UUID / FK | UNIQUE, FK → user.id | One-to-one with user |
| `org_name` | VARCHAR(200) | NOT NULL | Display name (NGO, company, university) |
| `org_type` | ENUM | NOT NULL | `'company'` · `'ngo'` · `'university'` · `'government'` · `'other'` |
| `description` | TEXT | NULLABLE | About the organization |
| `website` | VARCHAR(255) | NULLABLE | |
| `logo_url` | TEXT | NULLABLE | |
| `location` | VARCHAR(150) | NULLABLE | e.g., "Phnom Penh, Cambodia" |
| `is_approved` | BOOLEAN | DEFAULT false | Admin must approve org before posting |
| `created_at` | TIMESTAMP | DEFAULT NOW() | |

---

### 3.3 `student_profile`

Extended profile for student accounts. Optional fields — students can browse without filling these.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID / SERIAL | PK | |
| `user_id` | UUID / FK | UNIQUE, FK → user.id | |
| `university` | VARCHAR(200) | NULLABLE | e.g., "RUPP", "ITC" |
| `field_of_study` | VARCHAR(150) | NULLABLE | e.g., "Computer Science" |
| `year_of_study` | INTEGER | NULLABLE | 1, 2, 3, 4 |
| `bio` | TEXT | NULLABLE | Short personal description |
| `cv_url` | TEXT | NULLABLE | Uploaded CV link |
| `created_at` | TIMESTAMP | DEFAULT NOW() | |

---

### 3.4 `opportunity` *(core table)*

The main listing — a job, internship, scholarship, volunteer role, or competition.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID / SERIAL | PK | |
| `organization_id` | UUID / FK | FK → organization.id | Who posted it |
| `category_id` | INTEGER / FK | FK → category.id | Type (intern / job / scholarship / volunteer / comp) |
| `title` | VARCHAR(255) | NOT NULL | |
| `description` | TEXT | NOT NULL | Full posting body |
| `requirements` | TEXT | NULLABLE | Eligibility / criteria |
| `location` | VARCHAR(150) | NULLABLE | "Phnom Penh", "Remote", "Hybrid" |
| `is_remote` | BOOLEAN | DEFAULT false | Quick filter flag |
| `salary_or_award` | VARCHAR(150) | NULLABLE | "$500/month", "Full tuition", "Unpaid" |
| `deadline` | TIMESTAMP | NULLABLE | Application deadline |
| `start_date` | DATE | NULLABLE | When opportunity begins |
| `external_url` | TEXT | NULLABLE | Apply link (for v1 — external) |
| `contact_email` | VARCHAR(255) | NULLABLE | Optional |
| `status` | ENUM | DEFAULT `'pending'` | `'draft'` · `'pending'` · `'approved'` · `'rejected'` · `'expired'` |
| `view_count` | INTEGER | DEFAULT 0 | Analytics |
| `created_at` | TIMESTAMP | DEFAULT NOW() | |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | |

**Indexes** *(for Week 2 planning)*
- `(category_id, status)` — main browse query
- `(deadline)` — sort by deadline
- `(organization_id)` — org dashboard
- Full-text index on `title` + `description` — search

---

### 3.5 `category`

Lookup table for opportunity types. Small — only 5 rows.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | INTEGER | PK | |
| `name` | VARCHAR(50) | UNIQUE, NOT NULL | `'internship'`, `'job'`, `'scholarship'`, `'volunteer'`, `'competition'` |
| `slug` | VARCHAR(50) | UNIQUE, NOT NULL | URL-safe version |
| `icon` | VARCHAR(50) | NULLABLE | Icon name for frontend |
| `description` | TEXT | NULLABLE | Display copy |

**Seed data (Week 3)**
```
1, 'Internship',   'internship',   'briefcase',    '...'
2, 'Job',          'job',          'building',     '...'
3, 'Scholarship',  'scholarship',  'school',       '...'
4, 'Volunteer',    'volunteer',    'heart',        '...'
5, 'Competition',  'competition',  'trophy',       '...'
```

---

### 3.6 `tag`

Free-form labels for finer filtering (e.g., `tech`, `paid`, `remote`, `english`, `khmer`).

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | INTEGER / SERIAL | PK | |
| `name` | VARCHAR(50) | UNIQUE, NOT NULL | |
| `slug` | VARCHAR(50) | UNIQUE, NOT NULL | |

---

### 3.7 `opportunity_tag` *(join table)*

Many-to-many — each opportunity can have multiple tags, each tag can apply to many opportunities.

| Field | Type | Constraints |
|---|---|---|
| `opportunity_id` | UUID / FK | FK → opportunity.id, ON DELETE CASCADE |
| `tag_id` | INTEGER / FK | FK → tag.id, ON DELETE CASCADE |
| | | PK = (opportunity_id, tag_id) |

---

### 3.8 `bookmark`

A student saves an opportunity to revisit later.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID / SERIAL | PK | |
| `user_id` | UUID / FK | FK → user.id, ON DELETE CASCADE | Student |
| `opportunity_id` | UUID / FK | FK → opportunity.id, ON DELETE CASCADE | |
| `created_at` | TIMESTAMP | DEFAULT NOW() | |
| | | UNIQUE (user_id, opportunity_id) | Prevent duplicate saves |

---

### 3.9 `application`

Tracks when a student clicks "Apply" — for v1 this records the click and the external URL they went to. Future versions could store full applications in-platform.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID / SERIAL | PK | |
| `user_id` | UUID / FK | FK → user.id | Student |
| `opportunity_id` | UUID / FK | FK → opportunity.id | |
| `applied_at` | TIMESTAMP | DEFAULT NOW() | |
| `status` | ENUM | DEFAULT `'clicked'` | `'clicked'` · `'in_review'` · `'accepted'` · `'rejected'` *(future)* |
| `notes` | TEXT | NULLABLE | Student's private notes |

---

### 3.10 `opportunity_status_log`

Audit trail for status changes. Useful for admin moderation history and for the **state diagram** in Week 2 (Automata course requirement).

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID / SERIAL | PK | |
| `opportunity_id` | UUID / FK | FK → opportunity.id | |
| `changed_by` | UUID / FK | FK → user.id | Who made the change (usually admin) |
| `from_status` | ENUM | NULLABLE | Previous status |
| `to_status` | ENUM | NOT NULL | New status |
| `reason` | TEXT | NULLABLE | e.g., rejection reason |
| `changed_at` | TIMESTAMP | DEFAULT NOW() | |

---

## 4. Relationships Summary

```
user (1) ─────── (1) student_profile
user (1) ─────── (1) organization
organization (1) ── (many) opportunity
opportunity (many) ── (1) category
opportunity (many) ── (many) tag       [via opportunity_tag]
user (1) ─────── (many) bookmark ───── (many) opportunity
user (1) ─────── (many) application ── (many) opportunity
opportunity (1) ─── (many) opportunity_status_log
```

---

## 5. Opportunity Status State Machine

The `opportunity.status` field follows a state machine — directly relevant to the **Automata** course component in Week 2.

```
       ┌─────────┐  submit   ┌─────────┐  approve  ┌──────────┐  deadline  ┌─────────┐
       │  draft  │ ────────► │ pending │ ────────► │ approved │ ─────────► │ expired │
       └─────────┘           └─────────┘           └──────────┘            └─────────┘
                                  │
                                  │ reject
                                  ▼
                             ┌──────────┐
                             │ rejected │
                             └──────────┘
```

**State transition rules**
- `draft` → `pending`: organization submits for review
- `pending` → `approved`: admin approves
- `pending` → `rejected`: admin rejects (with reason)
- `approved` → `expired`: deadline passes (automatic via cron job)
- `rejected` → `draft`: organization edits and resubmits *(optional)*

This is the "deadline state automation" referenced in Week 5.

---

## 6. Decisions to Confirm (Week 2)

These design decisions are flagged for discussion before locking the ER diagram:

1. **UUID vs SERIAL ids?** — UUID is safer for public APIs; SERIAL is simpler. Recommend **UUID**.
2. **Soft delete vs hard delete?** — `is_active` flag on users for soft-delete. For opportunities, prefer `status = 'expired'`.
3. **Single `user` table or split by role?** — Single table with `role` field is simpler. Profile tables (`student_profile`, `organization`) hold role-specific data.
4. **Should `application` exist in v1?** — Yes, even if it only tracks "clicked apply" → matters for usage analytics and the demo story.
5. **Categories: lookup table vs enum?** — Lookup table chosen — more flexible for icons / descriptions, easier to manage from admin UI later.

---

## 7. Implications for Week 2 & 3

- **Week 2 (Design)** — turn this into a formal **ER diagram**, normalize to 3NF, draft **API endpoints** for each entity (CRUD + special routes like `/auth/login`, `/opportunities/search`).
- **Week 3 (Foundation)** — implement schema in PostgreSQL with migrations, set up foreign keys + indexes, seed `category` table + 10+ sample opportunities.
- **Automata link** — the `opportunity_status_log` table and status state machine satisfy the state-diagram requirement.

---

*Maintained as part of the Aukas repo. Updates needed if new entities are added (e.g. notifications, comments, ratings) in later weeks.*
