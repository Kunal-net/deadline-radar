# Frontend Specification — Deadline Radar

## 1. Product Identity & Design Philosophy

Deadline Radar is an AI-powered personalized deadline monitoring and time-management operational command center. Its primary purpose is to help the user answer with absolute clarity:

> **What deserves my time right now?**

The frontend architecture prioritizes:
- **Operational Clarity**: High-signal, low-cognitive-load views presenting workload pressure, risk states, and actionable recommendations.
- **Empirical Accuracy**: Explicit distinction between user-entered commitments, AI suggestions, system calculations, and observed stopwatch time.
- **Seamless Work Breakdown & Tracking**: Inline subtask decomposition, interactive stopwatch sessions, and adaptive plan adjustment.
- **Strict Anti-Patterns**: No generic SaaS dashboard cards, no decorative AI sparkle clutter, no meaningless gamification badges, and no noisy uncalibrated alert dialogs.

---

## 2. Technical Stack Architecture

The frontend client is built as a responsive Single Page Application (SPA):

- **Framework**: **React 18+ with TypeScript** (strict mode enabled).
- **Build Tool**: **Vite** for rapid HMR and optimized production bundles.
- **Routing**: **React Router v6+** with lazy-loaded route chunks and protected route guards.
- **Server State & Caching**: **TanStack Query (React Query v5)** for optimistic UI updates, automated query invalidation, and background synchronization.
- **Client/Session State**: **Zustand** for lightweight local state (active stopwatch timer, sidebar collapse, draft modal state).
- **Icons**: **Lucide React** for consistent, minimalist line iconography.
- **Date & Time Handling**: **date-fns** with UTC standard conversions and user-timezone display formatting.
- **Form Management**: **React Hook Form + Zod** for schema validation matching backend Pydantic models.

---

## 3. Information Architecture & Route Map

| Path | Screen Name | Layout / Access | Purpose & Core Content |
| :--- | :--- | :--- | :--- |
| `/` | **Landing Page** | Public Layout | Visual editorial introduction to Deadline Radar, core loop, problem visualization, CTA. |
| `/login` | **Sign In** | Minimal Auth | Email/password authentication, error banners, password recovery link. |
| `/register` | **Sign Up** | Minimal Auth | Account registration, timezone detection, password validation. |
| `/onboarding` | **Onboarding Wizard** | Focused Flow | 5-step setup: study/work context, weekly available hours, protected interests, working preferences. |
| `/today` | **Today View** | App Shell (Protected) | **Core operational view**: Active stopwatch session, NOW/NEXT recommendations, Today's timeline schedule. |
| `/dashboard` | **Radar Dashboard** | App Shell (Protected) | High-level operational overview: Risk states radar, approaching deadlines, workload vs. capacity alerts. |
| `/work` | **Work Items List** | App Shell (Protected) | Master view of all work items, category tabs, risk filters, sorting by dynamic priority, bulk actions. |
| `/work/new` | **Add Work Modal / Drawer** | App Overlay | Create work item, optional natural-language input, AI decomposition preview and editing drawer. |
| `/work/:id` | **Work Detail** | App Shell (Protected) | Deep dive into a single work item: subtasks checklist, effort estimates, risk breakdown, logged time entries. |
| `/timeline` | **Timeline Projection** | App Shell (Protected) | Gantt-style forward projection showing work durations mapped against suitable working capacity windows. |
| `/calendar` | **Calendar View** | App Shell (Protected) | Day and Week calendar grids integrating schedule blackout blocks, planned time slots, and tracked sessions. |
| `/workload` | **Workload & Capacity** | App Shell (Protected) | Analytical bar visualization comparing user available hours vs estimated demand by day and week. |
| `/priorities` | **Dynamic Priorities** | App Shell (Protected) | Ranked list of work items sorted by dynamic priority score with transparent AI/system explanations. |
| `/planning` | **Adaptive Daily Planner** | App Shell (Protected) | Daily time allocation generator, drag-and-drop plan item reordering, commitment and interest buffers. |
| `/insights` | **Personal Insights** | App Shell (Protected) | Historical learning metrics: category pace factors, predicted vs actual accuracy curves, logged time. |
| `/notifications` | **Notifications Center** | App Shell (Protected) | Proximity alerts, risk escalation notices, capacity overload warnings, and read/dismiss controls. |
| `/profile` | **Profile & Preferences** | App Shell (Protected) | Account details, working habits, buffer percentages, weekly recurring availability templates. |
| `/settings` | **Settings** | App Shell (Protected) | Protected interests manager, notification channels, password change, data export. |
| `*` | **404 Not Found** | Minimal Layout | Editorial empty state with quick navigation back to `/today`. |

