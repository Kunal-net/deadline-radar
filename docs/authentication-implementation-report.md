# Authentication Implementation Report — Deadline Radar

## Existing Authentication Architecture
Prior to this task, the Deadline Radar application contained a foundational async authentication module built with FastAPI and SQLAlchemy:
- **Backend**:
  - `backend/app/core/security.py`: Provided `bcrypt`-based password hashing (`get_password_hash`, `verify_password`) and JWT encode/decode logic using `python-jose`.
  - `backend/app/api/deps.py`: Contained the `get_current_user` dependency, which extracts and validates the `Authorization: Bearer <token>` header, decodes the JWT `sub` claim (user ID), checks `user.is_active`, and returns the authenticated `User` model.
  - `backend/app/services/auth_service.py`: Implemented registration (`POST /api/v1/auth/register`), login (`POST /api/v1/auth/login`), and profile retrieval (`GET /api/v1/auth/me`).
  - `backend/app/models/user.py`: Defined the `User` table with `id`, `email`, `hashed_password`, `full_name`, `is_active`, and related entities.
- **Frontend**:
  - `frontend/src/store/useAuthStore.ts`: Zustand store managing user profile, access token, and authentication state.
  - `frontend/src/services/apiClient.ts`: Central fetch wrapper that attaches `Authorization: Bearer <token>` from `localStorage`.
  - `frontend/src/components/layout/ProtectedRoute.tsx`: Route guard checking authentication state.

## Changes Made
1. **JWT Expiration & Token Distinction (`security.py`)**:
   - Explicitly imported `ExpiredSignatureError` from `jose` and updated `decode_access_token` to return `UnauthorizedException(message="Token has expired", code="EXPIRED_TOKEN")` on expired tokens, cleanly separating expired signatures from malformed/invalid tokens (`INVALID_TOKEN`).
2. **Deactivated Account Safeguard (`auth_service.py`)**:
   - Added `user.is_active` validation in `AuthService.login()` to return 401 `ACCOUNT_DEACTIVATED` if a deactivated user attempts to log in.
3. **Shared QueryClient Singleton & In-Memory Purge (`queryClient.ts`)**:
   - Created `frontend/src/services/queryClient.ts` as a shared singleton.
   - Wired `queryClient.clear()` into `useAuthStore.logout()`, `login()`, `register()`, and the 401 unauthenticated callback. This guarantees that when User A logs out, all cached queries, work items, and metrics in memory are evicted before User B logs in.
4. **Resilient 401 & Centralized Auth Failure Handling (`apiClient.ts`)**:
   - Replaced passive `localStorage.removeItem()` with active `registerAuthFailureHandler`.
   - Excluded `/auth/login` so invalid credential errors remain localized in the login form.
   - For all other endpoints, a 401 status evicts the token, resets the auth store, purges query cache, and safely navigates to `/login` without infinite loops.
   - Exported `BASE_URL` for shared usage across components.
5. **Initial Loading State Optimization (`useAuthStore.ts`)**:
   - Initialized `isLoading: !!localStorage.getItem('deadline_radar_token')`. If no token exists, the application immediately resolves to unauthenticated without a loading flash.
6. **Route Protection Hardening (`App.tsx`)**:
   - Moved `/onboarding` inside `<Route element={<ProtectedRoute />}>`.
   - Added `/add-work` alias redirecting to `/work/new` within the protected shell.
7. **Landing Page Authenticated vs Unauthenticated CTAs (`ProductView.tsx`)**:
   - Updated CTA buttons so unauthenticated visitors are directed to `/signup` ("Create Free Account") and `/login` ("Sign In to Workspace →"), while authenticated users are directed to `/today` ("Open Deadline Radar" / "Enter Live Workspace →").
8. **Removed Outdated Placeholders (`SignupView.tsx`, `SettingsView.tsx`)**:
   - Replaced `"Dr. Eleanor Vance"` and `"elena@university.edu"` in `SignupView.tsx` with generic examples.
   - Replaced fallback `'authenticated@deadlineradar.com'` in `SettingsView.tsx` with `user?.email || 'No email registered'`.
   - Replaced hardcoded `http://localhost:8000/api/v1` in `SettingsView.tsx` calendar export with `${BASE_URL}/availability/export.ics`.
