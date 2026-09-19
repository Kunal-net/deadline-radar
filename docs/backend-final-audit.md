# Backend & AI Final Audit Report — Deadline Radar

**Date**: 2026-09-20  
**Repository**: `deadline-radar`  
**Author**: Lead Backend & AI Systems Engineer  
**Status**: COMPLETE (Phases 01–20 Executed)  

---

## 1. Architecture Summary

Deadline Radar is structured as a **clean, modular monolith** in Python utilizing **FastAPI**, **SQLAlchemy 2.0 (Asyncio)**, **PostgreSQL 15+ / SQLite**, **Pydantic v2**, and **Alembic**.

```
backend/
├── app/
│   ├── api/
│   │   ├── deps.py              # Auth and DB dependency injection
│   │   └── v1/
│   │       ├── router.py        # Master v1 API Router
│   │       └── endpoints/       # auth, users, work, availability, tracking,
│   │                            # planning, today, dashboard, notifications, ai, insights
│   ├── core/
│   │   ├── config.py            # Pydantic Settings (env vars, secrets, CORS)
│   │   ├── database.py          # Async engine, sessionmaker, Base declarative
│   │   ├── errors.py            # Custom exceptions & RFC 7807 error handlers
│   │   ├── logging.py           # Structured JSON application logger
│   │   └── security.py          # bcrypt password hashing, JWT encode/decode
│   ├── domain/                  # Pure Deterministic Engines (NO LLM DEPENDENCIES)
│   │   ├── risk_engine.py       # DeadlineRiskEngine: R = RemainingEffort / SuitableCapacity
│   │   ├── priority_engine.py   # PriorityEngine: Multi-factor dynamic score (0-100+)
│   │   └── planner.py           # DailyPlanner: Constraint-driven slot schedule
│   ├── models/                  # 14 SQLAlchemy 2.0 ORM Entities (UUID PKs, UTC TIMESTAMPTZ)
│   ├── repositories/            # Repository pattern (encapsulated queries & user isolation)
│   ├── schemas/                 # Pydantic v2 schemas with camelCase/snake_case dual compatibility
│   └── services/
│       ├── ai/                  # AI Facade & sub-services (Interpreter, Decomposer, Estimator,
│       │                        # Explainer, PlannerAssistant, Personalization, Providers)
│       ├── auth_service.py
│       ├── availability_service.py
│       ├── background_recalculation.py
│       ├── dashboard_service.py
│       ├── notification_service.py
│       ├── planning_service.py
│       ├── tracking_service.py
│       ├── user_service.py
│       └── work_service.py
├── alembic/                     # Database migrations
└── tests/                       # Pytest test suite (69 tests, 77% coverage)
    ├── unit/
    └── integration/
```

