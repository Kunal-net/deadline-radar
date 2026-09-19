# Deadline Radar

> **An AI-powered personalized deadline monitoring, workload management, and adaptive time-planning system.**

Deadline Radar helps a person answer with absolute clarity:

> **What deserves my time right now?**

---

## 📌 The Problem

Most people do not miss deadlines because they forgot the date. They miss deadlines because they misjudge the relationship between:
- **How much work remains**
- **How long that work actually takes them**
- **How much suitable, usable capacity they have before the deadline**
- **What other commitments are competing for that exact same time**

A conventional task manager or to-do list knows:
> *"Assignment 3 is due Friday at 11:59 PM."*

**Deadline Radar** understands:
> *"Assignment 3 requires approximately 7 hours. You normally take 25% longer than average on compiler assignments. You have only 5 suitable hours of capacity available between now and Friday, and an exam preparation block is competing for the same window. This task is AT RISK."*

---

## 🔄 The Central Product Loop

The core operating model of Deadline Radar is a closed-loop intelligence cycle:

```text
USER ADDS WORK
      ↓
AI UNDERSTANDS THE WORK (Extracts scope, context, deadline constraints)
      ↓
AI DECOMPOSES COMPLEX WORK (Breaks project into actionable 0.5h–3h units)
      ↓
ESTIMATE REQUIRED EFFORT (Initial baseline sizing with confidence bounds)
      ↓
LEARN USER'S PERSONAL PACE (Empirical ratio of actual time to predicted time)
      ↓
COMPARE WORKLOAD WITH AVAILABLE TIME (Evaluates net usable capacity minus commitments)
      ↓
DETECT DEADLINE RISK (Calculates risk ratio: remaining effort vs. suitable hours)
      ↓
CALCULATE DYNAMIC PRIORITY (Mathematically ranks work based on risk, time, and importance)
      ↓
GENERATE / ADJUST PLAN (Allocates available hours to highest-leverage work while protecting personal life)
      ↓
USER EXECUTES WORK (Interactive stopwatch session or manual time logging)
      ↓
TRACK ACTUAL TIME / PROGRESS (Records observed duration per work unit)
      ↓
COMPARE PREDICTED VS ACTUAL (Calculates estimation variance)
      ↓
UPDATE PERSONAL MODEL (Refines category-specific pace factors via Exponential Moving Average)
      ↓
REPLAN WHEN NECESSARY (Adapts schedule dynamically as reality shifts)
```

---

## ✨ Core Product Capabilities

1. **Work Items & Flexible Decomposition**: Tracks assignments, coding projects, exam preparation, reports, and administrative tasks. Breaks complex work into verifiable subtasks with editable estimates.
2. **True Time Availability**: Models finite usable capacity based on recurring weekly schedules and one-off blackout blocks (classes, doctor appointments, family commitments).
3. **Protected Personal Interests**: Explicitly reserves time for gym, personal projects, gaming, reading, and rest—ensuring the user is not optimized into burnout.
4. **Deterministic Deadline Risk Engine**: Continuously evaluates risk states (`SAFE`, `WATCH`, `AT RISK`, `CRITICAL`, `OVERDUE`) based on mathematical ratios between remaining effort and available suitable hours.
5. **Dynamic Priority Engine**: Recalculates priority rankings continuously as deadlines near, capacity shrinks, or progress is made. Transparent explanations detail why tasks move up.
6. **Adaptive Daily Planner ("Today View")**: Proposes a realistic daily schedule (NOW, NEXT, and chronological plan blocks) that users can reorder, adapt, and execute.
7. **Empirical Personalization Loop**: Observes actual stopwatch time vs. predicted time to compute personal pace factors (e.g. `1.20x` on academic papers, `0.95x` on coding), improving future plans over time without claiming unrealistic AI perfection.

---

## 🏗️ System Architecture

Deadline Radar is engineered as a **Modular Monolith** designed for operational simplicity, type safety, and clean domain isolation:

```text
                               ┌────────────────────────┐
                               │     Frontend Client    │
                               │ React + Vite + TS SPA  │
                               └───────────┬────────────┘
                                           │ HTTPS / REST (JSON)
                                           ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             FastAPI Application Server                           │
│                                                                                  │
│  ┌───────────────┐  ┌───────────────────┐  ┌───────────────┐  ┌───────────────┐  │
│  │  Auth & Users │  │  Work Management  │  │ Time Tracking │  │ Availability  │  │
│  └───────────────┘  └───────────────────┘  └───────────────┘  └───────────────┘  │
│  ┌───────────────┐  ┌───────────────────┐  ┌───────────────┐  ┌───────────────┐  │
│  │  Risk Engine  │  │  Priority Engine  │  │Planner Engine │  │Personalization│  │
│  │ (Deterministic│  │  (Multi-factor)   │  │(Cap-Packing)  │  │  (EMA Stats)  │  │
│  └───────────────┘  └───────────────────┘  └───────────────┘  └───────────────┘  │
│                                          │                                       │
│                                          ▼                                       │
│                        ┌───────────────────────────────────┐                     │
│                        │       AI Intelligence Layer       │                     │
│                        │ (LLM Facade: Gemini/Claude/Mock)  │                     │
│                        └───────────────────────────────────┘                     │
└──────────────────────────────────────────┬───────────────────────────────────────┘
                                           │ Async SQLAlchemy / asyncpg
                                           ▼
                               ┌────────────────────────┐
                               │   PostgreSQL 15+ DB    │
                               │ Relational Persistence │
                               └────────────────────────┘
```

