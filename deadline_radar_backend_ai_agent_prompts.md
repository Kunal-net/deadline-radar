# Deadline Radar — Backend & AI Agent Prompt Pack

## Purpose

This document is the master operating instruction set for AI coding agents implementing the **Deadline Radar backend, intelligence layer, and AI/ML systems**.

Deadline Radar is a personalized deadline and time-intelligence system that helps users understand what deserves their time, estimate work, assess deadline pressure, create realistic plans, execute work, observe actual effort, learn the user's pace, and continuously replan.

It is NOT an opportunity aggregator, hackathon discovery platform, internship tracker, generic task manager, or generic chatbot.

Core loop:

`ADD WORK → UNDERSTAND → DECOMPOSE → ESTIMATE → PERSONALIZE → ANALYZE DEADLINE RISK → PRIORITIZE → PLAN → EXECUTE → OBSERVE ACTUAL TIME → LEARN → REPLAN`

---

# 0. NON-NEGOTIABLE AGENT RULES

## Rule 1 — Downloaded skills are mandatory

**The agent MUST inspect and use the downloaded Antigravity/Gemini skills whenever a relevant skill exists.**

Before every major backend/AI phase:

1. Discover available skills.
2. Identify relevant skills.
3. Read their `SKILL.md`.
4. Apply their instructions.
5. Use additional relevant skills discovered later.

Relevant areas include backend/API development, FastAPI, Python, SQL/database engineering, PostgreSQL, SQLAlchemy, migrations, testing, debugging, security, performance, architecture, ML, AI integration, evaluation, and observability.

Do not claim a skill was used unless it was actually inspected and applied.

## Rule 2 — Deterministic logic must remain deterministic

AI must NOT replace core business calculations.

The backend/domain layer must calculate:
- capacity
- available time
- deadline distance
- remaining effort
- deadline risk
- priority
- schedule feasibility
- workload

AI can interpret, estimate, decompose, explain, and recommend.

## Rule 3 — Never silently trust AI output

AI output must be schema-validated.

Important AI-derived changes should be user-confirmed before becoming authoritative user data.

## Rule 4 — Do not fabricate data

Mock data may be used during development, but it must be isolated and clearly replaceable.

Never present fabricated analytics or AI results as real.

---

# 1. SOURCE OF TRUTH

Before implementation, inspect:

- `docs/architecture.md`
- `docs/api-contract.md`
- `docs/database-schema.md`
- `docs/frontend-spec.md`
- `deadline_radar_design.md`
- existing `backend/`
- existing migrations
- existing tests
- dependency/configuration files

Do not silently rewrite the existing architecture.

If a genuine conflict exists:
1. identify it
2. document it
3. choose the smallest compatible solution
4. make major architectural changes only when necessary

---

# 2. ARCHITECTURE

Use a **modular monolith** initially.

```text
Frontend
   ↓
FastAPI API
   ↓
Application / Service Layer
   ↓
Domain Logic
   ├── Work Management
   ├── Time & Availability
   ├── Deadline Risk
   ├── Priorities
   ├── Planning
   ├── Time Tracking
   └── Learning / Personalization
   ↓
Repositories
   ↓
PostgreSQL
```

AI sits beside the deterministic domain layer:

```text
FastAPI
  ├── Deterministic Domain
  │   ├── Capacity
  │   ├── Risk
  │   ├── Priority
  │   ├── Scheduling
  │   └── Time Tracking
  │
  └── AI Intelligence
      ├── Interpretation
      ├── Decomposition
      ├── Effort Estimation
      ├── Explanation
      └── Personalization
```

Do not turn this into microservices without a clear requirement.

---

# 3. EXECUTION PHASES

Execute sequentially:

1. Backend Initialization & Architecture Audit
2. Backend Foundation
3. Database & Migrations
4. Domain Models & Repositories
5. Authentication & User Preferences
6. Work Management API
7. Time Availability & Tracking
8. Deterministic Deadline Risk Engine
9. Priority Engine
10. Planning & Scheduling Engine
11. Background Jobs & Recalculation
12. AI Infrastructure
13. AI Work Interpretation
14. AI Decomposition
15. AI Effort Estimation
16. Personalization / Learning
17. AI Planning Assistance
18. AI Explanations
19. API Integration & Contract Verification
20. Testing, Evaluation, Security & Production Audit

