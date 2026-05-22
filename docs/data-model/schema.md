## Database Schema — Opportunities Hub (Aukas)

> **Phase:** Week 3 — Foundation (Database & Setup)
> **Owner:** M1 (Backend & Database)
> **Issue:** [#17](https://github.com/so-dawg/Aukas/issues/17)
> **Target engine:** PostgreSQL 15+

---

## 1. Purpose

This is the implementation-ready reference for the Aukas database. Where [`er-diagram.md`](./er-diagram.md) defines the schema conceptually (entities, cardinalities, crow's-foot notation), this document is what the Week 3 migration actually creates: PostgreSQL `CREATE TABLE` statements, foreign keys with `ON DELETE` behavior, indexes, triggers, and seed data.

If the two documents disagree, the ER diagram is the design source of truth; this file should be updated to match.

---

## 2. PostgreSQL setup

The schema relies on one built-in extension for UUID generation:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- provides gen_random_uuid()
```

All primary keys are `uuid`, generated server-side by `gen_random_uuid()`. The application never supplies an id on insert.

Timestamps use `timestamptz` (timestamp with time zone) and default to `now()`. The application sends UTC; PostgreSQL stores UTC.

---

## 3. Tables

The seven tables are listed in the order they must be created (no table is created before its parents). Run the full block as a single migration in Week 3 once issue [#9](https://github.com/so-dawg/Aukas/issues/9) provisions PostgreSQL.

### 3.1 `users`

The base authentication table. Every account is a row here.

```sql
CREATE TYPE user_role AS ENUM ('student', 'organization', 'admin');

CREATE TABLE users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         varchar(255) NOT NULL,
  password_hash varchar(255) NOT NULL,
  full_name     varchar(150) NOT NULL,
  role          user_role    NOT NULL,
  created_at    timestamptz  NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);

CREATE UNIQUE INDEX users_email_active_unique
  ON users (email)
  WHERE deleted_at IS NULL;
```

Notes:

- `email` is the natural login key — the partial unique index serves the `auth/register` duplicate check while letting a deleted user's address be reused by a future signup (see §6.4).
- `password_hash` stores a bcrypt hash (60 chars); the column is sized generously to allow future algorithm changes.
- `deleted_at` implements the soft-delete convention: `NULL` = active, timestamp = logically deleted. Every read query must include `WHERE deleted_at IS NULL`. See §6.4.
- The `user_role` enum value lists are repeated across this schema and the [REST spec §1.4](../api/rest-spec.md#14-roles-and-authorization); changing one means changing the other.

### 3.2 `students`

Student-specific profile fields. The primary key doubles as the foreign key into `users`.

```sql
CREATE TABLE students (
  user_id       uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  university    varchar(200),
  major         varchar(150),
  year_of_study smallint CHECK (year_of_study BETWEEN 1 AND 6),
  resume_url    varchar(500)
);
```

A row in `students` is created at the same time as the parent `users` row when `role = 'student'` (transaction-wrapped in the register endpoint).

### 3.3 `organizations`

Organization-specific profile fields. Same one-to-one shape as `students`.

```sql
CREATE TABLE organizations (
  user_id     uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  org_name    varchar(200) NOT NULL,
  website     varchar(255),
  description text,
  verified    boolean      NOT NULL DEFAULT false
);
```

`verified = true` is required before the organization can post — enforced by the `POST /opportunities` handler, not the schema.

### 3.4 `categories`

Fixed lookup table with exactly five rows, seeded in §7.

```sql
CREATE TABLE categories (
  id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(50) NOT NULL UNIQUE,
  slug varchar(50) NOT NULL UNIQUE
);
```

### 3.5 `opportunities`

The core posting table.

```sql
CREATE TYPE opportunity_type AS ENUM (
  'internship', 'job', 'scholarship', 'volunteer', 'competition'
);

CREATE TYPE opportunity_status AS ENUM (
  'draft', 'pending', 'approved', 'rejected', 'expired'
);

CREATE TABLE opportunities (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(user_id) ON DELETE RESTRICT,
  category_id     uuid NOT NULL REFERENCES categories(id)         ON DELETE RESTRICT,
  approved_by     uuid          REFERENCES users(id)              ON DELETE SET NULL,
  title           varchar(255)       NOT NULL,
  description     text               NOT NULL,
  type            opportunity_type   NOT NULL,
  location        varchar(150),
  deadline        date,
  status          opportunity_status NOT NULL DEFAULT 'pending',
  created_at      timestamptz        NOT NULL DEFAULT now(),
  updated_at      timestamptz        NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);
```

The pair (`category_id`, `type`) is the controlled denormalization documented in [`normalization.md` §5](./normalization.md#5-controlled-denormalization). `type` is kept in sync by the trigger in §6.1 — the application does not write to `type` directly.

`deleted_at` follows the same soft-delete convention as `users` (see §6.4). An organization "unpublishing" a posting sets `deleted_at`; the row stays in the database so existing `applications` and `bookmarks` still resolve.

### 3.6 `applications`

Records a student clicking "Apply" on an opportunity.

```sql
CREATE TYPE application_status AS ENUM (
  'clicked', 'in_review', 'accepted', 'rejected'
);

CREATE TABLE applications (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id     uuid NOT NULL REFERENCES students(user_id)      ON DELETE CASCADE,
  opportunity_id uuid NOT NULL REFERENCES opportunities(id)      ON DELETE CASCADE,
  status         application_status NOT NULL DEFAULT 'clicked',
  applied_at     timestamptz        NOT NULL DEFAULT now()
);
```

`(student_id, opportunity_id)` is intentionally **not** unique — every click is a separate row. See [`normalization.md` §3.6](./normalization.md#36-applications).

### 3.7 `bookmarks`

A student's saved opportunities.

```sql
CREATE TABLE bookmarks (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id     uuid NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  opportunity_id uuid NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  saved_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, opportunity_id)
);
```

The composite unique constraint blocks duplicate bookmarks at the database level; the `POST /bookmarks` handler turns the resulting error into a `409 CONFLICT`.

---

## 4. Foreign key catalog

| Child table | Column | Parent | On delete | Why |
|---|---|---|---|---|
| `students` | `user_id` | `users(id)` | CASCADE | Profile is meaningless without the auth row |
| `organizations` | `user_id` | `users(id)` | CASCADE | Same as above |
| `opportunities` | `organization_id` | `organizations(user_id)` | RESTRICT | Deleting an org must not silently delete its postings — admin reassigns or expires first |
| `opportunities` | `category_id` | `categories(id)` | RESTRICT | Categories are seed data; deletions should not propagate |
| `opportunities` | `approved_by` | `users(id)` | SET NULL | Admin account deletion should not erase the posting; the `approved` audit is allowed to be lost |
| `applications` | `student_id` | `students(user_id)` | CASCADE | If a student is hard-deleted, their click history goes too |
| `applications` | `opportunity_id` | `opportunities(id)` | CASCADE | Same — application history makes no sense without the posting |
| `bookmarks` | `student_id` | `students(user_id)` | CASCADE | — |
| `bookmarks` | `opportunity_id` | `opportunities(id)` | CASCADE | — |

In practice the application uses soft deletes for `users` and `opportunities` (see §6.4). The CASCADE rules above only fire on explicit hard `DELETE` statements (e.g., admin spam removal, GDPR purge) — they do not fire when a row is soft-deleted.

---

## 5. Indexes

PostgreSQL automatically creates a B-tree index for every `PRIMARY KEY` and `UNIQUE` constraint. The indexes below are the **additional** ones the migration creates to support known query patterns.

```sql
-- Homepage list & filter sidebar (Week 4)
CREATE INDEX idx_opportunities_browse
  ON opportunities (status, category_id, deadline DESC)
  WHERE deleted_at IS NULL;