---

## 💻 Technology Stack

| Domain | Primary Technology | Purpose |
| :--- | :--- | :--- |
| **Backend API** | **FastAPI** (Python 3.11+) | High-performance asynchronous REST API with Pydantic v2 validation |
| **Database & ORM** | **PostgreSQL 15+**, **SQLAlchemy**, **Alembic** | Strongly typed relational schema with deterministic migrations |
| **Frontend Client** | **React 18+**, **Vite**, **TypeScript** | Responsive Single Page Application with TanStack Query and Zustand |
| **Styling & Design** | **Dark Editorial Design System** | High-contrast, typography-driven UI inspired by premium editorial design |
| **AI Subsystem** | **Pluggable LLM Facade** (Gemini, Claude, Mock) | Unstructured work parsing, decomposition suggestions, missing info flags |
| **Task Scheduling** | **In-Process Async Worker** (`asyncio.create_task`) | Proximity checks, risk state recalculations, notification delivery |

---

## 📂 Repository Structure

```text
deadline-radar/
├── frontend/                     # Client application (React + Vite + TypeScript)
│   └── README.md
├── backend/                      # Core REST API (FastAPI + SQLAlchemy + PostgreSQL)
│   └── README.md
├── ai-model/                     # AI parsing, prompt templates, and evaluation datasets
│   └── README.md
├── docs/                         # Single Source of Truth for Architecture & Specs
│   ├── project-context.md        # Canonical product context, vision, and principles
│   ├── prd.md                    # Complete 44-section Product Requirements Document
│   ├── architecture.md           # Modular Monolith system architecture and ADRs
│   ├── database-schema.md        # PostgreSQL relational schema and ER diagram
│   ├── api-contract.md           # Versioned REST API endpoints and schemas
│   ├── frontend-spec.md          # UI/UX information architecture and screen specs
│   ├── ai-model-spec.md          # AI capabilities and deterministic engine boundaries
│   ├── design.md                 # Dark editorial design system and visual tokens
│   ├── development-workflow.md   # Step-by-step developer and AI agent lifecycle
│   ├── coding-conventions.md     # Code style, patterns, and quality rules
│   ├── testing-strategy.md       # Multi-tier testing across Unit, API, and UI
│   └── deployment.md             # Infrastructure blueprints and container specs
├── CHANGELOG.md                  # Detailed chronological changelog
└── README.md                     # Root project documentation
```

---

## 🗺️ Documentation Map

Before modifying code or adding features, consult the authoritative documentation:
- **Product Overview & Rules**: [docs/project-context.md](docs/project-context.md)
- **Detailed Requirements**: [docs/prd.md](docs/prd.md)
- **System Architecture & ADRs**: [docs/architecture.md](docs/architecture.md)
- **Relational Data Model**: [docs/database-schema.md](docs/database-schema.md)
- **REST API Endpoints**: [docs/api-contract.md](docs/api-contract.md)
- **Frontend Architecture**: [docs/frontend-spec.md](docs/frontend-spec.md)
- **AI Engine & Math Boundaries**: [docs/ai-model-spec.md](docs/ai-model-spec.md)
- **Visual Design System**: [docs/design.md](docs/design.md)
- **Engineering Conventions**: [docs/coding-conventions.md](docs/coding-conventions.md)
- **Testing & CI Strategy**: [docs/testing-strategy.md](docs/testing-strategy.md)

---

## 📐 Core Engineering & Product Principles

1. **Deterministic Calculations Over Generative Hallucinations**:
   - Deadline risk ($R = E_r / H_a$), dynamic priority scores ($S$), and pace factor multipliers ($A / E$) are strictly calculated by deterministic Python and SQL algorithms. Generative LLMs are never permitted to invent risk scores or temporal arithmetic.
2. **Explicit Data Boundaries**:
   - Every piece of data is categorized as `USER INPUT`, `AI-DERIVED DATA`, `SYSTEM-CALCULATED DATA`, `USER-VERIFIED DATA`, or `ACTUAL OBSERVED DATA`. AI suggestions are never presented as authoritative facts until verified.
3. **Respect Finite Human Capacity**:
   - Time cannot be created. When new work is added, the system reveals trade-offs and capacity conflicts rather than blindly stacking tasks.
4. **No AI Cliché Anti-Patterns**:
   - No purple/neon gradients, floating blobs, decorative cards, or robot illustrations. The interface is a dark, sophisticated editorial command center designed for sustained daily focus.

---

## 🚦 Current Development Status

- **Status**: **Phase 1–6 Architectural Specification Complete (Product Pivot Documented)**
- **Next Phase**: Implementation of backend core models, migrations, and services following the approved specifications.
- **Rule**: Code implementation must not begin without explicit user instruction.
