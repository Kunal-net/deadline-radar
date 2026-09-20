# Work CRUD & Persistence Implementation Report

**Product**: Deadline Radar  
**Module**: Work Ledger, Add Work, Work Detail, and Persistence Engine  
**Status**: Verified & Production-Ready  
**Verification Scope**: End-to-end (PostgreSQL/SQLite Relational Database, FastAPI Backend, TanStack Query, React/Vite Frontend)

---

## 1. Existing Work Architecture

The Deadline Radar Work subsystem is built upon a deterministic relational persistence model. Work items represent core commitments and deliverables across various categories (`academic`, `project`, `career`, `exam_prep`, `personal`), scheduled against individual capacity constraints.

```
                  ┌──────────────────────┐
                  │    React Frontend    │
                  │  (Zustand + TanStack)│
                  └──────────┬───────────┘
                             │ JWT Authenticated HTTP
                             ▼
                  ┌──────────────────────┐
                  │   FastAPI API v1     │
                  │  /api/v1/work/*      │
                  └──────────┬───────────┘
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
┌──────────────────────┐          ┌──────────────────────┐
│     WorkService      │          │      AIService       │
│  (Business Metrics)  │          │ (Groq/Mock Ingestion)│
└──────────┬───────────┘          └──────────────────────┘
           │
           ▼
┌──────────────────────┐
│  WorkItemRepository  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Relational Database  │
│ (work_items & units) │
└──────────────────────┘
```

The database acts as the single authoritative source of truth. No client-side mock arrays or optimistic state bypasses relational persistence.

---

## 2. API Endpoints

All endpoints are prefixed under `/api/v1/work` and require valid JWT Bearer authentication (`Authorization: Bearer <token>`).

| Method | Path | Summary | Auth Required | Description |
|---|---|---|---|---|
| `GET` | `/api/v1/work` | List Work Items | Yes | Paginated list with filtering by `status`, `category`, `risk_state`, and sorting by `dynamic_priority`, `deadline`, or `effort`. |
| `POST` | `/api/v1/work` | Create Work Item | Yes | Creates a new work item associated with the current user, optionally creating `initial_units`. |
| `GET` | `/api/v1/work/{id}` | Get Work Detail | Yes | Retrieves full work dossier including child units, risk states, and calculated metrics. Returns 404 if not found or unowned. |
| `PATCH` | `/api/v1/work/{id}` | Update Work Item | Yes | Partially updates title, description, category, deadline, importance, effort, or status. Recalculates metrics. |
| `DELETE` | `/api/v1/work/{id}` | Delete Work Item | Yes | Deletes work item and cascades deletion to all child units. Returns 204 No Content. |
| `GET` | `/api/v1/work/{id}/units` | List Units | Yes | Lists all subtasks ordered by `sequence_order`. |
| `POST` | `/api/v1/work/{id}/units` | Add Unit | Yes | Appends an execution unit to the work item and recalculates remaining effort. |
| `PATCH` | `/api/v1/work/{id}/units/{unit_id}` | Update Unit | Yes | Updates title, estimated hours, or `is_completed` status. |
| `DELETE` | `/api/v1/work/{id}/units/{unit_id}` | Delete Unit | Yes | Deletes a subtask and recalculates metrics. |
| `PUT` | `/api/v1/work/{id}/units/reorder` | Reorder Units | Yes | Updates sequential ordering of subtasks. |

---

## 3. Database Model

The relational schema is implemented with SQLAlchemy 2.0 and mapped to PostgreSQL (and SQLite in development):

### `work_items`
- `id` (UUID Primary Key, String 36)
- `user_id` (Foreign Key -> `users.id`, `ondelete="CASCADE"`, Index)
- `title` (String 255, Not Null)
- `description` (Text, Nullable)
- `category` (String 64, Default "academic", Index)
- `importance_weight` (Float, Default 1.0, Constrained 0.5 to 3.0)
- `deadline_utc` (DateTime with timezone, Nullable, Index)
- `is_hard_deadline` (Boolean, Default True)
- `status` (String 32, Default "todo", Index) — e.g., `todo`, `in_progress`, `completed`, `blocked`
- `total_estimated_hours` (Float, Default 0.0)
- `remaining_estimated_hours` (Float, Default 0.0)
- `total_actual_hours` (Float, Default 0.0)
- `completion_pct` (Integer, Default 0)
- `risk_state` (String 32, Default "safe", Index) — `safe`, `watch`, `at_risk`, `critical`, `overdue`
- `risk_ratio` (Float, Default 0.0)
- `dynamic_priority` (Float, Default 50.0, Index)
- `priority_explanation` (Text, Nullable)
- `completed_at` (DateTime with timezone, Nullable)
- `created_at`, `updated_at` (DateTime with timezone, Auto-updated)

