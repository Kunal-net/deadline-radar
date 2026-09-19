# Coding Conventions & Standards — Deadline Radar

## Core Principles
> **Prefer existing project abstractions over creating duplicates.**  
> **Do not refactor unrelated code while implementing a feature.**  
> **Do not introduce a dependency unless there is a clear reason.**

---

## 1. Naming Conventions

### Python (Backend & AI)
- **Modules and Files**: `snake_case.py` (e.g., `work_item_service.py`, `risk_engine.py`, `planner.py`).
- **Classes**: `PascalCase` (e.g., `WorkItemRepository`, `RiskAssessmentService`).
- **Functions and Methods**: `snake_case()` (e.g., `calculate_deadline_risk()`, `decompose_work_item()`).
- **Variables and Attributes**: `snake_case` (e.g., `is_hard_deadline`, `deadline_utc`, `remaining_hours`).
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `DEFAULT_BUFFER_PERCENTAGE`, `MAX_TITLE_LENGTH`).
- **Pydantic Schemas**: Suffix with purpose (e.g., `WorkItemCreate`, `WorkItemResponse`, `WorkItemUpdate`).

### TypeScript (Frontend)
- **Files**:
  - Components: `PascalCase.tsx` (e.g., `WorkItemCard.tsx`, `RiskBadge.tsx`, `ActiveTimer.tsx`).
  - Hooks: `camelCase.ts` starting with `use` (e.g., `useWorkItems.ts`, `useActiveSession.ts`).
  - Utilities and Types: `camelCase.ts` (e.g., `formatDuration.ts`, `apiClient.ts`).
- **Components**: `PascalCase` (e.g., `function WorkItemCard(props: WorkItemCardProps)`).
- **Interfaces and Types**: `PascalCase` (e.g., `WorkItem`, `RiskState`, `TimeEntry`).
- **Variables and Functions**: `camelCase` (e.g., `fetchDashboardSummary()`).

### Database
- **Tables**: Plural `snake_case` (e.g., `work_items`, `work_units`, `time_entries`).
- **Columns**: `snake_case` (e.g., `created_at`, `remaining_estimated_hours`).
- **Foreign Keys**: `<singular_table>_id` (e.g., `user_id`, `work_item_id`).

---

## 2. Folder Structure Standards

### Backend (`backend/`)
```text
backend/
├── app/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── endpoints/          # Route handlers (auth, work, tracking, planning, dashboard, ai)
│   │   │   └── router.py           # Top-level API router mounting
│   ├── core/
│   │   ├── config.py               # Settings and env validation (Pydantic Settings)
│   │   ├── security.py             # Password hashing, JWT token utilities
│   │   └── database.py             # SQLAlchemy engine, session maker, base model
│   ├── models/                     # SQLAlchemy DB models (one entity per module)
│   ├── schemas/                    # Pydantic v2 schemas (request/response validation)
│   ├── services/                   # Business logic and external orchestrators
│   │   ├── work_service.py
│   │   ├── risk_service.py
│   │   ├── planning_service.py
│   │   ├── tracking_service.py
│   │   ├── notification_service.py
│   │   └── ai/                     # AI facades, prompt adapters, and parsers
│   └── main.py                     # FastAPI application factory
├── alembic/                        # Database migration scripts
│   ├── versions/
│   └── env.py
├── tests/                          # Automated tests
│   ├── conftest.py
│   ├── unit/
│   └── integration/
├── pyproject.toml / requirements.txt
└── README.md
```

### Frontend (`frontend/`)
```text
frontend/
├── src/
│   ├── components/                 # Shared UI components (Button, Badge, Card, Modal)
│   │   ├── ui/
│   │   └── layout/
│   ├── features/                   # Domain features (today, work, dashboard, timeline, calendar, planning)
│   │   ├── today/
│   │   ├── work/
│   │   ├── dashboard/
│   │   ├── timeline/
│   │   └── planning/
│   ├── hooks/                      # Reusable custom React hooks
│   ├── lib/                        # API client, date formatters, constants
│   ├── types/                      # TypeScript interfaces and type definitions
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── README.md
```