---

## 4. Screen Specifications & User Flows

### 4.1 Today View (`/today`)
The primary daily cockpit for the user.
- **Top Section — Active Session Bar**:
  - If a session is running: Displays current work item and work unit title, live elapsed stopwatch timer (HH:MM:SS), "Stop Session" button, and optional notes input.
  - If idle: Displays a quick "Start Focus Session" selector with one-click launch for the current NOW recommendation.
- **Middle Section — NOW & NEXT Allocation**:
  - **NOW Card**: Clear, prominent highlight of the single most critical work block right now, duration, deadline countdown, and deterministic rationale (e.g., *"4.5h remaining with only 3.6h capacity before Friday"*).
  - **NEXT Card**: The queued work block or scheduled commitment immediately following the current block.
- **Bottom Section — Today's Timeline Plan**:
  - Chronological list of planned time blocks for today.
  - Each item shows start/end time, work title, status indicator (`pending`, `in_progress`, `completed`, `rescheduled`), and action buttons (start timer, mark complete, dismiss).
  - Ability to trigger "Re-generate Plan" if reality shifts during the day.

### 4.2 Radar Dashboard (`/dashboard`)
Macro view of commitments and temporal risk.
- **Radar Urgency Quadrant**:
  - Summary counter cards grouped by risk states: `SAFE`, `WATCH`, `AT RISK`, `CRITICAL`, `OVERDUE`.
  - Visual high-contrast risk ratio metric showing remaining effort vs available suitable hours.
- **Approaching Deadlines Widget**:
  - Chronological list of deadlines due within the next 7 days.
  - Includes progress bar (completed units vs total units), estimated remaining hours, and deadline timestamp with countdown badge.
- **Weekly Capacity Meter**:
  - Horizontal progress bar comparing total estimated workload this week against net available capacity.
  - Alerts user if workload exceeds 100% capacity ("Overbooked by 4.5 hours").

### 4.3 Work Master & Add Work Flow (`/work`, `/work/new`)
- **Work Items Table & Cards**:
  - Filter bar: Status (`All`, `In Progress`, `Completed`, `Blocked`), Category (`Academic`, `Project`, `Exam Prep`, etc.), Risk State.
  - Sort dropdown: Dynamic Priority (default), Deadline Proximity, Remaining Effort, Created Date.
  - Row / Card contents: Title, category badge, deadline date + relative countdown, remaining estimated hours, risk state badge, completion progress ring.
- **Add Work Flow (Modal / Slide-Over Drawer)**:
  - **Step 1: Input Mode**: User enters title, deadline, category, and optional natural language description.
  - **Step 2: AI Decomposition (Optional)**: User clicks "Decompose with AI". A drawer displays suggested work units with estimated durations and detected missing information.
  - **Step 3: User Verification**: User can edit subtask names, delete items, reorder, adjust estimates, or add custom subtasks.
  - **Step 4: Save**: Work item and verified units are committed to the backend.

### 4.4 Work Item Detail (`/work/:id`)
- **Header**: Title, category tag, deadline picker (with hard/soft toggle), status selector (`todo`, `in_progress`, `blocked`, `completed`).
- **Telemetry Bar**: Total estimated hours, user pace factor adjustment, total actual logged hours, current risk state, dynamic priority score.
- **Work Units Checklist**:
  - Interactive reorderable list of subtasks.
  - Each row shows completion checkbox, title, estimate, actual time spent, and a "Start Timer" button.
- **Risk & Priority Explanation Drawer**:
  - Transparent textual explanation of why the item is ranked at its current priority.
  - Math breakdown: Remaining Effort ($E_r$) / Available Hours ($H_a$) = Risk Ratio ($R$).
- **Logged Time History**:
  - List of past work sessions with duration, dates, notes, and manual "Log Time" button.

### 4.5 Timeline Projection (`/timeline`)
- Horizontal Gantt-style timeline projection spanning 14, 30, or 60 days.
- Maps estimated work hours strictly across days that have suitable available capacity.
- Displays deadline vertical milestone lines. If an item's projected completion extends beyond its deadline, the projected segment is highlighted in alert styling with a "Projected Late" tag.

### 4.6 Calendar View (`/calendar`)
- Dual view toggle: Week View (default) and Day View.
- Visualizes:
  - Recurring available working windows (lightly shaded background).
  - Schedule blackout blocks and protected personal interests (e.g., Gym, Meals, Classes).
  - Planned work slots from the Daily Planner.
  - Historical completed time entry blocks.
