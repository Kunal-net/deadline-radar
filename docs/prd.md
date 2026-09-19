# Deadline Radar — Product Requirements Document (PRD)

## 1. Product Overview

**Deadline Radar** is an AI-powered personalized deadline monitoring, workload management, and adaptive time-planning system. It is designed for students, researchers, software engineers, knowledge workers, and creators who manage complex, high-stakes commitments under hard temporal constraints.

Unlike traditional task managers that merely record when something is due, or calendar apps that display static event blocks, **Deadline Radar maintains continuous, living awareness of the relationship between work, effort, available time, personal pace, and deadline risk**.

### The Core Value Proposition
> **"Never be blindsided by a deadline again."**
> Deadline Radar estimates how long work will realistically take *you*, calculates whether you actually have enough usable hours before the cutoff, warns you when commitments become risky, and dynamically structures your day so you execute with clarity and calm.

---

## 2. Problem Statement

Ambitious individuals face chronic cognitive overwhelm, estimation errors, and deadline panic:

1. **The "Friday Deadline" Fallacy**: Traditional tools treat deadlines as point-in-time alerts. A to-do list records: *"Distributed Systems Lab 3 due Friday 11:59 PM."* It provides zero insight into the fact that Lab 3 requires 9 hours of deep work, the user has only 5 usable free hours between now and Friday, and another urgent commitment is competing for the exact same hours.
2. **The Planning Fallacy & Cognitive Blindness**: Humans suffer from chronic optimism bias when estimating task duration. Because traditional productivity software never tracks *actual time spent* against *predicted estimates*, users repeat the same severe underestimations semester after semester, quarter after quarter.
3. **Monolithic Task Paralysis**: Large, complex projects (e.g. *"Write Master's Thesis Literature Review"*, *"Prepare for Algorithm Final"*, *"Ship v1 Mobile Redesign"*) feel intimidating and amorphous. Users procrastinate because the work has not been decomposed into concrete, bite-sized units with clear time budgets.
4. **Disconnect Between Workload and Calendar Capacity**: Calendars show busy blocks; to-do lists show tasks. Neither system calculates whether the user's **aggregate demand for time** exceeds their **actual supply of available hours**.
5. **Static Priority Stagnation**: A task assigned "Medium Priority" stays medium until 12 hours before the deadline, when it suddenly triggers emergency crunching. Priority in real life is dynamic: it depends on remaining effort, available buffer, and competing demands.
6. **Burnout from Neglecting Personal Well-being**: Standard tools schedule work into every free gap, ignoring the user's need for gym, rest, hobbies, family, and recovery.

---

## 3. Product Vision

Deadline Radar aspires to be the definitive **intelligent time command center** that answers:

> **"What deserves my time right now, how much effort remains, and will I finish safely before the deadline?"**

It transforms reactive stress into proactive, calm execution by continuously learning how the user works and adapting plans in real time as life unfolds.

---

## 4. Target Users

### Primary Audience: College & Graduate Students
- **Context**: STEM, business, law, and medical students juggling problem sets, lab reports, exams, research papers, and application milestones.
- **Pain Points**: Heavy concurrent deadlines, irregular weekly schedules, severe estimation optimism, frequent last-minute cramming.
- **Needs**: Automatic decomposition of academic projects, realistic hour estimates, visual countdowns, and daily study allocations.

### Secondary Audience: Software Engineers & Technical Knowledge Workers
- **Context**: Developers, analysts, and product builders managing sprint deliverables, code reviews, technical specs, bug fixes, and continuous self-study.
- **Pain Points**: Constant context switching, underestimating debugging/testing time, conflicting project priorities.
- **Needs**: Granular effort tracking, deep-work session logging, and capacity-aware scheduling.

### Tertiary Audience: Independent Creators & Solopreneurs
- **Context**: Freelancers, researchers, and creators delivering client milestones, grants, and personal projects without a manager.
- **Pain Points**: Total autonomy leading to self-scheduling paralysis and hidden capacity deficits.
- **Needs**: Unbiased reality checks on workload versus available hours.

---

## 5. User Personas

