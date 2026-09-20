# Groq AI Integration Report

**Project:** Deadline Radar  
**Date:** 2026-09-20  
**Report Version:** 1.0

---

## Provider

**Groq** — using the OpenAI-compatible Chat Completions API

| Property | Value |
|----------|-------|
| Endpoint | `https://api.groq.com/openai/v1/chat/completions` |
| Auth method | `Authorization: Bearer <GROQ_API_KEY>` (server-side only) |
| Default model | `llama-3.3-70b-versatile` |
| JSON mode | `response_format: {"type": "json_object"}` |
| HTTP transport | `httpx.AsyncClient` (already in requirements) |
| Response path | `choices[0].message.content` |

---

## Configuration

```
AI_PROVIDER:   groq
GROQ_API_KEY:  MISSING  (configure in backend/.env — never commit)
GROQ_MODEL:    llama-3.3-70b-versatile
AI_TIMEOUT_SECONDS: 15
```

> The API key is never exposed to the frontend, API responses, logs, or source control.
> Configure it in `backend/.env` (already in `.gitignore`).

---

## Implementation

### GroqProvider (`backend/app/services/ai/provider.py`)

New `GroqProvider` class implementing the existing `BaseAIProvider` interface:

- **`_call_groq(messages)`** — shared HTTP helper:
  - Sends `POST https://api.groq.com/openai/v1/chat/completions`
  - `Authorization: Bearer <GROQ_API_KEY>` header (server-side only)
  - `response_format: {"type": "json_object"}` for structured output
  - `temperature: 0.2` for consistent estimation
  - Maps HTTP error codes → typed AI exceptions
  - API key never appears in exception messages or logs

- **`estimate_effort()`** — real Groq model call:
  - System + user prompt requesting exact JSON schema
  - Validates response with `EffortEstimationModelOutput` (Pydantic)
  - Applies deterministic backend calculations (pace factor, uncertainty interval)
  - Returns `EffortEstimationResponse` with `estimation_source="groq_calibrated"`

- **All 5 operations use real Groq calls:** `interpret_work`, `decompose_work`, `estimate_effort`, `explain_risk_and_priority`, `assist_planning`

- **Zero silent mock fallbacks:** missing key raises `AIConfigurationException` immediately

### Provider Factory (`get_ai_provider()`)

```
AI_PROVIDER=groq   → GroqProvider   (primary production provider)
AI_PROVIDER=gemini → GeminiProvider (legacy, retained for compatibility)
AI_PROVIDER=claude → ClaudeProvider
AI_PROVIDER=mock   → MockAIProvider (deterministic, no key needed)
Auto-detect:       GROQ_API_KEY present → GroqProvider (priority over Gemini)
```

### Configuration (`backend/app/core/config.py`)

- `GROQ_API_KEY: Optional[str]`
- `GROQ_MODEL: str = "llama-3.3-70b-versatile"`
- `effective_groq_api_key` property
- `is_groq_configured` property

### Provider-Neutral Schema (`backend/app/services/ai/schemas.py`)

- `GeminiEffortExtraction` renamed → `EffortEstimationModelOutput`
- `GeminiEffortExtraction` retained as backward-compatible alias (test migration)
- `EffortEstimationModelOutput` used by both `GroqProvider` and `GeminiProvider`

### Error Handling

| Condition | Exception | HTTP |
|-----------|-----------|------|
| Missing GROQ_API_KEY | `AIConfigurationException` | 500 `AI_CONFIG_ERROR` |
| Invalid/expired key (401/403) | `AIConfigurationException` | 500 `AI_CONFIG_ERROR` |
| Bad request (400) | `AIValidationException` | 502 `AI_MALFORMED_RESPONSE` |
| Rate limit (429) | `AIRateLimitException` | 429 `AI_RATE_LIMIT` |
| Service error (5xx) | `AIServiceUnavailableException` | 503 `AI_SERVICE_UNAVAILABLE` |
| Network timeout | `AITimeoutException` | 504 `AI_TIMEOUT` |
| Malformed JSON response | `AIValidationException` | 502 `AI_MALFORMED_RESPONSE` |
| Schema validation failure | `AIValidationException` | 502 `AI_MALFORMED_RESPONSE` |

### Frontend Integration

No frontend changes were required. The existing pipeline is fully compatible:

1. User clicks "Estimate Calibrated Effort" in `AddWorkView.tsx`
2. `useAIEffortEstimate()` hook sends `POST /api/v1/ai/estimate-effort` with JWT
3. Button shows "Estimating..." during pending state
4. Backend routes through `GroqProvider` → Groq API → validated response
5. Frontend receives `estimated_hours`, `confidence_score`, `reasoning`
6. On error: `setErrorMessage()` displays the error — no fake estimate shown
7. User confirms → `createMutation` persists to SQLite