- Drag-to-create schedule blocks and click-to-view details.

### 4.7 Workload & Capacity View (`/workload`)
- Day-by-day and week-by-week bar charts comparing available working hours vs. scheduled work demand.
- Visual overload threshold: bars exceeding 100% capacity are highlighted with an overbooking indicator.
- Breakdown panel showing which projects are consuming the largest share of weekly capacity.

### 4.8 Daily Planning View (`/planning`)
- Interactive daily time budget manager.
- Controls to generate or adapt a plan for any selected date.
- Shows total day capacity, protected personal interest hours, and planned work hours.
- Reorder items via drag-and-drop to adjust planned sequence.

### 4.9 Personal Insights View (`/insights`)
- **Category Pace Factors**: Visual meters showing user's empirical multiplier for each category (e.g., Academic = 1.25x, Coding = 1.05x).
- **Prediction vs. Actual Distribution**: Scatter or bar comparison of estimated hours vs. actual logged hours over time.
- **Estimation Accuracy Trend**: Moving average of estimation error showing personalization progress over weeks.

---

## 5. Key Reusable UI Components

1. **`ActiveSessionWidget`**: Global or header-mounted timer showing running stopwatch, elapsed time, and quick stop/note controls.
2. **`RiskBadge`**: Displays risk state (`SAFE`, `WATCH`, `AT RISK`, `CRITICAL`, `OVERDUE`) accompanied by explicit text and icon, never relying on color alone.
3. **`DynamicPriorityScore`**: Displays score (0–100) with a tooltip or popover detailing the mathematical calculation and constraints.
4. **`WorkDecompositionEditor`**: Reorderable list of subtasks with inline duration inputs, add/remove controls, and total duration tally.
5. **`CapacityBar`**: Visual meter showing allocated vs available hours with overflow alert state.
6. **`TimeEntryModal`**: Form for retroactively logging completed time with start/end time or manual duration in minutes.

---

## 6. State Management Architecture

### 6.1 Server State (TanStack Query)
- Query keys structured hierarchically:
  - `['work', 'list', filters]`
  - `['work', 'detail', workId]`
  - `['work', 'units', workId]`
  - `['planning', 'today']`
  - `['tracking', 'active-session']`
  - `['availability', 'templates']`
  - `['availability', 'blocks', dateRange]`
  - `['insights', 'summary']`
  - `['notifications', 'list']`
- **Optimistic Updates**: Toggling subtask completion or reordering immediately updates client cache and reverts on API error.

### 6.2 Client Session State (Zustand)
- **`useTimerStore`**: Maintains local running tick for active session, synchronization with server timestamp, and local note draft.
- **`useUIStore`**: Manages modal visibility (Add Work modal, Log Time modal), drawer expansion, and timeline zoom levels.

---

## 7. Operational States: Loading, Empty, and Error Handling

### 7.1 Loading States
- **Skeleton Loaders**: Custom structural skeleton layouts matching table rows, cards, and timeline bars rather than full-page spinners.
- **Inline Action Spinners**: Button loading states for API mutations to prevent duplicate submissions.

### 7.2 Empty States
- **Work Items Empty**: *"No active work items. Add your first assignment, project, or exam preparation to activate your radar."* with primary CTA "Add Work".
- **Today Plan Empty**: *"No plan generated for today yet. Review your available capacity (4.0h) and click 'Generate Plan'."*
- **Notifications Empty**: *"All caught up. No deadline risk escalations or alerts."*

### 7.3 Error States & Fallbacks
- **API Disconnections**: Non-intrusive floating banner: *"Network connection lost. Time tracking continues offline and will sync when reconnected."*
- **AI Service Degradation**: If `/ai/decompose` fails or times out, the Add Work drawer informs: *"AI decomposition is currently unavailable. You can enter your subtasks manually below."* Input text is strictly preserved.

---

## 8. Accessibility (a11y) & Responsiveness

- **Keyboard Navigation**: Full tab navigation across all interactive elements, modal focus trapping, and Esc key dismissals.
- **ARIA Compliance**: Proper `aria-expanded`, `aria-haspopup`, `role="timer"`, and screen-reader status live regions for stopwatch updates.
- **Mobile Responsiveness**:
  - Desktop (>= 1024px): Top editorial navigation, wide multi-column layouts, side-by-side timeline/detail drawers.
  - Tablet (768px - 1023px): Two-column adaptive grid, collapsible filters.
  - Mobile (< 768px): Single-column stack, bottom navigation bar (`Today`, `Work`, `Timeline`, `Insights`), full-screen overlay modals for work creation and stopwatch tracking.