### Persona A: "Aarav" — The Overcommitted Computer Science Student
- **Profile**: 21 years old, 3rd-year CS student taking 5 technical courses, preparing a conference paper, and training for a half-marathon.
- **Current Behavior**: Keeps a Notion checklist and Google Calendar. Thinks coding an assignment will take "about 2 hours" when it consistently takes 5.5 hours.
- **Critical Moment of Failure**: Starts his Operating Systems assignment at 8:00 PM on the due date, discovers at 11:00 PM that the debugging phase requires another 3 hours, and misses the submission window.
- **Needs from Deadline Radar**: AI decomposition of coding projects, historical pace adjustment ($1.6\times$ on Systems programming), and an alert on Wednesday warning: *"Only 3.5h of free time remain before Friday; you have 6.0h of estimated work. Start now."*

### Persona B: "Elena" — The PhD Candidate & Researcher
- **Profile**: 26 years old, 2nd-year doctoral researcher drafting grant proposals, analyzing datasets, and preparing teaching seminars.
- **Current Behavior**: Maintains sprawling spreadsheets of deliverables. Tasks feel infinite and unbounded.
- **Critical Moment of Failure**: Spends all week polishing dataset preprocessing while neglecting a grant proposal due on Thursday, forcing a sleepless night.
- **Needs from Deadline Radar**: Dynamic priority calculation that elevates the grant proposal as its deadline buffer shrinks, combined with protected daily blocks for writing and gym.

### Persona C: "Marcus" — The Remote Software Engineer & Lifelong Learner
- **Profile**: 29 years old, senior engineer balancing company sprint deliverables with cloud certification studies and family time.
- **Current Behavior**: Works long hours whenever a sprint deadline approaches, sacrificing evening rest and fitness.
- **Needs from Deadline Radar**: Time availability modeling that treats gym, family dinner, and rest as protected non-work blocks, ensuring work is scheduled strictly within available working hours.

---

## 6. Jobs to Be Done (JTBD)

| Job Code | When I... | I want to... | So that I can... |
| :--- | :--- | :--- | :--- |
| **JTBD-01** | Receive a complex project or syllabus assignment | Have it decomposed into discrete, estimated work units | Know exactly where to begin without cognitive paralysis. |
| **JTBD-02** | Plan my upcoming week | See whether my remaining work fits into my available hours | Spot upcoming crunches days in advance and negotiate extensions or adjust commitments early. |
| **JTBD-03** | Start my working day | See a prioritized, realistic time allocation for "Today" | Sit down and immediately focus on high-impact work without deciding what to do next. |
| **JTBD-04** | Complete a work session | Log my actual time against what was estimated | Calibrate my personal pace model so future predictions become increasingly accurate. |
| **JTBD-05** | Fall behind on a task | Have the system recalculate risk and adapt my plan | Recover calmly without abandoning my schedule or burning out. |
| **JTBD-06** | Have personal fitness and leisure goals | Protect non-negotiable personal time | Maintain physical health and mental well-being without feeling guilty about neglected work. |

---

## 7. Product Goals

1. **Eliminate Unforeseen Deadline Crises**: Ensure 100% of tracked deadlines have explicit capacity projections, eliminating the *"I didn't realize how much was left"* shock.
2. **De-bias Effort Estimation**: Continuously calibrate user-specific personal pace factors, reducing the gap between estimated and actual duration by >= 40% within 30 days of active logging.
3. **Protect Human Usable Capacity**: Accurately calculate usable deep-work hours by subtracting classes, jobs, meals, workouts, and rest from raw clock time.
4. **Transparent, Explainable Prioritization**: Provide deterministic, clear rationales for why any work unit is scheduled today (e.g. remaining buffer ratio, deadline proximity, user importance).
5. **Frictionless Daily Execution**: Provide an interactive "Today" execution workspace featuring a built-in session timer, subtask checklist, and 1-click status transitions.

---

## 8. Non-Goals

To maintain laser focus, the following are explicitly **out of scope**:
- **NOT an Opportunity Aggregator / Discovery Board**: Deadline Radar will NOT scrape, aggregate, or recommend hackathons, internships, scholarships, or jobs. (Users can track application tasks, but the system is not a search engine).
- **NOT an Enterprise Jira / Team Agile Board**: Deadline Radar will NOT feature sprint story points, team velocity charts, Gantt allocations across team members, or managerial surveillance tools. It is strictly an individual personal command center.
- **NOT a General Meeting Scheduler**: It will NOT replace Google Calendar or Calendly for booking meetings. It models calendar busy-times to determine *available work capacity*.
- **NOT a Generative Content Creator**: The AI will NOT write reports, generate code, or complete assignments on behalf of the user. It organizes and budgets the time needed for the user to execute.
- **NOT a Social Network**: No followers, social feeds, public streaks, or leaderboards.

---

## 9. Product Principles

