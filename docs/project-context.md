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
- **Database**: PostgreSQL 15+, SQLAlchemy ORM (async session), Alembic (migrations).
- **Frontend**: Modern TypeScript SPA (`TODO — NEEDS DECISION`: Recommend Vite + React + TypeScript).
- **AI/ML**: Python NLP / LLM integration layer (`TODO — MODEL SELECTION`: Modular interface, model/provider TBD).
- **Containerization**: Docker & Docker Compose (`TODO — NEEDS DECISION`).

---

## AI/ML Components
- **Information Extraction**: Parsing messy text/HTML into validated Pydantic models (Title, Org, Deadline, Eligibility, URL, etc.).
- **Categorization**: Multi-class categorization into opportunity domains.
- **Summarization**: Generating concise 2-sentence executive summaries and bulleted requirement checklists.
- **Deduplication**: Detecting duplicate listings across multiple submission channels.
- **Semantic Search & Personalization**: Natural language query matching and ranking based on user skills/interests.

---

## Data Sources
- **Current State**: No static dataset exists.
- **Future Ingestion Pipeline**: Public APIs, verified RSS feeds, user-submitted links/texts, and community contributions.
- **Architectural Requirement**: Sources must plug into a common, normalized ingestion pipeline without tight coupling to the core domain models.

---

## External Services
- **Transactional Notifications**: Email / push provider (e.g., Resend, SendGrid, or AWS SES - `TODO — NEEDS DECISION`).
- **AI Provider**: LLM / Embedding API (e.g., Gemini, OpenAI, Claude, or local Ollama / HuggingFace - `TODO — MODEL SELECTION`).

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
- **Phase**: Initialization & Architecture Foundation (Phase 0 - 16).
- **Application Code**: None yet. Foundation and contracts established first.

---

## Important Decisions
1. **Product, Not Hackathon**: Designed for long-term production quality, not hackathon shortcuts.
2. **Backend Direction**: FastAPI + SQLAlchemy + PostgreSQL chosen based on developer proficiency and async performance.
3. **Decoupled AI Layer**: AI capabilities are isolated as external services/modular interfaces so underlying models can be swapped without rewriting business logic.
4. **Documentation-Driven Development**: All endpoints, schemas, and architecture are documented before implementation.
5. **Notification Delivery for MVP**: In-app notification center is the primary delivery channel for MVP, eliminating external email/SMTP dependencies while establishing milestone triggers (7d, 3d, 1d, day-of). Transactional email is deferred to post-MVP.
6. **Distinct Opportunity vs. Application Lifecycles**: Strict separation between system-wide opportunity status (`OPEN`, `CLOSING_SOON`, `EXPIRED`) and private user tracking lifecycle (`SAVED`, `INTERESTED`, `APPLYING`, `APPLIED`, `SELECTED`, `REJECTED`, `COMPLETED`, `ARCHIVED`).
7. **Scoped AI Capabilities**: MVP AI is focused strictly on unstructured entity extraction, taxonomy classification, and 2-sentence summaries. Semantic vector search and resume-matching recommendations are deferred.

---

## Open Questions
1. **Frontend Stack**: Selection between Vite + React + TypeScript vs. Next.js (Working assumption: Vite + React + TypeScript SPA).
2. **Authentication Mechanism**: JWT in HTTP-only cookies vs. Bearer tokens in localStorage, OAuth2 providers (Google/GitHub).
3. **AI Inference Provider**: Selection of specific LLM provider for extraction (Working assumption: Gemini 1.5 Flash or OpenAI GPT-4o-mini).
4. **Hosting & Deployment**: Selection between Render, Fly.io, Railway, or VPS.

---

## Things AI Agents Must NOT Assume
- **Do not assume a technology unless documented**: Do not add random libraries, frameworks, or cloud services.
- **Do not add dependencies without justification**: Every dependency in `pyproject.toml` / `package.json` must serve an explicit requirement.
- **Do not invent product features**: Adhere strictly to the features in `docs/prd.md`.
- **Do not replace architectural decisions without discussion**: Keep the FastAPI + PostgreSQL + modular AI architecture intact.
- **Do not modify unrelated components**: When fixing or implementing a feature, change only the necessary files.
- **Do not bypass documentation**: Keep `api-contract.md` and `database-schema.md` in sync with any code changes.
- **Do not generate fake/mock implementations and call them done**: Write real, tested code once implementation commences.
