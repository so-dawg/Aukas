# Competitor Analysis — Opportunities Hub (Aukas)

> **Project:** Opportunities Hub
> **Phase:** Week 1 — Discovery (Research & Planning)
> **Owner:** M1 (Backend & Database) — research input for M3 (Docs)
> **Last updated:** May 2026

---

## 1. Executive summary

Cambodia has a competitive job-board market, but **no existing platform consolidates all five opportunity types** that Cambodian students care about: internships, jobs, scholarships, volunteer work, and competitions.

A typical student today must check at least 4 different websites, multiple Facebook pages, and several Telegram groups to find opportunities. **Opportunities Hub** addresses this gap with a single Cambodia-first platform built around a 3-role system (Student / Organization / Admin).

---

## 2. Current landscape — by opportunity type

| Opportunity type | Coverage | Where students look today |
|---|---|---|
| **Jobs** | ✅ Well covered | CamHR, BongThom, Khmer24, Pelprek, Talent4U, TopJobCambodia, 9cv9, LinkedIn Cambodia |
| **Internships** | ⚠️ Scattered | University career offices, UNDP, UNICEF, OHCHR, individual company career pages |
| **Scholarships** | ⚠️ No local platform | Global aggregators (Scholars4Dev, ScholarshipSet, WeduShare) — Cambodia-eligible listings buried in noise |
| **Volunteer work** | ❌ Almost nothing | NGO Facebook pages, word of mouth |
| **Competitions** | ❌ Completely fragmented | Facebook event pages, Telegram groups |

---

## 3. Top competitors — deep dive

### 3.1 CamHR — `camhr.com`

One of Cambodia's largest job platforms. Multilingual support (Khmer, Chinese, English). Strong in banking, IT, hospitality, and sales sectors.

**Strengths**
- Large listing volume across diverse industries
- Multilingual interface (Khmer + Chinese + English)
- Sector-specific filters and CV-building tools
- Daily updated listings

**Gaps for our use case**
- Jobs only — no internship category
- No scholarships, volunteer work, or competitions
- Not designed for students specifically
- No application tracking for students

---

### 3.2 BongThom — `bongthom.com`

One of the oldest and most trusted job portals in Cambodia. Heavily used by NGOs, international organizations, and the development sector. Verified employers, paid postings ensure quality.

**Strengths**
- Strong NGO and development-sector presence
- Trusted brand name in Cambodia
- High-quality, verified job listings
- Good for professional roles

**Gaps for our use case**
- Mostly professional / mid-senior roles
- Weak student-targeted features
- Dated UI/UX
- No scholarships, volunteer, or competition categories
- Posting fees may deter small organizations

---

### 3.3 Khmer24 — `khmer24.com`

Classified-style platform with a busy job section. Originally a marketplace, not built for careers. Strong mobile use, very popular for entry-level retail and part-time work.

**Strengths**
- Huge user base across Cambodia
- Mobile-first design
- Affordable / free for SMEs to post
- Khmer-language content

**Gaps for our use case**
- Classified format, not career-focused
- No application tracking or candidate profiles
- No internship, scholarship, volunteer, or competition categories
- Low listing quality control

---

### 3.4 LinkedIn (Cambodia) — `kh.linkedin.com`

Global professional network. Limited Cambodia-specific inventory (around 23 intern jobs listed in Cambodia at a recent check). Strong for networking, weak on local volume.

**Strengths**
- Professional networking platform
- Profile-driven (CV, endorsements, connections)
- Global reach for students seeking international roles

**Gaps for our use case**
- Very few Cambodia-specific listings
- English-only interface
- No scholarships, volunteer work, or competitions
- Premium features paywalled
- Not optimized for entry-level Cambodian students

---

### 3.5 Pelprek — `pelprek.com`

Cambodian recruitment portal with a freelance section. Covers entry-level to senior roles and supports remote/freelance arrangements.

**Strengths**
- Dedicated freelance section
- All seniority levels covered
- Cambodia-focused