1. **Reality Over Wishful Thinking**: If a user has 4 hours of work and 2 hours of available time, the system must show a critical deficit clearly, rather than pretending everything will magically fit.
2. **Deterministic Calculations vs. Probabilistic Reasoning**: Mathematical calculations (risk ratios, available hours, dynamic priority scores, countdowns) are computed using strict deterministic code. LLMs are used exclusively for semantic comprehension, task decomposition, and initial effort suggestions.
3. **Respect User Agency**: AI proposes; the user disposes. Decompositions, estimates, and daily plans are always editable.
4. **Data Minimization & Confidentiality**: Work descriptions, personal schedules, and time logs are private to the user. No public social feeds, leaderboards, or vanity metrics.
5. **Editorial Calm**: An interface inspired by dark editorial typography, high contrast, generous spacing, and zero distracting gamification gimmicks.

---

## 10. Core User Journey

```text
1. INITIAL SETUP
   - User registers and sets up timezone and weekly working capacity windows.
   - User defines protected interest slots (e.g. Gym: MWF 7-8 AM, Dinner/Rest: 7-8 PM).

2. ADDING WORK
   - User inputs task in natural language: "CS 350 Distributed Systems Lab 3 due next Friday at 5pm."
   - AI extracts title, deadline, importance, and domain.
   - AI proposes a breakdown into 4 subtasks with baseline hour estimates (Total: 8.5h).
   - User reviews, adjusts subtasks, and confirms.

3. CAPACITY & RISK EVALUATION
   - System aggregates existing workload and maps it against available free blocks before next Friday.
   - System detects: 6.5h of available deep work vs 8.5h of estimated work.
   - Deadline Risk flagged as: CRITICAL (Deficit: 2.0h).
   - System alerts user immediately on Monday: "Distributed Systems Lab 3 has a 2-hour capacity deficit."

4. DAILY PLANNING ("TODAY" VIEW)
   - User opens Deadline Radar on Tuesday morning.
   - Today View presents: 3.5h of available deep work.
   - Proposed Plan:
     - 09:00 - 11:00: Distributed Systems Lab 3 — Subtask 1: RPC Protocol Implementation (2h)
     - 14:00 - 15:30: History Term Paper — Subtask 2: Primary Source Outline (1.5h)
   - User confirms plan.

5. EXECUTION & TIME TRACKING
   - User clicks "Start Session" on Subtask 1.
   - Built-in distraction-free stopwatch tracks active deep work.
   - User finishes in 2 hours 30 minutes (actual time logged: 2.5h vs estimated: 2.0h).

6. LEARNING & RE-CALIBRATION
   - System records estimation variance (+30 mins on Systems Coding).
   - Personal Pace Factor for "Systems Programming" updates from 1.00 to 1.15.
   - Remaining subtasks for Lab 3 automatically adjust their required estimates.
   - Dynamic priority updates across the entire workload to keep the user on track.
```

---

## 11. Work Item Model

A **Work Item** represents an overarching deliverable, assignment, project, or goal.

### Data Attributes
| Attribute | Data Source | Type | Required / Optional | Description |
| :--- | :--- | :--- | :---: | :--- |
| `id` | System | UUID | Required | Unique identifier |
| `title` | User / AI | String (3–255) | Required | Title of the work (e.g. "Distributed Systems Lab 3") |
| `description` | User / AI | Markdown | Optional | Detailed instructions, guidelines, rubrics |
| `category` | User / AI | Enum | Required | Academic, Engineering, Writing, Career, Research, Personal |
| `importance` | User | Enum (1–5) | Required | 1 (Low), 2 (Medium-Low), 3 (Medium), 4 (High), 5 (Critical) |
| `deadline` | User / AI | TIMESTAMPTZ | Required | Strict completion cutoff timestamp (UTC) |
| `deadline_type` | User | Enum | Required | `HARD` (penalty for lateness) or `SOFT` (self-imposed target) |
| `is_rolling` | User | Boolean | Required | True if open-ended / no strict calendar cutoff |
| `status` | System / User | Enum | Required | `NOT_STARTED`, `IN_PROGRESS`, `BLOCKED`, `COMPLETED`, `ARCHIVED` |
| `estimated_hours` | System / User | Float (hrs) | Required | Aggregate estimated hours across all subtasks |
| `actual_hours` | Observed Data | Float (hrs) | Required | Total actual hours logged across all sessions |
| `completion_pct` | System | Integer (0–100)| Required | Percentage of subtask effort completed |
| `tags` | User / AI | Array[String] | Optional | Topic tags (e.g. `python`, `systems`, `thesis`) |
| `created_at` | System | TIMESTAMPTZ | Required | Creation timestamp |
| `updated_at` | System | TIMESTAMPTZ | Required | Last modification timestamp |

