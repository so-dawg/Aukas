# Usability Pre-Test Plan — Aukas Mockups

> **Phase:** Week 3 — Foundation (Database & Setup)
> **Owner:** M3 (HCI / Research)
> **Issue:** [#19](https://github.com/so-dawg/Aukas/issues/19)
> **Status:** Plan only — actual testing happens before Week 4 implementation begins.

---

## 1. Purpose

Before any frontend code is written in Week 4, run a small round of informal usability checks on the existing mockup ([`docs/design/Aukas Web Offline.html`](../design/Aukas%20Web%20Offline.html)) with real Cambodian students. The goal is to catch broken assumptions about navigation, labels, and the browse → detail flow while changes are still cheap (HTML mockup, no real backend wired up yet).

This is a **pre-test**, not the formal usability evaluation. The full evaluation runs in Week 6 against the live app (issue [#46](https://github.com/so-dawg/Aukas/issues/46)).

---

## 2. What we want to learn

The pre-test answers four questions:

1. **Can a student find an opportunity they care about?** (browse + filter + search)
2. **Is the opportunity detail page understandable?** (deadline, eligibility, apply CTA)
3. **Are the five category labels — Internship, Job, Scholarship, Volunteer, Competition — clear in both English and Khmer context?**
4. **What is missing or confusing on first contact?** (open observation)

Anything outside these four questions is captured as a side note but is not the focus.

---

## 3. Participants

| Criterion | Target |
|---|---|
| Number of participants | 3–5 |
| Profile | University students in Cambodia (RUPP, ITC, Paragon, AUPP, or similar) |
| Year | At least one Year 1 or 2 and one Year 3 or 4 |
| Field | At least one non-CS major (humanities, business, or similar) — to catch jargon |
| Language | Khmer or English speakers — both are in the target audience |
| Tech | Has used a laptop and a job board (LinkedIn, BongThom, KhmerOnlineJobs) at least once |

Recruit from immediate networks (classmates, dorm-mates, faculty contacts). No compensation; the session is short and informal.

---

## 4. Logistics

| Item | Detail |
|---|---|
| Duration | 20–25 minutes per session |
| Location | Quiet area on campus or video call (Zoom/Meet) — laptop required |
| Setup | Open the mockup in Chrome/Firefox at 1366×768 or larger |
| Recording | With explicit consent — record only the screen, not the participant's face. Save to a private drive; delete after Week 6 report |
| Moderator | One team member runs the session; a second takes notes (rotate roles) |

If a session is remote, share the mockup via screen share rather than sending the HTML file (avoids version drift).

---

## 5. Consent script (read aloud)

> "Thanks for helping us out. We're building a website that helps Cambodian students find opportunities — internships, jobs, scholarships, volunteer work, and competitions. We want to see if the design makes sense before we build the real thing.
>
> This is a test of the design, not a test of you. There are no right or wrong answers. If something is confusing, that's useful for us. Please think out loud — tell us what you're looking at and what you're trying to do.
>
> The session takes about 20 minutes. We'll record the screen so we can review later; we won't record your face. You can stop at any time. Is that OK?"

Wait for verbal yes before continuing.

---

## 6. Tasks

Read each task aloud; do not point at the screen. Let the participant find their own path. If they get stuck for more than ~60 seconds, note where, then nudge.

### Task 1 — Browse (3 min)
> "You're looking for a part-time job in Phnom Penh. Find one that interests you."

**Watching for:** how they choose between category buttons vs. the search bar, whether they notice the filter sidebar, whether `Job` as a category label reads as "any job" or "full-time job".

### Task 2 — Detail (3 min)
> "Open the one you picked. Tell me everything you can see about this opportunity."

**Watching for:** do they find the deadline, the organization name, the location, the "apply" CTA? Is anything visually buried?

### Task 3 — Filter and re-search (4 min)
> "Now imagine you only want opportunities that are remote. Find one."

**Watching for:** do they look for a remote toggle? Use the search box? Re-read the category list?
*Note for the team:* the mockup may not have a remote filter yet — that finding is itself the result.

### Task 4 — Category clarity (3 min)
Point at the five category cards on the homepage one at a time:
> "In your own words, what kind of opportunity would I find under [Internship / Job / Scholarship / Volunteer / Competition]?"

**Watching for:** mismatches between the label and the participant's expectation, especially `Volunteer` (paid/unpaid?) and `Competition` (hackathon? sports? business pitch?).

### Task 5 — Sign up flow (3 min)
> "Imagine you want to save this opportunity for later. What would you do?"

**Watching for:** do they look for a bookmark icon? Do they expect to log in first? Do they understand the difference between *Student* and *Organization* sign-up?

### Task 6 — Open feedback (3 min)
> "Anything that confused you, that you'd want to change, or that's missing?"

Let them talk. Do not defend the design.

---

## 7. Post-test questions

Five short questions. Record answers in the findings template.

1. On a scale of 1–5, how easy was it to find an opportunity you cared about?
2. On a scale of 1–5, how clearly did the opportunity detail page show what you needed to know?
3. Was anything in English that you'd prefer in Khmer (or vice versa)?
4. Would you use this site if it were live tomorrow? Why or why not?
5. Anything else?

---

## 8. What to record per session

For each participant, capture:

- Participant id (P1, P2, …) — never the real name
- Year of study, field, university
- Time taken on each task
- Where they hesitated (>10s pause) and where they got stuck (>60s)
- Direct quotes that show a misunderstanding ("Oh, I thought *Volunteer* meant…")
- The 1–5 ratings from §7
- One sentence: "Top thing this participant tripped on"

Use the template at [`usability-pretest-findings-template.md`](./usability-pretest-findings-template.md). One row per participant; do not edit older rows after a new session is run — keep raw observations separate from analysis.

---

## 9. After the sessions

Within two days of the last session, the moderator team consolidates findings into a short report at `docs/research/usability-pretest-findings.md` (one file, not per-session). The report has three sections:

1. **What broke** — issues at least 2 of the 5 participants hit. These are the must-fix items before Week 4 implementation.
2. **What surprised us** — single-participant findings that are still worth thinking about.
3. **What worked** — flows where no one got stuck. Worth keeping as-is.

Each "what broke" item should be filed as a new GitHub issue tagged `usability` and linked back to this document, so the Week 4 implementation work has concrete tickets to absorb the feedback.

---

## 10. Out of scope

These are explicitly **not** part of the pre-test — they belong to the Week 6 formal usability evaluation:

- System Usability Scale (SUS) questionnaire
- Task success / failure scoring with strict pass criteria
- A/B comparison between design variants
- Accessibility audit (color contrast, keyboard nav) — issue [#49](https://github.com/so-dawg/Aukas/issues/49)
- Mobile responsiveness check — issue [#38](https://github.com/so-dawg/Aukas/issues/38)

Trying to do all of that with 3 participants on a static mockup would produce noisy results. The pre-test stays small on purpose.

---

## 11. Related documents

- [`usability-pretest-findings-template.md`](./usability-pretest-findings-template.md) — per-participant capture form
- [`competitor-analysis.md`](./competitor-analysis.md) — the platforms participants will compare us to in their answers
- [`../design/Aukas Web Offline.html`](../design/Aukas%20Web%20Offline.html) — the mockup under test
- [`../proposal.md`](../proposal.md) — what the platform is for