-- Organization dashboard
CREATE INDEX idx_opportunities_org
  ON opportunities (organization_id);

-- Full-text search on title + description (Week 4)
CREATE INDEX idx_opportunities_search
  ON opportunities
  USING GIN (to_tsvector('simple', title || ' ' || description));

-- Student profile pages
CREATE INDEX idx_applications_student
  ON applications (student_id, applied_at DESC);

CREATE INDEX idx_bookmarks_student
  ON bookmarks (student_id, saved_at DESC);
```

Notes:

- The full-text index uses the `simple` configuration (no stemming) because postings can contain both English and Khmer; the default `english` configuration would mangle Khmer terms.
- `idx_opportunities_browse` is a covering index for the homepage query in [REST spec §5.1](../api/rest-spec.md#51-get-opportunities) — `status` first (high selectivity: most rows are `approved` but the filter is always present), then `category_id`, then `deadline` for the sort. The `WHERE deleted_at IS NULL` clause makes it a partial index — soft-deleted rows never enter the index, so the browse query skips them automatically.

---

## 6. Triggers

### 6.1 Keep `opportunities.type` in sync with `categories.slug`

The denormalization in §3.5 / [`normalization.md` §5](./normalization.md#5-controlled-denormalization) is enforced by a trigger so the application cannot insert mismatched values.

```sql
CREATE OR REPLACE FUNCTION sync_opportunity_type() RETURNS trigger AS $$
BEGIN
  SELECT slug::opportunity_type INTO NEW.type
    FROM categories WHERE id = NEW.category_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_opportunities_sync_type
  BEFORE INSERT OR UPDATE OF category_id ON opportunities
  FOR EACH ROW EXECUTE FUNCTION sync_opportunity_type();
