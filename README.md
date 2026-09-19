# Deadline Radar

> A centralized opportunity and deadline management platform for students and young professionals to discover, track, prioritize, and act on time-sensitive opportunities before they expire.

---

## 📌 Project Overview

Students and young professionals are overwhelmed with fragmented, time-sensitive opportunities spread across college portals, Discord/Slack communities, newsletters, emails, and job boards:
- Hackathons & coding competitions
- Internships & fellowships
- Scholarships & grants
- Academic & project deadlines
- Certifications & conferences

Finding opportunities is only half the battle. The core problem is **remembering, organizing, prioritizing, and acting on them before deadlines pass**.

**Deadline Radar** provides a structured, noise-free radar to track deadlines, manage application statuses, receive timely reminders, and leverage modular AI to parse, classify, and prioritize opportunities.

---

## 🏗️ Repository Architecture

This repository is organized into distinct, decoupled boundaries:

```text
deadline_radar/
│
├── frontend/                     # Web client (TBD: React / Vite / TypeScript)
│   └── README.md
│
├── backend/                      # Core REST API (FastAPI + PostgreSQL + SQLAlchemy)
│   └── README.md
│
├── ai-model/                     # Modular AI services (Extraction, classification, deduplication)
│   └── README.md
│
├── docs/                         # Single Source of Truth for Architecture & Specs
│   ├── project-context.md        # Primary context for developers and AI agents
│   ├── prd.md                    # Product requirements document
│   ├── architecture.md           # System architecture and data flow diagrams
│   ├── api-contract.md           # Backend REST API contracts and schemas
│   ├── database-schema.md        # PostgreSQL relational schema and ER diagrams
│   ├── ai-model-spec.md          # AI/ML pipeline, parsing, and inference specifications
│   ├── frontend-spec.md          # UI/UX specifications, design tokens, and components
│   ├── development-workflow.md   # Step-by-step developer and AI agent workflow
│   ├── coding-conventions.md     # Code style, standards, patterns, and linting rules
│   ├── testing-strategy.md       # Unit, integration, E2E, and AI evaluation strategy
│   └── deployment.md             # Hosting, containerization, and CI/CD blueprints
│
├── .github/
│   └── pull_request_template.md  # Standard pull request checklist
│
├── .gitignore                    # Comprehensive ignore rules
├── CHANGELOG.md                  # Change log adhering to Keep a Changelog
└── README.md                     # Root project documentation
```

---

## 📋 Technology Stack Overview

| Layer | Primary Technology | Status / Notes |
| :--- | :--- | :--- |
| **Backend API** | FastAPI (Python 3.11+) | Asynchronous, auto-documented OpenAPI |
| **Database & ORM** | PostgreSQL + SQLAlchemy + Alembic | Strongly typed relational schema & migrations |
| **Frontend** | Modern TypeScript SPA | Recommended: Vite + React + TypeScript (`TODO — NEEDS DECISION`) |
| **AI / ML** | Modular Python Services | Extraction, summarization, deduplication (`TODO — MODEL SELECTION`) |
| **Authentication** | Token-based Auth | JWT / OAuth2 (`TODO — NEEDS DECISION`) |
| **Hosting** | Containerized / Cloud PaaS | Docker, Render / Railway / Fly.io (`TODO — DEPLOYMENT DECISION`) |

---

## 🤖 Mandatory Rules for AI Coding Agents

Every AI coding agent working in this repository **must** abide by these rules:

1. **Zero Assumptions**: Do not invent features, frameworks, or dependencies not documented in `docs/`.
2. **Read Before Coding**: Always read `README.md`, `docs/project-context.md`, `docs/architecture.md`, and the relevant specification before writing code.
3. **Keep Docs in Sync**: When modifying an endpoint or schema, update `docs/api-contract.md` or `docs/database-schema.md`.
4. **No Unrelated Changes**: Keep PRs and changesets scoped strictly to the task at hand.
5. **Never Commit Secrets**: Never commit `.env` files, API keys, credentials, or secrets.
6. **Follow the Workflow**: Review and follow [docs/development-workflow.md](docs/development-workflow.md) for every task.

---

## 📚 Documentation Index

- [Project Context & Identity](docs/project-context.md)
- [Product Requirements Document (PRD)](docs/prd.md)
- [System Architecture](docs/architecture.md)
- [API Contract](docs/api-contract.md)
- [Database Schema](docs/database-schema.md)
- [AI Model Specification](docs/ai-model-spec.md)
- [Frontend Specification](docs/frontend-spec.md)
- [Development Workflow](docs/development-workflow.md)
- [Coding Conventions](docs/coding-conventions.md)
- [Testing Strategy](docs/testing-strategy.md)
- [Deployment Guide](docs/deployment.md)

---

## 📄 License & Status

- **Status**: Initialization Phase — Foundation & Documentation setup. No application code implemented yet.
- **Project Type**: Personal Product (Independent software project).
