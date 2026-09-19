# API Contract — Deadline Radar

## Overview
This document serves as the **single source of truth** for communication between the Frontend Client and the FastAPI Backend. All requests and responses must conform strictly to the schemas and conventions defined herein.

- **Base URL (Local)**: `http://localhost:8000/api/v1`
- **Base URL (Production)**: `https://api.deadlineradar.com/api/v1` (`TODO — DEPLOYMENT DECISION`)
- **Protocol**: HTTPS / REST
- **Content-Type**: `application/json`
- **Date/Time Format**: ISO 8601 UTC strings (`YYYY-MM-DDTHH:MM:SSZ`)

---

## Authentication & Headers

### Headers
| Header | Value | Description |
| :--- | :--- | :--- |
| `Content-Type` | `application/json` | Required for POST / PUT / PATCH |
| `Authorization` | `Bearer <JWT_TOKEN>` | Required on protected user endpoints |

### Standard Error Response Envelope
All non-2xx responses adhere to this standardized JSON shape:
```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Opportunity with ID 42 was not found.",
    "details": []
  }
}
```

### Common HTTP Status Codes
- `200 OK`: Request succeeded.
- `201 Created`: Resource successfully created.
- `204 No Content`: Resource deleted or action completed with no body returned.
- `400 Bad Request`: Payload validation failure or malformed JSON.
- `401 Unauthorized`: Missing or invalid authentication token.
- `403 Forbidden`: Authenticated user lacks permission.
- `404 Not Found`: Target resource does not exist.
- `409 Conflict`: Duplicate entry or conflicting state transition.
- `422 Unprocessable Entity`: Pydantic validation error detailing field mismatches.
- `500 Internal Server Error`: Unhandled server exception.

---

## Endpoints

### 1. System Health

#### `GET /health`
Verifies API and database connectivity.
- **Auth**: None
- **Response `200 OK`**:
```json
{
  "status": "healthy",
  "version": "0.1.0",
  "database": "connected",
  "timestamp": "2026-03-31T12:00:00Z"
}
```

---

### 2. Authentication

#### `POST /auth/register`
Create a new user account.
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

#### `POST /auth/login`
Authenticate existing user.
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

#### `GET /auth/me`
Retrieve currently logged-in user profile.
- **Auth**: Bearer Token
- **Response `200 OK`**:
```json
{
  "id": "usr_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "email": "student@university.edu",
  "full_name": "Aarav Sharma",
  "created_at": "2026-03-31T12:05:00Z"
}
```

---

### 3. Opportunities (Catalog & Discovery)

#### `GET /opportunities`
List and filter opportunities in the global catalog.
- **Auth**: Optional (Provides user tracking state if authenticated)
- **Query Parameters**:
  - `query` (string, optional): Keyword search in title, organization, description.
  - `category` (string, optional): e.g., `hackathon`, `internship`, `scholarship`.
  - `mode` (string, optional): `online`, `in_person`, `hybrid`.
  - `is_free` (boolean, optional): Filter free opportunities.
  - `deadline_from` (ISO datetime string, optional).
  - `deadline_to` (ISO datetime string, optional).
  - `page` (integer, default `1`).
  - `limit` (integer, default `20`, max `100`).
  - `sort_by` (string, default `deadline`, options: `deadline`, `created_at`, `title`).
  - `sort_order` (string, default `asc`, options: `asc`, `desc`).
- **Response `200 OK`**:
```json
{
  "items": [
    {
      "id": "opp_1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
      "title": "Global AI Hackathon 2026",
      "organization": "OpenAI & Devpost",
      "category": "hackathon",
      "description": "Build innovative agents and tools with multimodal foundation models.",
      "deadline": "2026-04-15T23:59:59Z",
      "start_date": "2026-04-18T09:00:00Z",
      "end_date": "2026-04-20T18:00:00Z",
      "eligibility": "Open to all students worldwide enrolled in accredited universities.",
      "location": "Global / Remote",
      "mode": "online",
      "cost": 0,
      "application_url": "https://globalaihackathon.example.com",
      "source": "Devpost",
      "tags": ["AI", "Hackathon", "Open Source"],
      "is_rolling": false,
      "user_status": "saved",
      "created_at": "2026-03-30T10:00:00Z",
      "updated_at": "2026-03-30T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_items": 142,
    "total_pages": 8
  }
}
```