Do not skip phases.

---

# 4. PHASE 1 — BACKEND INITIALIZATION & ARCHITECTURE AUDIT

```text
Read this entire document.

Inspect downloaded Antigravity/Gemini skills relevant to backend, FastAPI, Python, PostgreSQL, SQLAlchemy, testing, security, AI/ML, debugging, and architecture.

Read and apply the relevant SKILL.md files.

Inspect:
- backend/
- docs/architecture.md
- docs/api-contract.md
- docs/database-schema.md
- docs/frontend-spec.md
- existing configuration
- migrations
- tests
- dependency files

Do not modify production code yet.

Create a detailed audit containing:
- current backend state
- modules
- models
- routes
- services
- database state
- authentication
- tests
- AI/ML state
- missing functionality
- conflicts
- technical debt
- implementation order

Create/update:
docs/backend-implementation-progress.md

Record Phase 1.

Only stop for a genuine blocker.
```

---

# 5. PHASE 2 — BACKEND FOUNDATION

```text
Implement the backend foundation.

Use relevant downloaded FastAPI/Python/backend/code-quality skills.

Establish:
- FastAPI application
- configuration management
- environment handling
- database connection
- SQLAlchemy setup
- dependency injection
- API router structure
- service layer
- repository layer
- exception handling
- response/error conventions
- logging
- health endpoint
- test configuration

Keep business logic out of route functions.

Prefer:
Router → Service → Repository → Database

Run type checking, linting, tests, and startup validation.

Update docs/backend-implementation-progress.md.
```

---

# 6. PHASE 3 — DATABASE & MIGRATIONS

```text
Implement and validate the PostgreSQL database layer.

Use the downloaded SQLAlchemy/PostgreSQL/database skills.

Use SQLAlchemy and Alembic.

Core entities include:
- User
- UserPreference
- WorkItem
- WorkUnit
- TimeEntry
- ScheduleBlock

Add entities only when justified.

WorkItem should support concepts such as:
- title
- description
- work type
- deadline
- estimated effort
- remaining effort
- status
- importance
- priority
- dependencies
- AI interpretation
- confirmation state
- completion state

Use proper relationships, indexes, constraints, foreign keys, and timestamps.

Never manually alter production schema without migrations.

Test migrations from a clean database where possible.
```

---

# 7. PHASE 4 — DOMAIN MODELS & REPOSITORIES

```text
Build the backend domain/service layer.

Separate:
- API schemas
- domain/service logic
- database models

Create repositories for database access where justified.

Create services for:
- work management
- preferences
- time tracking
- capacity
- planning
- priorities
- deadline risk

Keep domain calculations deterministic and unit-testable.

Do not put business logic in FastAPI routers or SQLAlchemy models.
```

---

# 8. PHASE 5 — AUTHENTICATION & USER PREFERENCES

```text
Implement authentication and user preferences according to the existing API contract.

Use downloaded security/backend skills.

Support:
- user identity
- availability
- recurring commitments
- preferred work periods
- personal time
- planning preferences

Never store secrets in source code.

Validate input.

Ensure strict user-data isolation.

Test:
- authentication success/failure
- unauthorized access
- cross-user isolation
- invalid input
```

---

# 9. PHASE 6 — WORK MANAGEMENT API

```text
Implement complete Work Management.

Support:
- create
- retrieve
- list
- update
- delete/archive
- detail
- status changes
- deadline changes
- effort changes
- dependency management
- completion

Natural-language input may be stored, but AI is not required for basic CRUD.

Separate:
USER-PROVIDED
AI-SUGGESTED
SYSTEM-CALCULATED
OBSERVED

values where appropriate.

Never silently overwrite confirmed user data with AI output.
```

---

# 10. PHASE 7 — TIME AVAILABILITY & TRACKING

```text
Implement:
- available time
- recurring availability
- blackout/commitment periods
- schedule blocks
- focus sessions
- time entries
- actual duration
- completion time

Distinguish:
AVAILABLE TIME
COMMITTED TIME
PLANNED TIME
ACTUAL TIME

Protected personal interests/commitments must be respected.

Example:
Monday 18–22 = 4h available
Tuesday 19–22 = 3h available
Wednesday 18–21, but 19–20 protected

The planner must account for protected periods.
```