9. **Comprehensive Automated Test Suite (`test_auth_e2e_isolation.py`, `test_errors_and_security.py`)**:
   - Implemented 5 end-to-end integration tests covering the complete authentication lifecycle and strict cross-user data isolation.
   - Added unit test for expired token decoding.

## Login Flow
1. User enters email and password into `LoginView`.
2. `useAuthStore.login(email, password)` calls `POST /api/v1/auth/login`.
3. Backend validates email existence, checks `bcrypt` hash, verifies `user.is_active`, and generates a signed HS256 JWT access token with user ID in `sub` and email in claims.
4. On success:
   - Token is stored in `localStorage` under key `deadline_radar_token`.
   - Previous query cache is purged via `queryClient.clear()`.
   - `GET /api/v1/auth/me` is immediately requested to retrieve the full `UserProfile`.
   - `useAuthStore` updates `user`, `token`, `isAuthenticated = true`, `isLoading = false`.
   - User is redirected to their intended route (`from` location or `/today`).
5. On failure:
   - Backend returns 401 with `INVALID_CREDENTIALS` or `ACCOUNT_DEACTIVATED`.
   - Frontend catches `ApiError` and displays the exact error message to the user without redirecting.

## Registration Flow
1. User fills out full name, email, password (min 8 chars), and timezone in `SignupView`.
2. `useAuthStore.register(...)` invokes `POST /api/v1/auth/register`.
3. Backend checks for existing email. If present, returns 409 Conflict with `EMAIL_ALREADY_EXISTS`.
4. If unique, password is salted and hashed with `bcrypt`.
5. User entity is persisted, default preferences and 7-day availability templates are seeded in the database.
6. Signed JWT access token is generated and returned with HTTP 201.
7. Frontend stores token, sets authenticated state, and redirects to `/onboarding` for initial baseline calibration.

## JWT Flow
1. **Creation**:
   - Issued with HMAC-SHA256 (`HS256`).
   - Signing key configured from `settings.SECRET_KEY`.
   - Expiration set to `ACCESS_TOKEN_EXPIRE_MINUTES` (default: 30 minutes).
   - Claims: `{"sub": user.id, "email": user.email, "exp": ..., "iat": ...}`.
2. **Decoding & Verification**:
   - Handled centrally by `decode_access_token(token)`.
   - Expired tokens raise `UnauthorizedException(code="EXPIRED_TOKEN", status_code=401)`.
   - Invalid/tampered tokens raise `UnauthorizedException(code="INVALID_TOKEN", status_code=401)`.
3. **Dependency Injection**:
   - `get_current_user` extracts `Bearer <token>` from the HTTP `Authorization` header.
   - Decodes `sub` claim and queries `UserRepository.get_with_preferences(user_id)`.
   - Verifies active status and injects the `User` model into FastAPI endpoint handlers.

## Frontend Session Persistence
1. On initial page load or browser refresh, `localStorage.getItem('deadline_radar_token')` is read.
2. If token exists:
   - `useAuthStore` sets `isAuthenticated: true` and `isLoading: true`.
   - `<ProtectedRoute>` displays a calm, branded loading indicator ("Verifying session authorization...").
   - `checkAuth()` fires `GET /api/v1/auth/me`.
   - On 200 OK: User profile is refreshed and stored; `isLoading` transitions to `false`; protected view renders.
   - On 401: Token is invalidated, removed from storage, and user is redirected to `/login`.
3. If no token exists:
   - `isLoading` starts as `false`, immediately allowing navigation to public routes or redirecting protected route attempts to `/login`.

## API Authentication
- All API requests flow through `frontend/src/services/apiClient.ts:apiRequest`.
- When `deadline_radar_token` exists in `localStorage`, the client automatically injects:
  ```
  Authorization: Bearer <access_token>
  ```
- Individual components and custom hooks in `apiHooks.ts` do not manage tokens manually.

## 401 Handling
- In `apiClient.ts`:
  - If a 401 status occurs on `/auth/login`, it is treated as a normal credential failure and thrown as an `ApiError` for form handling.
  - On any protected endpoint, a 401 triggers `onAuthFailure()`:
    1. Removes `deadline_radar_token` from `localStorage`.
    2. Invokes `useAuthStore.logout()`, resetting state.
    3. Flushes in-memory cache via `queryClient.clear()`.
    4. If the user is currently on an authenticated route, redirects to `/login`.
    5. Excludes `/login`, `/signup`, and `/` to prevent redirect loops.