### `work_units`
- `id` (UUID Primary Key, String 36)
- `work_item_id` (Foreign Key -> `work_items.id`, `ondelete="CASCADE"`, Index)
- `user_id` (Foreign Key -> `users.id`, `ondelete="CASCADE"`, Index)
- `title` (String 255, Not Null)
- `description` (Text, Nullable)
- `sequence_order` (Integer, Default 1)
- `is_completed` (Boolean, Default False)
- `completed_at` (DateTime with timezone, Nullable)
- `estimated_hours` (Float, Default 1.0)
- `actual_hours` (Float, Default 0.0)

---

## 4. Create Flow

1. **Intake**: User inputs unstructured intent in `AddWorkView` (e.g. *"Finish my FastAPI project documentation by Friday"*).
2. **AI Interpretation**: `POST /api/v1/ai/interpret` uses the configured Groq (or fallback) provider to propose structured parameters: title, category, deadline horizon, and effort.
3. **Decomposition**: `POST /api/v1/ai/decompose` suggests granular cognitive focus chunks.
4. **User Customization & Confirmation**:
   - The user can click "Edit Parameters" to adjust the title, category, target deadline, estimated hours, and hard deadline cutoff before saving.
   - User reviews or toggles decomposed subtasks.
5. **Persistence**:
   - `POST /api/v1/work` is called with title, description, category, deadline, effort, importance, and initial units.
   - Backend creates `WorkItem` and child `WorkUnit` records in a single database transaction.
   - Initial metrics (`risk_state`, `dynamic_priority`) are computed by `PriorityEngine`.
6. **Post-Create Navigation**: TanStack Query invalidates cache keys and redirects to `/work`, where the new work item renders immediately.

---

## 5. Read Flow

1. **Work List (`WorkListView.tsx`)**:
   - Calls `GET /api/v1/work`.
   - Displays loading skeleton during active requests.
   - Displays real work items sorted by deadline urgency, dynamic priority, or effort.
   - Shows empty state ("No active commitments found") only when zero records exist in the database.
   - If the API fails, displays an error state with an explicit "Retry" button. Never falls back to mock work.
2. **Work Detail (`WorkDetailView.tsx`)**:
   - Routes to `/work/:id`.
   - Calls `GET /api/v1/work/:id`.
   - Directly refreshable in the browser without losing state.
   - Returns a 404 "Commitment Not Found" view if the ID does not exist or belongs to a different user.

---

## 6. Update Flow

1. **Edit Dossier Modal**:
   - In `WorkDetailView.tsx`, user opens "Edit Dossier" modal.
   - Form exposes `title`, `description`, `category`, `deadline`, `isHardDeadline`, `total_estimated_hours`, and `importance_weight`.
2. **Persistence**:
   - Submits `PATCH /api/v1/work/:id`.
   - Backend updates database record, re-evaluates risk ratios and priority score, and commits transaction.
   - Returns updated `WorkItemResponse`.
3. **Cache Synchronization**:
   - TanStack Query invalidates `workItem(id)`, `workItems`, `dashboardSummary`, `todayOverview`, `timelineProjection`, and `workloadCapacity`.
   - UI reflects saved changes immediately, and changes remain intact upon browser refresh.

---

## 7. Delete / Archive Flow

1. **User Action**: User clicks "Delete Commitment" in `WorkDetailView.tsx`.
2. **Confirmation**: A standard browser confirmation modal prompts the user.
3. **Persistence**:
   - Calls `DELETE /api/v1/work/:id`.
   - Backend cascades deletion to all related `work_units`, `work_estimates`, and dependent entries.
   - Returns `204 No Content`.
