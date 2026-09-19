# Backend Module — Deadline Radar

## Purpose
The `backend/` directory contains the core application server and RESTful API for **Deadline Radar**. Built with **FastAPI**, it orchestrates relational data persistence, work item management, schedule availability, stopwatch time tracking, deterministic deadline risk scoring, dynamic priority ranking, adaptive daily planning, and interactions with AI intelligence services.

## Responsibilities
- **RESTful API Service**: Exposing validated, documented endpoints conforming to [docs/api-contract.md](../docs/api-contract.md).
- **Work & Decomposition Management**: Managing work items, subtask (work unit) hierarchies, sequences, and completion statuses.
- **Time Availability & Blackout Engine**: Modeling recurring weekly available windows and deducting overlapping schedule blackout commitments.
- **Stopwatch Time Tracking**: Managing real-time active stopwatch sessions, computing elapsed time, logging manual time entries, and maintaining telemetry history.
- **Deterministic Risk & Priority Engines**: Mathematically computing deadline risk ratios ($R = \text{RemainingEffort} / \text{AvailableHours}$) and dynamic multi-factor priority scores without generative hallucinations.
- **Adaptive Daily Planning**: Allocating available hours to top-priority tasks while safeguarding protected personal interests (gym, creative projects, rest).
- **Personalization Engine**: Applying Exponential Moving Averages (EMA) to observed actual vs. predicted time entries to refine user-specific category pace factors.
- **AI Intelligence Gateway**: Coordinating task decomposition and baseline effort estimation via decoupled LLM provider facades (Gemini, Claude, Mock).
- **Data Persistence & Migrations**: Relational persistence via **SQLAlchemy** and migration versioning via **Alembic** on **PostgreSQL 15+**.

## API Architecture
- Built using **FastAPI** with automatic OpenAPI/Swagger documentation at `/docs` and ReDoc at `/redoc`.
- Versioned routing under `/api/v1/`.
- Strict request and response schemas enforced via **Pydantic v2**.
- Structured error handling with consistent RFC 7807 problem details JSON envelopes.

## Database
- **Engine**: PostgreSQL 15+
- **ORM**: SQLAlchemy (Declarative asynchronous mapping with `AsyncSession`)
- **Migrations**: Alembic for deterministic schema migrations
- **Schema Reference**: [docs/database-schema.md](../docs/database-schema.md)

## AI Integration
- Modular abstraction layer (`backend/app/services/ai/`) interfacing with external LLMs or local stubs.
- Strict isolation: if external AI services fail or time out, the backend falls back gracefully to manual input without interrupting user workflows.

## Relevant Documentation
- [Architecture Overview](../docs/architecture.md)
- [API Contract](../docs/api-contract.md)
- [Database Schema](../docs/database-schema.md)
- [Coding Conventions](../docs/coding-conventions.md)
- [Development Workflow](../docs/development-workflow.md)
