# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### ⚠️ Major Product Pivot (2026-09-19)
- **Architectural Transition**: Formally transitioned Deadline Radar from a legacy opportunity/hackathon/scholarship discovery aggregator into an **AI-powered personalized deadline monitoring, workload management, dynamic prioritization, empirical time tracking, and adaptive daily planning system**.
- **Deprecation**: Deprecated all legacy concepts involving public opportunity catalogs, hackathon feeds, web scrapers, application trackers as primary products, organization registries, and opportunity taxonomy scrapers.
- **Rewritten Core Context & PRD (`docs/project-context.md`, `docs/prd.md`)**:
  - Established the closed-loop intelligence cycle: Add Work → AI Decompose → Estimate Effort → Learn Personal Pace → Compare with Available Time → Detect Risk → Prioritize → Daily Plan → Stopwatch Execution → Track Actual Time → Update Personal Model → Replan.
  - Authored comprehensive 44-section PRD detailing Work Items, Temporal Deadlines, Work Decomposition, Effort Estimation, Personalization & Pace Factors, Available Time modeling, Workload Capacity calculations, Dynamic Priority scoring, Today view cockpit, Stopwatch tracking, and Protected Personal Interests.
- **Redesigned System Architecture (`docs/architecture.md`)**:
  - Established a decoupled Modular Monolith centered around Work Management, Time Availability, Time Tracking, Deterministic Risk & Priority Engines, Adaptive Daily Planning, Statistical Personalization Engine (Exponential Moving Average), and a Pluggable AI Facade.
  - Codified updated Architectural Decision Records (ADR-001 through ADR-007) ensuring deterministic algorithms for math/risk calculations while scoping LLM usage to semantic work decomposition and unstructured parsing.
- **Redesigned Database Schema (`docs/database-schema.md`)**:
  - Redesigned normalized relational schema with 13 core entities: `users`, `user_preferences`, `user_interests`, `time_availability`, `schedule_blocks`, `work_items`, `work_units`, `work_estimates`, `time_entries`, `user_pace_factors`, `plans`, `plan_items`, and `notifications`.
  - Enforced strict UTC `TIMESTAMPTZ` representations, row-level ownership isolation, and historical observation persistence for personalization telemetry.
- **Redesigned REST API Contract (`docs/api-contract.md`)**:
  - Replaced legacy catalog endpoints with operational REST routes: `/work`, `/availability`, `/tracking/sessions`, `/planning`, `/today`, `/dashboard`, `/timeline`, `/workload`, `/insights`, and `/ai/decompose`.
  - Added strict Pydantic v2 schemas, Bearer JWT security models, RFC 7807 error envelopes, and explicit data classification badges (`USER INPUT`, `AI-DERIVED DATA`, `SYSTEM-CALCULATED DATA`, `USER-VERIFIED DATA`, `ACTUAL OBSERVED DATA`).
- **Rewritten Frontend Specification (`docs/frontend-spec.md`)**:
  - Outlined client information architecture: Today View (Now/Next/Plan/Stopwatch), Radar Dashboard, Work Items list & detail, Add Work with AI Decomposition drawer, Timeline Gantt projection, Calendar view, Workload Capacity meters, and Personal Insights.
- **Rewritten AI Subsystem Specification (`docs/ai-model-spec.md`)**:
  - Defined strict separation between generative LLM reasoning (decomposition, extraction, missing-info flags) and deterministic mathematical calculations (risk ratio $R = E_r / H_a$, dynamic priority score $S$, and statistical pace factor $P = A / E$).
  - Specified provider abstraction supporting Gemini, Claude, OpenAI, and a deterministic offline test stub (`MockAIService`).
- **Created Editorial Design Specification (`docs/design.md`, `design.md`)**:
  - Created 41-section dark editorial design system inspired by high-contrast, typography-driven layouts (near-black `#0B0C0C` canvas, warm off-white `#F2F0EA` text, restrained amber accents, subtle borders, generous spacing, anti-AI-slop principles).
- **Rewritten Documentation & Module Indexes**:
  - Rewrote root `README.md` and module READMEs (`backend/README.md`, `frontend/README.md`, `ai-model/README.md`) to reflect the new product identity.
  - Updated supporting documentation (`docs/development-workflow.md`, `docs/coding-conventions.md`, `docs/testing-strategy.md`, `docs/deployment.md`).

### Historical Changes (Legacy Opportunity Discovery Concept - Obsolete)
- Completed initial prototype specifications for public opportunity discovery catalog, hackathon feeds, Devpost scraping pipelines, and application status kanban boards. *(Superseded by product pivot).*
