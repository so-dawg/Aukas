-- Aukas — Opportunities Hub
-- PostgreSQL 15+ schema migration
-- Spec: docs/data-model/schema.md
--
-- Apply against an empty database:
--   psql "$DATABASE_URL" -f db/schema.sql
--
-- Soft-delete convention
--   users and opportunities have a `deleted_at timestamptz` column.
--     NULL      -> row is active
--     timestamp -> row is logically deleted at that moment
--   Application queries must filter `WHERE deleted_at IS NULL` to hide
--   deleted rows. CASCADE rules on FKs only fire on a true `DELETE` (admin
--   purge, GDPR removal) -- normal user/org deletion is an UPDATE.

BEGIN;

-- =============================================================================
-- 1. Extensions
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- gen_random_uuid()

-- =============================================================================
-- 2. Enum types
-- =============================================================================

CREATE TYPE user_role AS ENUM ('student', 'organization', 'admin');

CREATE TYPE opportunity_type AS ENUM (
  'internship', 'job', 'scholarship', 'volunteer', 'competition'
);

CREATE TYPE opportunity_status AS ENUM (
  'draft', 'pending', 'approved', 'rejected', 'expired'
);

CREATE TYPE application_status AS ENUM (
  'clicked', 'in_review', 'accepted', 'rejected'
);

-- =============================================================================
-- 3. Tables (parents before children)
-- =============================================================================

CREATE TABLE users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         varchar(255) NOT NULL,
  password_hash varchar(255) NOT NULL,
  full_name     varchar(150) NOT NULL,
  role          user_role    NOT NULL,
  created_at    timestamptz  NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);

-- Email is unique only among active users, so a deleted account does
-- not block a new signup with the same address.
CREATE UNIQUE INDEX users_email_active_unique
  ON users (email)
  WHERE deleted_at IS NULL;

CREATE TABLE students (
  user_id       uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  university    varchar(200),
  major         varchar(150),
  year_of_study smallint CHECK (year_of_study BETWEEN 1 AND 6),
  resume_url    varchar(500)
);

CREATE TABLE organizations (
  user_id     uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  org_name    varchar(200) NOT NULL,
  website     varchar(255),
  description text,
  verified    boolean      NOT NULL DEFAULT false
);

CREATE TABLE categories (
  id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(50) NOT NULL UNIQUE,
  slug varchar(50) NOT NULL UNIQUE
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

CREATE TABLE applications (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id     uuid NOT NULL REFERENCES students(user_id)      ON DELETE CASCADE,
  opportunity_id uuid NOT NULL REFERENCES opportunities(id)      ON DELETE CASCADE,
  status         application_status NOT NULL DEFAULT 'clicked',
  applied_at     timestamptz        NOT NULL DEFAULT now()
);

CREATE TABLE bookmarks (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id     uuid NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  opportunity_id uuid NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  saved_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, opportunity_id)
);

-- =============================================================================
-- 4. Indexes
-- =============================================================================

CREATE INDEX idx_opportunities_browse
  ON opportunities (status, category_id, deadline DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_opportunities_org
  ON opportunities (organization_id);

CREATE INDEX idx_opportunities_search
  ON opportunities
  USING GIN (to_tsvector('simple', title || ' ' || description));

CREATE INDEX idx_applications_student
  ON applications (student_id, applied_at DESC);

CREATE INDEX idx_bookmarks_student
  ON bookmarks (student_id, saved_at DESC);

-- =============================================================================
-- 5. Triggers
-- =============================================================================

-- 5.1 Keep opportunities.type in sync with categories.slug
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

-- 5.2 Maintain opportunities.updated_at
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_opportunities_touch_updated_at
  BEFORE UPDATE ON opportunities
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- 5.3 Guard opportunity status transitions (DFM in opportunity-state-diagram.md)
CREATE OR REPLACE FUNCTION guard_opportunity_status() RETURNS trigger AS $$
BEGIN
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  IF NOT (
    (OLD.status = 'draft'    AND NEW.status IN ('pending', 'draft'))              OR
    (OLD.status = 'pending'  AND NEW.status IN ('approved', 'rejected', 'draft')) OR
    (OLD.status = 'approved' AND NEW.status = 'expired')                          OR
    (OLD.status = 'rejected' AND NEW.status = 'draft')
  ) THEN
    RAISE EXCEPTION 'illegal status transition: % -> %', OLD.status, NEW.status;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_opportunities_guard_status
  BEFORE UPDATE OF status ON opportunities
  FOR EACH ROW EXECUTE FUNCTION guard_opportunity_status();

-- =============================================================================
-- 6. Seed data
-- =============================================================================

INSERT INTO categories (name, slug) VALUES
  ('Internship',  'internship'),
  ('Job',         'job'),
  ('Scholarship', 'scholarship'),
  ('Volunteer',   'volunteer'),
  ('Competition', 'competition');

COMMIT;
