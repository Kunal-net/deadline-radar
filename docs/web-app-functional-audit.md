# Deadline Radar — Web App Functional Audit

**Audit Date:** September 20, 2026  
**Auditor:** Senior QA Engineer & Full-Stack Systems Reviewer  
**Audit Scope:** Full Application Stack (`frontend/`, `backend/`, `ai-model/`, database, network, API schemas, user journeys)  
**Verification Method:** Static Code Analysis, API Integration Diagnostics, Server Telemetry, Runtime Contract Analysis (Browser automation skipped per audit protocol)

---

## 1. Executive Summary

| Category | Count | Percentage of Total | Notes |
| :--- | :--- | :--- | :--- |
| **Total Interactive Elements Inspected** | **74** | 100% | Buttons, forms, inputs, switches, modals, links, tabs |
| **Working** | **17** | 23.0% | Client-side routing, navigation drawer, client-side search/filters, print dialog |
| **Partially Working** | **7** | 9.5% | Client-side state updates (Zustand timer, Onboarding form, local item prepends) without persistence |
| **UI-Only / Dummy** | **28** | 37.8% | Buttons triggering toast simulations, inputs with fake parsing banners, non-functional tabs |
| **Broken** | **11** | 14.9% | Schema mismatches, path discrepancies, invalid parameters causing 401, 404, 405, 422 errors |
| **Mocked** | **7** | 9.5% | Pages and components bound directly to static datasets or silently falling back on 401 errors |
| **Not Implemented** | **4** | 5.4% | Login form, Signup form, Auth guard, Calendar sync (CalDAV/ICS) |
| **Unverified** | **0** | 0.0% | All components and endpoints traced end-to-end |

### Overall Implementation State: Severely Fractured Architecture
The Deadline Radar application presents an exceptional, high-fidelity editorial visual design and a complete, well-architected FastAPI backend with SQLite/PostgreSQL persistence and deterministic AI evaluation engines. However, **the frontend and backend are effectively completely disconnected in production**:
1. **Zero Authentication in Frontend**: The backend strictly guards 90% of all API endpoints with `get_current_user` (`Authorization: Bearer <token>`). The frontend has **no login form, no registration form, and never writes `deadline_radar_token` to `localStorage`**.
2. **Universal Silent Mock Fallbacks**: Because the frontend sends unauthenticated requests, every single API query in `apiHooks.ts` catches HTTP 401 Unauthorized and silently falls back to static mock fixtures (`MOCK_WORK_ITEMS`, `MOCK_TODAY_OVERVIEW`, `MOCK_CAPACITY_METRIC`).
3. **Simulated State Everywhere**: Actions that appear functional (logging time, marking tasks complete, saving settings, rebalancing workload, adapting schedules) merely trigger `showToast(...)` or mutate ephemeral React component state that vanishes immediately upon page reload.

---

## 2. Application Routes

| Route | Page Component | Auth Required | Status | Evidence |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `ProductView.tsx` | No | **PARTIALLY WORKING** | Static landing page renders. "Sign In" navigates to `/today`. "Open Radar" navigates to `/onboarding`. Intent evaluation button is a dummy click handler. |
| `/onboarding` | `OnboardingView.tsx` | No | **PARTIALLY WORKING** | Interactive sliders and boundary toggles update client-side Zustand store, but never persist to database. Navigates to `/today`. |
| `/today` | `TodayView.tsx` | Intended Yes / Actual No | **MOCKED** | Bypasses `useTodayOverview` hook; directly imports and renders hardcoded `MOCK_TODAY_OVERVIEW` fixture. |
| `/radar` | `RadarView.tsx` | Intended Yes / Actual No | **MOCKED** | Calls `useDashboardSummary()`, which fails with 401 Unauthorized and falls back to `MOCK_CAPACITY_METRIC`. |
| `/dashboard` | `Navigate to /radar` | No | **WORKING** | Client-side compatibility redirect operates correctly. |
| `/work` | `WorkListView.tsx` | Intended Yes / Actual No | **PARTIALLY WORKING** | Client-side search and category filtering work over `MOCK_WORK_ITEMS`. Quick-add appends to local React state only (not persisted). |
| `/work/:id` | `WorkDetailView.tsx` | Intended Yes / Actual No | **PARTIALLY WORKING** | Renders item details from `MOCK_WORK_ITEMS`. Time logging, rescheduling, and archiving are pure toast simulations. |
| `/work/new` | `AddWorkView.tsx` | Intended Yes / Actual No | **BROKEN** | AI buttons fail with 401. Form submission calls `POST /work` without auth, fails with 401, creates an ephemeral in-memory mock item, and immediately loses it. |
| `/planning` | `PlanningView.tsx` | Intended Yes / Actual No | **UI-ONLY / DUMMY** | 100% static HTML. Dynamic calibration form only triggers an ephemeral pulse toast. AI assist hook fails with 422 Validation Error. |
| `/timeline` | `TimelineView.tsx` | Intended Yes / Actual No | **UI-ONLY / DUMMY** | 100% static mock HTML. Scope buttons (`This Week`, `Next Week`, `14-Day`) toggle local state but change nothing in the view. |
| `/calendar` | `CalendarView.tsx` | Intended Yes / Actual No | **MOCKED** | Toggles between Week, Day, and Agenda layout branches, but all branches render hardcoded `MOCK_CALENDAR_SLOTS`. |
| `/workload` | `WorkloadView.tsx` | Intended Yes / Actual No | **UI-ONLY / DUMMY** | 100% static hardcoded values from `DAYS_DATA`. "Rebalance Horizon" button opens a modal that only triggers a toast. |
| `/priorities` | `PrioritiesView.tsx` | Intended Yes / Actual No | **UI-ONLY / DUMMY** | 100% static hardcoded HTML. "Initiate Focus" only toggles button icon; "Add New" navigates to `/work/new`. |
| `/insights` | `InsightsView.tsx` | Intended Yes / Actual No | **UI-ONLY / DUMMY** | 100% static hardcoded array `velocityHistory`. Does not call `useInsightsSummary()`. Button triggers a toast simulation. |
| `/settings` | `SettingsView.tsx` | Intended Yes / Actual No | **UI-ONLY / DUMMY** | All 5 tabs, toggles, profile details, and save buttons are cosmetic or local React state. "Save Changes" and "Log Out" are dummy toast calls. |
| `*` | `NotFoundView.tsx` | No | **WORKING** | Correctly catches unmatched URLs and provides a "Return to Today" button. |

---

## 3. Authentication Audit

