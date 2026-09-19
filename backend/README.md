# Backend Module — Deadline Radar

## Purpose
The `backend/` directory contains the core application server and RESTful API for **Deadline Radar**. Built with **FastAPI**, it orchestrates data persistence, opportunity querying, user tracking state, deadline notification schedules, and interactions with AI extraction services.

## Responsibilities
- **RESTful API Service**: Exposing validated, documented endpoints conforming to [docs/api-contract.md](../docs/api-contract.md).
- **Domain Logic & Business Rules**: Managing opportunities, status transitions, priority calculations, tags, and category taxonomies.
- **Data Persistence & Migrations**: Relational persistence via **SQLAlchemy** and migration versioning via **Alembic** on **PostgreSQL**.
- **Deadline Scheduling & Notifications**: Calculating deadline proximity, triggering alerts (7 days, 3 days, 1 day, day-of), and managing notification state.
- **AI Integration Gateway**: Serving as the client/coordinator for AI extraction, classification, summarization, and deduplication tasks.
- **Authentication & Authorization**: Protecting user-specific endpoints, sessions, and preferences (`TODO — NEEDS DECISION`).

## API
- Built using **FastAPI** with automatic OpenAPI/Swagger documentation at `/docs` and ReDoc at `/redoc`.
- Versioned routing under `/api/v1/`.
- Strict request and response schemas enforced via **Pydantic v2**.
- Structured error handling with consistent RFC 7807 problem details or standard `{ detail, code, status }` JSON envelopes.

## Database
- **Engine**: PostgreSQL 15+
- **ORM**: SQLAlchemy (Declarative mapping with AsyncSession or Session)
- **Migrations**: Alembic for deterministic schema migrations
- **Schema Reference**: [docs/database-schema.md](../docs/database-schema.md)

## AI Integration
- Modular abstraction layer (`backend/app/services/ai/`) that interfaces with the `ai-model/` module or external LLM/NLP providers.
- Isolates external model failures: if the AI service fails or times out, the backend falls back gracefully without interrupting manual opportunity creation or user workflows.

## Relevant Documentation
- [Architecture Overview](../docs/architecture.md)
- [API Contract](../docs/api-contract.md)
- [Database Schema](../docs/database-schema.md)
- [Coding Conventions](../docs/coding-conventions.md)
- [Development Workflow](../docs/development-workflow.md)
