# Deadline Radar — API Contract Specification

## 1. Overview

This document serves as the **authoritative, implementation-ready REST API contract** governing all HTTP communication between the Frontend Client and the FastAPI Backend for **Deadline Radar**. Both frontend and backend engineers (and AI coding agents) must adhere strictly to the endpoints, schemas, headers, status codes, and error formats defined herein.

- **Protocol**: RESTful JSON over HTTPS (TLS 1.3)
- **Base URL (Development)**: `http://localhost:8000/api/v1`
- **Base URL (Production)**: `https://api.deadlineradar.com/api/v1` (`TODO — DEPLOYMENT DECISION`)
- **Default Media Type**: `application/json; charset=utf-8`
- **Date & Time Standard**: ISO 8601 UTC strings (`YYYY-MM-DDTHH:MM:SSZ`)
- **Data Categories**: Every field returned by this API is explicitly classified as `USER INPUT`, `AI-DERIVED DATA`, `SYSTEM-CALCULATED DATA`, `USER-VERIFIED DATA`, or `ACTUAL OBSERVED DATA`.

---

## 2. Resource Organization & Namespaces

All core API endpoints are organized under versioned domain routes:

```text
/api/v1/
├── /auth/                  # Registration, login, token refresh, current session
├── /users/                 # Profile, working preferences, protected interests
├── /availability/          # Recurring weekly schedule templates & blackout blocks
├── /work/                  # Work items, subtasks (work units), status, manual estimates
├── /tracking/              # Real-time stopwatch sessions & manual time entries
├── /planning/              # Daily adaptive plan generation, reordering, item states
├── /dashboard/             # High-level operational radar, critical items, today summary
├── /today/                 # Unified active session, scheduled plan, urgent radar items
├── /timeline/              # Gantt-style timeline projection and deadline markers
├── /calendar/              # Day/week calendar aggregating schedule blocks and time entries
├── /workload/              # Weekly capacity vs. remaining estimated effort calculations
├── /insights/              # Historical pace factors, accuracy metrics, category trends
├── /notifications/         # Proximity reminders, risk escalation alerts, notifications
└── /ai/                    # AI work parsing, task decomposition, and draft estimates
```

---

## 3. Authentication & Authorization

### 3.1 Request Headers
Protected endpoints require an `Authorization` header containing a valid Bearer JWT:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### 3.2 Token Claims & Lifetimes
- **Access Token**: Lifetime of 30 minutes (`ACCESS_TOKEN_EXPIRE_MINUTES`). Contains `sub` (User UUID), `email`, and `exp` (UTC timestamp).
- **Session Expiration**: Invalid or expired tokens return `HTTP 401 Unauthorized`. The frontend client must catch this and redirect to login without corrupting local state.

### 3.3 Strict Row-Level Ownership Isolation
Every entity in the database is strictly owned by `user_id`. Users can **only** query, mutate, or delete records belonging to their authenticated identity (`user_id == current_user.id`). Attempting to access another user's record returns `HTTP 404 Not Found` (to avoid leaking resource existence) or `HTTP 403 Forbidden`.

---

## 4. Standard Response Formats & Error Handling