---

## 3. Functions & Classes
- **Single Responsibility**: Every function should perform one cohesive action.
- **Maximum Length**: Aim for functions < 40 lines. Break complex business logic into private helper functions or domain service classes.
- **Pure Functions**: Write business calculations (e.g., urgency tier grouping, date parsing) as pure, testable functions without side effects.
- **Class Usage**: Use classes when encapsulating stateful services, repositories, or dependency-injected clients. Avoid unnecessary class wrappers around stateless collections of utility functions.

---

## 4. Error Handling
- **Never Fail Silently**: Never catch generic `Exception` without logging or re-raising.
- **Custom Domain Exceptions**: Define domain exceptions (e.g. `WorkItemNotFoundError`, `ActiveSessionConflictError`) in the service layer, and map them to HTTP responses via FastAPI exception handlers.
- **Structured Error Responses**: All API errors must return the standard JSON envelope:
  ```json
  {
    "error": {
      "code": "SPECIFIC_ERROR_CODE",
      "message": "User-friendly description",
      "details": []
    }
  }
  ```
- **Frontend Error Boundaries**: Use React Error Boundaries to catch unhandled rendering exceptions, and inline alerts for network/API failures.

---

## 5. Logging
- Use standard Python `logging` or `loguru` configured with structured output (JSON or timestamped log format).
- **Log Levels**:
  - `DEBUG`: Verbose diagnostics (payload shapes, intermediate parsing steps).
  - `INFO`: Normal operational events (user registered, work item created, scheduled notification run).
  - `WARNING`: Recoverable anomalies (AI decomposition timed out, falling back to manual entry; unrecognized timezone).
  - `ERROR`: Unhandled exceptions, database query failures, broken external calls.
- **No Sensitive Data**: Never log passwords, tokens, full authorization headers, or private user credentials.

---

## 6. Type Safety
- **Python**: Strict type hints required on all function arguments and return types. Verify via `mypy` or `ruff`.
  ```python
  # Good
  async def get_work_item_by_id(db: AsyncSession, work_item_id: UUID) -> WorkItem | None:
      ...
  ```
- **TypeScript**: No `any`. Use explicit interfaces, generics, or `unknown` with type guards. Enable `strict: true` in `tsconfig.json`.

---

## 7. Environment Variables & Configuration
- Store all configuration in environment variables.
- Use `pydantic-settings` in Python to validate environment configurations at startup:
  ```python
  class Settings(BaseSettings):
      DATABASE_URL: PostgresDsn
      SECRET_KEY: str
      ENVIRONMENT: str = "development"
      AI_API_KEY: str | None = None
  ```
- Provide an audited, safe `.env.example` file with placeholder values. Never commit actual `.env` files.

---

## 8. Security Standards
- **Password Storage**: Argon2id or bcrypt with high work factor.
- **SQL Injection**: Always use SQLAlchemy ORM queries or parameterized statements. Never concatenate raw SQL strings.
- **CORS**: Explicitly configure allowed origins; do not use `allow_origins=["*"]` in production.
- **Input Sanitization**: Validate all inputs using Pydantic schemas. Sanitize HTML tags from extracted texts before rendering on the frontend.
- **Rate Limiting**: Apply rate limiting to authentication endpoints (`/auth/login`, `/auth/register`) and AI extraction endpoints.

---

## 9. Dependency Management
- Evaluate any proposed library before installing:
  1. Does it solve a real problem that cannot be addressed in 20 lines of standard library code?
  2. Is it actively maintained with an active security track record?
  3. Does it bloat package installation or Docker image size unnecessarily?
- Pin dependency versions in `requirements.txt` / `pyproject.toml` and `package.json` to guarantee reproducible builds.