## Logout
- Located in `SettingsView.tsx` ("Log Out" action) and wired through `useAuthStore.logout()`.
- Steps performed on logout:
  1. `localStorage.removeItem('deadline_radar_token')`.
  2. `queryClient.clear()` (evicts all cached queries, work items, and personal data).
  3. Resets Zustand store (`user: null, token: null, isAuthenticated: false, isLoading: false`).
  4. Explicitly redirects to `/login`.
  5. Subsequent navigation to protected routes is intercepted by `<ProtectedRoute>`, preventing access.

## Protected Routes
The following routes are strictly protected by `<ProtectedRoute>`:
- `/onboarding`
- `/today`
- `/radar`
- `/work`
- `/work/:id`
- `/work/new`
- `/work/add` (alias)
- `/add-work` (alias)
- `/planning`
- `/timeline`
- `/calendar`
- `/workload`
- `/priorities`
- `/insights`
- `/settings`

Unauthenticated users attempting to access these routes are redirected to `/login` with location state preserved for post-login return.

## User Isolation
Every backend service and repository enforces strict ownership filtering on queries and mutations:
- **Work Items & Units**: `WorkItemRepository.list_work_items(user_id=...)` and `get_by_user(work_item_id, user_id)` ensure User B receives 404 for any attempt to view, edit, or delete User A's work.
- **Availability Templates & Blocks**: Filtered by `Availability.user_id == user_id`. User B cannot list or delete User A's schedule commitments.
- **Personal Interests**: Filtered by `UserInterest.user_id == user_id`.
- **Planning & Today Overview**: `PlanningRepository.get_plan_by_date(user_id, ...)` ensures daily plans and recommendations are derived exclusively from the authenticated user's ledger.
- **Time Tracking**: Active sessions and time entries are strictly keyed by `user_id`.
- **In-Memory Cache**: `queryClient.clear()` prevents cross-user stale reads on client devices.

## Security Checks
- **Passwords**: Never logged; hashed using bcrypt with salt.
- **JWT Secret**: Configured through `settings.SECRET_KEY`, customizable via `backend/.env`.
- **Secrets in Version Control**:
  - `backend/.env` is listed in `.gitignore` and is not tracked by Git.
  - No secrets or API keys are committed.
- **Frontend Source**:
  - Zero `console.log(token)` or sensitive header prints.
  - No secrets in frontend environment variables.

## Tests
The authentication suite includes 96 passing automated tests:
1. `backend/tests/integration/test_auth_e2e_isolation.py`:
   - `test_registration_flow_and_validation`: Verifies successful creation, duplicate 409, short password 422, invalid email 422.
   - `test_login_flow_and_failures`: Verifies token issuance, bad password 401, nonexistent user 401, deactivated account 401.
   - `test_protected_endpoints_token_validation`: Verifies 401 on missing token, malformed header, invalid signature, expired token, non-existent DB user.
   - `test_current_user_me_endpoint`: Verifies `/auth/me` returns identity matching JWT `sub`.
   - `test_complete_user_data_isolation_e2e`: End-to-end multi-tenant isolation verifying User B cannot read or modify User A's work items, work units, schedule blocks, interests, tracking sessions, daily plans, or dashboard summaries.
2. `backend/tests/unit/test_errors_and_security.py`:
   - `test_password_hashing`: Verifies bcrypt hashing and verification.
   - `test_jwt_token_generation_and_decoding`: Verifies valid generation and decoding.
   - `test_invalid_jwt_token`: Verifies 401 `INVALID_TOKEN`.
   - `test_expired_jwt_token`: Verifies 401 `EXPIRED_TOKEN`.
3. All 90 previously passing backend tests continue to pass with 0 regressions.
4. Frontend `tsc --noEmit` and `vite build` pass with 0 errors.

## Remaining Limitations
- **Stateless Tokens**: Access tokens are stateless JWTs without database-backed token blocklisting or server-side revocation tables. Revocation occurs via client token eviction and token expiration (30-minute lifetime). If instant server-side revocation is needed in the future, a Redis or DB token blacklist table can be added.