---

# 11. PHASE 8 — DETERMINISTIC DEADLINE RISK ENGINE

```text
Implement the deterministic Deadline Risk Engine.

DO NOT use an LLM to calculate risk.

Compare:
REMAINING REQUIRED EFFORT
against
REMAINING SUITABLE AVAILABLE CAPACITY

Consider:
- deadline
- current time
- remaining work
- availability
- commitments
- dependencies
- completion
- work constraints
- estimated effort
- historical adjustment where available

Return structured results such as:
- risk state
- remaining effort
- suitable capacity
- deficit/surplus
- buffer
- deadline distance
- contributing factors
- calculation timestamp

Possible states:
- comfortable
- watch
- at-risk
- critical

Use domain-defined thresholds.

AI may explain the result but must not replace the calculation.

Test:
- no deadline
- completed work
- zero effort
- insufficient capacity
- excess capacity
- passed deadline
- missing availability
- conflicting commitments
- dependencies
- multiple deadlines
```

---

# 12. PHASE 9 — PRIORITY ENGINE

```text
Implement the deterministic Priority Engine.

Consider:
- deadline proximity
- remaining effort
- available capacity
- importance
- dependencies
- completion
- deadline risk
- workload
- user-defined importance

Priority must be dynamic.

Return:
- priority value/order
- contributing factors
- explanation-ready structured data

Do NOT use an LLM for the numerical priority calculation.

Make calculations reproducible.
```

---

# 13. PHASE 10 — PLANNING & SCHEDULING ENGINE

```text
Implement the deterministic planning engine.

Account for:
- deadlines
- remaining effort
- available capacity
- protected personal time
- commitments
- dependencies
- work priority
- user pace
- focus windows

The goal is a realistic plan, not filling every free minute.

Produce schedule blocks containing:
- work item
- start
- end
- duration
- reason
- confidence where appropriate
- calculation/source metadata

The planner must validate feasibility.

AI cannot silently create impossible schedules.
```

---

# 14. PHASE 11 — BACKGROUND JOBS & RECALCULATION

```text
Implement background processing where necessary.

Potential jobs:
- deadline-risk recalculation
- priority recalculation
- scheduled plan generation
- reminder preparation
- learning updates
- recurring schedule processing
- stale-state cleanup

Use the simplest architecture compatible with the project.

Jobs should be:
- idempotent where possible
- retry-safe
- observable
- bounded
- logged

Do not create uncontrolled loops.
```

---

# 15. PHASE 12 — AI INFRASTRUCTURE

```text
Implement the modular AI service layer.

Use downloaded AI/ML/backend skills.

Architecture:

AIService
├── WorkInterpreter
├── WorkDecomposer
├── EffortEstimator
├── ExplanationGenerator
├── PlanningAssistant
└── PersonalizationService

Do not call an LLM directly from route functions.

Use structured schemas for all AI inputs/outputs.

Validate every response.

Implement:
- provider configuration
- model configuration
- prompt/version management
- structured output validation
- timeout handling
- retries
- failure handling
- observability
- cost controls where appropriate

AI failures must never corrupt core data.
```

---

# 16. PHASE 13 — AI WORK INTERPRETATION

```text
Implement natural-language work interpretation.

Example:
"Finish my ML assignment by Friday. It should take around 4 hours and I need to submit the report."

Extract candidate structured data:
- title
- description
- deadline
- estimated effort
- work type
- deliverable
- constraints
- subtasks
- missing information

Flow:

Natural language
→ AI interpretation
→ schema validation
→ user confirmation
→ persistence

Never persist unconfirmed assumptions as authoritative data.

If the input is ambiguous, identify the ambiguity.

Do not hallucinate missing deadlines or effort.
```

---

# 17. PHASE 14 — AI DECOMPOSITION

```text
Implement AI work decomposition.

Turn complex work into meaningful work units.

Example:
"Build the ML assignment"

may become:
- understand requirements
- collect data
- clean data
- train model
- evaluate model
- write report
- review
- submit

The decomposition must:
- preserve the parent work item
- produce actionable units
- avoid unnecessary microtasks
- identify dependencies where possible
- remain editable
- be user-confirmable

Treat decomposition as a suggestion, not truth.
```