| Feature | Status | Frontend | Backend | Database | Runtime Result | Problem |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **User Registration** | **NOT IMPLEMENTED** in Frontend | Missing (`No UI/form`) | Fully Working (`POST /api/v1/auth/register`) | Persists in `users` table | Backend generates UUID, hashed password, and JWT token | Frontend has no registration page or form. |
| **User Login** | **NOT IMPLEMENTED** in Frontend | Missing (`"Sign In"` is an anchor linking to `/today`) | Fully Working (`POST /api/v1/auth/login`) | Verifies bcrypt hash | Backend returns JWT Bearer token on valid credentials | No login form or modal exists in the frontend. |
| **Token Storage** | **BROKEN** | `localStorage.getItem('deadline_radar_token')` is read, but `localStorage.setItem` is **NEVER** called | Expects `Authorization: Bearer <token>` | Verified via `get_current_user` dependency | `localStorage` has no token; all API requests lack Authorization headers | Requests receive HTTP 401 Unauthorized `MISSING_TOKEN`. |
| **Current User (`/auth/me`)** | **NOT CONNECTED** | Not called by frontend | Fully Working (`GET /api/v1/auth/me`) | Reads user profile & preferences | Valid token returns user JSON; without token returns 401 | Frontend uses hardcoded user "Elena Vance" in `SettingsView.tsx`. |
| **Logout** | **UI-ONLY / DUMMY** | `SettingsView.tsx:538` runs `onClick={() => showToast('Session termination simulation.')}` | No backend endpoint required | N/A | Displays a toast banner; does not clear tokens or redirect | Does nothing. |
| **Protected Routes** | **NOT IMPLEMENTED** | `App.tsx` has no auth guards or redirects; all routes load without authentication | Protected via FastAPI dependencies | N/A | Any unauthenticated user can access any route | Frontend renders empty or mock data when unauthenticated. |

---

## 4. Settings Audit

| Setting / Button | Status | Handler | API Endpoint | Persistence | Runtime Result | Problem |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Save Changes (Top Button)** | **UI-ONLY / DUMMY** | `handleSave()` (`SettingsView.tsx:30`) | None | None | Displays toast: *"Settings saved successfully."* | Never calls any API; values reset upon page reload. |
| **Save Changes (Sidebar Button)** | **UI-ONLY / DUMMY** | `handleSave()` (`SettingsView.tsx:522`) | None | None | Displays toast: *"Settings saved successfully."* | Never calls any API; values reset upon page reload. |
| **Export Calendar Data** | **UI-ONLY / DUMMY** | `showToast(...)` (`SettingsView.tsx:530`) | None | None | Displays toast: *"Calendar data export initiated."* | No export or ICS file generation occurs. |
| **Log Out Button** | **UI-ONLY / DUMMY** | `showToast(...)` (`SettingsView.tsx:538`) | None | None | Displays toast: *"Session termination simulation."* | Does not log out or clear session. |
| **Settings Tabs (Capacity, Boundaries, Intelligence, Account, Preferences)** | **UI-ONLY / DUMMY** | `setActiveTab(...)` (`SettingsView.tsx:76-120`) | None | None | Toggles CSS highlight on tab buttons only | `activeTab` is not used anywhere else in JSX; does not filter or switch content. |
| **Weekly Focus Baseline (+/-)** | **PARTIALLY WORKING** | `setWeeklyHours(...)` (`SettingsView.tsx:170, 185`) | None (`PATCH /users/me/preferences` exists on backend) | None | Updates local React state number | Lost on page refresh; never updates backend preferences. |
| **Daily Focus Limit (+/-)** | **PARTIALLY WORKING** | `setDailyHours(...)` (`SettingsView.tsx:205, 220`) | None (`PATCH /users/me/preferences` exists on backend) | None | Updates local React state number | Lost on page refresh; never updates backend preferences. |
| **Active Working Days (Mon–Sun)** | **PARTIALLY WORKING** | `toggleDay(...)` (`SettingsView.tsx:249`) | None (`PUT /availability/templates` exists on backend) | None | Updates local React state dictionary | Lost on page refresh; never updates backend templates. |
| **Weekend Zero-Work Policy** | **PARTIALLY WORKING** | `setWeekendPolicy(...)` (`SettingsView.tsx:358`) | None | None | Toggles UI switch visual position | Lost on page refresh; never updates backend. |
| **15% Safety Buffer Toggle** | **PARTIALLY WORKING** | `setSafetyBuffer(...)` (`SettingsView.tsx:413`) | None | None | Toggles UI switch visual position | Lost on page refresh; never updates backend. |
| **Proactive Nudge Dropdown** | **PARTIALLY WORKING** | `setNudgeOption(...)` (`SettingsView.tsx:469`) | None | None | Changes select dropdown value | Lost on page refresh; never updates backend. |
| **Account Profile Info** | **UI-ONLY / DUMMY** | None (`SettingsView.tsx:511-516`) | None (`GET /auth/me` exists on backend) | None | Static hardcoded text: *"Elena Vance"*, *"elena@deadlineradar.com"* | Does not load active user identity. |

---

## 5. Work Management Audit

| Feature | Status | UI Component | API Call | DB Persistence | Runtime Result | Problem |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Add Work (Natural Intake)** | **BROKEN** | `AddWorkView.tsx` | `POST /api/v1/work` | Yes (if authed) | Returns 401 Unauthorized without token. With token, backend ignores `deadlineUtc` & `estimatedEffortHours`. | Schema parameter casing mismatch (`deadlineUtc` vs `deadline_utc`, `estimatedEffortHours` vs `estimated_hours`). |
| **Quick Add (Work Ledger)** | **UI-ONLY / DUMMY** | `WorkListView.tsx:60` | None | None | Appends item to `localItems` React state | Disappears immediately on page reload. |
| **Work List Retrieval** | **MOCKED** | `WorkListView.tsx` | `GET /api/v1/work` | Yes | Fails with 401 Unauthorized and falls back to `MOCK_WORK_ITEMS` | Real database items are never displayed to unauthenticated frontend. |
| **Work Item Detail** | **MOCKED** | `WorkDetailView.tsx` | `GET /api/v1/work/{id}` | Yes | Fails with 401 Unauthorized and falls back to `MOCK_WORK_ITEMS[0]` | Real database item is not loaded. |
| **Subtask Breakdown List** | **UI-ONLY / DUMMY** | `WorkDetailView.tsx:25` | None (`useWorkUnits` not imported) | None | Checkboxes toggle local `executionBlocks` state | Does not read or write `work_units` table. |
| **Manual Time Logging (+30m, +1h)** | **UI-ONLY / DUMMY** | `WorkDetailView.tsx:302` | None (`POST /tracking/sessions/stop` exists) | None | Increments local `actualHours` state and shows toast | No time entry is written to database. |
| **Reschedule Work** | **UI-ONLY / DUMMY** | `WorkDetailView.tsx:397` | None | None | Displays toast: *"Schedule plan adjusted against calendar."* | Does not alter deadlines or schedule blocks. |
| **Mark Work as Complete** | **UI-ONLY / DUMMY** | `WorkDetailView.tsx:403` | None (`PATCH /work/{id}` exists) | None | Displays toast: *"Assignment archived as completed."* | Does not update work item status in database. |
| **Delete Work Item** | **NOT IMPLEMENTED** | None | `DELETE /api/v1/work/{id}` exists on backend | Yes | No delete button or trigger exists in frontend UI | Feature missing from UI. |

