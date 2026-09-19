# Project Context — Deadline Radar

## Project Identity
- **Project Name**: Deadline Radar
- **Nature of Project**: Personal software product (NOT a hackathon project; designed as a durable, production-grade product).
- **Repository**: `deadline_radar`
- **Location**: `/Users/kunalsuryanshi/Documents/Projectsnew/deadline_radar`
- **Primary Domain**: Opportunity discovery, deadline tracking, time-management, and decision assistance for students and young professionals.

---

## Problem Statement
Students and young professionals are inundated with high-stakes, time-sensitive opportunities and academic/career responsibilities distributed across disparate channels:
- Hackathons, coding competitions, project showcases
- Internship and fellowship application portals
- Scholarships, financial aid, and grants
- College competitions, exams, course submissions
- Certifications, conferences, and career events

The critical failure point is not merely discovering opportunities—it is **remembering, organizing, prioritizing, and acting on them before their deadlines expire**. Valuable opportunities are continually lost due to:
- Information overload and fragmentation across emails, Discord/Slack groups, social media, and university portals.
- Lack of centralized visibility into closing dates and upcoming urgency.
- Absence of personalized status tracking (e.g., whether an application is bookmarked, started, submitted, or awaiting a decision).
- Forgotten deadlines due to irregular or nonexistent reminder mechanisms.

---

## Proposed Solution
**Deadline Radar** is a centralized opportunity and deadline management platform. It aggregates opportunities into a unified, distraction-free radar, empowers users to track application lifecycles, surfaces urgent deadlines via dashboard and calendar views, sends timely notifications, and leverages modular AI capabilities to parse messy opportunity announcements, classify them, detect duplicates, and prioritize what matters most to each user.

---

## Target Users
- **Primary Audience (Initial Focus)**: College and university students actively seeking career advancement, competitions, and academic milestones.
- **Secondary Audience**: Recent graduates and young professionals looking for internships, entry-level jobs, certifications, and fellowships.
- **Key Characteristics**: High context-switching, active on multiple communication channels, deadline-sensitive, need low friction and high clarity.

---

## Core User Journey
1. **Discover & Ingest**: The user navigates available opportunities on the platform OR pastes an unstructured link/text to quickly capture an opportunity.
2. **Review & Save**: The user inspects opportunity details (deadline, eligibility, location, application URL) and saves it to their personal radar.
3. **Organize & Prioritize**: The user categorizes the item, tags it, notes required action items, and monitors it on their central dashboard.
4. **Calendar & Proximity Alerting**: The user reviews deadlines on a timeline/calendar and receives scheduled notifications (e.g., 7 days, 3 days, 1 day before, and day-of).
5. **Execute & Update**: The user submits their application and updates the tracking status (`Applied`, `Interviewing`, `Completed`, or `Archived`).

---

## Core Features
### 1. Opportunity Catalog & Discovery
- Filterable registry of opportunities across Hackathons, Internships, Scholarships, Competitions, Coding Contests, Events, Fellowships, and Certifications.
- Multi-attribute search (category, dates, mode: online/offline, cost, eligibility criteria).

### 2. Comprehensive Opportunity Details
- Structured fields: Title, description, organizing body, category, deadline timestamp, start/end dates, eligibility criteria, location, online/in-person status, registration fee/cost, official URL, source attribution, tags, and current state.

### 3. Personal Radar & Lifecycle Tracking
- Save/Bookmark opportunities with custom statuses (`Saved`, `Interested`, `Applied`, `Interviewing`, `Offered`, `Rejected`, `Completed`, `Archived`).
- Personal notes and custom reminders per opportunity.

### 4. Deadline Dashboard
- Clear, prioritized views: Urgent (next 24h, next 3 days, next 7 days), Active Tracking, Overdue, and Recently Added.

### 5. Calendar & Timeline Views
- Visual representation of upcoming deadlines on monthly/weekly calendar layouts.

### 6. Notification System
- Configurable reminder milestones (7d, 3d, 1d, day-of) via email or in-app alerts (`TODO — NEEDS DECISION`).

### 7. Modular AI Assistance
- Extraction of structured fields from unstructured text or URLs.
- Domain classification, concise opportunity summaries, and eligibility extraction.
- Cross-source deduplication and semantic search.

---

## Technology Stack
- **Backend**: Python 3.11+, FastAPI (asynchronous REST API, OpenAPI docs).
- **Database**: PostgreSQL 15+, SQLAlchemy ORM 2.0 (asyncio), Alembic (migrations).
- **Frontend**: Vite + React 18+ + TypeScript + TanStack Query + Vanilla CSS / CSS Modules (ADR-003).
- **AI/ML**: Modular Python service facade invoking hosted LLM structured output APIs (Gemini 1.5 Flash / OpenAI GPT-4o-mini).
- **Background Worker**: In-process lightweight `asyncio` task loop running inside FastAPI container.
- **Search**: PostgreSQL native full-text search (`tsvector`) and trigram matching (`pg_trgm`).
- **Containerization**: Docker & Docker Compose.

---