4. **Cache & Navigation**:
   - Invalidates query cache and navigates back to `/work`.
   - Direct GET requests to `/api/v1/work/:id` return `404 Not Found`.

---

## 8. Completion Flow

1. **Toggle Action**:
   - Clicking "Mark Completed" (in `WorkDetailView` or `ActionablePrioritiesList`) sends `PATCH /api/v1/work/:id` with `status: "COMPLETED"`.
   - Backend normalizes status case-insensitively, records `completed_at = now()`, marks all child units as completed (`is_completed = True`), zeroes `remaining_estimated_hours`, sets `completion_pct = 100`, and sets `risk_state = "safe"`.
2. **Reactivation Action**:
   - Clicking "Mark Active" sends `status: "IN_PROGRESS"`.
   - Backend clears `completed_at = None`, reactivates child units (or restores remaining effort), and recalculates risk and dynamic priority.
   - Changes persist to database and reload accurately across browser refreshes.

---

## 9. AI Integration

- Groq provider (`llama-3.3-70b-versatile`) is actively utilized when `GROQ_API_KEY` is present, with deterministic fallback to the Mock provider for offline testing.
- `title` and `work_title` naming conventions are normalized in backend schemas (`EffortEstimationRequest`, `DecompositionRequest`).
- AI results are explicitly presented as suggestions requiring confirmation, strictly preventing unconfirmed AI generation from silently creating database entities.

---

## 10. Authentication & User Isolation

- Every API endpoint resolves the user identity strictly through JWT validation via `get_current_user`.
- Arbitrary `user_id` parameters are never accepted from the frontend client.
- All repository queries filter with `WHERE user_id = current_user.id`.
- If User A attempts to access or mutate Work B owned by User B:
  - Database lookup returns `None`.
  - Service raises `NotFoundException` returning an HTTP `404 Not Found`.
  - Zero leakage of cross-tenant data.

---

## 11. Query Cache Invalidation

Centralized TanStack Query invalidation (`apiHooks.ts`) ensures that whenever a work mutation occurs, dependent telemetry across Deadline Radar updates consistently:

```typescript
// On Work Mutation (Create / Update / Delete)
queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workItems });
queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workItem(id) });
queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardSummary });
queryClient.invalidateQueries({ queryKey: QUERY_KEYS.todayOverview });
queryClient.invalidateQueries({ queryKey: ['timelineProjection'] });
queryClient.invalidateQueries({ queryKey: ['workloadCapacity'] });
queryClient.invalidateQueries({ queryKey: ['dailyPlan'] });
queryClient.invalidateQueries({ queryKey: QUERY_KEYS.insightsSummary });
```

---

## 12. Error Handling

- **401 Unauthorized**: Handled centrally by API client; redirects to `/login` if authentication expires without redirect loops.
- **404 Not Found**: Handled by `WorkDetailView` with dedicated "Commitment Not Found" editorial screen and retry/back options.
- **422 Validation Error**: Backend returns detailed validation breakdowns (e.g. importance weight out of range, missing title).
- **Network / 500 Failure**: Renders inline error banner with retry options. Never falls back to mock or demo data.

---

## 13. Test Results

### Automated Integration Tests
- Full test suite: **103 passed**, 0 failed (`backend/tests/`)
- Dedicated CRUD & Persistence test suite (`test_work_crud_persistence.py`):
  - `test_work_create_and_validation`: PASSED
  - `test_work_unauthenticated_endpoints`: PASSED
  - `test_work_multi_tenant_isolation`: PASSED
  - `test_work_edit_and_persistence`: PASSED
  - `test_work_completion_and_reactivation_cycle`: PASSED
  - `test_work_delete_and_cascade`: PASSED
  - `test_direct_db_persistence`: PASSED

### Frontend Typecheck & Build
- `npm run typecheck`: PASSED (0 errors)
- `npm run build`: PASSED (production bundle built in 1.78s)

---

## 14. Remaining Limitations

- Subtask reordering via drag-and-drop in the UI is not yet visually implemented (the API endpoint `/api/v1/work/{id}/units/reorder` is fully functional and tested on the backend).
- Deletion is currently hard deletion (`DELETE`); future iterations may add soft-archive filtering if requested.