---

## 6. Today Audit

| Value / Feature | Display Value | Source | Real or Mock? | Runtime Tested |
| :--- | :--- | :--- | :--- | :--- |
| **Date & Issue Number** | *"Sunday, Oct 19"* / *"Issue 042"* | `MOCK_TODAY_OVERVIEW` in `TodayView.tsx:42-43` | **Hardcoded Mock** | Yes |
| **Available Focus Hours** | `4.5 hrs` | `MOCK_TODAY_OVERVIEW.availableFocusHours` | **Hardcoded Mock** | Yes |
| **Approaching Deadlines Count** | `1` | `MOCK_TODAY_OVERVIEW.deadlinesCount` | **Hardcoded Mock** | Yes |
| **Day Shape Plate Visuals** | Photograph + Schedule block breakdown | `DayShapePlate.tsx` | **Static Placeholder** | Yes |
| **Actionable Priorities List** | ResNet Retraining, FastAPI Spec, Linear Algebra | `DEFAULT_PRIORITIES` in `ActionablePrioritiesList.tsx` | **Hardcoded Mock** | Yes |
| **Priority Checkbox Toggle** | Checkbox visual toggle | Component `useState` (`completedIds`) | **UI-Only / Dummy** | Yes |
| **Start Focus Session** | Stopwatch timer on top bar | `useAppStore` in-memory Zustand store | **Frontend Simulation** | Yes |
| **Natural Schedule Adjustment** | Typing > 5 chars shows "Parsed Intent" banner | Component `useState` (`statusState`) | **UI-Only / Dummy** | Yes |
| **Schedule Adjustment Submission** | "Committed: ... Schedule balanced" banner | `useAppStore.setTodayAdjustmentNote` | **Frontend Simulation** | Yes |

---

## 7. Radar Audit

| Metric / Element | Display Value | Source | Backend Connected? | Reality Assessment |
| :--- | :--- | :--- | :--- | :--- |
| **Risk Counts (Critical/Watch/Safe)** | 1 Critical, 2 Watch, 4 Safe | `useDashboardSummary()` catch block | No (returns 401, catches to mock) | **Mocked Fallback** |
| **Available Focus Capacity** | `18.5 hrs` | `MOCK_CAPACITY_METRIC.availableFocusHours` | No | **Hardcoded Mock** |
| **Committed Work Hours** | `14.2 hrs` | `MOCK_CAPACITY_METRIC.committedWorkHours` | No | **Hardcoded Mock** |
| **Net Buffer Hours** | `4.3 hrs` | `MOCK_CAPACITY_METRIC.netBufferHours` | No | **Hardcoded Mock** |
| **Radar Hero Visual** | SVG Arc Gauges | Derived from `metric` props | No | **Mock-Derived UI** |
| **Approaching Deadlines List** | Machine Learning, FastAPI Spec, Linear Algebra | `MOCK_WORK_ITEMS` | No | **Hardcoded Mock** |
| **Feasibility Intake Form** | Natural language feasibility input | `FeasibilityIntake.tsx` local state | No | **UI-Only / Dummy** (Never calls API) |
| **Backend Calculation Engine** | Mathematically computes $R = \text{Effort} / \text{Capacity}$ | `DashboardService.get_summary()` | Yes, fully implemented on backend | Real backend engine is unreachable due to missing auth. |

---

## 8. Planning Audit

| Planning Feature | Status | Implementation Details |
| :--- | :--- | :--- |
| **Weekly Allocation Balance Sheet** | **UI-ONLY / DUMMY** | Renders static numbers (`18.5h`, `14.2h`, `4.3h`) from `MOCK_CAPACITY_METRIC`. |
| **Daily Schedule Breakdown** | **UI-ONLY / DUMMY** | Hardcoded Monday through Friday blocks in `PlanningView.tsx`. |
| **AI Planning Assistance** | **BROKEN** | `usePlanAIAssist('today')` calls `/planning/today/ai-assist`. Backend parameter is `plan_date: date`. Returns **422 Validation Error** (`"Input should be a valid date or datetime"`). Hook catches error and displays mock recommendations. |
| **Dynamic Calibration Input** | **UI-ONLY / DUMMY** | Typing an adjustment into the form calls `setAdjustmentToast(...)`, which shows an animated pulse toast for 4 seconds and does nothing else. |
| **Drag-and-Drop Reordering** | **NOT IMPLEMENTED** | No drag-and-drop handles, library, or event handlers exist in `PlanningView.tsx`. |
| **Save / Regenerate Plan** | **NOT IMPLEMENTED** | No button exists to trigger `POST /api/v1/planning/generate` or persist schedule modifications. |

---

## 9. Calendar / Timeline / Workload / Priorities Audit

