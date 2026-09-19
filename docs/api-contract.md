# Deadline Radar — API Contract

## 1. Overview

This document serves as the **authoritative, implementation-ready contract** governing all HTTP communication between the Frontend Client and the FastAPI Backend for **Deadline Radar**. Both frontend and backend engineers (and AI coding agents) must adhere strictly to the endpoints, schemas, headers, status codes, and error formats defined herein.

- **Protocol**: RESTful JSON over HTTPS (TLS 1.3)
- **Base URL (Development)**: `http://localhost:8000/api/v1`
- **Base URL (Production)**: `https://api.deadlineradar.com/api/v1` (`TODO — DEPLOYMENT DECISION`)
- **Default Media Type**: `application/json; charset=utf-8`
- **Date & Time Standard**: ISO 8601 UTC strings (`YYYY-MM-DDTHH:MM:SSZ`)

---

## 2. Base URL & Resource Organization

All core API endpoints are prefixed with the version namespace `/api/v1`:

```text
/api/v1/
├── /auth/               # Account registration, login, logout, token verification
├── /users/              # Current user profile and personalized preferences
├── /opportunities/      # Public opportunity discovery catalog, details, creation
├── /radar/              # Personal opportunity tracking lifecycle & private notes
├── /dashboard/          # Urgency aggregation, countdowns, and calendar views
├── /notifications/      # Proximity reminders, unread counts, read acknowledgments
├── /ai/                 # AI-assisted unstructured parsing and extraction
└── /internal/           # Secured administrative & worker triggers
```

---

## 3. Versioning

- **URI Versioning**: The API version is encoded in the URI path (`/api/v1/`).
- **Backward Compatibility Policy**:
  - Non-breaking changes (adding optional request fields, adding new response fields) will occur within `/api/v1/`.
  - Breaking changes (renaming fields, removing endpoints, changing required validation rules) will mandate a new major version path (`/api/v2/`).

---

## 4. Authentication

Deadline Radar utilizes stateless **JSON Web Tokens (JWT)**:

### 4.1 Request Headers
Protected endpoints require the `Authorization` header with a valid Bearer token:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### 4.2 Token Semantics
- **Access Token**: Short-lived (30 minutes) containing claims:
  - `sub`: User UUID string (e.g., `"usr_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"`)
  - `email`: User login email
  - `exp`: Expiration timestamp in UTC seconds
- **Session Expiration**: Expired or invalid tokens return `HTTP 401 Unauthorized`. The client must catch this and redirect to login without corrupting local state.

---

## 5. Authorization

Access boundaries are enforced at the service/repository layer using strict row-level isolation:

| Scope | Access Level | Description |
| :--- | :--- | :--- |
| **Public** | Unauthenticated | Catalog listing, opportunity details, category taxonomies, system health. |
| **Authenticated User** | Bearer Token Required | Personal radar, notes, application tracking, dashboard metrics, notifications, user preferences, AI extraction. |
| **User Resource Isolation** | Strict Row Ownership | Users can **only** view, mutate, or delete their own tracking records, notes, and notifications (`user_id == current_user.id`). Attempting to access another user's resources returns `HTTP 404 Not Found` or `HTTP 403 Forbidden`. |
| **Internal Service** | `X-Internal-Token` Header | Internal ingestion runs and notification worker sweeps. |

---

## 6. Common Request Rules

1. **Content-Type**: Requests with a body (`POST`, `PUT`, `PATCH`) must specify `Content-Type: application/json`.
2. **Strict Payload Validation**: Payloads are validated against Pydantic v2 schemas. Extraneous or malformed fields trigger `HTTP 422 Unprocessable Entity`.
3. **Strings & Whitespace**: Leading and trailing whitespaces are automatically trimmed from user string inputs.
4. **URL Validation**: All URL fields (`application_url`, `website_url`) must be valid HTTP/HTTPS URLs (max 2048 characters).

---

## 7. Common Response Rules

1. **JSON Standard**: All responses return valid UTF-8 JSON.
2. **Consistent Field Naming**: All JSON keys utilize `snake_case` (e.g., `application_url`, `time_remaining_seconds`).
3. **Empty Collections**: When zero records match a query, the API returns an empty array `[]` with `HTTP 200 OK`, never `null` or a 404 error.
4. **Timestamps**: All timestamps are formatted as ISO 8601 UTC strings with a trailing `Z` (e.g., `"2026-04-15T23:59:59Z"`).