---

## 12. Deadline Model

A deadline in Deadline Radar is a comprehensive temporal framework, not merely a date label:

### Key Dimensions
- **Exact Cutoff (`deadline`)**: Stored in UTC (`TIMESTAMPTZ`), localized on presentation to user's timezone.
- **Deadline Strictness**:
  - `HARD`: Zero tolerance for slip (e.g., college registrar cutoff, conference submission server, court filing).
  - `SOFT`: Self-imposed goal (e.g., "Finish draft before Friday so I can rest over the weekend"). Soft deadlines allow flexible re-planning without red alerts.
- **Timezone Awareness**: Preserves source timezone string (e.g. `PST`, `AoE`, `UTC+5:30`).
- **Anywhere on Earth (AoE)**: Handled deterministically as `UTC-12:00` (translating 23:59:59 AoE on Day $D$ into 11:59:59 UTC on Day $D+1$).
- **Buffer Target**: Configurable safety margin (e.g., aim to complete 24 hours before the hard cutoff).

---

## 13. Work Decomposition

Complex work items are paralyzed when left as single monolithic tasks. Deadline Radar decomposes Work Items into **Work Units (Subtasks)**.

### Subtask Structure
- Each Work Unit contains:
  - `title`: Actionable verb-driven label (e.g., "Implement Raft consensus election logic").
  - `estimated_hours`: Base estimated effort (typically 30 minutes to 3 hours).
  - `order_index`: Logical sequence of execution.
  - `is_completed`: Boolean completion toggle.
  - `actual_hours`: Cumulative logged session time.
- **AI Decomposition Flow**:
  - User submits raw prompt: *"Need to write a 10-page paper on Transformer Attention Mechanisms for CS 480 by Nov 12."*
  - AI identifies 5 logical milestones:
    1. Literature search & paper selection (2.0h)
    2. Architecture diagram & mathematical formulation (2.5h)
    3. Drafting Introduction & Background (2.0h)
    4. Drafting Methodology & Experimental Analysis (3.5h)
    5. Proofreading, citation check & formatting (1.5h)
  - Presented to user in an editable drawer to adjust hours, remove items, or add steps before confirming.

---

## 14. Effort Estimation

### Estimation Methodology
1. **Initial Baseline Prediction**:
   - The AI uses historical averages and domain heuristics to propose baseline hours for decomposed work units.
2. **Uncertainty & Confidence Range**:
   - Every estimate carries an uncertainty interval:
     $$\text{Estimated Range} = [\text{Optimistic}, \text{Most Likely}, \text{Pessimistic}]$$
   - Default point estimate uses PERT-weighted average:
     $$\text{Estimate} = \frac{\text{Optimistic} + 4 \times \text{Most Likely} + \text{Pessimistic}}{6}$$
3. **User Override**: User can manually set or override the estimate at any time.

---

## 15. Personalization & Personal Pace Factor

The core intelligence of Deadline Radar lies in its **personalized pace learning loop**:

### Mathematical Formulation
For each user and task domain $D$ (e.g. `writing`, `coding`, `reading`, `design`), the system maintains a **Pace Factor** ($PF_D$):

$$PF_D = \frac{\sum_{i=1}^{N} \text{Actual Time spent on task } i}{\sum_{i=1}^{N} \text{Estimated Time for task } i}$$

- If $PF = 1.0$: User works at predicted baseline speed.
- If $PF = 1.35$: User takes 35% longer than baseline on this category.
- If $PF = 0.85$: User finishes 15% faster than baseline.

### Application to Planning
When estimating a new task in domain $D$ with baseline estimate $E_{\text{base}}$:
$$\text{Personalized Estimate} = E_{\text{base}} \times PF_D$$
This adjusted value is used for capacity calculations, risk assessment, and daily scheduling.

---

## 16. Available Time & Usable Capacity

Deadline Radar explicitly calculates the user's **Usable Working Capacity**:

### Weekly Schedule Model
- Users define their standard weekly schedule windows:
  - Example: Mon–Thu: 09:00–12:00 (Morning Deep Work), 14:00–17:00 (Afternoon Work), 19:00–21:00 (Evening Review).
- **Non-Work Commitments (Busy Blocks)**:
  - Classes, lectures, day-job shifts, commuting, meals, family obligations.