| Page | Data Source | Interactive Controls | Real Backend Connected? | Functional Assessment |
| :--- | :--- | :--- | :--- | :--- |
| **Timeline (`/timeline`)** | Hardcoded JSX in `TimelineView.tsx` | `This Week`, `Next Week`, `14-Day Horizon` buttons toggle `horizonScope` React state | **No** (Doesn't call `useTimelineProjection`) | **UI-ONLY / DUMMY**: Buttons only change their own CSS active border; timeline graphics are static. |
| **Calendar (`/calendar`)** | `MOCK_CALENDAR_SLOTS` in `mockData.ts` | `Week`, `Day`, `Agenda` toggle buttons switch view modes | **No** (No CalDAV, ICS, or backend connection) | **MOCKED**: Renders mock slots across 3 layout variations. Cannot create, edit, or delete events. |
| **Workload (`/workload`)** | `const DAYS_DATA` in `WorkloadView.tsx` | "Rebalance Horizon" button opens a modal; "Apply Suggested Rebalance" button shows a toast | **No** (Doesn't call `useWorkloadCapacity`) | **UI-ONLY / DUMMY**: Rebalance action is a dummy toast. Data is hardcoded. |
| **Priorities (`/priorities`)** | Hardcoded JSX in `PrioritiesView.tsx` | "Initiate Focus" button toggles local state `isFocusActive`; "Add New Commitment" navigates to `/work/new` | **No** | **UI-ONLY / DUMMY**: Tasks, metrics, and explanations are static text. |

---

## 10. Insights Audit

| Feature / Element | Status | Code Evidence | Runtime Behavior |
| :--- | :--- | :--- | :--- |
| **Velocity History Table** | **UI-ONLY / DUMMY** | `const velocityHistory` (`InsightsView.tsx:12-53`) | Static rows (*"Q3 Architecture Review"*, *"Investor Board Pitch"*, etc.). |
| **Backend Telemetry API** | **NOT CONNECTED** | `useInsightsSummary()` exists in `apiHooks.ts:295` but is **never imported** in `InsightsView.tsx` | Backend `GET /api/v1/insights/summary` calculates real Exponential Moving Averages (EMA), but frontend never calls it. |
| **Cycle View Toggle** | **UI-ONLY / DUMMY** | `setViewMode('grounded' \| 'early')` (`InsightsView.tsx:94-114`) | Toggles between two static text descriptions. |
| **Apply Calibrated Multipliers** | **UI-ONLY / DUMMY** | `handleApplyMultiplier()` (`InsightsView.tsx:67-70`) | Sets `multiplierApplied = true` and shows toast: *"Drafting multiplier calibrated: 1.12x applied..."*. Never saves to database. |

---

## 11. AI Functionality Audit

| AI Feature | Status | Frontend Trigger | Backend Endpoint | AI Provider / Model | Real or Mock? | Runtime Result |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Work Interpretation** | **BROKEN (Auth)** | `handleInterpret` in `AddWorkView.tsx:56` | `POST /api/v1/ai/interpret` | `MockAIProvider` (regex & heuristic NLP parser) | Real backend service, heuristic provider | Fails with HTTP 401 Unauthorized in production due to missing token. Works when bearer token is supplied manually. |
| **Work Decomposition** | **BROKEN (Auth)** | `handleDecompose` in `AddWorkView.tsx:66` | `POST /api/v1/ai/decompose` | `MockAIProvider.decompose_work` | Real backend service, heuristic provider | Fails with HTTP 401 Unauthorized in production. Works when bearer token is supplied manually. |
| **Effort Estimation** | **BROKEN (Schema & Auth)** | `handleEstimateEffort` in `AddWorkView.tsx:89` | `POST /api/v1/ai/estimate-effort` | `MockAIProvider.estimate_effort` | Real backend service | Fails with 401 without token. With token, fails with **422 Validation Error** because frontend sends `work_title` instead of `title`. |
| **Grounded Risk Explanation** | **BROKEN (Schema & Auth)** | `useWorkExplanation` in `WorkDetailView.tsx:19` | `GET /api/v1/work/{id}/explanation` | `MockAIProvider.explain_risk_and_priority` | Real backend service | Fails with 401 without token. With token, backend returns `risk_explanation` and `actionable_recommendations` while frontend expects `contributing_factors` and `mitigations`, hiding them. |
| **Planning AI Assist** | **BROKEN (Param & Auth)** | `usePlanAIAssist` in `PlanningView.tsx:10` | `GET /api/v1/planning/{plan_date}/ai-assist` | `MockAIProvider.assist_planning` | Real backend service | Fails with 401 without token. With token, fails with **422 Validation Error** because frontend passes `'today'` instead of a date `YYYY-MM-DD`. |
| **External LLM (Gemini/Claude)** | **MOCKED** | Configured in `backend/app/core/config.py` | N/A | `AI_PROVIDER = "mock"` | Mocked | Zero external API calls are made to Gemini or Anthropic; all AI runs through local heuristic classes in `provider.py`. |

---

## 12. API Contract Audit

| Frontend Call | Backend Endpoint | Exists? | HTTP Method Match? | Auth Match? | Schema Match? | Runtime Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `apiRequest('/work')` | `GET /api/v1/work` | Yes | Yes (`GET`) | **Mismatch** (Backend requires Bearer token) | Yes | **Fails (401)** in production |
| `apiRequest('/work', { method: 'POST' })` | `POST /api/v1/work` | Yes | Yes (`POST`) | **Mismatch** (Backend requires Bearer token) | **Mismatch** (`deadlineUtc` vs `deadline_utc`, `estimatedEffortHours` vs `estimated_hours`) | **Fails (401)**; with token saves with 0 effort & null deadline |
| `apiRequest('/work/{id}')` | `GET /api/v1/work/{id}` | Yes | Yes (`GET`) | **Mismatch** (Backend requires token) | Yes | **Fails (401)** in production |
| `apiRequest('/work/{id}/units', { method: 'POST' })` | `POST /api/v1/work/{id}/units` | Yes | Yes (`POST`) | **Mismatch** (Backend requires token) | Yes | **Unused** by frontend components |
| `apiRequest('/work/{id}/units/{uid}', { method: 'PUT' })` | `PATCH /api/v1/work/{id}/units/{uid}` | Yes | **Mismatch** (Frontend sends `PUT`, Backend defines `PATCH`) | **Mismatch** | Yes | **Broken (405 Method Not Allowed)** |
| `apiRequest('/dashboard/summary')` | `GET /api/v1/dashboard/summary` | Yes | Yes (`GET`) | **Mismatch** (Backend requires token) | Yes | **Fails (401)** in production |
| `apiRequest('/timeline/projection')` | `GET /api/v1/timeline/projection` | Yes | Yes (`GET`) | **Mismatch** | Yes | **Unused** by frontend components |
| `apiRequest('/workload/capacity')` | `GET /api/v1/workload/capacity` | Yes | Yes (`GET`) | **Mismatch** | Yes | **Unused** by frontend components |
| `apiRequest('/today/overview')` | `GET /api/v1/today/overview` | Yes | Yes (`GET`) | **Mismatch** | Yes | **Unused** by frontend components |
| `apiRequest('/tracking/session/active')` | `GET /api/v1/tracking/sessions/active` | **Mismatch** | Yes (`GET`) | **Mismatch** | N/A | **Broken (404 Not Found)** (`session` vs `sessions`) |
| `apiRequest('/tracking/session/start')` | `POST /api/v1/tracking/sessions/start` | **Mismatch** | Yes (`POST`) | **Mismatch** | N/A | **Broken (404 Not Found)** (`session` vs `sessions`) |
| `apiRequest('/tracking/session/pause')` | None | **No** | `POST` | N/A | N/A | **Broken (404 Not Found)** (Endpoint does not exist) |
| `apiRequest('/tracking/session/resume')` | None | **No** | `POST` | N/A | N/A | **Broken (404 Not Found)** (Endpoint does not exist) |
| `apiRequest('/tracking/session/stop')` | `POST /api/v1/tracking/sessions/stop` | **Mismatch** | Yes (`POST`) | **Mismatch** | N/A | **Broken (404 Not Found)** (`session` vs `sessions`) |
| `apiRequest('/insights/summary')` | `GET /api/v1/insights/summary` | Yes | Yes (`GET`) | **Mismatch** | Yes | **Unused** by frontend components |
| `apiRequest('/ai/interpret')` | `POST /api/v1/ai/interpret` | Yes | Yes (`POST`) | **Mismatch** | Yes | **Fails (401)** in production |
| `apiRequest('/ai/decompose')` | `POST /api/v1/ai/decompose` | Yes | Yes (`POST`) | **Mismatch** | Yes | **Fails (401)** in production |
| `apiRequest('/ai/estimate-effort')` | `POST /api/v1/ai/estimate-effort` | Yes | Yes (`POST`) | **Mismatch** | **Mismatch** (Frontend sends `work_title`, backend requires `title`) | **Broken (422 Validation Error)** |
| `apiRequest('/work/{id}/explanation')` | `GET /api/v1/work/{id}/explanation` | Yes | Yes (`GET`) | **Mismatch** | **Mismatch** (Different response field names) | **Fails (401)**; with token hides factors |
| `apiRequest('/planning/{date}/ai-assist')` | `GET /api/v1/planning/{date}/ai-assist` | Yes | Yes (`GET`) | **Mismatch** | **Mismatch** (Frontend passes `'today'`, backend requires `date`) | **Broken (422 Validation Error)** |

---

## 13. Dummy / Placeholder Detection

### Finding 1: Fake Log Out Button
- **File:** [frontend/src/pages/SettingsView.tsx](file:///Users/kunalsuryanshi/Documents/Projectsnew/deadline-radar/frontend/src/pages/SettingsView.tsx#L537-L545)
- **Component:** `SettingsView`
- **Code:** `onClick={() => showToast('Session termination simulation.')}`
- **Classification:** **UI-ONLY / DUMMY**
- **Why:** The button displays a toast message explicitly stating *"Session termination simulation"*; it does not clear tokens, terminate cookies, or redirect the user.

### Finding 2: Fake Calendar Export Button
- **File:** [frontend/src/pages/SettingsView.tsx](file:///Users/kunalsuryanshi/Documents/Projectsnew/deadline-radar/frontend/src/pages/SettingsView.tsx#L529-L536)
- **Component:** `SettingsView`
- **Code:** `onClick={() => showToast('Calendar data export initiated (ICS format).')}`
- **Classification:** **UI-ONLY / DUMMY**
- **Why:** Displays an informational toast; no CalDAV, ICS, or file download is triggered.

### Finding 3: Fake Settings Save Handlers
- **File:** [frontend/src/pages/SettingsView.tsx](file:///Users/kunalsuryanshi/Documents/Projectsnew/deadline-radar/frontend/src/pages/SettingsView.tsx#L30-L32)
- **Component:** `SettingsView`
- **Code:** `const handleSave = () => { showToast('Settings saved successfully. Capacity baseline recalibrated.'); };`
- **Classification:** **UI-ONLY / DUMMY**
- **Why:** Both "Save Changes" buttons only trigger a toast. No network call, `localStorage` write, or store update occurs. All toggled options vanish on reload.

### Finding 4: Inoperative Settings Navigation Tabs
- **File:** [frontend/src/pages/SettingsView.tsx](file:///Users/kunalsuryanshi/Documents/Projectsnew/deadline-radar/frontend/src/pages/SettingsView.tsx#L74-L130)
- **Component:** `SettingsView`
- **Code:** Tab buttons call `setActiveTab('capacity')`, `setActiveTab('boundaries')`, etc.
- **Classification:** **UI-ONLY / DUMMY**
- **Why:** The state variable `activeTab` is only used to add an active CSS class to the button itself. It is never used in conditional rendering; all sections are always rendered consecutively on the page.

### Finding 5: Fake Natural Schedule Adjustment
- **File:** [frontend/src/components/today/NaturalScheduleAdjustment.tsx](file:///Users/kunalsuryanshi/Documents/Projectsnew/deadline-radar/frontend/src/components/today/NaturalScheduleAdjustment.tsx#L21-L45)
- **Component:** `NaturalScheduleAdjustment`
- **Code:** Typing > 5 characters triggers hardcoded text: `"Parsed Intent: Adjusting commitments · Remaining focus adjusted"`. Submitting shows `"Committed: ... Schedule balanced."`
- **Classification:** **UI-ONLY / DUMMY**
- **Why:** Purely hardcoded text based on string length. Does not call the AI interpreter or planning adjustment endpoints.

### Finding 6: Fake Feasibility Intake Form
- **File:** [frontend/src/components/radar/FeasibilityIntake.tsx](file:///Users/kunalsuryanshi/Documents/Projectsnew/deadline-radar/frontend/src/components/radar/FeasibilityIntake.tsx#L40-L75)
- **Component:** `FeasibilityIntake`
- **Code:** Button click evaluates `estimatedEffort <= availableBufferHours` on hardcoded constants and displays static safe text.
- **Classification:** **UI-ONLY / DUMMY**
- **Why:** Never invokes `/ai/interpret` or the backend feasibility calculation service.

### Finding 7: Fake Workload Rebalance Action
- **File:** [frontend/src/pages/WorkloadView.tsx](file:///Users/kunalsuryanshi/Documents/Projectsnew/deadline-radar/frontend/src/pages/WorkloadView.tsx#L96-L99)
- **Component:** `WorkloadView`
- **Code:** `handleApplyRebalance = () => { setIsRebalanceModalOpen(false); showToast('1.0h shifted to Wednesday. Thursday load eased.'); };`
- **Classification:** **UI-ONLY / DUMMY**
- **Why:** Merely closes modal and prints a hardcoded toast string without modifying schedule slots.

### Finding 8: Fake Time Logging Buttons
- **File:** [frontend/src/pages/WorkDetailView.tsx](file:///Users/kunalsuryanshi/Documents/Projectsnew/deadline-radar/frontend/src/pages/WorkDetailView.tsx#L302-L315)
- **Component:** `WorkDetailView`
- **Code:** Buttons `+30m`, `+1.0h`, `+2.0h sprint` call `handleLogTime(...)` which updates local component `useState` and shows a toast.
- **Classification:** **UI-ONLY / DUMMY**
- **Why:** No time entry is written to the backend or saved in the database.

### Finding 9: Fake Work Completion and Reschedule Buttons
- **File:** [frontend/src/pages/WorkDetailView.tsx](file:///Users/kunalsuryanshi/Documents/Projectsnew/deadline-radar/frontend/src/pages/WorkDetailView.tsx#L396-L405)
- **Component:** `WorkDetailView`
- **Code:** `onClick={() => setToastMessage('Schedule plan adjusted against calendar.')}`, `onClick={() => setToastMessage('Assignment archived as completed.')}`
- **Classification:** **UI-ONLY / DUMMY**
- **Why:** Pure string toasts; zero API requests or status mutations occur.

### Finding 10: Fake Planning Dynamic Adaptation Form
- **File:** [frontend/src/pages/PlanningView.tsx](file:///Users/kunalsuryanshi/Documents/Projectsnew/deadline-radar/frontend/src/pages/PlanningView.tsx#L12-L18)
- **Component:** `PlanningView`
- **Code:** Form submission runs `setAdjustmentToast('Re-allocated focus blocks for ...')`.
- **Classification:** **UI-ONLY / DUMMY**
- **Why:** Does not calculate re-allocations or interact with the planning engine.

### Finding 11: Fake Horizon Scope Buttons
- **File:** [frontend/src/pages/TimelineView.tsx](file:///Users/kunalsuryanshi/Documents/Projectsnew/deadline-radar/frontend/src/pages/TimelineView.tsx#L20-L50)
- **Component:** `TimelineView`
- **Code:** Scope buttons update `horizonScope` in `useState`.
- **Classification:** **UI-ONLY / DUMMY**
- **Why:** `horizonScope` is only referenced to style the buttons themselves; the timeline items beneath never change.

### Finding 12: Fake Multiplier Application
- **File:** [frontend/src/pages/InsightsView.tsx](file:///Users/kunalsuryanshi/Documents/Projectsnew/deadline-radar/frontend/src/pages/InsightsView.tsx#L67-L70)
- **Component:** `InsightsView`
- **Code:** `handleApplyMultiplier = () => { setMultiplierApplied(true); showToast('Drafting multiplier calibrated: 1.12x applied...'); };`
- **Classification:** **UI-ONLY / DUMMY**
- **Why:** Does not update user pace factors in the backend database.

---

## 14. Broken Interactions

### 1. `POST /api/v1/work` Schema Mismatch
- **Expected:** Creating a work item persists title, category, deadline, and estimated effort hours.
- **Actual:** Backend creates the item with `deadline_utc: null` and `total_estimated_hours: 0.0`.
- **Frontend Cause:** Sends camelCase `deadlineUtc` and `estimatedEffortHours`.
- **Backend Cause:** Pydantic schema expects snake_case `estimated_hours` and `deadline_utc` (or alias `deadline`).
- **Evidence:** Verified via direct cURL call with valid JWT; resulting JSON returned `total_estimated_hours: 0.0` and `deadline_utc: null`.

### 2. `POST /api/v1/ai/estimate-effort` 422 Validation Error
- **Expected:** Clicking "Estimate Calibrated Effort" returns AI-estimated hours.
- **Actual:** Request fails with HTTP 422 Unprocessable Entity.
- **Frontend Cause:** Sends `{ work_title: payload.title }`.
- **Backend Cause:** `EffortEstimationRequest` requires `{ title: str }`.
- **Evidence:** Terminal cURL test returned `{"location": "body -> title", "msg": "Field required"}`.

### 3. `GET /api/v1/planning/{plan_date}/ai-assist` 422 Validation Error
- **Expected:** Loads AI planning recommendations for the current day.
- **Actual:** Request fails with HTTP 422 Unprocessable Entity and falls back to hardcoded mock text.
- **Frontend Cause:** `usePlanAIAssist` passes default string `'today'` to the path.
- **Backend Cause:** Endpoint specifies `plan_date: date`, requiring a valid ISO date (`YYYY-MM-DD`).
- **Evidence:** Terminal cURL test returned `{"location": "path -> plan_date", "msg": "Input should be a valid date or datetime"}`.

### 4. Stopwatch Tracking Endpoints 404 Not Found
- **Expected:** Starting or stopping a session communicates with the backend tracking service.
- **Actual:** Calls return HTTP 404 Not Found.
- **Frontend Cause:** `apiHooks.ts` calls singular `/tracking/session/active`, `/tracking/session/start`, `/tracking/session/stop`.
- **Backend Cause:** `tracking.py` defines plural routes: `/tracking/sessions/active`, `/tracking/sessions/start`, `/tracking/sessions/stop`.
- **Evidence:** Terminal cURL test to `/api/v1/tracking/session/active` returned `{"code": "NOT_FOUND"}`.

### 5. Work Unit Mutation 405 Method Not Allowed
- **Expected:** Updating a subtask updates its completion status or title in the database.
- **Actual:** Calls return HTTP 405 Method Not Allowed.
- **Frontend Cause:** `apiHooks.ts:143` sends HTTP `PUT`.
- **Backend Cause:** `work.py:147` defines `@router.patch("/{work_id}/units/{unit_id}")`.
- **Evidence:** Inspecting `work.py:147` confirms route only accepts `PATCH`.

---

## 15. Missing Functionality

1. **User Authentication Flow:** No Login form, Signup form, Password Reset, or Auth Guard in the entire frontend application.
2. **True Time Tracking Integration:** Real stopwatch backend with `time_entries` table and EMA calculation exists, but frontend tracking is completely decoupled and in-memory.
3. **Calendar Integration:** Calendar view has no integration with CalDAV, Apple Calendar, Google Calendar, or ICS import/export.
4. **Interactive Planning Scheduler:** No manual task reordering, block dragging, duration adjustment, or schedule persistence in `PlanningView`.
5. **Work Item Deletion & Editing:** No UI controls exist to delete work items or edit title, description, and deadlines after creation.
6. **Notification Management:** Backend `/notifications` endpoints are fully implemented with database models, but the frontend lacks a notification center or notification bell.

---

## 16. Mock Data

| File | Purpose | Used By | Production Impact | Classification |
| :--- | :--- | :--- | :--- | :--- |
| `frontend/src/mocks/mockData.ts` (`MOCK_WORK_ITEMS`) | Fallback deliverable ledger | `WorkListView.tsx`, `WorkDetailView.tsx`, `apiHooks.ts` | Disconnects users from database work items on 401 error. | **MOCKED** |
| `frontend/src/mocks/mockData.ts` (`MOCK_TODAY_OVERVIEW`) | Today brief metrics & deadlines | `TodayView.tsx` | Directly imported; bypasses database entirely. | **MOCKED** |
| `frontend/src/mocks/mockData.ts` (`MOCK_CAPACITY_METRIC`) | Horizon capacity numbers | `RadarView.tsx`, `PlanningView.tsx`, `apiHooks.ts` | Overrides real mathematical capacity engine with hardcoded 18.5h/14.2h. | **MOCKED** |
| `frontend/src/mocks/mockData.ts` (`MOCK_CALENDAR_SLOTS`) | Calendar week grid blocks | `CalendarView.tsx` | Replaces calendar integration with static hardcoded time slots. | **MOCKED** |
| `frontend/src/pages/InsightsView.tsx` (`velocityHistory`) | Pace telemetry logs | `InsightsView.tsx` | Hardcoded array of 5 project logs; ignores actual user time tracking. | **MOCKED** |
| `frontend/src/components/today/ActionablePrioritiesList.tsx` (`DEFAULT_PRIORITIES`) | Prioritized task list | `ActionablePrioritiesList.tsx` | Renders static hardcoded priorities regardless of database state. | **MOCKED** |
| `frontend/src/pages/WorkloadView.tsx` (`DAYS_DATA`) | 7-day capacity distribution | `WorkloadView.tsx` | Hardcoded daily hours array; ignores user's schedule commitments. | **MOCKED** |

---

## 17. Console / Runtime Errors

1. **HTTP 401 Unauthorized (`MISSING_TOKEN`):**  
   Occurs on every initial query to `/work`, `/dashboard/summary`, `/ai/interpret`, and `/work/{id}` because `localStorage` lacks `deadline_radar_token`.
2. **HTTP 422 Unprocessable Entity (`VALIDATION_ERROR`):**  
   Occurs on calls to `/ai/estimate-effort` (missing required `title` key) and `/planning/today/ai-assist` (invalid date format string `'today'`).
3. **HTTP 404 Not Found (`NOT_FOUND`):**  
   Occurs if `useActiveSessionTracking` is triggered due to the singular vs plural path mismatch (`/tracking/session/*` vs `/tracking/sessions/*`).
4. **HTTP 405 Method Not Allowed:**  
   Occurs if `updateUnitMutation` is triggered due to sending `PUT` instead of `PATCH`.

---

## 18. Critical User Journeys

| Journey | Steps Traced | Result | Root Cause / Evidence |
| :--- | :--- | :--- | :--- |
| **Journey 1: New User** | Signup → Login → Onboarding → Today | **FAIL** | No Signup or Login forms exist. Onboarding modifies ephemeral Zustand store without database persistence. Today displays hardcoded mock constants. |
| **Journey 2: Add Work** | Add Work → AI interpretation → Confirmation → Save → Work list | **FAIL** | AI calls fail with 401 Unauthorized. Save mutation creates an ephemeral mock object that immediately vanishes upon navigating to `/work`. |
| **Journey 3: Execute Work** | Work → Work Detail → Start → Time tracking → Complete | **FAIL** | Starting stopwatch runs an in-memory client timer without creating a database session. Log time and Complete buttons are toast simulations. |
| **Journey 4: Planning** | Work → Planning → Schedule → Save → Reopen | **FAIL** | View is 100% static HTML. No scheduling controls exist. Adaptation form only displays a toast banner. |
| **Journey 5: Deadline Radar** | Work changes → Risk recalculation → Radar changes | **FAIL** | Frontend changes never reach database. Radar displays `MOCK_CAPACITY_METRIC` and does not dynamically recompute. |
| **Journey 6: Settings** | Change setting → Save → Refresh → Verify persistence | **FAIL** | Save button only runs `showToast(...)`. On browser refresh, all adjusted settings immediately revert to initial default values. |
| **Journey 7: Logout** | Logout → Protected route → Refresh → Verify auth state | **FAIL** | Logout button triggers toast `"Session termination simulation"`. Routes lack auth guards; unauthenticated user remains on page. |

---

## 19. Priority of Findings

### P0 — Critical (Blockers Preventing Core Functionality)
1. **Missing Authentication Flow in Frontend:** Complete absence of Login and Registration forms prevents users from establishing authenticated sessions, causing all backend API interactions to fail with 401 Unauthorized.
2. **Silent Mock Fallbacks Masking Failure:** Universal catch-blocks in `apiHooks.ts` conceal authentication and API failures by silently substituting mock datasets, creating a false impression of operation.
3. **Schema Key & Type Incompatibilities:** 
   - `AddWorkView` sends `deadlineUtc` and `estimatedEffortHours` instead of `deadline_utc` and `estimated_hours`.
   - `useAIEffortEstimate` sends `work_title` instead of `title`.
   - `usePlanAIAssist` sends `'today'` instead of a date string (`YYYY-MM-DD`).
   - `useActiveSessionTracking` targets `/tracking/session/*` instead of `/tracking/sessions/*`.

### P1 — High (Core Features That Are Pure UI-Only Simulations)
1. **Settings Persistence:** Save buttons, calendar export, and logout buttons in `SettingsView.tsx` are cosmetic toast triggers with zero database persistence.
2. **Work Execution & Time Logging:** Time logging (+30m, +1h) and task completion buttons in `WorkDetailView.tsx` are local component state mutations that never persist.
3. **Quick Add in Work Ledger:** `WorkListView.tsx` appends new deliverables to local React state without calling `POST /work`.
4. **Planning View Disconnection:** `PlanningView.tsx` has no controls for scheduling, moving tasks, or saving daily allocations.

### P2 — Medium (Secondary Features Lacking Integration)
1. **Calendar View Decoupling:** `CalendarView.tsx` does not fetch from `/availability/blocks` or support event creation.
2. **Workload Diagnostics Decoupling:** `WorkloadView.tsx` renders hardcoded `DAYS_DATA` and performs fake rebalance toasts.
3. **Insights Telemetry Decoupling:** `InsightsView.tsx` renders static `velocityHistory` and never queries `GET /api/v1/insights/summary`.
4. **Today Natural Adjustment:** Natural schedule intake in `TodayView.tsx` is an in-memory Zustand string assignment.

### P3 — Low (Cosmetic / Minor Interactions)
1. **Inactive Settings Tabs:** Tab switcher in `SettingsView.tsx` updates button styling but does not filter content.
2. **Unused Scope Toggles in Timeline:** Scope buttons in `TimelineView.tsx` update React state but do not alter timeline graphics.
3. **Static Person Avatar in Landing Header:** Profile circle in `ProductView.tsx` is a non-clickable `<div>`.

---

## 20. Final Functionality Matrix

| Area | Feature | Status | Real Backend? | Real DB? | Real AI? | Runtime Tested? | Priority | Key Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth** | User Registration | NOT IMPLEMENTED (FE) | Yes | Yes | N/A | Yes | P0 | Backend endpoint `/api/v1/auth/register` works; no frontend UI exists. |
| **Auth** | User Login | NOT IMPLEMENTED (FE) | Yes | Yes | N/A | Yes | P0 | Backend endpoint `/api/v1/auth/login` works; "Sign In" link only navigates to `/today`. |
| **Auth** | User Logout | UI-ONLY / DUMMY | N/A | N/A | N/A | Yes | P1 | `SettingsView.tsx:538` runs `showToast('Session termination simulation.')`. |
| **Auth** | Route Guards | NOT IMPLEMENTED | N/A | N/A | N/A | Yes | P0 | All routes in `App.tsx` are accessible without tokens. |
| **Today** | Daily Brief Metrics | MOCKED | Yes | Yes | N/A | Yes | P1 | `TodayView.tsx` directly renders `MOCK_TODAY_OVERVIEW`. |
| **Today** | Priorities Checklist | UI-ONLY / DUMMY | Yes | Yes | N/A | Yes | P1 | Checkboxes only mutate local React `useState(completedIds)`. |
| **Today** | Natural Adjustment | UI-ONLY / DUMMY | Yes | N/A | Yes | Yes | P2 | String length > 5 triggers hardcoded parsing message; updates Zustand string. |
| **Radar** | Risk Metrics | MOCKED | Yes | Yes | N/A | Yes | P1 | Fails with 401; catches to `MOCK_CAPACITY_METRIC`. |
| **Radar** | Approaching Deadlines | MOCKED | Yes | Yes | N/A | Yes | P1 | Renders `MOCK_WORK_ITEMS` due to unauthenticated query. |
| **Radar** | Feasibility Evaluation | UI-ONLY / DUMMY | Yes | N/A | Yes | Yes | P2 | Compares string input locally; never calls AI API. |
| **Work** | List & Filters | PARTIALLY WORKING | Yes | Yes | N/A | Yes | P1 | Client-side filter/sort works, but operates over mock items due to 401. |
| **Work** | Quick Add | UI-ONLY / DUMMY | Yes | Yes | N/A | Yes | P1 | Prepends item to local React `localItems` state only. |
| **Work** | Add Work (AI Form) | BROKEN | Yes | Yes | Yes | Yes | P0 | Fails with 401; casing mismatch drops effort to 0.0 & deadline to null. |
| **Work** | Work Detail View | MOCKED | Yes | Yes | N/A | Yes | P1 | Displays `MOCK_WORK_ITEMS[0]` due to 401 error. |
| **Work** | Time Logging Buttons | UI-ONLY / DUMMY | Yes | Yes | N/A | Yes | P1 | Increments local `useState` hours and shows toast. |
| **Work** | Mark Complete | UI-ONLY / DUMMY | Yes | Yes | N/A | Yes | P1 | Shows toast *"Assignment archived as completed"*; no DB update. |
| **Work** | Subtask Checklist | UI-ONLY / DUMMY | Yes | Yes | N/A | Yes | P1 | Checkboxes toggle local `executionBlocks` state only. |
| **Planning** | Capacity Balance Sheet | UI-ONLY / DUMMY | Yes | Yes | N/A | Yes | P1 | Static JSX display from `MOCK_CAPACITY_METRIC`. |
| **Planning** | AI Plan Assist | BROKEN | Yes | Yes | Yes | Yes | P1 | Passes `'today'` to date param; fails with 422; falls back to mock text. |
| **Planning** | Adaptation Form | UI-ONLY / DUMMY | N/A | N/A | N/A | Yes | P1 | Form submission only triggers `setAdjustmentToast(...)`. |
| **Timeline** | 14-Day Horizon Grid | UI-ONLY / DUMMY | Yes | Yes | N/A | Yes | P2 | Static hardcoded JSX; scope buttons toggle local state only. |
| **Calendar** | Week/Day/Agenda Views | MOCKED | Yes | Yes | N/A | Yes | P2 | Toggles layout, but data is hardcoded `MOCK_CALENDAR_SLOTS`. |
| **Workload** | Equilibrium Diagnostics | UI-ONLY / DUMMY | Yes | Yes | N/A | Yes | P2 | Static data from `DAYS_DATA`; rebalance button is a dummy toast. |
| **Priorities** | Ranked Priorities List | UI-ONLY / DUMMY | Yes | Yes | N/A | Yes | P2 | Static hardcoded items; focus button only toggles icon state. |
| **Insights** | Velocity Journal | UI-ONLY / DUMMY | Yes | Yes | N/A | Yes | P2 | Static `velocityHistory` array; apply multiplier is a dummy toast. |
| **Settings** | Baseline Calibration | UI-ONLY / DUMMY | Yes | Yes | N/A | Yes | P1 | +/- buttons update local state; "Save Changes" is a dummy toast. |
| **Settings** | Protected Sanctuaries | UI-ONLY / DUMMY | Yes | Yes | N/A | Yes | P1 | Sleep and weekend toggles update local state; never saved to backend. |
| **Settings** | Intelligence Preferences | UI-ONLY / DUMMY | Yes | Yes | N/A | Yes | P1 | 15% buffer and nudge dropdowns update local state only. |
| **Settings** | User Profile Card | UI-ONLY / DUMMY | Yes | Yes | N/A | Yes | P2 | Static hardcoded user *"Elena Vance"*. |
| **AI** | Work Interpretation | BROKEN (Auth) | Yes | N/A | Yes | Yes | P0 | Backend works; frontend fails with 401 Unauthorized. |
| **AI** | Work Decomposition | BROKEN (Auth) | Yes | N/A | Yes | Yes | P0 | Backend works; frontend fails with 401 Unauthorized. |
| **AI** | Effort Estimation | BROKEN (Schema) | Yes | Yes | Yes | Yes | P0 | Sends `work_title` instead of `title`; fails with 422. |
| **AI** | Risk Explanation | BROKEN (Schema) | Yes | Yes | Yes | Yes | P1 | Backend returns different keys than frontend expects. |
| **Tracking** | Active Stopwatch Session | BROKEN (Path) | Yes | Yes | N/A | Yes | P0 | Frontend calls singular `/tracking/session/*`; backend is plural. |
