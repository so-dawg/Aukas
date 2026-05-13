# Project Proposal — Opportunities Hub (Aukas)

**Project:** Opportunities Hub
**Repository:** [github.com/so-dawg/Aukas](https://github.com/so-dawg/Aukas)
**Course:** CS GEN 11 · Year 2 · Term 3
**Team:** 3 members (M1 Backend & DB · M2 Frontend & UX · M3 Research & Docs)
**Duration:** 7 weeks

---

## 1. Problem Statement

Cambodian students face a fragmented opportunity landscape. To find an internship, scholarship, volunteer position, or competition, a typical university student must monitor multiple disconnected sources at once: established job boards such as CamHR, BongThom, Khmer24, and Pelprek; university career office bulletins; individual NGO and company Facebook pages; global scholarship aggregators where Cambodia-eligible listings are buried in international noise; and dozens of Telegram and Messenger groups where hackathons, competitions, and volunteer calls are announced.

This fragmentation creates four concrete problems:

1. **Information is scattered across too many platforms.** No single Cambodian website covers all five opportunity types that matter to students — internships, jobs, scholarships, volunteer work, and competitions. Existing platforms are essentially job-only.

2. **Existing platforms are not built for students.** Sites like CamHR, BongThom, and Pelprek are designed for professional job seekers and employers. They offer no student-targeted features such as bookmarking, deadline tracking, or filtering by opportunity type. Khmer24 treats jobs as classified ads with no application workflow.

3. **Scholarships and volunteer work are nearly invisible online.** Global aggregators like Scholars4Dev and ScholarshipSet do list Cambodia-eligible scholarships, but Cambodian students must filter through international results to find them, and local scholarships from universities or ministries are missing entirely. Volunteer opportunities and student competitions live almost exclusively on social media, with no searchable archive.

4. **Existing platforms have poor mobile experience and limited Khmer-language support.** Most Cambodian students access the web primarily through smartphones, yet several leading platforms still rely on dated, desktop-first interfaces with English-heavy content.

The result is that students miss opportunities that would have been highly relevant to them, organizations struggle to reach the right student audience, and there is no infrastructure to support the growing ecosystem of NGO programs, scholarships, and competitions targeting Cambodian youth.

**Opportunities Hub addresses this gap** by consolidating all five opportunity types into one Cambodia-first platform, built around the three roles that matter in this ecosystem — students, organizations, and administrators.

---

## 2. Project Objectives

### 2.1 General Objective

To design, develop, and deploy a full-stack web platform that serves as the central hub for Cambodian students to discover, save, and apply for internships, jobs, scholarships, volunteer work, and competitions — and for organizations to reach those students directly.

### 2.2 Specific Objectives

The project will:

1. **Build a unified opportunity database** capable of storing and serving five distinct opportunity types (internship, job, scholarship, volunteer, competition) with type-specific metadata, deadlines, eligibility criteria, and application links.

2. **Implement a 3-role user system** with separate workflows for Students (browse, save, apply), Organizations (post, edit, manage opportunities), and Administrators (approve postings, moderate content, manage users).

3. **Design a mobile-first, responsive user interface** optimized for the devices Cambodian students actually use, with usability validated through testing with at least five real students before launch.

4. **Develop a RESTful backend API** using Node.js and Express, backed by a normalized PostgreSQL database (3NF), with secure JWT-based authentication, input validation, and proper error handling.

5. **Apply software engineering best practices** throughout the project — including UML modeling (use case, class, sequence, and state diagrams), sprint-based development tracked on GitHub Projects, and documented API specifications.

6. **Deploy a production-ready application** publicly accessible online by the end of Week 7, with the frontend hosted on Vercel, backend on Render, and database on Supabase or Railway.

7. **Produce a complete academic deliverable** — including a full project report, presentation slides, demo video, and final live demo — that integrates learning from six courses: Backend Development, Database Administration, Software Engineering, Automata, HCI, and Research Methodology.

### 2.3 Success Criteria

The project will be considered successful if, by end of Week 7:

| Criterion            | Target                                                           |
| -------------------- | ---------------------------------------------------------------- |
| Deployed application | Publicly accessible at a stable URL                              |
| Opportunity database | Minimum 20 seeded opportunities across all 5 types               |
| User roles working   | All 3 roles (Student, Organization, Admin) functional end-to-end |
| Usability testing    | Conducted with ≥ 5 students, results documented                  |
| Survey response      | ≥ 20 student responses collected and analyzed                    |
| Documentation        | Complete report, UML diagrams, API spec, README                  |
| Presentation         | Delivered live with working demo                                 |

---

## 3. Scope

### 3.1 In Scope

- Web-based platform (responsive — works on mobile browsers)
- 5 opportunity types: internship, job, scholarship, volunteer, competition
- 3 user roles: Student, Organization, Admin
- Search, filter, bookmark, and view functionality
- Posting workflow for organizations with admin moderation
- English-language interface (v1)
- Deployment to public cloud platforms

### 3.2 Out of Scope (for v1)

- Native mobile apps (iOS / Android)
- Full Khmer-language translation _(schema-ready, UI deferred)_
- Direct application submission within the platform _(external links only in v1)_
- Payment processing or paid postings
- Real-time chat or messaging
- Advanced recommendation algorithms / AI matching

---

## 4. Significance of the Project

This project contributes value at three levels:

**For Cambodian students,** Opportunities Hub reduces the time and effort needed to find relevant opportunities, helps surface scholarships and volunteer work that would otherwise be invisible, and provides a single trusted source they can return to throughout their academic journey.

**For organizations** — NGOs, companies offering internships, scholarship providers, and competition organizers — it provides a focused channel to reach the student audience they actually want, without competing with general job listings on platforms designed for mid-career professionals.

**For the team,** it serves as a capstone integration of six computer science courses into one substantial, end-to-end product, demonstrating skills in full-stack development, database design, software engineering process, user research, and deployment.

---

_This document is the formal proposal for Week 1 of the Opportunities Hub project. It will be refined as user survey results come in and as design decisions are finalized in Week 2._