---

# 18. PHASE 15 — AI EFFORT ESTIMATION

```text
Implement AI-assisted effort estimation.

Consider:
- work description
- work type
- complexity
- decomposition
- user's historical pace
- similar completed work
- uncertainty
- available observations

Return:
- predicted effort
- uncertainty/confidence
- major factors
- estimation source
- model/version metadata

Never present predictions as guarantees.

Example:
Predicted: 3h
Likely range: 2.5–4h
Confidence: medium

Do not personalize from insufficient data.
```

---

# 19. PHASE 16 — PERSONALIZATION / LEARNING

```text
Implement the learning loop:

Prediction
→ execution
→ actual time
→ prediction error
→ personal pattern update
→ future estimate adjustment

Example:
Predicted = 3h
Actual = 4h20m
Error = +1h20m

Learn gradually.

Where enough data exists, personalize by:
- work type
- complexity
- category
- context
- behavior
- historical variance

Track:
- absolute error
- signed error
- percentage error
- rolling bias
- confidence calibration

Do not let one observation radically change the model.

Cold-start users should use general estimates.

Only personalize after sufficient observations.
```

---

# 20. PHASE 17 — AI PLANNING ASSISTANCE

```text
Implement AI assistance around the deterministic planner.

Deterministic planning remains authoritative.

AI may:
- suggest alternatives
- explain tradeoffs
- summarize schedule pressure
- identify potential conflicts
- suggest sequencing
- explain why a plan feels aggressive

AI may NOT:
- invent free time
- ignore protected time
- silently override availability
- create impossible schedules
- replace capacity calculations

Flow:

User context
→ deterministic capacity
→ deterministic candidate plan
→ AI recommendation/explanation
→ deterministic validation
→ user-visible plan
```

---

# 21. PHASE 18 — AI EXPLANATIONS

```text
Implement concise AI explanations for:
- deadline risk
- priority
- effort estimate
- plan
- estimation variance
- schedule conflict

Explanations must be grounded in validated structured data.

Example:
System:
Remaining effort = 6h
Suitable capacity = 4h

AI:
"You have about 6 hours of work remaining but only about 4 suitable hours before the deadline, so the current schedule has a capacity gap."

The model must not invent numbers.

Prefer concise explanations over long AI essays.
```

---

# 22. PHASE 19 — API & FRONTEND CONTRACT VERIFICATION

```text
Verify the backend against:

docs/api-contract.md

and the actual frontend.

Check:
- routes
- methods
- request schemas
- response schemas
- authentication
- pagination
- errors
- validation
- status codes
- timestamps
- IDs

Do not invent undocumented endpoints.

If the API contract is outdated, update the contract and implementation together.

Run integration tests using the actual frontend expectations.
```

---

# 23. PHASE 20 — TESTING, EVALUATION, SECURITY & PRODUCTION AUDIT

```text
Perform the final backend and AI production audit.

Use all relevant downloaded skills for:
- backend testing
- API testing
- database testing
- security
- AI evaluation
- debugging
- performance
- code review

Backend:
- API correctness
- authentication
- authorization
- user isolation
- validation
- constraints
- migrations
- transactions
- errors
- logging
- performance

Deterministic engines:
- deadline risk
- priority
- capacity
- planning
- dependencies
- edge cases
- timezone behavior

AI:
- structured-output validity
- hallucination resistance
- ambiguity handling
- effort estimation
- decomposition
- personalization
- failure handling
- provider failures

Security:
- secrets
- authentication
- authorization
- injection
- unsafe input
- prompt injection
- sensitive logging
- database access
- CORS
- rate limiting where appropriate

Performance:
- slow queries
- N+1 queries
- expensive calculations
- AI latency
- repeated model calls
- background jobs

Run the complete validation suite and fix critical issues before declaring completion.
```

---

# 24. AI MODEL DESIGN PRINCIPLES

These rules apply to every AI phase.

## AI is probabilistic

Treat AI outputs as suggestions or predictions unless validated.

## Deterministic calculations stay deterministic

Never ask an LLM to calculate authoritative:
- capacity
- deadline distance
- remaining hours
- priority score
- schedule feasibility

## Structured outputs only

Prefer schema-validated objects such as:

```json
{
  "title": "...",
  "deadline": "...",
  "estimated_minutes": 240,
  "work_type": "...",
  "missing_information": []
}
```

over unstructured prose.

## Version AI behavior

Where appropriate record:
- provider
- model
- prompt version
- timestamp
- schema version
- relevant context

## User confirmation

AI suggests. The user confirms important changes.

## Uncertainty

Never claim perfect prediction.

---

# 25. PERSONALIZATION PRINCIPLES

The system should become more accurate from observed behavior.

```text
Prediction
    ↓
Execution
    ↓
Actual time
    ↓
Error measurement
    ↓
Personal pattern
    ↓
Future estimate adjustment
```

Do not use one crude global multiplier for all future estimates.

Use minimum-data thresholds and gradual updates.

Avoid overfitting.

---

# 26. TIME & TIMEZONE RULES

All time calculations must explicitly handle timezone.

Do not assume UTC is the user's working timezone.

Store timestamps consistently.

Convert to the user's timezone for planning/display.

Test:
- midnight boundaries
- deadlines near midnight
- recurring availability
- timezone conversion
- relevant daylight-saving transitions

Never create impossible schedules due to timezone errors.

---

# 27. ERROR HANDLING

AI failures must degrade gracefully.

If an AI provider fails, the core product should still support, where applicable:

- manual work creation
- deadlines
- deterministic risk
- priority
- time tracking
- deterministic planning

Do not make the application unusable because AI is temporarily unavailable.

---

# 28. OBSERVABILITY

Track useful technical information:

- request duration
- database failures
- AI latency
- AI failures
- job failures
- calculation errors

Do not log sensitive user information unnecessarily.

Never log:
- passwords
- API keys
- auth tokens
- secrets

---

# 29. BROWSER VALIDATION RULE

Backend work must not become blocked by frontend browser inspection.

If frontend integration requires browser validation:

1. perform a bounded check
2. inspect
3. continue

If browser inspection fails twice, stop browser inspection and use:
- API tests
- integration tests
- direct endpoint testing
- static validation

Never enter an infinite browser loop.

---

# 30. GIT CHECKPOINTS

After every major phase:

1. validate
2. inspect diff
3. create a meaningful commit

Examples:

`feat(api): implement work management`

`feat(domain): add deadline risk engine`

`feat(planning): add capacity-aware scheduler`

`feat(ai): add work interpretation`

`feat(ai): add personalized effort estimation`

`test(api): add backend integration coverage`

Do not rewrite history.

---

# 31. PROGRESS TRACKING

Maintain:

`docs/backend-implementation-progress.md`

For every phase record:
- phase number
- phase name
- status
- implementation summary
- files changed
- skills used
- tests run
- validation result
- known issues
- next phase

If interrupted, inspect this file and resume from the first incomplete phase.

Do not repeat completed phases unnecessarily.

---

# 32. MASTER EXECUTION RULE

Execute this document sequentially.

Do not wait for the user to provide individual phase prompts.

Use:

`READ → INSPECT → IMPLEMENT → TEST → VALIDATE → COMMIT → UPDATE PROGRESS → NEXT PHASE`

Only stop for genuine blockers.

Do not stop after a normal phase with "Ready for the next prompt."

Continue automatically.

---

# 33. DEFINITION OF DONE

Backend + AI implementation is complete only when:

- FastAPI backend works
- PostgreSQL schema is stable
- migrations work
- authentication works
- user isolation works
- work CRUD works
- time tracking works
- availability works
- deadline risk engine works
- priority engine works
- planning engine works
- required background processing works
- AI infrastructure is modular
- work interpretation works
- decomposition works
- effort estimation works
- personalization works
- AI explanations work
- AI planning assistance is deterministically validated
- API contract matches frontend
- tests pass
- security audit is complete
- AI evaluation is complete
- observability is sufficient
- critical performance issues are addressed
- no secrets are committed
- documentation is updated

The final system must support:

`ADD WORK → UNDERSTAND → DECOMPOSE → ESTIMATE → PERSONALIZE → ANALYZE DEADLINE RISK → PRIORITIZE → PLAN → EXECUTE → OBSERVE → LEARN → REPLAN`

without allowing probabilistic AI to silently override deterministic product logic.
