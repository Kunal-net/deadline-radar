# Project Context — Deadline Radar

## 1. Project Identity
- **Project Name**: Deadline Radar
- **Repository**: `deadline_radar`
- **Location**: `/Users/kunalsuryanshi/Documents/Projectsnew/deadline_radar`
- **Product Nature**: Personal software product (production-grade personal software, NOT a hackathon project, NOT an enterprise team PM tool).
- **Core Domain**: AI-powered personalized deadline monitoring, cognitive workload management, dynamic prioritization, and adaptive time planning.
- **Product Vision**: A personalized intelligent command center that continuously answers: *"What deserves my time right now?"* rather than merely listing *"What tasks do I have?"*

---

## 2. Product Definition & Mission
**Deadline Radar** is an AI-powered personalized deadline monitoring and time-management system. It transforms how students, knowledge workers, researchers, and creators manage competing obligations by maintaining active situational awareness of:
- **WORK**: What needs to be accomplished and how complex it is.
- **TIME**: When obligations are due and how much usable time actually exists.
- **CAPACITY**: Available working windows minus classes, jobs, gym, rest, and personal interests.
- **EFFORT**: Estimated duration calibrated to **this specific user's historical working pace**.
- **RISK**: The real-time relationship between remaining work and remaining suitable time.
- **DYNAMIC PRIORITY**: Objective, transparent ranking of which work requires attention today.
- **CONTINUOUS LEARNING**: Comparing predicted effort versus observed actual time to refine future personal estimates.

---

## 3. Explicit Deprecation of Legacy Opportunity-Discovery Concept
> [!IMPORTANT]
> **ARCHITECTURAL PIVOT NOTICE**: The previous concept of Deadline Radar as an "opportunity discovery platform", "hackathon aggregator", "scholarship search engine", or "internship directory" is **OBSOLETE AND DEPRECATED**.
> 
> Deadline Radar is **NOT** an opportunity discovery feed, web scraper, or job board. External commitments (such as preparing an internship application, studying for an exam, writing a research paper, or submitting a project) are simply treated as **Work Items** within the user's personal workload.

---

## 4. Problem Statement
People are chronically overwhelmed by multiple concurrent commitments with differing deadlines, effort requirements, priorities, and schedules. 

Traditional task managers and calendars fail catastrophically because they treat time and work as static:
- **The "Friday Deadline" Fallacy**: A standard task manager records: *"ML Report due Friday at 11:59 PM."* It is blind to the fact that the report requires 8 hours of deep focus, the user takes 25% longer than average on writing, and the user has only 4 suitable hours of free time before Friday due to labs, gym, and exam study.
- **Estimation Blindness (The Planning Fallacy)**: Humans consistently underestimate how long complex tasks take. Traditional tools never record actual time spent versus predicted time, so users repeat the same estimation errors indefinitely.
- **Lack of Time-Capacity Awareness**: A calendar shows events, and a to-do list shows items, but neither connects **workload demand** against **usable supply of time**.
- **Static Priority Stagnation**: Tasks marked "Medium Priority" stay medium until the night before the deadline, triggering panic, rushed quality, and burnout.
- **Monolithic Intimidation**: Complex tasks (e.g. *"Prepare for Distributed Systems Final"*) feel paralyzing because they are not broken into manageable cognitive units with concrete effort estimates.

---

## 5. The Central Product Loop
The heartbeat of Deadline Radar is an adaptive feedback loop that connects planning with reality:

```text
USER ADDS WORK
      ↓
AI UNDERSTANDS THE WORK (Extracts constraints, deliverables, type)
      ↓
AI DECOMPOSES COMPLEX WORK (Breaks into concrete Work Units)
      ↓
ESTIMATE REQUIRED EFFORT (Initial baseline prediction)
      ↓
LEARN USER'S PERSONAL PACE (Calibrates against historical pace factor)
      ↓
COMPARE WORKLOAD WITH AVAILABLE TIME (Calculates capacity & buffer)
      ↓
DETECT DEADLINE RISK (Safe, Watch, At Risk, Critical, Overdue)
      ↓
CALCULATE DYNAMIC PRIORITY (Objective, transparent score & reasoning)
      ↓
GENERATE / ADJUST PLAN (Proposes time allocation for Today)
      ↓
USER EXECUTES WORK (Deep work sessions with built-in time tracking)
      ↓
TRACK ACTUAL TIME / PROGRESS (Logs observed duration & completion)
      ↓
COMPARE PREDICTED VS ACTUAL (Calculates estimation variance)
      ↓
UPDATE PERSONAL MODEL (Refines personal pace profile per task domain)
      ↓
REPLAN WHEN NECESSARY (Adapts schedule dynamically as reality shifts)
```