## AI/ML Components
- **Information Extraction**: Parsing messy text/HTML into validated Pydantic models (Title, Org, Deadline, Eligibility, URL, etc.).
- **Categorization**: Multi-class categorization into 13 standardized opportunity domains.
- **Summarization**: Generating concise 2-sentence executive summaries and bulleted requirement checklists.
- **Deduplication**: Exact canonical URL matching and Jaro-Winkler title distance.
- **Semantic Search & Personalization**: Deferred to post-MVP (`pgvector`).

---

## Data Sources
- **Current State**: Seed catalog + user submissions.
- **Future Ingestion Pipeline**: Pluggable source adapters for public APIs, verified RSS feeds, and platform scrapers (Devpost, Unstop).
- **Architectural Requirement**: Sources must plug into a common, normalized ingestion pipeline without tight coupling to core domain models.

---

## External Services
- **AI Provider**: Hosted LLM API (Google Gemini 1.5 Flash or OpenAI GPT-4o-mini).
- **Transactional Notifications**: Deferred to post-MVP (Resend / AWS SES); in-app notifications used for MVP.

---

## Constraints
- **Maintainability**: Clear, self-documenting code; clean separation of concerns.
- **Modularity**: AI engine, ingestion pipeline, API, and UI must evolve independently.
- **Cost Awareness**: Low-cost / free-tier compatible during initial development; no premature expensive infrastructure.
- **Security**: Strict credential hygiene; zero secrets in code; typed validation on all external inputs.
- **AI-Agent Friendly**: Structured documentation as the single source of truth; no unguided architectural drift.

---

## Team Structure
- **Current Team**: Solo personal project by Kunal Suryanshi.
- **Development Process**: Accelerated via AI coding agents adhering strictly to project documentation.
- **Future Ready**: Codebase structured with clear boundaries to support open-source or team collaboration seamlessly.

---

## Current Development Status
- **Phase**: API Contract Design Complete. Ready for Frontend & AI Model Specifications.
- **Application Code**: None yet. Contracts and blueprints established first.

---

## Important Decisions
1. **Product, Not Hackathon**: Designed for long-term production quality, not hackathon shortcuts.
2. **Backend Direction**: FastAPI + SQLAlchemy + PostgreSQL chosen based on developer proficiency and async performance (ADR-001, ADR-002).
3. **Frontend Stack**: Vite + React 18+ + TypeScript SPA with TanStack Query and Vanilla CSS/CSS Modules for speed, type safety, and rich UI aesthetics (ADR-003).
4. **Decoupled AI Layer**: AI capabilities isolated as an in-process service facade calling hosted LLMs with strict JSON schemas, allowing model swapping without altering business logic (ADR-004).
5. **Lightweight In-Process Background Worker**: Scheduled tasks (notification evaluation, periodic sync) run via Python `asyncio` task loop inside the API container, deferring Celery/Redis complexity (ADR-005).
6. **Native PostgreSQL Search**: Full-text `tsvector` and trigram `pg_trgm` used for MVP search; dedicated vector DB deferred to post-MVP via `pgvector` (ADR-006).
7. **In-App Notification Center for MVP**: Proves reminder generation logic without third-party email deliverability dependencies (ADR-007).
8. **Distinct Opportunity vs. Application Lifecycles**: Strict separation between system-wide opportunity status (`OPEN`, `CLOSING_SOON`, `EXPIRED`) and private user tracking lifecycle (`SAVED`, `INTERESTED`, `APPLYING`, `APPLIED`, `SELECTED`, `REJECTED`, `COMPLETED`, `ARCHIVED`).
9. **Unified User Tracking Entity & API**: Single `/radar` resource manages the entire user lifecycle with private notes and timestamps, avoiding fragmented endpoints.
10. **Separation of Authoritative vs. AI Data**: Core opportunity facts reside in `opportunities`, while AI summaries, bullets, and confidence scores reside in `opportunity_ai_metadata`.
11. **Normalized Organizations & Sources**: Independent `organizations` and `sources` tables prevent string duplication and enable platform-wide deduplication.
12. **Idempotent Radar Tracking & Read Actions**: Saving already-tracked items returns the existing record idempotently; read receipts on notifications are idempotent.
13. **Documentation-Driven Development**: All endpoints, schemas, and architecture are documented before implementation.

---

## Open Questions
1. **Authentication Session Storage**: JWT Bearer token in Authorization header vs. HttpOnly secure cookie for production (Working assumption: Bearer header for early API development, migrating to HttpOnly cookies before public launch).
2. **Production Hosting Platform**: Selection between Render, Railway, or Fly.io for containerized deployment.
3. **Managed PostgreSQL Provider**: Selection between Neon, Supabase, or Railway Managed Postgres.

---

## Things AI Agents Must NOT Assume
- **Do not assume a technology unless documented**: Do not add random libraries, frameworks, or cloud services.
- **Do not add dependencies without justification**: Every dependency in `pyproject.toml` / `package.json` must serve an explicit requirement.
- **Do not invent product features**: Adhere strictly to the features in `docs/prd.md`.
- **Do not replace architectural decisions without discussion**: Keep the FastAPI + PostgreSQL + modular AI architecture intact.
- **Do not modify unrelated components**: When fixing or implementing a feature, change only the necessary files.
- **Do not bypass documentation**: Keep `api-contract.md` and `database-schema.md` in sync with any code changes.
- **Do not generate fake/mock implementations and call them done**: Write real, tested code once implementation commences.