**Gaps for our use case**
- Pure jobs board format
- Internships not separated from jobs
- No scholarships, volunteer, or competition categories
- Limited student-friendly features

---

### 3.6 Talent4U, TopJobCambodia, 9cv9, CamUp Job, HRINC Jobs

Other notable Cambodian job platforms. Each adds incremental features — Talent4U focuses on matching algorithms and personalized alerts; TopJobCambodia targets fresh graduates with CV tips; 9cv9 offers AI-powered recruitment tools and verified employers.

**Common gaps across all of them**
- Jobs-only or jobs + freelance
- No multi-category opportunity discovery
- Limited integration with the scholarship, NGO, or competition ecosystem

---

### 3.7 Global scholarship aggregators — Scholars4Dev, ScholarshipSet, WeduShare

International scholarship platforms with Cambodia-eligible listings (Chevening, Fulbright, ASEAN scholarships, Erasmus Mundus, etc).

**Strengths**
- Large global databases
- Deadlines and eligibility clearly listed
- Coverage of major international scholarships

**Gaps for our use case**
- Not built for Cambodians — Cambodia-eligible items buried in global lists
- English-only
- No local scholarships (RUPP, ITC, ministry-funded, NGO scholarships)
- No connection to other opportunity types

---

## 4. The market gap

> **No existing platform covers all five opportunity types — internships, jobs, scholarships, volunteer work, and competitions — for Cambodian students in one place.**

A Cambodian student looking for an internship, scholarship, and hackathon today must check at least 4 different websites, several Facebook pages, and a few Telegram groups. Information is fragmented, often outdated, and largely English-only.

**Opportunities Hub solves this** with one unified, Cambodia-first platform.

---

## 5. Our differentiators

| # | Differentiator | What it means |
|---|---|---|
| 1 | **5-in-1 coverage** | Internships, jobs, scholarships, volunteer work, and competitions in one unified feed |
| 2 | **Cambodia-first** | Khmer + English UI, local opportunities prioritized, designed around Cambodian student personas |
| 3 | **3-role system** | Student (browse/save/apply), Organization (post), Admin (moderate) — most competitors serve only 1-2 roles |
| 4 | **Mobile-first responsive design** | Built for the device most Cambodian students use — addresses dated mobile UX of older platforms |
| 5 | **Save & track features** | Bookmark opportunities, deadline alerts, and application history — missing from classified-style sites |
| 6 | **Free for students and organizations** | No paywall, no posting fees during launch — lowers barrier vs. paid platforms |

---

## 6. Implications for our system design

This research informs Week 2 design decisions:

- **Data model must support 5 opportunity types** as a category enum, not just `job`. ER diagram needs `category` as a first-class field on the `opportunity` table.
- **3-role authentication** required from day one — Student, Organization, Admin roles encoded in the `user` table.
- **Multi-language readiness** — even if v1 ships in English, schema should support translated fields for future Khmer support.
- **Mobile-first UI** — Figma mockups must be designed mobile-first, not desktop-first.
- **Moderation workflow** — Admin approval state for opportunity postings (justifies Week 2 state diagram for `opportunity_status`).

---

## 7. Sources

- 9cv9 — *Top 10 Best Job Posting Websites in Cambodia for 2025*
- Cambodia Nation — *Top 8 Job Board Websites in Cambodia*
- Talent4U — *Best Job Website in Cambodia | Employment Opportunities*
- LinkedIn Cambodia — `kh.linkedin.com/jobs`
- CamHR — `camhr.com`
- BongThom — `bongthom.com`
- ScholarshipSet — *Ongoing Scholarships for Cambodia Students 2026-2027*
- Scholars4Dev — *International Scholarships for Cambodians 2026-2027*
- UNDP / UNICEF / OHCHR Cambodia — internship programmes
- Nucamp — *Top 10 Tech Internships in Cambodia 2026*

---

*Document maintained as part of the `Aukas` repo. Update as new competitors or features are discovered during the project.*