```

This means callers do not set `type` themselves — it is derived from `category_id` at write time.

### 6.2 Maintain `opportunities.updated_at`

```sql
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_opportunities_touch_updated_at
  BEFORE UPDATE ON opportunities
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
```

### 6.3 Status transition guard (Automata tie-in)

The DFM defined in [`opportunity-state-diagram.md` §4](./opportunity-state-diagram.md#4-transition-table--δq-σ) is enforced at the API layer; a database trigger acts as the defense-in-depth check.

```sql
CREATE OR REPLACE FUNCTION guard_opportunity_status() RETURNS trigger AS $$
BEGIN
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  IF NOT (
    (OLD.status = 'draft'     AND NEW.status IN ('pending', 'draft'))                 OR
    (OLD.status = 'pending'   AND NEW.status IN ('approved', 'rejected', 'draft'))    OR
    (OLD.status = 'approved'  AND NEW.status = 'expired')                             OR
    (OLD.status = 'rejected'  AND NEW.status = 'draft')
  ) THEN
    RAISE EXCEPTION 'illegal status transition: % -> %', OLD.status, NEW.status;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_opportunities_guard_status
  BEFORE UPDATE OF status ON opportunities
  FOR EACH ROW EXECUTE FUNCTION guard_opportunity_status();
```

If the API and the trigger ever disagree about a transition, the trigger wins — the API will surface a `500 INTERNAL` instead of a `409 CONFLICT`, which is the signal that the transition table is out of sync between layers.

### 6.4 Soft-delete convention

`users` and `opportunities` carry a `deleted_at timestamptz` column:

- `NULL` → row is active.
- timestamp → row is logically deleted at that moment.

Deletion is an `UPDATE`, not a `DELETE`:

```sql
-- Soft-delete (the normal path)
UPDATE users         SET deleted_at = now() WHERE id = $1;
UPDATE opportunities SET deleted_at = now() WHERE id = $1;

-- Restore
UPDATE users SET deleted_at = NULL WHERE id = $1;

-- Hard delete (admin spam removal, GDPR purge — fires FK CASCADEs)
DELETE FROM users WHERE id = $1;
```

Every read query must filter out soft-deleted rows:

```sql
SELECT * FROM users         WHERE email = $1 AND deleted_at IS NULL;
SELECT * FROM opportunities WHERE status = 'approved' AND deleted_at IS NULL;
```

The partial unique index on `users(email) WHERE deleted_at IS NULL` (§3.1) means a deleted user's email is freed for a future signup. The partial `idx_opportunities_browse` (§5) means soft-deleted postings are physically absent from the homepage's index path.

Why two layers (app filter + partial index)?

- The app filter is the **functional** guard — it determines what users see.
- The partial index is the **performance** guard — it keeps the homepage query fast even when the deleted row count grows.

`students`, `organizations`, `applications`, and `bookmarks` do not carry `deleted_at`:

- `students` / `organizations` are 1-to-1 with `users`; checking the parent's `users.deleted_at` is sufficient.
- `applications` / `bookmarks` are cheap to recreate and would only add clutter if retained after deletion.
- `categories` is fixed seed data — never deleted.

---

## 7. Seed data

The five categories are inserted by the migration so that the `opportunities.category_id` foreign key has something to reference from day one.

```sql
INSERT INTO categories (name, slug) VALUES
  ('Internship',  'internship'),
  ('Job',         'job'),
  ('Scholarship', 'scholarship'),
  ('Volunteer',   'volunteer'),
  ('Competition', 'competition');
```

Sample opportunities and at least one admin user are loaded by a separate seed script ([#11](https://github.com/so-dawg/Aukas/issues/11)) — they are dev-only and never run against production.

---

## 8. Migration order

When the migration is written for [#10](https://github.com/so-dawg/Aukas/issues/10), apply the statements in this order. Each step depends on everything above it.

1. `CREATE EXTENSION pgcrypto`
2. Enum types: `user_role`, `opportunity_type`, `opportunity_status`, `application_status`
3. Tables: `users` → `students`, `organizations` → `categories` → `opportunities` → `applications`, `bookmarks`
4. Indexes (§5)
5. Trigger functions and triggers (§6)
6. Seed categories (§7)

Rolling back is the reverse order. Because every FK has an `ON DELETE` rule and no table self-references, `DROP TABLE ... CASCADE` on `users` would remove the whole graph — but a real migration framework should drop in strict reverse order so the rollback is reviewable.

---

## 9. Verification queries

Quick checks to run after the migration applies, before seeding sample data:

```sql
-- 1. Every expected table exists.
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
-- Expected: applications, bookmarks, categories, opportunities, organizations, students, users

-- 2. Five categories are seeded.
SELECT slug FROM categories ORDER BY slug;
-- Expected: competition, internship, job, scholarship, volunteer

-- 3. Triggers are attached to opportunities.
SELECT trigger_name FROM information_schema.triggers
WHERE event_object_table = 'opportunities' ORDER BY trigger_name;
-- Expected: trg_opportunities_guard_status, trg_opportunities_sync_type, trg_opportunities_touch_updated_at

-- 4. The status guard rejects an illegal transition.
-- (Run only against a row in 'draft' status — should raise an exception.)
-- UPDATE opportunities SET status = 'approved' WHERE id = '<draft row>';
```

---

## 10. Related documents

- [`er-diagram.md`](./er-diagram.md) — conceptual model and cardinalities
- [`normalization.md`](./normalization.md) — 3NF analysis and the `type` denormalization rationale
- [`opportunity-state-diagram.md`](./opportunity-state-diagram.md) — formal definition of the status FSM enforced in §6.3
- [`../api/rest-spec.md`](../api/rest-spec.md) — endpoints that read and write this schema