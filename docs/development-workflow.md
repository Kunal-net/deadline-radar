# Development Workflow — Deadline Radar

## Purpose
This document defines the mandatory, disciplined development lifecycle for all software engineers and AI coding agents working on the **Deadline Radar** repository. Following this process guarantees architectural consistency, prevents regressions, and maintains documentation synchronization.

---

## Project Phase Roadmap

The Deadline Radar repository follows a structured, documentation-driven progression:

| Phase | Description | Key Artifact | Status |
| :---: | :--- | :--- | :---: |
| **Phase 1** | **Product Requirements Definition** | `docs/prd.md` | **COMPLETE** |
| **Phase 2** | **System Architecture Design** | `docs/architecture.md` | **COMPLETE** |
| **Phase 3** | **Database Schema & Data Modeling** | `docs/database-schema.md` | **COMPLETE** |
| **Phase 4** | **API Contract Specification** | `docs/api-contract.md` | **NEXT PHASE** |
| **Phase 5** | **AI Subsystem Specification** | `docs/ai-model-spec.md` | Pending |
| **Phase 6** | **Frontend UI/UX Specification** | `docs/frontend-spec.md` | Pending |
| **Phase 7** | **Backend Core Implementation** | `backend/` | Pending |
| **Phase 8** | **AI Layer Implementation** | `ai-model/` | Pending |
| **Phase 9** | **Frontend Client Implementation** | `frontend/` | Pending |
| **Phase 10** | **End-to-End Integration & Testing** | `tests/` | Pending |
| **Phase 11** | **Deployment & Production Launch** | `docs/deployment.md` | Pending |

---

## Mandatory AI Agent Workflow

```text
       ┌───────────────────────────────┐
       │         READ CONTEXT          │
       └───────────────┬───────────────┘
                       │
                       ▼
       ┌───────────────────────────────┐
       │    UNDERSTAND REQUIREMENT     │
       └───────────────┬───────────────┘
                       │
                       ▼
       ┌───────────────────────────────┐
       │     INSPECT EXISTING CODE     │
       └───────────────┬───────────────┘
                       │
                       ▼
       ┌───────────────────────────────┐
       │    MAKE IMPLEMENTATION PLAN   │
       └───────────────┬───────────────┘
                       │
                       ▼
       ┌───────────────────────────────┐
       │           IMPLEMENT           │
       └───────────────┬───────────────┘
                       │
                       ▼
       ┌───────────────────────────────┐
       │             TEST              │
       └───────────────┬───────────────┘
                       │
                       ▼
       ┌───────────────────────────────┐
       │            REVIEW             │
       └───────────────┬───────────────┘
                       │
                       ▼
       ┌───────────────────────────────┐
       │     UPDATE DOCUMENTATION      │
       └───────────────┬───────────────┘
                       │
                       ▼
       ┌───────────────────────────────┐
       │        REPORT CHANGES         │
       └───────────────────────────────┘
```

---

## Step-by-Step Instructions

### Step 1: Read Context
Before writing a single line of code or running modifying commands, every AI agent **MUST** read:
1. `README.md`: Overall project mission and module index.
2. `docs/project-context.md`: Project identity, constraints, decisions, and negative assumptions.
3. `docs/architecture.md`: System layout, service boundaries, and data flows.
4. `docs/prd.md`: Product features and domain requirements.

Depending on the specific task, the agent must then read the specialized specification:
- Backend work: `docs/api-contract.md` and `docs/database-schema.md`
- Frontend work: `docs/frontend-spec.md` and `docs/api-contract.md`
- AI/ML work: `docs/ai-model-spec.md`
- Deployment work: `docs/deployment.md`

### Step 2: Understand Requirement
- Identify what is explicitly requested.
- Ensure the task aligns with the PRD and does not introduce undocumented scope creep.
- If an architectural ambiguity is uncovered, stop and clarify or flag as `TODO — NEEDS DECISION`.

### Step 3: Inspect Existing Code
- Inspect the relevant files, abstractions, and existing tests in the target module.
- Check for existing utility functions, Pydantic schemas, or components to prevent redundant duplicate code.

### Step 4: Make Implementation Plan
- Outline the sequence of changes:
  - What files will be created or modified?
  - Are there database schema migrations involved?
  - Does the API contract require updates?
- Verify that the plan will not touch unrelated files or break existing interfaces.

### Step 5: Implement
- Write clean, type-safe, minimal code fulfilling the planned requirement.
- Adhere strictly to [docs/coding-conventions.md](coding-conventions.md).
- Do not introduce new dependencies without concrete justification.
- Never hardcode secrets, credentials, or API keys.

### Step 6: Test
- Run automated unit and integration tests.
- Verify schema migrations against a test database.
- Confirm that existing tests continue to pass.
- AI agents must not claim something works without executing tests and verifying the output.

### Step 7: Review
- Run linters and type checkers (e.g. `ruff`, `mypy`, `tsc`).
- Review git diffs to ensure no unintended files (e.g., `.DS_Store`, `__pycache__`, temporary logs) are staged.

### Step 8: Update Documentation
- If an API endpoint was added or altered, update `docs/api-contract.md`.
- If a table or column was added, update `docs/database-schema.md`.
- Record changes in `CHANGELOG.md` under `[Unreleased]`.

### Step 9: Report Changes
Every coding agent must summarize its work using this standard report format:
```text
What changed:
- High-level summary of the implementation.

Why it changed:
- Rationale connecting the change to the PRD / user requirement.

Files modified:
- List of created, modified, or deleted files with clickable links.

Tests performed:
- Commands executed and their outcomes.

Known issues / Limitations:
- Any edge cases or pending tasks.

Next recommended step:
- Logical next action for the user or subsequent agent.
```

---

## Branching & Commit Conventions
- Use descriptive branch names: `feature/short-description`, `fix/issue-description`, `docs/doc-name`.
- Use conventional commit messages:
  - `feat(backend): add deadline proximity calculation service`
  - `fix(api): handle null start_date on opportunity creation`
  - `docs: update api contract for /dashboard/overview`
  - `test(ai): add unit tests for date extraction parser`