### Files Changed

| File | Change |
|------|--------|
| `backend/app/core/config.py` | Added `GROQ_API_KEY`, `GROQ_MODEL`, `effective_groq_api_key`, `is_groq_configured` |
| `backend/app/services/ai/schemas.py` | Renamed `GeminiEffortExtraction` → `EffortEstimationModelOutput` |
| `backend/app/services/ai/provider.py` | Added `GroqProvider` class (all 5 operations); updated factory |
| `backend/app/services/ai/__init__.py` | Exported `GroqProvider` |
| `backend/tests/unit/test_ai_infrastructure.py` | Added Groq factory tests, schema validation test |
| `backend/tests/integration/test_groq_ai_pipeline.py` | New — 7 integration tests for Groq pipeline |
| `backend/.env.example` | Created with Groq as primary provider template |
| `docs/groq-ai-integration-report.md` | This report |

---

## AI Features

| Feature | Groq Connected? | Real Model Call? | Status |
|---------|----------------|-----------------|--------|
| Work Interpretation | ✅ Yes | ✅ Yes (`/interpret`) | Implemented |
| Work Decomposition | ✅ Yes | ✅ Yes (`/decompose`) | Implemented |
| Effort Estimation | ✅ Yes | ✅ Yes (`/estimate-effort`) | Implemented |
| Planning Assistance | ✅ Yes | ✅ Yes (`/plan-assist`) | Implemented |
| Risk Explanation | ✅ Yes | ✅ Yes (`/explain`) | Implemented |

All features route through `GroqProvider` when `AI_PROVIDER=groq`. No feature silently falls back to `MockAIProvider` when Groq is configured.

---

## Tests

### Full Backend Test Suite

```
90 tests collected
90 passed
0 failed
3 deprecation warnings (Starlette HTTP status constant — does not affect behavior)
Execution time: 17.77s
```

### Groq Pipeline Integration Tests (`test_groq_ai_pipeline.py`)

| Test | Scenario | Result |
|------|----------|--------|
| Factory: `AI_PROVIDER=groq` → `GroqProvider` | Factory selection | ✅ PASS |
| Factory: `AI_PROVIDER=gemini` → `GeminiProvider` | Backward compat | ✅ PASS |
| Factory: `AI_PROVIDER=mock` → `MockAIProvider` | Explicit mock | ✅ PASS |
| Auto-detect: `GROQ_API_KEY` present | Key-based auto-select | ✅ PASS |
| Auto-detect: No keys → `MockAIProvider` | Fallback to mock | ✅ PASS |
| Valid request (mocked Groq) → HTTP 200 | Full pipeline | ✅ PASS |
| Missing title → HTTP 422 | Pydantic validation | ✅ PASS |
| Missing API key → HTTP 500 `AI_CONFIG_ERROR` | Config error | ✅ PASS |
| Malformed response (non-JSON) → HTTP 502 | Parse error | ✅ PASS |
| Schema rejection (negative hours) → HTTP 502 | Pydantic error | ✅ PASS |
| Rate limit (429) → HTTP 429 `AI_RATE_LIMIT` | Rate limit | ✅ PASS |
| Service unavailable (503) → HTTP 503 | Service error | ✅ PASS |
| Timeout → HTTP 504 `AI_TIMEOUT` | Network timeout | ✅ PASS |
| Unauthenticated → HTTP 401 | Auth check | ✅ PASS (in both suites) |

### Frontend Build

```
tsc -b && vite build → ✓ built in 1.16s (0 TypeScript errors)
```

---

## Live Verification

```
GROQ_API_KEY: MISSING
```

**Status: GROQ PROVIDER IMPLEMENTED — LIVE KEY NOT CONFIGURED**

The Groq provider is fully implemented and all integration tests pass with mocked HTTP.
To activate live AI, create `backend/.env` with:

```bash
AI_PROVIDER=groq
GROQ_API_KEY=<your-key-from-console.groq.com>
GROQ_MODEL=llama-3.3-70b-versatile
AI_TIMEOUT_SECONDS=15
```

Once the key is configured, `POST /api/v1/ai/estimate-effort` will make a real authenticated
request to `https://api.groq.com/openai/v1/chat/completions` using `llama-3.3-70b-versatile`.

---

## Security Checklist

- [x] `GROQ_API_KEY` only in `backend/.env` (server-side, not committed)
- [x] `backend/.env` is in `.gitignore`
- [x] No key in frontend source, React env vars, Vite client code, or `localStorage`
- [x] No key in API responses, error messages, or application logs
- [x] `Authorization` header never surfaced in exception messages
- [x] `backend/.env.example` has empty `GROQ_API_KEY=` (no real key)
- [x] `git status` confirms no secrets are staged