---

## 6. Core Product Concepts

### A. Work Items & Work Units
- **Work Item**: Any objective or deliverable requiring user time and energy (e.g. assignment, exam prep, software project, research report, grant submission, personal project).
- **Work Unit (Subtask)**: An atomic, measurable piece of work decomposed from a Work Item (e.g. *"Data preprocessing"*, *"Draft methodology section"*, *"Review unit tests"*).

### B. Deadline & Temporal Constraints
- A deadline is not evaluated in isolation. It is evaluated in the context of:
  $$\text{Deadline Risk} = \frac{\text{Remaining Estimated Effort}}{\text{Remaining Usable Available Time}}$$
- Considers hard deadlines, soft targets, milestones, buffer time, and time-of-day cutoffs.

### C. Personal Effort Estimation & Pace Learning
- The system recognizes that effort is deeply personal. If an initial baseline predicts 3 hours for writing a paper, but the user historically takes 4 hours on writing tasks (Pace Factor = 1.33), future writing estimates automatically adjust.
- AI estimates provide a starting baseline; the user can always inspect, override, and calibrate.

### D. Available Time & Usable Capacity
- Users have finite usable deep-work hours. 
- A 4-hour evening block containing a 1-hour gym workout and dinner does not offer 4 hours of focus—it offers 2.5 hours of usable deep-work capacity.
- The system explicitly differentiates between total clock time, available slots, and suitable cognitive focus windows.

### E. Dynamic Priority & Deadline Risk
- Priority is dynamic: an important task far in the future starts with low urgency. As available hours decrease and competing tasks consume capacity, its priority automatically rises.
- Risk states:
  - **SAFE**: Ample available time relative to required effort ($> 2.0\times$ buffer).
  - **WATCH**: Workload is manageable but requires steady progress ($1.3\times - 2.0\times$ buffer).
  - **AT RISK**: Usable time is nearly equal to remaining effort ($1.0\times - 1.3\times$ buffer). Slippage will cause a missed deadline.
  - **CRITICAL**: Required effort exceeds remaining available time ($< 1.0\times$ buffer). Deficit detected; intervention required.
  - **OVERDUE**: Deadline has passed without completion.

### F. Adaptive Daily Planning ("Today" View)
- Answers: *"What should I work on today, and when?"*
- Generates a proposed allocation of the user's available time blocks across top-priority Work Units.
- Plans are recommendations—never rigid mandates. The user can adjust, swap, or re-generate at any time.

### G. Protected Time for Personal Interests & Rest
- A healthy schedule must protect non-work activities: fitness, gaming, family, hobbies, rest, and recovery.
- The planner respects user-designated protected interest blocks and will not schedule deep work over them unless explicitly authorized.

---

## 7. Product Principles
1. **Explainable Intelligence**: No mysterious "black box" scores. When an item is marked `AT RISK` or given high priority, the system explicitly explains why (e.g. *"6.5h of work remain with only 4.0h of free time before Thursday 5 PM"*).
2. **Deterministic Calculations vs. Probabilistic Reasoning**: Mathematical calculations (risk ratios, time subtractions, countdowns) are computed using strict deterministic code. LLMs are used exclusively for semantic comprehension, task decomposition, and initial effort suggestions.
3. **Respect User Agency**: AI proposes; the user disposes. Decompositions, estimates, and daily plans are always editable.
4. **Data Minimization & Confidentiality**: Work descriptions, personal schedules, and time logs are private to the user. No public social feeds, leaderboards, or vanity metrics.
5. **Low Cognitive Load**: Interface designed for calm focus. Editorial typography, generous spacing, high contrast, and zero clutter.

---

