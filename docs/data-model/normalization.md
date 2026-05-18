# Database Normalization — Opportunities Hub (Aukas)

> **Phase:** Week 2 — Design (System & UI)
> **Owner:** M1 (Backend & Database)
> **Issue:** [#6](https://github.com/so-dawg/Aukas/issues/6)
> **Course tie-in:** Database Administration

---

## 1. Goal

Show that the Aukas schema is in **third normal form (3NF)** and document the small number of deliberate denormalizations. The schema being analyzed is the one in [`er-diagram.md`](./er-diagram.md): seven tables — `users`, `students`, `organizations`, `categories`, `opportunities`, `applications`, `bookmarks`.

---

## 2. Normal-form definitions (course reference)

| Form | Rule |
|---|---|
| **1NF** | All attributes hold atomic values; no repeating groups; each row is uniquely identifiable. |
| **2NF** | 1NF + every non-key attribute is fully functionally dependent on the whole primary key (eliminates partial dependencies). Only relevant when the PK is composite. |
| **3NF** | 2NF + no transitive dependencies — non-key attributes depend only on the primary key, not on other non-key attributes. |

A table can fail 3NF in two common ways:

- **Repeating groups** (e.g., `tag1`, `tag2`, `tag3` columns) violate 1NF.
- **Derived or transitively dependent columns** (e.g., storing both `birth_date` and `age`) violate 3NF.

---

## 3. Per-table analysis

For each table: list the functional dependencies (FDs), then verify each normal form.

### 3.1 `users`

```
id → email, password_hash, full_name, role, created_at
email → id   (UNIQUE constraint makes email a candidate key)
```

- **1NF** ✓ all attributes atomic, `id` is unique.
- **2NF** ✓ PK is single-column (`id`), so partial dependencies are impossible.
- **3NF** ✓ every non-key attribute depends directly on `id`. No attribute is derived from another non-key column.

### 3.2 `students`

```
user_id → university, major, year_of_study, resume_url
```

- **1NF** ✓ atomic columns.
- **2NF** ✓ single-column PK.
- **3NF** ✓ all attributes depend only on `user_id`. (`university` and `major` are not in a dependency chain — knowing the university does not determine the major.)

### 3.3 `organizations`

```
user_id → org_name, website, description, verified
```

- **1NF / 2NF / 3NF** ✓ same reasoning as `students`.

### 3.4 `categories`

```
id → name, slug
name → id      (UNIQUE)
slug → id      (UNIQUE)
```

- **1NF / 2NF / 3NF** ✓ a small, flat lookup table — by construction it has no transitive dependencies. The three candidate keys (`id`, `name`, `slug`) all uniquely identify a category; the schema picks `id` as the primary key.

### 3.5 `opportunities`

```
id → organization_id, category_id, approved_by, title, description,
     type, location, deadline, status, created_at, updated_at
category_id → type    (potential transitive dependency — see §5)
```

- **1NF** ✓ atomic columns; lists like tags would have violated 1NF, which is why a separate join table would be required if tags are added later.
- **2NF** ✓ single-column PK.
- **3NF** ⚠ The pair (`category_id`, `type`) is a controlled denormalization — `type` is functionally determined by `category_id`. See §5.

### 3.6 `applications`

```
id → student_id, opportunity_id, status, applied_at
```

- **1NF / 2NF / 3NF** ✓ `student_id` and `opportunity_id` together identify the relationship, but the table uses a surrogate `id` PK so partial-dependency questions don't arise. The natural composite `(student_id, opportunity_id)` is not unique by design — a student may re-click apply on the same opportunity, generating a new row each time.

### 3.7 `bookmarks`

```
id → student_id, opportunity_id, saved_at
(student_id, opportunity_id)   UNIQUE
```

- **1NF / 2NF / 3NF** ✓ Same shape as `applications` but with the composite uniqueness constraint, because bookmarking the same opportunity twice has no meaning.

---

## 4. Summary table

| Table | 1NF | 2NF | 3NF | Notes |
|---|---|---|---|---|
| `users` | ✓ | ✓ | ✓ | — |
| `students` | ✓ | ✓ | ✓ | — |
| `organizations` | ✓ | ✓ | ✓ | — |
| `categories` | ✓ | ✓ | ✓ | — |
| `opportunities` | ✓ | ✓ | ⚠ | `type` is denormalized from `category_id` — §5 |
| `applications` | ✓ | ✓ | ✓ | — |
| `bookmarks` | ✓ | ✓ | ✓ | — |

All tables are in 3NF except for one controlled denormalization, which is documented and justified below.

---

## 5. Controlled denormalization

### 5.1 `opportunities.type` duplicates `categories.name`

**The dependency.** Given `opportunities.category_id`, the value of `opportunities.type` is fully determined (`category_id → type`). Strictly, `type` should not exist as its own column — querying `categories` would yield the same string.

**Why it's kept.** The dominant query on the platform is the homepage list, filtered by opportunity type and sorted by deadline:

```sql
SELECT id, title, type, deadline FROM opportunities
WHERE status = 'approved' AND type = 'scholarship'
ORDER BY deadline ASC LIMIT 20;
```

With a denormalized `type` enum on `opportunities`:

- the index `(status, type, deadline)` answers the query without touching `categories`;
- the API can render category badges on result cards without a join.

With strictly normalized data, every list page would join `opportunities` against `categories` — five rows, but still a join.

**How consistency is maintained.** A check constraint and an application-level invariant keep the two in sync:

```sql
ALTER TABLE opportunities
  ADD CONSTRAINT chk_type_matches_category
  CHECK (
    type = (SELECT name_slug FROM categories WHERE id = category_id)
  );
```

The constraint as written would require a subquery, which Postgres CHECKs disallow. The practical enforcement is therefore:

1. Inserts and updates go through a single backend service that sets both columns from the same source.
2. A trigger (`BEFORE INSERT OR UPDATE`) populates `type` from `categories.slug` automatically, so callers cannot pass conflicting values.

A trigger is added to the Week 3 migration alongside the schema.

### 5.2 Future denormalizations to revisit

| Field | Source | Status |
|---|---|---|
| `opportunities.view_count` | `COUNT(*) FROM views` | Not implemented in v1 — see entities.md §3.4 sketch. If added later, it is a cached aggregate and must be incremented atomically. |
| `opportunities.application_count` | `COUNT(*) FROM applications WHERE opportunity_id = …` | Same — cache only if the live query becomes a hot path. |

Neither field exists in the Week 2 schema. They are listed here so that, if added in Week 5 or 6, the team remembers they are caches, not source-of-truth columns.

---

## 6. Deviations from the Week 1 sketch

The Week 1 `entities.md` document proposed 10 entities. The Week 2 ER diagram collapses this to 7. The differences and rationale:

| Week 1 entity | Week 2 status | Reason |
|---|---|---|
| `tag`, `opportunity_tag` | **Dropped** | Filtering by category + free-text search covers v1 use cases. Tags would add a many-to-many that is not exercised by any Week 4 feature. Can be added later without breaking changes. |
| `opportunity_status_log` | **Replaced by `opportunities.approved_by`** | Full audit history is out of scope for v1. The moderating admin's id is sufficient to answer "who approved this" — the most common admin question. |
| `student_profile`, `organization` | **Renamed `students`, `organizations`** | Plural table names match the API resource naming used in [`rest-spec.md`](../api/rest-spec.md). |
| `user.phone`, `user.avatar_url`, `user.is_verified`, `user.is_active` | **Dropped from base `users`** | None of these are required by Week 4 features. `verified` was kept but moved to `organizations` (organizations need admin verification before posting; students do not). |

These removals make the schema smaller and easier to seed for the Week 3 milestone. Each is reversible — adding a column or a new table later does not require restructuring existing data.

---

## 7. Anti-patterns explicitly avoided

| Anti-pattern | What it would look like | Why it's not in the schema |
|---|---|---|
| Repeating columns | `tag1`, `tag2`, `tag3` on `opportunities` | Violates 1NF; impossible to query and breaks once more than three tags are needed. |
| EAV (entity-attribute-value) | `opportunity_attributes(opportunity_id, key, value)` for flexible fields | Loses type safety and column-level constraints; queries become unreadable. The fixed columns on `opportunities` cover all five opportunity types. |
| Storing computed values | `opportunities.is_expired` boolean | Would require a job to keep it in sync. The `status = 'expired'` enum value plus the deadline comparison is enough — see [`opportunity-state-diagram.md`](./opportunity-state-diagram.md). |
| Wide `users` with NULLable role columns | `users.university`, `users.org_name`, `users.major`, … all NULLable | Half the columns would be NULL on any given row. Role-specific profile tables keep each row dense. |

---

## 8. Open questions for Week 3

These are the only schema decisions still pending — flagged here so they can be resolved before the migration is written:

1. **Should `applications` allow duplicate rows for the same (`student_id`, `opportunity_id`)?**
   Current answer: yes — each "click apply" is a tracking event. If v1.5 adds real submissions, this changes to UNIQUE.

2. **Cascade or restrict on `organizations` → `opportunities`?**
   Current answer: RESTRICT. Deleting an organization should not silently delete its opportunities; an admin must reassign or expire them first.

3. **Should `categories` be a table at all, given only 5 fixed rows?**
   Current answer: yes — a lookup table is easier to extend (e.g., adding `Hackathon` as a sixth type) than an enum migration.

---

## 9. Related documents

- [`er-diagram.md`](./er-diagram.md) — schema reference (Issue #5)
- [`entities.md`](./entities.md) — Week 1 conceptual sketch
- [`opportunity-state-diagram.md`](./opportunity-state-diagram.md) — status lifecycle (Issue #8)
- [`../api/rest-spec.md`](../api/rest-spec.md) — endpoints over the normalized schema (Issue #7)