#### `GET /opportunities/{id}`
Retrieve full details for a single opportunity.
- **Auth**: Optional
- **Response `200 OK`**:
```json
{
  "id": "opp_1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
  "title": "Global AI Hackathon 2026",
  "organization": "OpenAI & Devpost",
  "category": "hackathon",
  "description": "Build innovative agents and tools with multimodal foundation models.",
  "deadline": "2026-04-15T23:59:59Z",
  "start_date": "2026-04-18T09:00:00Z",
  "end_date": "2026-04-20T18:00:00Z",
  "eligibility": "Open to all students worldwide enrolled in accredited universities.",
  "location": "Global / Remote",
  "mode": "online",
  "cost": 0,
  "application_url": "https://globalaihackathon.example.com",
  "source": "Devpost",
  "tags": ["AI", "Hackathon", "Open Source"],
  "is_rolling": false,
  "created_at": "2026-03-30T10:00:00Z",
  "updated_at": "2026-03-30T10:00:00Z"
}
```

#### `POST /opportunities`
Create an opportunity manually or via parsed input.
- **Auth**: Bearer Token
- **Request Body**:
```json
{
  "title": "Summer Robotics Internship 2026",
  "organization": "RoboTech Labs",
  "category": "internship",
  "description": "12-week summer research internship working on autonomous drone navigation.",
  "deadline": "2026-04-10T17:00:00Z",
  "start_date": "2026-06-01T09:00:00Z",
  "end_date": "2026-08-21T17:00:00Z",
  "eligibility": "Penultimate year undergraduate or graduate students in CS/EE/Robotics.",
  "location": "Bangalore, India",
  "mode": "in_person",
  "cost": 0,
  "application_url": "https://robotech.example.com/apply",
  "source": "Manual",
  "tags": ["Robotics", "Internship", "Hardware"],
  "is_rolling": false
}
```
- **Response `201 Created`**: Returns created Opportunity object.

---

### 4. Personal Radar & Tracking

#### `GET /radar`
Fetch all opportunities tracked by the authenticated user.
- **Auth**: Bearer Token
- **Query Parameters**:
  - `status` (string, optional): `saved`, `interested`, `applied`, `interviewing`, `offered`, `rejected`, `completed`, `archived`.
  - `urgency` (string, optional): `urgent_24h`, `urgent_3d`, `urgent_7d`, `overdue`.
- **Response `200 OK`**:
```json
{
  "items": [
    {
      "tracking_id": "trk_5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d",
      "status": "applied",
      "personal_notes": "Submitted resume v3 with robotics project emphasis.",
      "reminder_preference": "3_days_before",
      "updated_at": "2026-03-31T09:30:00Z",
      "opportunity": {
        "id": "opp_1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
        "title": "Global AI Hackathon 2026",
        "organization": "OpenAI & Devpost",
        "category": "hackathon",
        "deadline": "2026-04-15T23:59:59Z",
        "mode": "online",
        "application_url": "https://globalaihackathon.example.com"
      }
    }
  ],
  "total": 1
}
```

#### `POST /radar/{opportunity_id}`
Save/track an opportunity to user's personal radar.
- **Auth**: Bearer Token
- **Request Body**:
```json
{
  "status": "saved",
  "personal_notes": "Check eligibility for 3rd year students.",
  "reminder_preference": "default"
}
```
- **Response `201 Created`**: Returns tracking object.

#### `PATCH /radar/{opportunity_id}`
Update application status or personal notes.
- **Auth**: Bearer Token
- **Request Body**:
```json
{
  "status": "applied",
  "personal_notes": "Application submitted on April 1st. Awaiting email response."
}
```
- **Response `200 OK`**: Returns updated tracking object.