## 8. Non-Goals
- **NOT an Opportunity Aggregator / Discovery Board**: Deadline Radar does not scrape or aggregate external hackathons, scholarships, or job portals.
- **NOT a Collaborative Team Jira / Enterprise ATS**: Designed exclusively as a personal command center for individuals, not for team sprints, agile burndowns, or manager oversight.
- **NOT a Google Calendar / Outlook Replacement**: Integrates with personal schedules and calendars, but does not seek to replace email or external meeting scheduling.
- **NOT an Automated Task Finisher**: The system does not write code, submit forms, or do the work for the user. It organizes and protects the time needed for the user to execute.

---

## 9. Technology Stack
- **Backend**: Python 3.11+, FastAPI (asynchronous REST API, Pydantic v2 schemas).
- **Database**: PostgreSQL 15+, SQLAlchemy 2.0 (AsyncIO), Alembic (deterministic schema migrations).
- **Frontend**: Vite + React 18+ + TypeScript, TanStack Query, Vanilla CSS / CSS Modules with editorial design system tokens.
- **AI/ML Subsystem**: Decoupled Python service facade interfacing with structured LLM APIs (Gemini 1.5 Flash / Claude / OpenAI) for natural-language parsing and decomposition; deterministic Python math engines for risk, capacity, and pace factor calibration.
- **Containerization**: Docker & Docker Compose.

---

## 10. Data Integrity Classification
Across all layers, data is strictly classified:
- `USER INPUT`: Explicit user-entered text, manual estimates, deadline dates, and schedule preferences.
- `AI-DERIVED DATA`: LLM-generated subtask suggestions, initial effort guesses, and milestone breakdowns (always flagged for review).
- `SYSTEM-CALCULATED DATA`: Deterministic calculations (risk ratios, available hours, dynamic priority scores, countdowns).
- `USER-VERIFIED DATA`: AI suggestions explicitly accepted, edited, or confirmed by the user.
- `ACTUAL OBSERVED DATA`: Empirical timer logs, session durations, and completion timestamps used to calculate personal pace factors.

---

## 11. Important Terminology
| Term | Definition |
| :--- | :--- |
| **Work Item** | A top-level task, project, assignment, or goal requiring effort. |
| **Work Unit** | A decomposed sub-task or actionable milestone within a Work Item. |
| **Deadline** | A temporal constraint with UTC timestamp, timezone, and buffer requirements. |
| **Available Time** | The actual usable free hours in a user's schedule, accounting for recurring commitments. |
| **Workload** | Total remaining estimated effort across active work items over a specified time horizon. |
| **Work Session** | A tracked block of focused execution against a specific Work Unit. |
| **Time Entry** | An empirical log of actual time spent (start time, end time, duration). |
| **Pace Factor** | Ratio of actual time spent to initial estimated time ($\text{Actual} / \text{Estimated}$) for a task domain. |
| **Deadline Risk** | Mathematical deficit/surplus indicator comparing remaining work to available time. |
| **Dynamic Priority** | Algorithmic ranking driven by urgency, risk, importance, and dependencies. |
| **Today's Plan** | A proposed daily time block schedule allocating available hours to priority work. |
| **Protected Interest**| Designated calendar slots reserved for personal well-being, fitness, or leisure. |

---

## 12. Current Scope (MVP) vs. Future Scope

### MVP Scope
- User authentication and personal profile setup.
- Work Item creation with title, description, deadline, importance, and category.
- Natural-language work understanding & AI decomposition into editable Work Units.
- Time availability configuration (weekly recurring commitments and deep-work capacity windows).
- Deterministic deadline risk calculation (`SAFE`, `WATCH`, `AT RISK`, `CRITICAL`, `OVERDUE`).
- Dynamic priority scoring with transparent explanations.
- "Today" adaptive daily planner (allocating available hours across priority work units).
- Built-in time tracking (active session timer and manual time logging).
- Prediction vs. actual variance tracking and personal pace factor calibration.
- In-app notification center for approaching deadlines and capacity risk warnings.

### Post-MVP Scope
- Calendar two-way synchronization (Google Calendar, Apple Calendar via `.ics` and OAuth).
- Multi-channel notifications (email digests, mobile push, Telegram/Discord webhooks).
- Advanced statistical pace models (Bayesian estimation adjustment across micro-skills).
- Energy-level curve optimization (matching high-focus tasks to user's peak morning/evening hours).
- Offline mobile companion app.