### 4.1 Success Envelope
Standard single-resource operations return the resource object directly with appropriate HTTP status codes (`200 OK`, `201 Created`, `204 No Content`). Collections return a standard envelope:

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "page_size": 20,
  "has_more": false
}
```

### 4.2 Standard Error Envelope
All error responses (4xx, 5xx) strictly follow RFC 7807-inspired JSON structures:

```json
{
  "error": {
    "code": "WORK_ITEM_NOT_FOUND",
    "message": "Work item 'wi_9b1deb4d' does not exist or access is forbidden.",
    "details": [],
    "timestamp": "2026-09-20T10:00:00Z"
  }
}
```

### 4.3 Standard HTTP Status Codes
- `200 OK`: Request succeeded.
- `201 Created`: Resource successfully created.
- `204 No Content`: Resource successfully deleted or state updated with empty response.
- `400 Bad Request`: Malformed syntax or invalid query parameters.
- `401 Unauthorized`: Missing, invalid, or expired Bearer token.
- `403 Forbidden`: Authenticated user lacks permission.
- `404 Not Found`: Resource does not exist or user does not own it.
- `409 Conflict`: Resource conflict (e.g., email already registered, concurrent session active).
- `422 Unprocessable Entity`: Request body failed Pydantic validation rules.
- `429 Too Many Requests`: Rate limit exceeded (100 req/min for general API, 10 req/min for AI endpoints).
- `500 Internal Server Error`: Unhandled server exception.

---

## 5. Domain Endpoint Specifications

### 5.1 Authentication (`/auth`)

#### `POST /auth/register`
Creates a new user account and seeds default preferences and weekly availability.
- **Request Body**:
  ```json
  {
    "email": "student@university.edu",
    "password": "SecurePassword123!",
    "full_name": "Alex Mercer",
    "timezone": "America/New_York"
  }
  ```
- **Validation**: Email must be valid RFC 5322; password minimum 8 chars with uppercase, lowercase, and digit; timezone must be valid IANA string.
- **Response (201 Created)**:
  ```json
  {
    "user": {
      "id": "usr_7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "email": "student@university.edu",
      "full_name": "Alex Mercer",
      "timezone": "America/New_York",
      "created_at": "2026-09-20T10:00:00Z"
    },
    "tokens": {
      "access_token": "eyJhbGciOi...",
      "token_type": "bearer",
      "expires_in": 1800
    }
  }
  ```

#### `POST /auth/login`
Authenticates credentials and returns a Bearer access token.
- **Request Body**:
  ```json
  {
    "email": "student@university.edu",
    "password": "SecurePassword123!"
  }
  ```
- **Response (200 OK)**: Same schema as `tokens` object above.
- **Errors**: `401 Unauthorized` (`INVALID_CREDENTIALS`).

#### `GET /auth/me`
Fetches authenticated user identity.
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**: User profile object.

---

### 5.2 User Preferences & Protected Interests (`/users`)

#### `GET /users/me/preferences`
Retrieves working preferences, reminder offsets, and buffer multipliers.
- **Response (200 OK)**:
  ```json
  {
    "id": "pref_3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "default_working_hours_per_day": 4.0,
    "buffer_percentage": 20.0,
    "preferred_work_chunk_minutes": 90,
    "min_break_minutes": 15,
    "reminder_offsets_hours": [168, 72, 24, 6],
    "ai_assistance_enabled": true,
    "theme": "dark_editorial"
  }
  ```

#### `PATCH /users/me/preferences`
Updates working preferences.
- **Request Body**: Subset of preferences fields.
- **Response (200 OK)**: Updated preferences object.

#### `GET /users/me/interests`
Retrieves user's protected personal activities and weekly target hours.
- **Response (200 OK)**:
  ```json
  {
    "interests": [
      {
        "id": "int_1a2b3c4d",
        "name": "Gym & Strength Training",
        "category": "fitness",
        "weekly_target_hours": 6.0,
        "is_protected": true,
        "color_hex": "#E07A5F"
      },
      {
        "id": "int_2b3c4d5e",
        "name": "Personal Game Project",
        "category": "creative",
        "weekly_target_hours": 4.0,
        "is_protected": true,
        "color_hex": "#81B29A"
      }
    ]
  }
  ```

#### `POST /users/me/interests`
Creates a new protected interest.
- **Request Body**: `name`, `category`, `weekly_target_hours`, `is_protected`, `color_hex`.
- **Response (201 Created)**: Created interest object.

---

### 5.3 Time Availability & Schedule Blocks (`/availability`)

#### `GET /availability/templates`
Retrieves 7-day recurring weekly available working windows.
- **Response (200 OK)**:
  ```json
  {
    "templates": [
      {
        "id": "avail_monday",
        "day_of_week": 1,
        "start_time": "18:00:00",
        "end_time": "22:00:00",
        "is_available": true,
        "capacity_hours": 4.0
      },
      {
        "id": "avail_tuesday",
        "day_of_week": 2,
        "start_time": "19:00:00",
        "end_time": "22:00:00",
        "is_available": true,
        "capacity_hours": 3.0
      }
    ]
  }
  ```

#### `PUT /availability/templates`
Replaces user's recurring weekly availability slots (0 = Sunday, 6 = Saturday).
- **Request Body**: Array of availability template records.
- **Response (200 OK)**: Updated templates array.

#### `GET /availability/blocks`
Retrieves schedule commitment overrides and blackouts within a date range.
- **Query Params**: `start_date` (ISO UTC), `end_date` (ISO UTC)
- **Response (200 OK)**:
  ```json
  {
    "blocks": [
      {
        "id": "blk_3a4b5c",
        "title": "Gym Session",
        "block_type": "personal_interest",
        "interest_id": "int_1a2b3c4d",
        "start_time": "2026-09-23T19:00:00Z",
        "end_time": "2026-09-23T20:00:00Z",
        "is_blackout": true
      }
    ]
  }
  ```

#### `POST /availability/blocks`
Creates a one-off commitment, blackout, or protected interest block.
- **Request Body**:
  ```json
  {
    "title": "Doctor Appointment",
    "block_type": "hard_commitment",
    "interest_id": null,
    "start_time": "2026-09-24T14:00:00Z",
    "end_time": "2026-09-24T15:30:00Z",
    "is_blackout": true
  }
  ```
- **Response (201 Created)**: Created block object.

#### `DELETE /availability/blocks/{id}`
Deletes a specific schedule block.
- **Response (204 No Content)**.

---

### 5.4 Work Management (`/work`)

#### `GET /work`
Lists user's work items with multi-criteria filtering, sorting, and pagination.
- **Query Parameters**:
  - `status`: `todo`, `in_progress`, `blocked`, `completed`, `abandoned`
  - `category`: `academic`, `project`, `exam_prep`, `career`, `administrative`, `personal`
  - `risk_state`: `safe`, `watch`, `at_risk`, `critical`, `overdue`
  - `due_before`: ISO UTC timestamp
  - `sort_by`: `dynamic_priority` (default), `deadline`, `remaining_effort`, `created_at`
  - `order`: `asc` or `desc`
  - `page`: integer (default 1)
  - `page_size`: integer (default 20, max 100)
- **Response (200 OK)**:
  ```json
  {
    "items": [
      {
        "id": "wi_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "title": "Machine Learning Research Report",
        "description": "Final comparative benchmark on Transformers vs RNNs",
        "category": "academic",
        "status": "in_progress",
        "importance_weight": 1.5,
        "deadline_utc": "2026-09-25T23:59:59Z",
        "is_hard_deadline": true,
        "total_estimated_hours": 7.0,
        "remaining_estimated_hours": 4.5,
        "total_actual_hours": 2.5,
        "risk_state": "at_risk",
        "risk_ratio": 1.25,
        "dynamic_priority": 84.5,
        "priority_explanation": "4.5h remaining with only 3.6h suitable capacity before Friday deadline.",
        "units_count": 5,
        "completed_units_count": 2,
        "created_at": "2026-09-18T14:00:00Z",
        "updated_at": "2026-09-20T10:15:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "page_size": 20,
    "has_more": false
  }
  ```

#### `POST /work`
Creates a new work item. Can accept optional decomposition units directly.
- **Request Body**:
  ```json
  {
    "title": "Compiler Construction Assignment 3",
    "description": "Implement lexical analyzer and AST generation in C++",
    "category": "academic",
    "deadline_utc": "2026-09-28T22:00:00Z",
    "is_hard_deadline": true,
    "importance_weight": 1.2,
    "estimated_hours": 6.0,
    "initial_units": [
      { "title": "Write Flex regex patterns", "estimated_hours": 2.0 },
      { "title": "Implement AST node classes", "estimated_hours": 2.5 },
      { "title": "Write integration test suite", "estimated_hours": 1.5 }
    ]
  }
  ```
- **Response (201 Created)**: Created work item object with computed baseline risk and priority.

#### `GET /work/{id}`
Retrieves a single work item along with its work units, estimates, and risk telemetry.
- **Response (200 OK)**: Detailed work item object including nested `units: []`, `estimates: []`, and `active_session`.

#### `PATCH /work/{id}`
Updates work item fields (title, description, category, deadline, importance, status).
- **Request Body**: Partial work item fields.
- **Response (200 OK)**: Updated work item object with recalculated risk and priority.

#### `DELETE /work/{id}`
Deletes a work item and cascades deletion to units, estimates, and plan items (associated time entries retain reference for historical telemetry).
- **Response (204 No Content)**.

---

### 5.5 Work Units / Subtasks (`/work/{work_id}/units`)

#### `GET /work/{work_id}/units`
Lists all subtasks for a work item in sequence order.
- **Response (200 OK)**:
  ```json
  {
    "units": [
      {
        "id": "wu_11223344",
        "work_item_id": "wi_9b1deb4d",
        "title": "Data Preprocessing & Cleaning",
        "description": null,
        "sequence_order": 1,
        "is_completed": true,
        "completed_at": "2026-09-19T16:00:00Z",
        "estimated_hours": 1.5,
        "actual_hours": 2.1,
        "is_user_verified": true
      },
      {
        "id": "wu_55667788",
        "work_item_id": "wi_9b1deb4d",
        "title": "Model Training & Hyperparameter Tuning",
        "description": "Run 50 epochs over CIFAR-100",
        "sequence_order": 2,
        "is_completed": false,
        "completed_at": null,
        "estimated_hours": 3.0,
        "actual_hours": 0.4,
        "is_user_verified": false
      }
    ]
  }
  ```

#### `POST /work/{work_id}/units`
Adds a new work unit to an existing work item.
- **Request Body**: `title`, `description`, `sequence_order`, `estimated_hours`.
- **Response (201 Created)**: Created work unit.

#### `PATCH /work/{work_id}/units/{unit_id}`
Updates work unit fields, toggles completion, or modifies estimated hours.
- **Request Body**:
  ```json
  {
    "is_completed": true,
    "actual_hours": 2.2
  }
  ```
- **Response (200 OK)**: Updated unit with recalculation of parent work item remaining effort and risk.

#### `PUT /work/{work_id}/units/reorder`
Reorders work units in a single atomic transaction.
- **Request Body**:
  ```json
  {
    "unit_orders": [
      { "unit_id": "wu_55667788", "sequence_order": 1 },
      { "unit_id": "wu_11223344", "sequence_order": 2 }
    ]
  }
  ```
- **Response (200 OK)**: List of reordered units.

---

### 5.6 Time Tracking & Sessions (`/tracking`)

#### `POST /tracking/sessions/start`
Starts a real-time stopwatch work session for a work item and optional work unit.
- **Request Body**:
  ```json
  {
    "work_item_id": "wi_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "work_unit_id": "wu_55667788",
    "notes": "Tuning learning rate on baseline model"
  }
  ```
- **Validation**: Enforces only one active session per user. If a session is already active, returns `409 Conflict` (`ACTIVE_SESSION_EXISTS`).
- **Response (201 Created)**:
  ```json
  {
    "session": {
      "id": "sess_8a7b6c5d",
      "work_item_id": "wi_9b1deb4d",
      "work_unit_id": "wu_55667788",
      "started_at": "2026-09-20T10:30:00Z",
      "is_active": true
    }
  }
  ```

#### `GET /tracking/sessions/active`
Retrieves currently active session if any, or null.
- **Response (200 OK)**: Active session object or `null`.

#### `POST /tracking/sessions/stop`
Stops the active stopwatch, computes duration, records a completed `TimeEntry`, and triggers background pace factor re-estimation.
- **Request Body**:
  ```json
  {
    "notes": "Completed initial 3 runs. Learning rate adjusted to 1e-4."
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "time_entry": {
      "id": "te_4d3c2b1a",
      "work_item_id": "wi_9b1deb4d",
      "work_unit_id": "wu_55667788",
      "start_time": "2026-09-20T10:30:00Z",
      "end_time": "2026-09-20T11:45:00Z",
      "duration_minutes": 75,
      "source": "stopwatch"
    },
    "work_item_remaining_hours": 3.75,
    "pace_factor_updated": true
  }
  ```

#### `POST /tracking/entries`
Manually logs completed work time (for offline or retroactive work).
- **Request Body**:
  ```json
  {
    "work_item_id": "wi_9b1deb4d",
    "work_unit_id": "wu_11223344",
    "start_time": "2026-09-19T14:00:00Z",
    "end_time": "2026-09-19T15:30:00Z",
    "duration_minutes": 90,
    "notes": "Offline reading of literature review"
  }
  ```
- **Response (201 Created)**: Created `TimeEntry` record.

#### `GET /tracking/entries`
Lists historical time entries with date range and work item filters.
- **Query Params**: `work_item_id`, `start_date`, `end_date`, `page`, `page_size`.
- **Response (200 OK)**: Paginated array of time entries.

---

### 5.7 Daily Planning & Today Execution (`/planning` & `/today`)

#### `POST /planning/generate`
Deterministic, capacity-aware daily plan generator. Allocates today's available capacity to highest-priority work items and work units while protecting personal interests.
- **Request Body**:
  ```json
  {
    "target_date": "2026-09-20",
    "max_hours": 4.0,
    "include_interests": true
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "plan": {
      "id": "plan_99887766",
      "plan_date": "2026-09-20",
      "total_planned_minutes": 240,
      "total_completed_minutes": 75,
      "is_finalized": false,
      "items": [
        {
          "id": "pi_1111",
          "work_item_id": "wi_9b1deb4d",
          "work_unit_id": "wu_55667788",
          "title": "Machine Learning Research Report — Model Training",
          "planned_start": "2026-09-20T10:30:00Z",
          "planned_end": "2026-09-20T12:00:00Z",
          "duration_minutes": 90,
          "sequence_order": 1,
          "status": "in_progress"
        },
        {
          "id": "pi_2222",
          "work_item_id": "wi_33445566",
          "work_unit_id": null,
          "title": "Database Schema Optimization",
          "planned_start": "2026-09-20T14:00:00Z",
          "planned_end": "2026-09-20T15:30:00Z",
          "duration_minutes": 90,
          "sequence_order": 2,
          "status": "pending"
        },
        {
          "id": "pi_3333",
          "work_item_id": null,
          "work_unit_id": null,
          "title": "Gym — Strength Training (Protected Interest)",
          "planned_start": "2026-09-20T19:00:00Z",
          "planned_end": "2026-09-20T20:00:00Z",
          "duration_minutes": 60,
          "sequence_order": 3,
          "status": "pending"
        }
      ]
    }
  }
  ```

#### `GET /today/overview`
Aggregates everything the user needs for today's operational command center.
- **Response (200 OK)**:
  ```json
  {
    "date": "2026-09-20",
    "active_session": {
      "session_id": "sess_8a7b6c5d",
      "work_item_id": "wi_9b1deb4d",
      "work_item_title": "Machine Learning Research Report",
      "work_unit_title": "Model Training & Hyperparameter Tuning",
      "started_at": "2026-09-20T10:30:00Z",
      "elapsed_seconds": 2430
    },
    "now_recommendation": {
      "work_item_id": "wi_9b1deb4d",
      "title": "Model Training & Hyperparameter Tuning",
      "duration_minutes": 90,
      "reason": "Highest risk ratio (1.25) due in 5 days with competing workload."
    },
    "next_recommendation": {
      "work_item_id": "wi_33445566",
      "title": "Database Schema Optimization",
      "duration_minutes": 90,
      "planned_start": "2026-09-20T14:00:00Z"
    },
    "urgent_deadlines_count": 2,
    "day_capacity_hours": 4.0,
    "day_allocated_hours": 3.0,
    "today_plan_items": [ ... ]
  }
  ```

#### `PATCH /planning/items/{item_id}`
Updates state of a plan item (`pending`, `in_progress`, `completed`, `dismissed`, `rescheduled`).
- **Request Body**: `status`, `notes`.
- **Response (200 OK)**: Updated plan item.

---

### 5.8 Operational Radar & Timeline (`/dashboard`, `/timeline`, `/workload`)

#### `GET /dashboard/summary`
Main operational radar metrics: risk counts, urgent countdowns, workload pressure.
- **Response (200 OK)**:
  ```json
  {
    "risk_counts": {
      "safe": 4,
      "watch": 2,
      "at_risk": 1,
      "critical": 1,
      "overdue": 0
    },
    "critical_items": [
      {
        "id": "wi_critical_1",
        "title": "Operating Systems Lab 2",
        "deadline_utc": "2026-09-21T18:00:00Z",
        "remaining_estimated_hours": 4.0,
        "available_hours_before_deadline": 2.5,
        "risk_state": "critical",
        "risk_ratio": 1.6
      }
    ],
    "week_workload_hours": 24.5,
    "week_capacity_hours": 20.0,
    "capacity_status": "overloaded"
  }
  ```

#### `GET /timeline/projection`
Returns timeline projections for all active work items mapped against user's actual calendar capacity.
- **Query Params**: `start_date`, `days` (default 14, max 60)
- **Response (200 OK)**:
  ```json
  {
    "timeline_window": {
      "start_date": "2026-09-20T00:00:00Z",
      "end_date": "2026-10-04T00:00:00Z"
    },
    "items": [
      {
        "work_item_id": "wi_9b1deb4d",
        "title": "Machine Learning Research Report",
        "category": "academic",
        "risk_state": "at_risk",
        "deadline_utc": "2026-09-25T23:59:59Z",
        "remaining_estimated_hours": 4.5,
        "projected_completion_utc": "2026-09-26T12:00:00Z",
        "is_projected_late": true,
        "allocated_slots": [
          { "date": "2026-09-20", "hours": 1.5 },
          { "date": "2026-09-21", "hours": 2.0 },
          { "date": "2026-09-23", "hours": 1.0 }
        ]
      }
    ]
  }
  ```

#### `GET /workload/capacity`
Aggregates capacity vs demand grouped by day or week.
- **Query Params**: `view` (`day` or `week`), `start_date`, `end_date`.
- **Response (200 OK)**:
  ```json
  {
    "periods": [
      {
        "date_label": "2026-09-20",
        "day_of_week": "Sunday",
        "capacity_hours": 4.0,
        "demand_hours": 5.5,
        "utilization_percentage": 137.5,
        "is_overloaded": true
      }
    ]
  }
  ```

---

### 5.9 AI Intelligence Services (`/ai`)

#### `POST /ai/decompose`
Decomposes unstructured work description into logical, actionable subtasks with baseline effort estimates.
- **Request Body**:
  ```json
  {
    "title": "Finish Machine Learning Research Report",
    "description": "Comparative benchmark of Transformers vs RNNs on time-series data with ablation study and 10-page IEEE conference paper.",
    "category": "academic",
    "target_deadline": "2026-09-25T23:59:59Z"
  }
  ```
- **Validation**: Title required (min 3 chars). Rate limited to 10 req/minute per user.
- **Response (200 OK)**:
  ```json
  {
    "suggested_category": "academic",
    "total_estimated_hours": 8.0,
    "confidence_score": 0.82,
    "reasoning_summary": "Estimated based on empirical complexity of empirical evaluation and report writeup.",
    "suggested_units": [
      {
        "sequence_order": 1,
        "title": "Dataset Preprocessing & Validation",
        "description": "Clean raw time-series records, construct train/val/test splits",
        "estimated_hours": 1.5
      },
      {
        "sequence_order": 2,
        "title": "Model Training & Hyperparameter Tuning",
        "description": "Train Transformer and LSTM benchmarks across learning rates",
        "estimated_hours": 3.0
      },
      {
        "sequence_order": 3,
        "title": "Evaluation & Ablation Experiments",
        "description": "Compute RMSE and latency metrics, plot comparative graphs",
        "estimated_hours": 1.5
      },
      {
        "sequence_order": 4,
        "title": "Draft IEEE Format Report",
        "description": "Write Methodology, Results, and Conclusion sections",
        "estimated_hours": 2.0
      }
    ],
    "detected_missing_information": [
      "No dataset size specified; assumed moderate benchmark dataset (< 100k samples)."
    ]
  }
  ```
- **Error Fallback**: If AI provider fails, returns `HTTP 200` with `confidence_score: 0.0` and fallback single unit with empty subtasks, permitting seamless manual completion.

#### `POST /ai/estimate-effort`
Provides single-task effort estimation with user pace factor adjustments.
- **Request Body**:
  ```json
  {
    "title": "Review Compiler Lab Flex rules",
    "category": "academic",
    "description": null
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "baseline_estimated_hours": 2.0,
    "user_pace_factor": 1.25,
    "adjusted_estimated_hours": 2.5,
    "confidence_score": 0.78,
    "explanation": "Standard 2h task adjusted upward by user's historical 1.25x pace on academic tasks."
  }
  ```

---

### 5.10 Personal Insights & Pace Telemetry (`/insights`)

#### `GET /insights/summary`
Returns user's empirical pace factors across work categories and estimation accuracy metrics.
- **Response (200 OK)**:
  ```json
  {
    "overall_pace_factor": 1.18,
    "total_hours_logged": 42.5,
    "total_hours_predicted": 36.0,
    "estimation_bias": "underestimating",
    "category_pace_factors": [
      {
        "category": "academic",
        "pace_factor": 1.25,
        "sample_count": 8,
        "confidence": 0.85
      },
      {
        "category": "project",
        "pace_factor": 1.10,
        "sample_count": 5,
        "confidence": 0.72
      },
      {
        "category": "exam_prep",
        "pace_factor": 0.95,
        "sample_count": 3,
        "confidence": 0.60
      }
    ],
    "accuracy_trend": [
      { "week": "2026-W36", "mean_absolute_error_hours": 1.4 },
      { "week": "2026-W37", "mean_absolute_error_hours": 0.8 }
    ]
  }
  ```

---

### 5.11 Notifications (`/notifications`)

#### `GET /notifications`
Retrieves user notifications with unread counts.
- **Query Params**: `status` (`all`, `unread`, `read`), `page`, `page_size`.
- **Response (200 OK)**:
  ```json
  {
    "unread_count": 2,
    "items": [
      {
        "id": "notif_987654",
        "work_item_id": "wi_critical_1",
        "title": "Deadline Risk Escalation",
        "message": "Operating Systems Lab 2 is now CRITICAL. 4h remaining with only 2.5h suitable capacity before tomorrow 18:00.",
        "notification_type": "risk_escalation",
        "urgency_level": "critical",
        "is_read": false,
        "created_at": "2026-09-20T08:00:00Z"
      }
    ]
  }
  ```

#### `PATCH /notifications/{id}/read`
Marks a specific notification as read.
- **Response (200 OK)**.

#### `POST /notifications/read-all`
Marks all user notifications as read in a single atomic operation.
- **Response (200 OK)**: `{ "marked_count": 2 }`.

---

## 6. Rate Limiting & Security Headers

1. **Rate Limiting**:
   - General API endpoints: `100 requests per minute` per authenticated user IP / user ID.
   - AI endpoints (`/ai/decompose`, `/ai/estimate-effort`): `10 requests per minute` per user.
   - Limit exceeded triggers `HTTP 429 Too Many Requests` with `Retry-After: <seconds>` header.
2. **Security Headers**:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
   - `Content-Security-Policy: default-src 'self'`
