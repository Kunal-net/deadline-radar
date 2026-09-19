# Frontend Module — Deadline Radar

## Purpose
The `frontend/` directory houses the client application for **Deadline Radar**. It provides an intuitive, high-signal, distraction-free interface for students and young professionals to discover opportunities, track deadlines, monitor application statuses, manage personal calendars, and receive reminders.

## Responsibilities
- **Opportunity Discovery UI**: Interactive search, filtering by category (hackathons, internships, scholarships, competitions), urgency, eligibility, and tags.
- **Deadline Dashboard**: High-visibility overview of upcoming deadlines (e.g., within 24h, 3 days, 7 days), overdue alerts, and application status summaries.
- **Personal Tracking & Management**: Saving opportunities, updating application statuses (`Saved`, `Applied`, `Interviewing`, `Offered`, `Rejected`, `Completed`, `Archived`), and adding personal notes.
- **Calendar & Timeline View**: Visual calendar/timeline representations of upcoming deadlines and critical dates.
- **AI-Powered Input / Ingestion Interface**: Providing a quick-paste box or URL input for users to trigger AI deadline extraction and review parsed fields before saving.
- **Notification & Preferences**: Setting reminder intervals (e.g., 7 days, 3 days, 1 day, on deadline).

## Expected Technology
- **Language**: TypeScript
- **Framework Evaluation**: `TODO — NEEDS DECISION` (Recommended: **Vite + React** or **Next.js**; lightweight, high-performance, fast client navigation).
- **Styling**: Modern, clean, purposeful CSS / CSS Modules or Tailwind CSS (`TODO — NEEDS DECISION`).
- **State Management & Data Fetching**: TanStack Query (React Query) or native fetch client with caching and optimistic UI updates.
- **Icons & Visuals**: Lucide Icons or equivalent modern SVG icons.

## Communication with Backend
- Communicates with the FastAPI backend over REST (`http://localhost:8000/api/v1` in local development).
- Uses standard JSON request and response payloads conforming to `docs/api-contract.md`.
- Authentication headers will pass Bearer tokens once auth is configured.
- Implements resilient error handling, network error fallbacks, and typed response validation.

## Relevant Documentation
- [Frontend Specification](../docs/frontend-spec.md)
- [API Contract](../docs/api-contract.md)
- [Product Requirements Document (PRD)](../docs/prd.md)
- [Coding Conventions](../docs/coding-conventions.md)
- [Development Workflow](../docs/development-workflow.md)