- **Focus Efficiency Factor**:
  - Humans cannot sustain 100% deep focus across an 8-hour block.
  - The system applies an efficiency factor (default 75%): a nominal 4-hour open block provides $4.0 \times 0.75 = 3.0$ hours of usable focused deep work.

---

## 17. Workload Calculation

**Workload** represents the cumulative demand for focus hours over a given time horizon:

$$\text{Workload}(T) = \sum_{k \in \text{Active Tasks Due before } T} \text{Remaining Estimated Hours}(k)$$

- **Capacity Deficit / Surplus**:
  $$\text{Capacity Delta}(T) = \text{Available Usable Hours}(T) - \text{Workload}(T)$$
  - $\Delta > 0$: Capacity Surplus (Healthy, ample buffer).
  - $\Delta < 0$: Capacity Deficit (Crunch alert; impossible to finish without dropping commitments or reallocating hours).

---

## 18. Deadline Risk

Deadline Risk is computed deterministically from the **Risk Ratio** ($R$):

$$R = \frac{\text{Remaining Estimated Effort}}{\text{Remaining Available Usable Hours before Deadline}}$$

### Risk States
| State | Risk Ratio Range | Description | System Action |
| :--- | :---: | :--- | :--- |
| **SAFE** | $R \le 0.50$ | Effort requires $\le 50\%$ of available time ($> 2.0\times$ buffer). | Normal scheduling; low urgency. |
| **WATCH** | $0.50 < R \le 0.75$ | Effort requires $50\% - 75\%$ of available time ($1.33\times - 2.0\times$ buffer). | Visible on radar; steady daily progress recommended. |
| **AT RISK** | $0.75 < R \le 1.00$ | Effort consumes almost all available time ($1.0\times - 1.33\times$ buffer). | Elevated priority; flagged on dashboard; warning banner. |
| **CRITICAL** | $R > 1.00$ | Required effort exceeds total usable hours before cutoff ($\text{Deficit}$). | High-visibility emergency alert; prompts user to drop tasks, adjust deadlines, or unlock extra hours. |
| **OVERDUE** | Now $>$ Deadline | Deadline elapsed with uncompleted subtasks. | Persistent overdue reconciliation prompt on dashboard. |

---

## 19. Dynamic Priority

Priority is not a static tag chosen once. It is a **continuously recalculated score** (0 to 100) driven by:

$$\text{Priority Score} = w_1 \cdot \text{Urgency} + w_2 \cdot \text{RiskRatio} + w_3 \cdot \text{Importance} + w_4 \cdot \text{DependencyImpact}$$

### Transparent Explanation
Every priority score is accompanied by human-readable reasoning:
- *"High Priority: 6.5h of work remain with only 4.0h of free time before Thursday 5 PM. High importance (4/5)."*

---

## 20. Planning & Time Allocation ("Today" View)

The daily planner resolves decision fatigue by building an actionable schedule for **Today**:

### Planner Rules
1. Fetches available deep-work blocks for Today from user schedule profile.
2. Selects top-priority uncompleted Work Units from `CRITICAL`, `AT RISK`, and high-importance work.
3. Packs Work Units into available time slots matching user's preferred session length (default 60–90 mins).
4. Respects designated protected interest blocks (gym, meals, rest).
5. Provides **1-Click Regenerate** and drag-and-drop manual reordering.

---

## 21. Actual-Time Tracking

Execution requires empirical feedback:
- **Built-in Session Timer**:
  - Distraction-free stopwatch / countdown timer on active work unit.
  - Can pause, resume, or cancel.
- **Manual Time Entry**:
  - Ability to log past sessions (e.g. "Logged 1h 45m of offline library reading").
- **Real-time Progress Indicator**:
  - As time is logged, remaining effort decrements and completion percentage updates automatically.

---

## 22. Prediction vs. Actual Analysis

When a Work Unit or Work Item is marked complete:
- The system computes the **Estimation Variance**:
  $$\text{Variance} = \text{Actual Time} - \text{Estimated Time}$$
  $$\text{Variance \%} = \frac{\text{Actual Time} - \text{Estimated Time}}{\text{Estimated Time}} \times 100$$
- Visual feedback displays:
  - *"Completed in 3h 15m (Estimated: 2h 30m · +30% longer)"*
  - Feeds into the user's historical accuracy metrics.

---

## 23. Learning Loop

