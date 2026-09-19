# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Completed authoritative Database Schema Specification (`docs/database-schema.md`) establishing PostgreSQL 15+ relational design, normalized organizations and ingestion sources, separate AI metadata extension table, unified user tracking lifecycle entity, UTC timezone invariance, full-text and trigram search strategies, and concrete indexing architectures.
- Completed comprehensive System Architecture Design (`docs/architecture.md`) defining technical stack selections (FastAPI, PostgreSQL 15+, Vite/React/TS SPA), component boundaries, pluggable AI and ingestion pipelines, in-process async background worker, security models, data flows, and Architectural Decision Records (ADR-001 through ADR-007).
- Updated development workflow roadmap (`docs/development-workflow.md`) marking database design complete and setting API contract design as the next phase.
- Formalized complete, implementation-ready 32-section Product Requirements Document (`docs/prd.md`) defining target personas, user journeys, MVP scope boundaries, opportunity data model, lifecycle states, in-app notifications, and testable acceptance criteria.
- Updated project context (`docs/project-context.md`) with confirmed MVP decisions regarding notification channels, AI feature scoping, and lifecycle separation.
- Initial project directory structure (`frontend/`, `backend/`, `ai-model/`, `docs/`, `.github/`)
- Project context documentation (`docs/project-context.md`)
- Product requirements document (`docs/prd.md`)
- System architecture documentation (`docs/architecture.md`)
- API contract specification (`docs/api-contract.md`)
- Database schema design (`docs/database-schema.md`)
- AI model specification (`docs/ai-model-spec.md`)
- Frontend specification and design guidelines (`docs/frontend-spec.md`)
- Development workflow for AI agents and human contributors (`docs/development-workflow.md`)
- Repository coding conventions and guidelines (`docs/coding-conventions.md`)
- Testing strategy across frontend, backend, AI, and integration (`docs/testing-strategy.md`)
- Deployment architecture plan (`docs/deployment.md`)
- Module boundary READMEs (`frontend/README.md`, `backend/README.md`, `ai-model/README.md`)
- Gitignore and pull request template (`.gitignore`, `.github/pull_request_template.md`)