### Architectural Highlights
- **Strict Separation Principle (Rule #3)**: The backend never delegates arithmetic, deadline distance, available focus capacity, risk ratios, or priority calculations to an LLM. All calculations are executed deterministically by domain engines.
- **Decoupled AI Facade**: The AI system (`AIService`) abstracts providers (`MockAIProvider`, `GeminiProvider`, `ClaudeProvider`) behind uniform interfaces and strict Pydantic v2 schemas.
- **Frontend Interoperability**: Response models utilize `@computed_field` to serialize both standard snake_case backend names and frontend camelCase names (`remainingEffortHours`, `riskLevel`, `workItemId`, `isCompleted`), guaranteeing seamless compatibility with `frontend/src/services/apiTypes.ts`.

---

## 2. Implemented Capabilities

1. **Authentication & User Profiles**:
   - Secure registration, login, token refresh, and profile management.
   - User preferences (`daily_capacity_limit_hours`, `buffer_percentage`, `protect_personal_interests`).
   - Personal interests (e.g. guitar, gym, reading) with weekly protected hours and scheduling preferences.
2. **Work Management & Hierarchical Units**:
   - Full CRUD for work items and atomic subtasks (`WorkUnit`).
   - Drag-and-drop sequence reordering (`PUT /api/v1/work/{id}/units/reorder`).
   - Real-time aggregation of logged hours, remaining effort, completion percentages, and risk state updates upon unit completion.
3. **Time Availability & Blackout Windows**:
   - Weekly recurring availability templates by day of week.
   - Schedule blackout blocks and protected interest blocks.
4. **Time Tracking & Focus Stopwatch**:
   - Live focus session management with atomic conflict prevention (single active session per user).
   - Pause, resume, and completion flows updating task actual hours and triggering background recalculations.
   - Manual time entry logging.
5. **Deterministic Deadline Risk Engine**:
   - Evaluates remaining effort against exact calendar capacity between current timestamp and deadline.
   - 5 discrete states: `SAFE`, `WATCH`, `AT_RISK`, `CRITICAL`, `OVERDUE`.
   - Contributing factor diagnostics explaining why an item is at risk without hallucinations.
6. **Dynamic Priority Engine**:
   - Composite 0–100+ score reflecting urgency, risk ratio, importance weight, momentum bonus for near-complete tasks, and penalty deductions for blocked tasks.
7. **Constraint-Validated Daily Planning Engine**:
   - Daily schedule generation carving out sleep, blackout commitments, and protected interest blocks.
   - Greedily schedules highest-priority work items within user daily focus capacity limits.
8. **Today Execution Dashboard**:
   - Today overview displaying date, issue number, available focus hours, deadlines count, daily plan items, and top priority items.
9. **Operational Radar & Horizon Timeline**:
   - High-level risk counts, approaching deadline countdowns, weekly capacity load meter (`GET /api/v1/dashboard/summary`).
   - Forward-looking timeline horizon projection mapping work units to calendar days (`GET /api/v1/timeline/projection`).
   - Daily and weekly capacity vs demand breakdown (`GET /api/v1/workload/capacity`).
10. **Background Recalculation & Proactive Notifications**:
    - Triggered on task completion, time logging, or deadline changes.
    - Detects risk state transitions (e.g. `SAFE` $\to$ `AT_RISK`) and persists proactive user notifications.
11. **AI Intelligence Layer**:
    - **Natural Language Work Interpretation**: Parses unformatted text and notes into candidate work items, detecting missing information (`POST /api/v1/ai/interpret`).
    - **Atomic Decomposition**: Breaks complex assignments into ordered, estimated subtasks (`POST /api/v1/ai/decompose`, `POST /api/v1/ai/work/{id}/apply-decomposition`).
    - **Calibrated Effort Estimation**: Estimates task duration with complexity categorization, variance risk, and non-guarantee disclosures (`POST /api/v1/ai/estimate-effort`).
    - **Adaptive Personalization**: Closed-loop learning adjusting category pace factors based on observed historical performance with cold-start damping (`GET /api/v1/insights/summary`, `POST /api/v1/insights/recalibrate-pace`).
    - **Grounded Explanations**: Generates clear natural-language justifications quoting exact validated telemetry (`GET /api/v1/work/{id}/explanation`).
    - **AI Planning Assistance**: Analyzes generated daily plans to provide workload pressure evaluation, rebalancing advice, and pacing tips (`GET /api/v1/planning/{date}/ai-assist`).

---

## 3. API Summary

All endpoints are served under `/api/v1/`:

| Path | Method | Purpose | Auth Required |
|---|---|---|---|
| `/health` | GET | Basic liveness and readiness probe | No |
| `/api/v1/health` | GET | Detailed subsystem health probe | No |
| `/api/v1/auth/register` | POST | User registration & token generation | No |
| `/api/v1/auth/login` | POST | User login with email and password | No |
| `/api/v1/auth/me` | GET | Retrieve authenticated user profile | Yes |
| `/api/v1/users/preferences` | GET / PUT | Retrieve and update user workload preferences | Yes |
| `/api/v1/users/interests` | GET / POST / DELETE | Manage protected personal interests | Yes |
| `/api/v1/work` | GET / POST | List and create work items | Yes |
| `/api/v1/work/{id}` | GET / PUT / DELETE | Retrieve, update, or archive a work item | Yes |
| `/api/v1/work/{id}/units` | GET / POST | List and add subtasks | Yes |
| `/api/v1/work/{id}/units/{uid}` | PUT / DELETE | Update or delete a subtask | Yes |
| `/api/v1/work/{id}/units/reorder` | PUT | Reorder subtasks sequence | Yes |
| `/api/v1/work/{id}/explanation` | GET | Retrieve grounded risk/priority explanation | Yes |
| `/api/v1/availability/templates` | GET / PUT | View and replace recurring availability templates | Yes |
| `/api/v1/availability/blocks` | GET / POST | View and create schedule blackout blocks | Yes |
| `/api/v1/availability/blocks/{id}` | DELETE | Remove schedule block | Yes |
| `/api/v1/tracking/session/start` | POST | Start live focus stopwatch session | Yes |
| `/api/v1/tracking/session/active` | GET | Check currently running focus session | Yes |
| `/api/v1/tracking/session/pause` | POST | Pause active focus session | Yes |
| `/api/v1/tracking/session/resume` | POST | Resume active focus session | Yes |
| `/api/v1/tracking/session/stop` | POST | Complete session and log actual hours | Yes |
| `/api/v1/tracking/entries` | GET / POST | List and manually log time entries | Yes |
| `/api/v1/planning/{plan_date}` | GET / POST | Retrieve or generate daily plan | Yes |
| `/api/v1/planning/{date}/items/{id}` | PUT | Update plan item status (PENDING/ACTIVE/COMPLETED) | Yes |
| `/api/v1/planning/{date}/ai-assist` | GET | Retrieve AI schedule advisory for plan | Yes |
| `/api/v1/today/overview` | GET | Retrieve Today dashboard overview | Yes |
| `/api/v1/dashboard/summary` | GET | Operational radar risk counts and capacity balance | Yes |
| `/api/v1/timeline/projection` | GET | Forward-looking calendar timeline projection | Yes |
| `/api/v1/workload/capacity` | GET | Daily/weekly capacity vs demand distribution | Yes |
| `/api/v1/notifications` | GET | List proactive risk notifications | Yes |
| `/api/v1/notifications/{id}/read` | PUT | Mark notification as read | Yes |
| `/api/v1/ai/interpret` | POST | Parse freeform text into candidate work items | Yes |
| `/api/v1/ai/decompose` | POST | Decompose work description into subtasks | Yes |
| `/api/v1/ai/work/{id}/decompose`| POST | Decompose existing work item into subtasks | Yes |
| `/api/v1/ai/work/{id}/apply-decomposition` | POST | Persist AI subtasks to work item | Yes |
| `/api/v1/ai/estimate-effort` | POST | Calibrated effort estimation with complexity rating | Yes |
| `/api/v1/ai/explain` | POST | Generate grounded telemetry explanation | Yes |
| `/api/v1/ai/plan-assist` | POST | AI review and recommendations on daily plan | Yes |
| `/api/v1/insights/summary` | GET | Personal pace factor telemetry and variance | Yes |
| `/api/v1/insights/recalibrate-pace` | POST | Force recalibration of personal pace factor | Yes |

---

## 4. Database Summary

- **Database Engine**: PostgreSQL 15+ compatible (tested with Async SQLAlchemy on SQLite & PostgreSQL).
- **Migration Framework**: Alembic (Current Revision: `c014e8a84b43`).
- **Entity Overview (14 Tables)**:
  1. `users`: Core identity, hashed password, timezone.
  2. `user_preferences`: Workload caps, buffer percentages, personal interest protection toggle.
  3. `personal_interests`: Protected personal activities, weekly hour targets.
  4. `user_pace_factors`: Learned speed multipliers per category with confidence and observation counts.
  5. `time_availability`: Recurring weekly focus schedule (Sunday=0 .. Saturday=6).
  6. `schedule_blocks`: Calendar commitments, blackout windows, and personal interest reservations.
  7. `work_items`: Central work items with deadlines, importance weights, status, and cached risk/priority metrics.
  8. `work_units`: Atomic subtasks with sequence ordering, completion status, estimated/actual hours.
  9. `work_estimates`: Audit history of effort estimates.
  10. `time_entries`: Logged work intervals and focus durations.
  11. `active_sessions`: Single-concurrency live focus stopwatch tracking.
  12. `daily_plans`: Planned daily schedules.
  13. `daily_plan_items`: Ordered time slots allocated to specific tasks or commitments.
  14. `notifications`: Proactive system alerts triggered by deadline risk escalation.
  15. `ai_analyses`: Audit log of AI interpretations, decompositions, and estimations.

---

## 5. AI Architecture

```
User / Frontend
      │
      ▼
REST API Layer (/api/v1/ai/*, /api/v1/insights/*)
      │
      ▼
AIService (Master Facade)
  ├── WorkInterpreter
  ├── WorkDecomposer
  ├── EffortEstimator
  ├── ExplanationGenerator
  ├── PlanningAssistant
  └── PersonalizationService
      │
      ▼
BaseAIProvider Interface
  ├── MockAIProvider   (Deterministic, offline rule-based heuristic fallback)
  ├── GeminiProvider   (Google GenAI API integration)
  └── ClaudeProvider   (Anthropic Claude API integration)
```

### Safety & Guardrails
- **Prompt Injection Isolation**: User-supplied input is escaped and passed within demarcated context delimiters.
- **Strict Pydantic Validation**: All outputs are parsed and validated against strict schemas (`WorkInterpretationResponse`, `WorkDecompositionResponse`, `EffortEstimateResponse`, `ExplanationResponse`, `PlanningAssistantResponse`).
- **Non-Guarantee Disclosures**: Estimates always carry `is_guarantee: False` and explicit confidence bounds.
- **Human Confirmation Flow**: AI-generated structures (e.g. interpretations and decompositions) are returned as proposals. They are never written to the database until explicitly confirmed by the user.

---

## 6. Deterministic Engine Summary

1. **Deadline Risk Engine (`backend/app/domain/risk_engine.py`)**:
   - Formula:
     $$R = \frac{\text{Remaining Estimated Effort} \times \text{Pace Factor}}{\text{Suitable Remaining Focus Capacity}}$$
   - Classifications:
     - $R \le 0.60$: `SAFE`
     - $0.60 < R \le 0.85$: `WATCH`
     - $0.85 < R \le 1.15$: `AT_RISK`
     - $R > 1.15$: `CRITICAL`
     - Deadline in past: `OVERDUE`
   - Accounts for calendar blackout periods, user recurring availability templates, and buffer margins.

2. **Dynamic Priority Engine (`backend/app/domain/priority_engine.py`)**:
   - Composite score $0–100+$ based on:
     - Urgency score from hours remaining until deadline.
     - Risk penalty multiplier based on risk ratio.
     - Importance weighting ($0.5$ to $3.0$).
     - Momentum bonus for work items near completion ($>70\%$ complete).
     - Blocker penalty for items flagged as blocked.

3. **Daily Planning Engine (`backend/app/domain/planner.py`)**:
   - Enforces personal interest protection before work scheduling.
   - Carves out blackout slots (meetings, classes, personal commitments).
   - Fills remaining focus slots with top-priority work units up to the user's daily maximum capacity limit (`daily_capacity_limit_hours`).

---

## 7. Personalization Approach

- **Closed-Loop Feedback**: As users track actual time via the focus stopwatch or manual entries, the system computes the historical estimation ratio:
  $$\text{Observed Ratio} = \frac{\text{Actual Logged Hours}}{\text{Estimated Hours}}$$
- **Gradual Dampening**: To prevent wild oscillations from single outliers, updates follow an exponential moving average:
  $$\text{New Pace Factor} = 0.70 \times \text{Prior Factor} + 0.30 \times \text{Observed Ratio}$$
  Bounded within safe operational clamps $[0.50, 3.00]$.
- **Cold-Start Protection**: For new users or categories with $< 3$ completed observations, the system defaults to a baseline pace factor of $1.0$ with `confidence: "low"` and transparent user explanations.

---

## 8. Testing Summary

- **Total Test Suite**: 69 tests.
- **Passing Tests**: 69 (100% Pass Rate).
- **Test Execution Time**: ~15 seconds.
- **Code Coverage**: 77% total coverage across backend codebase.
- **Test Categories**:
  - **Unit Tests**:
    - `test_risk_engine.py`: Edge cases, buffer deductions, blackouts, overdue handling, pace adjustment.
    - `test_priority_engine.py`: Urgency decay, momentum boost, blocker penalties, ranking determinism.
    - `test_planner.py`: Daily plan slot allocations, protected interests, daily focus caps.
    - `test_database_schema.py`: Cascades, foreign key constraints, session exclusivity.
    - `test_errors_and_security.py`: Password hashing, JWT token expiry, RFC 7807 exceptions.
    - `test_ai_infrastructure.py`: Provider fallback, schemas, validation.
    - `test_repositories.py`: Data access layers, user tenant isolation.
    - `test_health.py`: Healthcheck probes.
  - **Integration Tests**:
    - `test_auth_and_users.py`: Registration, login, preferences, interests isolation.
    - `test_work_api.py`: Work item and subtask lifecycle, reordering, status propagation.
    - `test_availability_and_tracking.py`: Weekly templates, schedule blocks, live focus stopwatch.
    - `test_planning_api.py`: Plan generation, item status progression, today overview.
    - `test_recalculation_and_notifications.py`: Background recalculation, proactive notification dispatch.
    - `test_ai_endpoints.py`: Interpretation, decomposition, effort estimation, user confirmation flow.
    - `test_ai_explanations.py`: Grounded metric quotation, explanation generation, cross-tenant isolation.
    - `test_planning_ai_assist.py`: Plan AI review, schedule pressure warnings.
    - `test_insights_api.py`: Cold-start protection, learning loop, recalibration.
    - `test_dashboard_and_contracts.py`: Operational radar, timeline projections, workload capacity, camelCase frontend parity.

---

## 9. Security Findings

- **Authentication & Tokens**:
  - Passwords hashed using industry-standard `bcrypt`.
  - JWT tokens encoded with HMAC-SHA256, strictly validated for expiration, signature, and user existence on every protected request.
- **Authorization & User Isolation**:
  - Every database query in all repositories enforces `WHERE user_id == current_user.id`.
  - Integration tests explicitly verify that User A cannot read, modify, or delete entities belonging to User B (returning 404/403).
- **SQL Injection Prevention**:
  - 100% of queries use SQLAlchemy ORM expressions or parameterized statements. No raw SQL string interpolation.
- **Secrets & Configuration**:
  - All credentials (`SECRET_KEY`, `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`, `DATABASE_URL`) loaded via environment variables using `pydantic-settings`. Zero hardcoded secrets in repository.
- **CORS Protection**:
  - Configurable `ALLOWED_ORIGINS` restricting browser origins to authorized frontend domains.
- **RFC 7807 Error Envelopes**:
  - Internal exceptions are trapped and returned as structured problem details without leaking internal tracebacks or database schema details to clients.

---

## 10. Known Limitations

1. **In-Process Recalculation**: Background recalculation currently executes as an asynchronous asyncio background task within the FastAPI process. Under enterprise scale (hundreds of thousands of concurrent users), this should be offloaded to Celery/Redis or ARQ.
2. **External Calendar Sync**: Schedule blocks currently reside in the local database. Two-way Google Calendar / Outlook iCal synchronization is architected to feed into `ScheduleBlock` but requires external OAuth integration in a future release.
3. **WebSockets for Live Timer**: The focus stopwatch provides REST polling endpoints (`/tracking/session/active`); a WebSocket channel can be added for sub-second UI synchronization if desired.

---

## 11. Production-Readiness Notes

- **Environment Config**: Ready for `.env` or container environment configuration.
- **Database Migrations**: Fully configured Alembic migrations (`alembic upgrade head`).
- **Containerization**: Python 3.9+ compatible, dependencies pinned in `requirements.txt` and `pyproject.toml`.
- **Zero Fake Data in Production Paths**: All mock behaviors are strictly isolated to `MockAIProvider` when external API keys are omitted. Production database queries use authentic user records.

---

## 12. Recommended Next Engineering Steps

1. **Production Infrastructure Setup**:
   - Provision PostgreSQL 15 on managed cloud (AWS RDS / Supabase).
   - Set up Redis for distributed caching and Celery task queues.
2. **AI Provider Credentials**:
   - Supply production `GEMINI_API_KEY` or `ANTHROPIC_API_KEY` in deployment environment variables.
3. **Frontend Hookup**:
   - Switch frontend development mode from `mockData.ts` to `apiClient.ts` connecting directly to `http://localhost:8000/api/v1`.