Over time, Deadline Radar becomes an indispensable personal asset:
- Tracks historical variance trends across 30, 60, and 90-day windows.
- Automatically suggests recalibrating default category pace factors:
  - *"You consistently take 40% longer on Writing tasks than initially estimated. Would you like Deadline Radar to apply a 1.4x factor to future writing drafts?"*
- Never overrides user settings without consent.

---

## 24. Personal Interests & Protected Time

To prevent burnout, the system elevates personal life to first-class status:
- Users can create **Protected Interest Blocks**:
  - Fitness & Gym
  - Family & Relationships
  - Hobbies & Creative Play
  - Rest, Sleep & Recovery
- The planning engine treats protected blocks as inviolable: work will never be scheduled during protected slots unless the user explicitly forces an override during a critical emergency.

---

## 25. Dashboard Requirements

The main command center communicates total situational awareness at a glance:
1. **Radar Status Bar**:
   - Overall Capacity Status: Healthy / Tight / Deficit.
   - Aggregate Workload for next 7 days vs Available Hours.
2. **Urgent & High-Risk Radar**:
   - Cards for items in `CRITICAL` and `AT RISK` states with live time-remaining countdowns and required effort badges.
3. **Today's Plan Quick-Widget**:
   - Current / next scheduled work block with "Start Session" button.
4. **Active Workload Breakdown**:
   - Visual bar chart comparing remaining work by category.
5. **Overdue Reconciliation Shelf**:
   - Overdue tasks requiring status resolution.

---

## 26. Today View

The dedicated execution view for daily flow:
- Linear chronological timeline of today's schedule blocks (08:00 to 22:00).
- Distinguishes: Scheduled Work Blocks, Busy Blocks (Classes/Work), Protected Interest Blocks, and Free Buffer.
- Active Timer Drawer: Floating or docked timer with play/pause, note taking, and "Mark Complete" button.

---

## 27. Timeline View

- Horizontal Gantt-style timeline visualizing active Work Items across days and weeks.
- Displays milestone cutoffs, dependencies, and overlapping project windows.
- Highlights days where aggregate workload exceeds daily capacity with red column backgrounds.

---

## 28. Calendar View

- Monthly and weekly grid view showing:
  - Hard and soft deadline badges.
  - Scheduled deep work session allocations.
  - Non-work busy blocks and protected interest slots.
- Day click opens sidebar drawer detailing all commitments, deadlines, and available hours for that date.

---

## 29. Workload View

- Quantitative capacity management screen:
  - Weekly capacity vs demand bar chart (Available Hours vs Planned Hours).
  - Risk heatmap across upcoming 4 weeks.
  - Capacity deficit alert banners with actionable suggestions (e.g. *"Free up 4 hours this weekend or request extension on Assignment 2"*).

---

## 30. Insights & Analytics

- **Estimation Accuracy Trend**: Line chart of prediction error percentage over time.
- **Pace Factor Breakdown**: Table of learned pace multipliers per category.
- **Deep Work Hours Logged**: Weekly totals of focused execution time.
- **On-Time Completion Rate**: Percentage of work completed before hard deadline.

---

## 31. Notifications

- **Capacity Deficit Alerts**: Triggered when a new commitment creates a negative capacity delta.
- **Risk Escalation Warnings**: Fired when a task transitions from `WATCH` to `AT RISK` or `CRITICAL`.
- **Proximity Reminders**: Configurable alerts at 7 days, 3 days, 1 day, and 6 hours prior to hard cutoff.
- **Morning Plan Briefing**: Daily briefing at user-configured time (e.g. 08:00) summarizing Today's proposed plan.

---

## 32. User Preferences

- **Schedule Windows**: Configurable start/end of working day, weekly deep work capacity limits.
- **Focus Efficiency Factor**: Slider (50% to 90%, default 75%).
- **Notification Toggles**: Individual toggles for risk alerts, proximity reminders, and daily briefing.
- **Timezone Configuration**: Auto-detected with manual override.

---

## 33. AI Features

| Feature Name | Input | Output | AI Role | Deterministic Role |
| :--- | :--- | :--- | :--- | :--- |
| **Natural Language Work Parsing** | Raw user text (e.g. assignment prompt) | Structured Work Item draft (title, deadline, importance) | Entity extraction & date parsing | Timestamp conversion & validation |
| **Work Decomposition** | Work Item title & description | Array of discrete Work Units with baseline hours | Semantic breakdown into logical steps | Cumulative hour aggregation |
| **Effort Baseline Estimation** | Work Unit description & category | Estimated baseline hours (min, likely, max) | Heuristic hour estimation | Personal pace factor multiplication |
| **Adaptive Plan Generation** | Available time slots + priority queue | Optimized daily time block proposal | Recommends logical task sequencing | Capacity slot packing & boundary enforcement |
| **Missing Information Detection** | User raw input | Warning flags (e.g. "No deadline detected") | Checks semantic completeness | Enforces mandatory field schema |