#### `DELETE /radar/{opportunity_id}`
Remove opportunity from personal radar (or mark archived).
- **Auth**: Bearer Token
- **Response `204 No Content`**

---

### 5. Dashboard & Analytics

#### `GET /dashboard/overview`
Get aggregate metrics and urgency counts for the authenticated user.
- **Auth**: Bearer Token
- **Response `200 OK`**:
```json
{
  "metrics": {
    "total_tracked": 12,
    "urgent_24h": 1,
    "urgent_3d": 3,
    "urgent_7d": 5,
    "overdue": 1,
    "active_applications": 4
  },
  "urgent_items": [
    {
      "opportunity_id": "opp_1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
      "title": "Global AI Hackathon 2026",
      "category": "hackathon",
      "deadline": "2026-04-01T18:00:00Z",
      "time_remaining_seconds": 21600,
      "status": "saved"
    }
  ]
}
```

#### `GET /dashboard/calendar`
Get deadline events mapped across a date window.
- **Auth**: Bearer Token
- **Query Parameters**:
  - `start_date` (ISO date, e.g., `2026-04-01`)
  - `end_date` (ISO date, e.g., `2026-04-30`)
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
          "status": "applied"
        }
      ]
    }
  ]
}
```

---

### 6. AI Intelligence Services

#### `POST /ai/extract`
Extract structured opportunity parameters from unstructured announcement text or a raw URL.
- **Auth**: Bearer Token
- **Request Body**:
```json
{
  "raw_text": "Join the Devpost AI Spring Sprint! Submission deadline is April 25, 2026 at 11:59pm EST. Open to college students worldwide. Cash prize $10,000. Apply at https://springsprint.example.com",
  "url": null
}
```
- **Response `200 OK`**:
```json
{
  "extracted": {
    "title": "Devpost AI Spring Sprint",
    "organization": "Devpost",
    "category": "hackathon",
    "deadline": "2026-04-26T03:59:00Z",
    "start_date": null,
    "end_date": null,
    "eligibility": "Open to college students worldwide.",
    "location": "Online / Remote",
    "mode": "online",
    "cost": 0,
    "application_url": "https://springsprint.example.com",
    "tags": ["AI", "Hackathon", "Prizes"],
    "summary": "AI Spring Sprint offering $10,000 in cash prizes for global college students.",
    "confidence_score": 0.94
  },
  "warnings": []
}
```

#### `POST /ai/deduplicate`
Evaluate if an incoming opportunity draft matches an existing record.
- **Auth**: Bearer Token
- **Request Body**:
```json
{
  "title": "Devpost AI Spring Sprint",
  "application_url": "https://springsprint.example.com"
}
```
- **Response `200 OK`**:
```json
{
  "is_duplicate": false,
  "matching_opportunity_id": null,
  "similarity_score": 0.12
}
```

---

### 7. Notifications & Reminders

#### `GET /notifications`
List recent notifications for the user.
- **Auth**: Bearer Token
- **Response `200 OK`**:
```json
{
  "items": [
    {
      "id": "notif_11223344",
      "opportunity_id": "opp_1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
      "title": "Deadline Approaching in 24 Hours",
      "message": "Global AI Hackathon 2026 deadline is tomorrow at 11:59 PM UTC.",
      "is_read": false,
      "created_at": "2026-04-14T23:59:59Z"
    }
  ]
}
```

#### `PATCH /notifications/{id}/read`
Mark notification as read.
- **Auth**: Bearer Token
- **Response `200 OK`**:
```json
{
  "id": "notif_11223344",
  "is_read": true
}
```

#### `GET /notifications/preferences`
- **Response `200 OK`**:
```json
{
  "remind_7_days": true,
  "remind_3_days": true,
  "remind_1_day": true,
  "remind_day_of": true,
  "email_alerts_enabled": false
}
```
