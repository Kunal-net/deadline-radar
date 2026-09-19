# Frontend Module — Deadline Radar

## Purpose
The `frontend/` directory houses the Single Page Application (SPA) for **Deadline Radar**. It provides an operational, high-signal, distraction-free command center for students and professionals to monitor deadline risk, manage finite usable capacity, track actual execution time, and execute adaptive daily plans.

## Responsibilities
- **Today Cockpit (`/today`)**: Active stopwatch timer bar, NOW / NEXT recommendation cards, and dynamic daily plan timeline.
- **Radar Dashboard (`/dashboard`)**: High-level operational overview displaying risk states (`SAFE`, `WATCH`, `AT RISK`, `CRITICAL`, `OVERDUE`), approaching deadlines, and weekly capacity load meters.
- **Work Management & Detail (`/work`, `/work/:id`)**: Comprehensive work item tracker with inline subtask checklists, dynamic priority rankings, and logged session histories.
- **AI Decomposition Drawer (`/work/new`)**: Natural language work input with AI task decomposition preview, allowing users to verify, edit, and adjust subtask estimates before saving.
- **Timeline Projection (`/timeline`)**: Forward Gantt-style visualization mapping required work hours against suitable capacity windows to visually highlight late projections.
- **Calendar & Workload (`/calendar`, `/workload`)**: Visual schedule integrating blackout commitments, protected personal interests, and workload capacity bars showing overbooked days.
- **Personal Insights (`/insights`)**: Visualizing empirical category pace factors, predicted vs. actual variance scatter plots, and personalization learning trends over time.

## Expected Technology Stack
- **Language**: TypeScript (Strict Mode)
- **Framework**: React 18+ with Vite
- **Routing**: React Router v6+
- **Styling**: Vanilla CSS / CSS Modules adhering to the Dark Editorial Design System ([docs/design.md](../docs/design.md))
- **State Management & Caching**: TanStack Query (React Query v5) for server state; Zustand for local active stopwatch and UI modal state
- **Icons**: Lucide React for consistent line iconography
- **Date Utilities**: `date-fns` for UTC conversions and timezone-aware formatting

## Communication with Backend
- Communicates with the FastAPI backend over REST (`http://localhost:8000/api/v1` in development).
- Uses standard JSON request and response payloads conforming strictly to [docs/api-contract.md](../docs/api-contract.md).
- Authentication headers pass Bearer JWT tokens with automatic 401 handling and session recovery.
- Strict error resilience with optimistic UI updates, background query revalidation, and graceful AI fallbacks.

## Relevant Documentation
- [Frontend Specification](../docs/frontend-spec.md)
- [Design System](../docs/design.md)
- [API Contract](../docs/api-contract.md)
- [Product Requirements Document (PRD)](../docs/prd.md)
- [Coding Conventions](../docs/coding-conventions.md)
- [Development Workflow](../docs/development-workflow.md)