---

## 34. Authentication & Data Privacy

- Email and password registration with Argon2id hashing.
- Stateless JWT authentication with short-lived access tokens.
- Strict row-level data isolation (`user_id` enforced on all work items, time logs, and preferences).
- Zero selling, sharing, or public exposure of user work or schedule data.

---

## 35. Functional Requirements

- **FR-01**: System must support CRUD operations on Work Items with mandatory title, category, importance, and deadline.
- **FR-02**: System must support decomposing Work Items into ordered Work Units with individual hour estimates.
- **FR-03**: System must store and compute all timestamps in UTC (`TIMESTAMPTZ`) with client-side localization.
- **FR-04**: System must compute Risk Ratio $R = \text{RemainingEffort} / \text{AvailableHours}$ deterministically.
- **FR-05**: System must calculate Dynamic Priority based on urgency, risk, importance, and dependencies.
- **FR-06**: System must maintain a user schedule profile with recurring working windows and protected interest blocks.
- **FR-07**: System must calculate remaining usable capacity by subtracting busy and protected blocks from gross time.
- **FR-08**: System must generate a proposed Today plan matching high-priority work units into available daily slots.
- **FR-09**: System must provide an active session timer and manual time entry logger with second-level precision.
- **FR-10**: System must compute estimation variance upon work unit completion and update domain-specific pace factors.
- **FR-11**: System must dispatch in-app notifications when an item escalates to `AT_RISK` or `CRITICAL`.
- **FR-12**: System must provide timeline, calendar, and workload capacity visualization endpoints.

---

## 36. Non-Functional Requirements

- **Performance**: Dashboard urgency and Today plan endpoints must respond in $<150\text{ms}$.
- **AI Latency**: Natural language decomposition and parsing must complete in $<5.0\text{s}$.
- **Reliability**: 99.5% uptime. Failure of AI services must never block manual work creation or timer logging.
- **Accessibility**: WCAG 2.1 AA compliant contrast ratios and keyboard navigation.
- **Responsiveness**: Fully responsive across mobile (375px+), tablet, and desktop (1440px+).

---

## 37. Edge Cases

- **Zero Available Time**: If a user has 0 free hours before a deadline, system immediately marks item `CRITICAL` with 100% capacity deficit.
- **Extreme Overestimation/Underestimation**: If actual time is $>5\times$ or $<0.2\times$ estimated time, system flags outlier for user confirmation before skewing the learned pace factor.
- **Interrupted Timer**: If a session timer runs for $>8$ hours continuously, system prompts user on return: *"Did you leave your timer running?"* and offers easy duration trimming.
- **Overlapping Deadlines**: When multiple high-importance deadlines fall on the same day, priority engine allocates available hours proportionally to risk ratios.

---

## 38. Error States

- **AI Parsing Failure**: If LLM service fails or times out, system preserves raw user text in manual input form with banner: *"AI parsing unavailable; please review fields manually."*
- **Database Connection Drop**: Client displays offline toast and buffers active timer locally in `localStorage` until connection is restored.
- **Validation Errors**: Clear field-level red highlights for invalid inputs (e.g. negative estimates, past deadlines on new items).

---

## 39. Empty States

- **New User / Empty Workload**: *"Your radar is clear! Add your first project, assignment, or goal to start monitoring deadlines and workload."*
- **Empty Today Plan**: *"No work scheduled for today. Take a break, enjoy your protected time, or pull in tomorrow's priorities."*
- **No Overdue Tasks**: *"All caught up! Zero overdue obligations."*

---

## 40. MVP Scope Matrix

