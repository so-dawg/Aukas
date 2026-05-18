# Opportunity Status — State Diagram (FSM)

> **Phase:** Week 2 — Design (System & UI)
> **Owner:** M1 (Backend & Database)
> **Issue:** [#8](https://github.com/so-dawg/Aukas/issues/8)
> **Course tie-in:** Automata (formal model: deterministic finite-state machine)

---

## 1. What this models

The `opportunities.status` column has five allowed values: `draft`, `pending`, `approved`, `rejected`, `expired`. Not every value can transition to every other value — for example, a rejected posting cannot jump straight to `approved`, and an `expired` posting cannot be revived. This document defines the legal transitions as a deterministic finite-state machine (DFM), which is the formal model required by the Automata course component.

The state machine is enforced in two places:

- the **API layer** (Express middleware on `PATCH /opportunities/:id/status`),
- a **database trigger** (`BEFORE UPDATE OF status ON opportunities`) as a defense-in-depth check.

If the two ever disagree, the trigger wins.

---

## 2. Formal definition

The opportunity lifecycle is the DFM `M = (Q, Σ, δ, q₀, F)`:

| Symbol | Meaning | Value |
|---|---|---|
| `Q` | finite set of states | `{ draft, pending, approved, rejected, expired }` |
| `Σ` | finite input alphabet (events that can trigger a transition) | `{ submit, approve, reject, edit, deadline_passed }` |
| `δ` | transition function `Q × Σ → Q` | see table in §4 |
| `q₀` | start state (when a new row is inserted) | `draft` |
| `F` | accepting / terminal states | `{ expired }` — see §5 |

`δ` is **partial**: not every (state, event) pair is defined. Calling an undefined transition is an error, surfaced as `409 Conflict` from the API.

---

## 3. Diagram

```
                                          ┌────────────────────┐
                                          │ deadline_passed    │
                                          ▼                    │
       ┌─────────┐  submit   ┌─────────┐  approve   ┌──────────┴┐
 ────► │  draft  │ ────────► │ pending │ ─────────► │ approved  │ ──────► (expired)
       └────┬────┘           └────┬────┘            └───────────┘
            ▲                     │
            │ edit                │ reject
            │                     ▼
            │              ┌──────────┐
            └──────────────│ rejected │
                           └──────────┘

(start) ── q₀ ──► draft
expired = terminal state (no outgoing transitions in v1)
```

A new row is inserted in state `draft`. From there, the diagram shows every reachable state and every legal event.

---

## 4. Transition table — `δ(q, σ)`

The complete transition function, written as a table. Empty cells = undefined (illegal) transitions.

| from \ event | `submit` | `approve` | `reject` | `edit` | `deadline_passed` |
|---|---|---|---|---|---|
| `draft` | `pending` | — | — | `draft` | — |
| `pending` | — | `approved` | `rejected` | `draft` | — |
| `approved` | — | — | — | — | `expired` |
| `rejected` | — | — | — | `draft` | — |
| `expired` | — | — | — | — | — |

**Reading the table**

- `δ(draft, submit) = pending` — an organization submits a draft for review.
- `δ(pending, approve) = approved` — an admin approves a pending posting.
- `δ(pending, reject) = rejected` — an admin rejects with a reason.
- `δ(approved, deadline_passed) = expired` — the nightly cron job sets `status = 'expired'` once `deadline < NOW()`.
- `δ(rejected, edit) = draft` — the organization edits and can resubmit.
- `δ(draft, edit) = draft` — editing a draft keeps it in draft (self-loop).

---

## 5. Terminal states

`expired` is the only terminal (accepting) state in v1. Once expired, an opportunity is archived and read-only — it remains visible in admin reports and student bookmarks but cannot be re-opened. If a future feature ("re-list expired posting") is added, an `expired → draft` transition would be introduced, making the FSM cyclic and removing the terminal property; that decision is out of scope for Week 2.

`rejected` is **not** terminal: an organization can edit a rejected posting and put it back into `draft`, at which point it can be re-submitted. This is intentional — rejection should be recoverable.

---

## 6. Event-to-action mapping

Each event in `Σ` corresponds to a concrete API call or system action. The "Actor" column identifies who is allowed to fire the event.

| Event | Actor | API entry point | Side effect |
|---|---|---|---|
| `submit` | organization (owner) | `PATCH /opportunities/:id/status { status: 'pending' }` | Notify admins (Week 5). |
| `approve` | admin | `PATCH /opportunities/:id/status { status: 'approved' }` | Set `approved_by = admin.id`; opportunity becomes public. |
| `reject` | admin | `PATCH /opportunities/:id/status { status: 'rejected', reason }` | Notify the posting organization (Week 5). |
| `edit` | organization (owner) | `PATCH /opportunities/:id` (any non-status field) | Status falls back to `draft` if it was `pending` or `rejected`. |
| `deadline_passed` | system | nightly cron (`scripts/expire-opportunities.js`, Week 5) | Updates rows where `status = 'approved' AND deadline < NOW()`. |

---

## 7. Guard conditions and invariants

In addition to the (state, event) → state mapping, three invariants must hold at all times:

1. **Authorisation invariant** — only the listed actor for an event may fire it. An organization cannot self-approve; an admin cannot edit a draft they do not own.
2. **Approval invariant** — `approved_by IS NOT NULL ⇔ status IN ('approved', 'expired')`. Once approved, the approving admin's id is recorded and is not cleared even after expiry.
3. **Deadline invariant** — `status = 'expired' ⇒ deadline < NOW()`. If `deadline` is moved into the future, the row must be re-approved (transition `expired → ?` is undefined; in practice the row stays expired and a new posting is created).

The first two invariants are enforced at the API layer; the third is enforced by the cron job (which only sets `expired` when the predicate holds).

---

## 8. Reachability and dead states

From `q₀ = draft`, every state in `Q` is reachable:

```
draft  →[submit]→  pending  →[approve]→  approved  →[deadline_passed]→  expired
                       │
                       └─[reject]→  rejected  →[edit]→  draft  (cycle back)
```

There are no unreachable states and no dead states (states with no path to a terminal state) other than the cycle `{draft, pending, rejected}`, which is intentional — a posting can loop indefinitely between drafts and rejections until it is either approved or abandoned.

---

## 9. Equivalence to a regular language (Automata note)

Because the lifecycle is a DFM, the set of legal event sequences that lead an opportunity from `draft` to `expired` is a regular language. A representative regular expression for the "happy path" is:

```
submit · (reject · edit · submit)* · approve · deadline_passed
```

That is: submit; optionally bounce through reject/edit/submit any number of times; eventually get approved; eventually expire. This formalisation is what satisfies the Automata course's "state diagram + corresponding regular language" requirement.

---

## 10. Implementation notes (forward reference)

- **Schema:** the `opportunities.status` enum is the state variable; the `approved_by` column records the admin from the `approve` transition. See [`er-diagram.md` §3.5](./er-diagram.md#35-opportunities).
- **Trigger:** Week 3 migration adds `tg_opportunities_status_guard` — a `BEFORE UPDATE OF status` trigger that raises an exception if the (old_status, new_status) pair is not in the transition table.
- **Cron:** `deadline_passed` is fired by `scripts/expire-opportunities.js` — scheduled as a Week 5 deliverable (issue #34, "Deadline state automation").
- **Tests:** every defined cell in §4 needs a passing integration test; every empty cell needs a test asserting `409 Conflict`. Tests live in `backend/tests/status.test.js` (Week 4).

---

## 11. Related documents

- [`er-diagram.md`](./er-diagram.md) — the schema this status field lives on
- [`normalization.md`](./normalization.md) — why `status` is an enum and not a derived column
- [`../api/rest-spec.md`](../api/rest-spec.md) §`PATCH /opportunities/:id/status` — API surface for transitions