---

## 8. Error Format

All non-2xx error responses adhere strictly to this standardized JSON envelope:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request payload. Please correct the highlighted fields.",
    "details": [
      {
        "field": "deadline",
        "issue": "Deadline must be a valid future ISO 8601 UTC timestamp."
      }
    ]
  }
}
```

### Standard Error Codes
| Error Code | HTTP Status | Description |
| :--- | :---: | :--- |
| `UNAUTHORIZED` | 401 | Missing, malformed, or expired JWT access token. |
| `FORBIDDEN` | 403 | Authenticated user lacks permission to access or mutate the resource. |
| `RESOURCE_NOT_FOUND` | 404 | Target entity does not exist or does not belong to the user. |
| `VALIDATION_ERROR` | 422 | Field-level validation failed (Pydantic schema violation). |
| `CONFLICT` | 409 | Duplicate unique constraint violation (e.g. email or canonical URL exists). |
| `RATE_LIMIT_EXCEEDED`| 429 | Request threshold exceeded; client must back off. |
| `AI_SERVICE_UNAVAILABLE`| 503 | AI model provider timed out or returned unparseable output. |
| `INTERNAL_SERVER_ERROR`| 500 | Unhandled server exception. |

---

## 9. Pagination

Listing endpoints (`GET /opportunities`, `GET /radar`, `GET /notifications`) implement offset-based pagination:

### Query Parameters
- `page` (integer, optional, default: `1`, minimum: `1`): The 1-indexed page number.
- `limit` (integer, optional, default: `20`, minimum: `1`, maximum: `100`): Number of items per page.

### Response Envelope
```json
{
  "items": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_items": 142,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

---

## 10. Filtering

Supported query parameters across catalog listing:
- `category` (string, optional): Domain taxonomy slug (e.g. `hackathon`, `internship`, `scholarship`).
- `mode` (string, optional): Delivery format (`online`, `in_person`, `hybrid`).
- `is_free` (boolean, optional): `true` filters opportunities where `cost == 0.00`.
- `cost_max` (numeric, optional): Maximum registration fee in USD.
- `deadline_from` (ISO 8601 UTC string, optional): Earliest deadline cutoff.
- `deadline_to` (ISO 8601 UTC string, optional): Latest deadline cutoff.
- `status` (string, optional): Global status (`open`, `closing_soon`, `expired`). Defaults to `open,closing_soon`.
- `organization_id` (UUID, optional): Filter opportunities hosted by a specific organization.
- `tag` (string, optional): Filter by keyword tag (e.g. `ai`, `python`).

---

## 11. Sorting

- `sort_by` (string, optional): Attribute to sort by. Options:
  - `deadline` (Default for catalog and urgent views)
  - `created_at` (Recently added listings)
  - `title` (Alphabetical)
- `sort_order` (string, optional):
  - `asc` (Default for `deadline`: earliest closing date first)
  - `desc` (Default for `created_at`: newest additions first)

---

## 12. Date & Time

- **Universal UTC Transport**: All date-time fields transmitted over the API must be ISO 8601 UTC strings terminating in `Z` (`YYYY-MM-DDTHH:MM:SSZ`).
- **Timezone Provenance**: Opportunity payloads return both the UTC `deadline` and the original host timezone string (`deadline_timezone`, e.g. `'EST'`, `'AoE'`).
- **Inferred Time Indicator**: `is_deadline_time_inferred: true` indicates the announcement specified only a calendar day, with time defaulted to 23:59:59.
- **Client Localization**: The frontend client is responsible for rendering UTC timestamps into the user's localized time (e.g., using `Intl.DateTimeFormat` and user preferences).

---

## 13. Endpoints

### 13.1 Authentication (`/auth`)

#### `POST /auth/register`
Create a new user account and receive an authenticated session token.
- **Authorization**: Public
- **Request Body**:
```json
{
  "email": "student@university.edu",
  "password": "SecurePassword123!",
  "full_name": "Aarav Sharma"
}
```
- **Response `201 Created`**:
```json
{
  "user": {
    "id": "usr_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "email": "student@university.edu",
    "full_name": "Aarav Sharma",
    "created_at": "2026-03-31T12:05:00Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```
- **Errors**: `400 Bad Request` (password complexity), `409 Conflict` (email already registered), `422 Unprocessable Entity`.

---

#### `POST /auth/login`
Authenticate with email and password.
- **Authorization**: Public
- **Request Body**:
```json
{
  "email": "student@university.edu",
  "password": "SecurePassword123!"
}
```
- **Response `200 OK`**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "usr_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "email": "student@university.edu",
    "full_name": "Aarav Sharma"
  }
}
```
- **Errors**: `401 Unauthorized` (invalid email or password), `422 Unprocessable Entity`.

---

#### `POST /auth/logout`
Terminates the user session.
- **Authorization**: Authenticated User
- **Response `204 No Content`**

---

### 13.2 Users & Preferences (`/users`)

#### `GET /users/me`
Retrieve the authenticated user's profile.
- **Authorization**: Authenticated User
- **Response `200 OK`**:
```json
{
  "id": "usr_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "email": "student@university.edu",
  "full_name": "Aarav Sharma",
  "created_at": "2026-03-31T12:05:00Z",
  "updated_at": "2026-03-31T12:05:00Z"
}
```

---

#### `PATCH /users/me`
Update profile information (e.g. full name).
- **Authorization**: Authenticated User
- **Request Body**:
```json
{
  "full_name": "Aarav K. Sharma"
}
```
- **Response `200 OK`**: Updated user profile object.

---

#### `GET /users/me/preferences`
Retrieve user notification preferences and discovery feed filter preferences.
- **Authorization**: Authenticated User
- **Response `200 OK`**:
```json
{
  "preferred_categories": ["hackathon", "internship"],
  "preferred_mode": "online",
  "timezone": "Asia/Kolkata",
  "remind_7_days": true,
  "remind_3_days": true,
  "remind_1_day": true,
  "remind_day_of": true,
  "email_alerts": false,
  "updated_at": "2026-03-31T12:10:00Z"
}
```

---

#### `PATCH /users/me/preferences`
Update user notification and filter preferences.
- **Authorization**: Authenticated User
- **Request Body**:
```json
{
  "preferred_categories": ["hackathon", "internship", "fellowship"],
  "timezone": "America/New_York",
  "remind_7_days": false
}
```
- **Response `200 OK`**: Updated preferences object.

---

### 13.3 Opportunities (`/opportunities`)

#### `GET /opportunities`
List, search, and filter opportunities in the public catalog.
- **Authorization**: Public (Optionally authenticated: includes user tracking status if Bearer token present)
- **Query Parameters**: See Section 10 (Filtering) and Section 9 (Pagination).
  - `search` (string, optional): Free-text query.
- **Response `200 OK`**:
```json
{
  "items": [
    {
      "id": "opp_1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
      "title": "Global AI Hackathon 2026",
      "organization": {
        "id": "org_8f7e6d5c-4b3a-2109-8765-4321fedcba98",
        "name": "Devpost & OpenAI",
        "slug": "devpost-openai",
        "logo_url": "https://cdn.deadlineradar.com/logos/devpost.png"
      },
      "category": "hackathon",
      "description": "Build innovative autonomous agents using state-of-the-art LLMs.",
      "deadline": "2026-04-15T23:59:59Z",
      "deadline_timezone": "EST",
      "is_deadline_time_inferred": false,
      "is_rolling": false,
      "start_date": "2026-04-18T09:00:00Z",
      "end_date": "2026-04-20T18:00:00Z",
      "eligibility": "Enrolled undergraduate and graduate students globally.",
      "location": "Remote",
      "mode": "online",
      "cost": 0.00,
      "application_url": "https://globalai.devpost.com",
      "tags": ["ai", "hackathon", "python"],
      "status": "open",
      "summary": "Premier 48-hour student hackathon with $25k in prizes for agentic AI projects.",
      "user_status": "saved",
      "created_at": "2026-03-30T10:00:00Z",
      "updated_at": "2026-03-30T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_items": 1,
    "total_pages": 1,
    "has_next": false,
    "has_prev": false
  }
}
```

---

#### `GET /opportunities/{id}`
Retrieve complete profile details for a single opportunity.
- **Authorization**: Public (Optionally authenticated: includes user tracking details and personal notes)
- **Response `200 OK`**:
```json
{
  "id": "opp_1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
  "title": "Global AI Hackathon 2026",
  "organization": {
    "id": "org_8f7e6d5c-4b3a-2109-8765-4321fedcba98",
    "name": "Devpost & OpenAI",
    "slug": "devpost-openai",
    "website_url": "https://devpost.com",
    "logo_url": "https://cdn.deadlineradar.com/logos/devpost.png"
  },
  "category": "hackathon",
  "description": "Full markdown description containing rules, tracks, prizes, and submission guidelines.",
  "deadline": "2026-04-15T23:59:59Z",
  "deadline_timezone": "EST",
  "is_deadline_time_inferred": false,
  "is_rolling": false,
  "start_date": "2026-04-18T09:00:00Z",
  "end_date": "2026-04-20T18:00:00Z",
  "eligibility": "Enrolled undergraduate and graduate students globally.",
  "location": "Remote",
  "mode": "online",
  "cost": 0.00,
  "application_url": "https://globalai.devpost.com",
  "canonical_url": "https://globalai.devpost.com",
  "tags": ["ai", "hackathon", "python"],
  "status": "open",
  "summary": "Premier 48-hour student hackathon with $25k in prizes for agentic AI projects.",
  "ai_eligibility_bullets": [
    "Must be 18+ years of age",
    "Teams of up to 4 members allowed",
    "Submission must include public GitHub repo and demo video"
  ],
  "user_tracking": {
    "status": "saved",
    "personal_notes": "Ask Rahul and Sneha to team up.",
    "applied_at": null,
    "updated_at": "2026-03-31T14:00:00Z"
  },
  "created_at": "2026-03-30T10:00:00Z",
  "updated_at": "2026-03-30T10:00:00Z"
}
```
- **Errors**: `404 Not Found`.

---

#### `POST /opportunities`
Create an opportunity manually or confirm an AI-extracted draft.
- **Authorization**: Authenticated User
- **Request Body**:
```json
{
  "title": "Summer Robotics Fellowship 2026",
  "organization_name": "RoboTech Labs",
  "category": "fellowship",
  "description": "10-week summer research residency in autonomous manipulation.",
  "deadline": "2026-04-20T17:00:00Z",
  "deadline_timezone": "PST",
  "is_rolling": false,
  "start_date": "2026-06-01T09:00:00Z",
  "end_date": "2026-08-10T17:00:00Z",
  "eligibility": "Undergraduate seniors or graduate students in CS/EE.",
  "location": "San Francisco, CA",
  "mode": "in_person",
  "cost": 0.00,
  "application_url": "https://robotech.example.com/apply",
  "tags": ["robotics", "fellowship", "ai"],
  "summary": "10-week funded summer fellowship in San Francisco for robotics research."
}
```
- **Response `201 Created`**: Returns created Opportunity object.
- **Errors**: `409 Conflict` (duplicate canonical URL), `422 Unprocessable Entity`.

---

#### `PATCH /opportunities/{id}`
Update an existing opportunity (restricted to creator or admin).
- **Authorization**: Authenticated Creator / Admin
- **Request Body**: Partial opportunity fields.
- **Response `200 OK`**: Returns updated Opportunity object.

---

### 13.4 Personal Radar & Lifecycle Tracking (`/radar`)

#### `GET /radar`
Fetch all opportunities tracked by the authenticated user across their application lifecycle.
- **Authorization**: Authenticated User
- **Query Parameters**:
  - `status` (string, optional): Filter by user tracking status (`saved`, `interested`, `applying`, `applied`, `selected`, `rejected`, `completed`, `archived`).
  - `urgency` (string, optional): Filter by urgency tier (`<24h`, `<3d`, `<7d`, `overdue`).
  - `page` (integer, default: `1`).
  - `limit` (integer, default: `20`).
- **Response `200 OK`**:
```json
{
  "items": [
    {
      "tracking_id": "trk_5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d",
      "status": "applying",
      "applied_at": null,
      "personal_notes": "Drafting 500-word personal statement. Professor recommendation requested.",
      "updated_at": "2026-03-31T09:30:00Z",
      "opportunity": {
        "id": "opp_1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
        "title": "Global AI Hackathon 2026",
        "organization_name": "Devpost & OpenAI",
        "category": "hackathon",
        "deadline": "2026-04-15T23:59:59Z",
        "time_remaining_seconds": 1332000,
        "mode": "online",
        "cost": 0.00,
        "application_url": "https://globalai.devpost.com"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_items": 1,
    "total_pages": 1,
    "has_next": false,
    "has_prev": false
  }
}
```

---

#### `POST /radar`
Save or start tracking an opportunity on personal radar.
- **Authorization**: Authenticated User
- **Idempotency Rule**: If the opportunity is already tracked by this user, the API is idempotent: it returns `200 OK` with the existing tracking record rather than a 409 Conflict. If new notes or status are provided, it updates them.
- **Request Body**:
```json
{
  "opportunity_id": "opp_1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
  "status": "saved",
  "personal_notes": "Review submission tracks."
}
```
- **Response `201 Created`** (or `200 OK` if already exists):
```json
{
  "tracking_id": "trk_5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d",
  "opportunity_id": "opp_1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
  "status": "saved",
  "applied_at": null,
  "personal_notes": "Review submission tracks.",
  "created_at": "2026-03-31T14:30:00Z",
  "updated_at": "2026-03-31T14:30:00Z"
}
```
- **Errors**: `404 Not Found` (invalid opportunity ID), `422 Unprocessable Entity`.

---

#### `PATCH /radar/{opportunity_id}`
Update application lifecycle status, record application submission, or update private notes.
- **Authorization**: Authenticated User
- **Lifecycle Transition Rules**:
  - Valid statuses: `saved`, `interested`, `applying`, `applied`, `selected`, `rejected`, `completed`, `archived`.
  - When status transitions to `applied`: The backend automatically sets `applied_at = NOW()` and suppresses future pending proximity reminders.
- **Request Body**:
```json
{
  "status": "applied",
  "personal_notes": "Submitted application via Devpost on April 1. Confirmation #9823."
}
```
- **Response `200 OK`**: Returns updated tracking object.
- **Errors**: `400 Bad Request` (invalid status enum), `404 Not Found`.

---

#### `DELETE /radar/{opportunity_id}`
Remove an opportunity from the user's personal radar (deletes tracking record, private notes, and pending reminders).
- **Authorization**: Authenticated User
- **Response `204 No Content`**
- **Errors**: `404 Not Found`.

---

### 13.5 Dashboard (`/dashboard`)

#### `GET /dashboard/overview`
Aggregated dashboard endpoint powering urgency tiers, counts, and active pipeline cards in a single, low-latency call.
- **Authorization**: Authenticated User
- **Response `200 OK`**:
```json
{
  "counts": {
    "total_tracked": 8,
    "urgent_24h": 1,
    "urgent_3d": 2,
    "urgent_7d": 4,
    "overdue": 1,
    "active_applications": 3
  },
  "urgent_radar": [
    {
      "opportunity_id": "opp_1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
      "title": "Global AI Hackathon 2026",
      "organization_name": "Devpost & OpenAI",
      "category": "hackathon",
      "deadline": "2026-04-01T18:00:00Z",
      "time_remaining_seconds": 21600,
      "urgency_tier": "urgent_24h",
      "status": "applying",
      "application_url": "https://globalai.devpost.com"
    }
  ],
  "active_applications": [
    {
      "opportunity_id": "opp_2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
      "title": "Google Summer Internship 2026",
      "organization_name": "Google",
      "status": "applied",
      "applied_at": "2026-03-25T11:00:00Z",
      "application_url": "https://careers.google.com"
    }
  ],
  "overdue_reconciliation": [
    {
      "opportunity_id": "opp_3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f",
      "title": "Spring Code Jam",
      "organization_name": "Codeforces",
      "deadline": "2026-03-30T23:59:59Z",
      "status": "saved",
      "prompt": "Deadline passed yesterday. Did you apply?"
    }
  ]
}
```

---

#### `GET /dashboard/calendar`
Returns opportunities grouped by deadline date for rendering monthly or weekly grid calendars.
- **Authorization**: Authenticated User
- **Query Parameters**:
  - `start_date` (ISO date string, e.g. `2026-04-01`, required): Start of window.
  - `end_date` (ISO date string, e.g. `2026-04-30`, required): End of window.
- **Response `200 OK`**:
```json
{
  "events": [
    {
      "date": "2026-04-15",
      "items": [
        {
          "opportunity_id": "opp_1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
          "title": "Global AI Hackathon 2026",
          "category": "hackathon",
          "deadline": "2026-04-15T23:59:59Z",
          "status": "applying",
          "is_rolling": false
        }
      ]
    }
  ],
  "rolling_opportunities": [
    {
      "opportunity_id": "opp_4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a",
      "title": "Open Source Fellowship (Rolling)",
      "category": "fellowship",
      "status": "saved"
    }
  ]
}
```

---

### 13.6 Notifications (`/notifications`)

#### `GET /notifications`
List recent notifications for the authenticated user.
- **Authorization**: Authenticated User
- **Query Parameters**: `page` (default: 1), `limit` (default: 20).
- **Response `200 OK`**:
```json
{
  "items": [
    {
      "id": "notif_98765432-1a2b-3c4d-5e6f-7a8b9c0d1e2f",
      "opportunity_id": "opp_1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
      "type": "1_day",
      "title": "Deadline in 24 Hours",
      "message": "Global AI Hackathon 2026 closes tomorrow at 11:59 PM UTC. Complete your submission!",
      "is_read": false,
      "scheduled_for": "2026-04-14T23:59:59Z",
      "created_at": "2026-04-14T23:59:59Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_items": 1,
    "total_pages": 1,
    "has_next": false,
    "has_prev": false
  }
}
```

---

#### `GET /notifications/unread-count`
Fast, lightweight endpoint for live navbar badge counters.
- **Authorization**: Authenticated User
- **Response `200 OK`**:
```json
{
  "unread_count": 3
}
```

---

#### `PATCH /notifications/{id}/read`
Mark a single notification as read.
- **Authorization**: Authenticated User
- **Idempotency Rule**: Idempotent. Subsequent calls return `200 OK`.
- **Response `200 OK`**:
```json
{
  "id": "notif_98765432-1a2b-3c4d-5e6f-7a8b9c0d1e2f",
  "is_read": true
}
```

---

#### `POST /notifications/read-all`
Mark all unread notifications as read.
- **Authorization**: Authenticated User
- **Response `200 OK`**:
```json
{
  "success": true,
  "marked_count": 3
}
```

---

### 13.7 AI Intelligence (`/ai`)

#### `POST /ai/extract`
Parse raw unstructured announcement text or a webpage URL into a structured opportunity draft.
- **Authorization**: Authenticated User
- **Rate Limit**: 15 requests / minute
- **Request Body**:
```json
{
  "raw_text": "Join the Devpost AI Spring Sprint! Submissions close April 25, 2026 at 11:59pm EST. Open to college students globally. Cash prizes up to $10,000. Apply at https://springsprint.example.com",
  "url": null
}
```
- **Response `200 OK`**:
```json
{
  "draft": {
    "title": "Devpost AI Spring Sprint",
    "organization_name": "Devpost",
    "category": "hackathon",
    "deadline": "2026-04-26T03:59:00Z",
    "deadline_timezone": "EST",
    "is_deadline_time_inferred": false,
    "is_rolling": false,
    "start_date": null,
    "end_date": null,
    "eligibility": "Open to college students globally.",
    "location": "Remote",
    "mode": "online",
    "cost": 0.00,
    "application_url": "https://springsprint.example.com",
    "tags": ["ai", "hackathon", "student"],
    "summary": "AI sprint offering $10,000 in cash prizes for global college students.",
    "confidence_score": 0.95
  },
  "is_duplicate": false,
  "existing_opportunity_id": null,
  "warnings": []
}
```
- **Defensive Error Behavior**: If LLM parsing fails or times out (>6.0s), the API returns `200 OK` with `draft: null`, `warnings: ["AI extraction timed out. Please enter details manually."]`, allowing the client to pre-fill the manual creation form with `raw_text` without blocking the user.

---

### 13.8 Internal Services (`/internal`)

These endpoints are strictly for scheduled worker loops and system maintenance. They are **not** exposed to regular client traffic.

#### `POST /internal/ingestion/sync`
Trigger external feed ingestion adapters.
- **Authorization**: `X-Internal-Token` header required.
- **Response `200 OK`**:
```json
{
  "status": "completed",
  "synced_sources": ["devpost", "unstop"],
  "new_opportunities_count": 14,
  "duplicates_skipped": 3
}
```

---

#### `POST /internal/notifications/evaluate`
Trigger milestone proximity evaluation sweep.
- **Authorization**: `X-Internal-Token` header required.
- **Response `200 OK`**:
```json
{
  "status": "completed",
  "eval_timestamp": "2026-04-14T23:59:59Z",
  "notifications_generated": 18,
  "notifications_suppressed": 5
}
```

---

## 14. Status Codes

| Code | Status | Usage Scenario |
| :---: | :--- | :--- |
| **200** | `OK` | Successful GET, PATCH, or idempotent POST execution. |
| **201** | `Created` | Successful entity creation (`POST /opportunities`, `POST /radar`). |
| **204** | `No Content` | Successful deletion (`DELETE /radar/{id}`) or session termination. |
| **400** | `Bad Request` | Malformed JSON body or illegal lifecycle status transition. |
| **401** | `Unauthorized` | Missing, expired, or corrupted Bearer JWT token. |
| **403** | `Forbidden` | User attempted to mutate an opportunity or tracking record they do not own. |
| **404** | `Not Found` | Target opportunity, tracking record, or user profile does not exist. |
| **409** | `Conflict` | Duplicate unique constraint violation (e.g. email already exists). |
| **422** | `Unprocessable Entity` | Pydantic schema validation error with field-level details. |
| **429** | `Too Many Requests` | Rate limit exceeded. |
| **500** | `Internal Server Error`| Unhandled server exception. |
| **503** | `Service Unavailable` | External AI provider or database connection failure. |

---

## 15. Idempotency

- `DELETE /radar/{opportunity_id}`: Idempotent. Deleting an already removed tracking record returns `204 No Content`.
- `PATCH /notifications/{id}/read`: Idempotent. Marking an already read notification returns `200 OK`.
- `POST /radar`: Idempotent. Attempting to track an opportunity already on the user's radar returns `200 OK` with the existing tracking record rather than failing.

---

## 16. Rate Limiting

Rate limiting is enforced at the FastAPI gateway middleware to protect database and LLM resources:

| Endpoint Group | Rate Limit (Per IP / User) | Window | Penalty |
| :--- | :---: | :---: | :--- |
| `POST /auth/login`, `POST /auth/register` | 10 requests | 1 minute | `429 Too Many Requests` |
| `POST /ai/extract` | 15 requests | 1 minute | `429 Too Many Requests` |
| `GET /opportunities` (Catalog browsing) | 120 requests | 1 minute | `429 Too Many Requests` |
| General Authenticated User Routes | 180 requests | 1 minute | `429 Too Many Requests` |

---

## 17. Open API Questions

| # | Question | Impact | Options | Decision / Working Assumption |
| :-: | :--- | :--- | :--- | :--- |
| **OA-1** | Should `/radar` return embedded opportunity summaries or require a secondary request? | Affects mobile bandwidth vs. request chattiness. | (A) Embedded opportunity summary<br>(B) Opportunity ID only | **Decision**: Embedded opportunity summary. Eliminates N+1 client queries and renders radar grids in a single network round-trip. |
| **OA-2** | How should the API expose AI confidence scores? | Affects UI transparency vs. user confusion. | (A) Expose raw float (0.00 to 1.00)<br>(B) Expose discrete tier (`high`, `medium`, `low`) | **Decision**: Expose `confidence_score` as float with a boolean `is_user_verified`. The client UI maps scores >= 0.85 as High confidence. |
| **OA-3** | Should notification polling support SSE/WebSockets for MVP? | Affects backend concurrency and frontend complexity. | (A) In-app HTTP polling on navigation (`GET /notifications/unread-count`)<br>(B) WebSockets / SSE connection | **Decision**: HTTP polling on route change + 60s interval. WebSockets deferred post-MVP. |