| Feature | In MVP? | Later? | Justification |
| :--- | :---: | :---: | :--- |
| Work Item & Subtask CRUD | **Yes** | — | Core foundation of work tracking |
| AI Work Decomposition | **Yes** | — | Critical differentiator for overcoming task paralysis |
| Usable Time & Busy Block Setup | **Yes** | — | Mandatory for calculating capacity vs workload |
| Deterministic Risk Engine | **Yes** | — | Core product promise: early deadline risk detection |
| Dynamic Priority Scoring | **Yes** | — | Solves daily decision fatigue |
| Adaptive Today View Planner | **Yes** | — | Core daily execution workspace |
| Active Stopwatch & Time Logger | **Yes** | — | Provides empirical actual data for learning loop |
| Personal Pace Factor Learning | **Yes** | — | Key differentiator: personalized estimation |
| Protected Personal Interests | **Yes** | — | Prevents burnout; balances work and well-being |
| Visual Timeline & Calendar | **Yes** | — | Essential spatial views of deadlines and workload |
| Two-Way Google Calendar Sync | — | **Later** | MVP uses manual schedule windows; external sync adds complex OAuth |
| Transactional Email & Push | — | **Later** | In-app notification center is sufficient for MVP launch |
| Native iOS / Android Apps | — | **Later** | Responsive web client serves mobile well initially |

---

## 41. Post-MVP Scope

- Two-way Google Calendar, Outlook, and Apple Calendar synchronization via OAuth and webhooks.
- Multi-channel notification delivery (mobile push notifications, daily email digests, Telegram bot).
- Energy-curve matching (scheduling high-cognitive tasks during user's peak morning/evening focus windows).
- Collaborative visibility (sharing deadline radar summaries with a mentor, advisor, or accountability partner).

---

## 42. Acceptance Criteria

- **AC-01 (Work Addition & Decomposition)**:
  - *Given* a user entering *"Prepare for Machine Learning Midterm on Oct 24"*,
  - *When* they click "Decompose with AI",
  - *Then* within 5 seconds, the system returns 3–6 concrete study subtasks with estimated hours for user review.
- **AC-02 (Capacity Risk Detection)**:
  - *Given* a Work Item requiring 8.0 hours due in 48 hours, and user schedule having only 4.0 available free hours,
  - *When* the system evaluates workload,
  - *Then* the item is assigned `CRITICAL` risk status and displays an explicit 4.0-hour deficit warning.
- **AC-03 (Today Plan Generation)**:
  - *Given* a user opening the Today view on a day with 3.0 available focus hours,
  - *When* the daily plan is generated,
  - *Then* the system allocates exactly 3.0 hours to the highest-priority subtasks without overlapping busy or protected blocks.
- **AC-04 (Pace Factor Learning)**:
  - *Given* a user completing a 2.0-hour estimated coding subtask in 3.0 hours,
  - *When* they mark the subtask complete,
  - *Then* actual time is logged, estimation variance (+50%) is recorded, and the learned pace factor for `coding` updates.

---

## 43. Success Metrics

### Product Metrics
- **Deadline Success Rate**: $\ge 90\%$ of tracked work items completed on or before the deadline.
- **Estimation Accuracy Improvement**: $\ge 35\%$ reduction in average estimation variance within 30 days of active use.
- **Daily Plan Execution Rate**: $\ge 70\%$ of hours scheduled in the Today view actually executed.
- **Weekly Active Retention**: $\ge 50\%$ of users logging sessions weekly after 4 weeks.

### Technical Metrics
- **API Response Latency**: 95th percentile $< 150\text{ms}$ on dashboard, today, and radar queries.
- **AI Decomposition Latency**: 95th percentile $< 4.5\text{s}$.
- **Zero Calculation Failures**: 100% deterministic accuracy on risk ratios, available hours, and countdowns.

---

## 44. Open Product Questions

| # | Question | Impact | Options | Working Assumption |
| :-: | :--- | :--- | :--- | :--- |
| **PQ-1** | Should subtasks have independent hard deadlines, or inherit the parent Work Item deadline? | Affects decomposition complexity and schedule packing. | (A) Inherit parent deadline with auto-staged target dates<br>(B) Mandatory independent deadlines for all subtasks | **Assumption**: Subtasks inherit parent deadline with optional auto-staged target milestone dates generated by the planner. |
| **PQ-2** | What default focus efficiency factor should be applied to raw calendar free time? | Affects realism of available capacity. | (A) 100% (raw free hours)<br>(B) 75% (realistic focus buffer)<br>(C) User-configurable slider | **Assumption**: 75% default focus efficiency with a user-configurable slider in preferences. |
| **PQ-3** | How should the system handle partially completed work units when adjusting daily plans? | Affects time-tracking rollups and remaining effort. | (A) Prompt user for remaining hours on pause<br>(B) Automatically deduct logged time from estimate | **Assumption**: Automatically deduct logged session time from remaining estimate, with 1-click option for user to manually adjust remaining hours. |
