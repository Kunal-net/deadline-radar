# Deployment Architecture & Strategy — Deadline Radar

## Overview
This document outlines the deployment strategy, infrastructure blueprints, and operational considerations for **Deadline Radar**.

```text
TODO — DEPLOYMENT DECISION
```
*Note: The exact hosting platforms and cloud providers are to be confirmed based on budget, free-tier limits, and operational simplicity.*

---

## 1. Hosting Architecture Options

### Option A: Fully Managed Free/Low-Cost Tier (Recommended for Initial Launch)
- **Frontend**: **Vercel** or **Cloudflare Pages** (Global CDN, automated git branch previews, zero server cost).
- **Backend API**: **Render** or **Railway** (Containerized FastAPI service running via Docker or native Python runtime).
- **Database**: **Supabase** or **Neon** (Managed PostgreSQL 15+, generous free tier, automated SSL, automated connection pooling).
- **AI Services**: Hosted API (Gemini / Claude / OpenAI) invoked securely via backend environment keys.

### Option B: Unified Single-VPS Deployment
- **Provider**: Hetzner, DigitalOcean, or AWS Lightsail ($5 - $10/month).
- **Orchestration**: Docker Compose + Caddy / Nginx Reverse Proxy with automated Let's Encrypt SSL certificates.
- **Components**: API container, Database container (PostgreSQL with mounted volume), Frontend static files served directly by Caddy.

---

## 2. Infrastructure Architecture Blueprint

```mermaid
flowchart TD
    subgraph Users ["Client Ingress"]
        Browser[User Browser]
    end

    subgraph CDN ["CDN / Edge Ingress"]
        Edge[Cloudflare / Vercel Edge Network]
    end

    subgraph Compute ["Application Compute (Render / Railway / Docker)"]
        API[FastAPI Container (Uvicorn Workers)]
        CronWorker[Scheduler Worker (Scheduled Reminders)]
    end

    subgraph Persistence ["Managed PostgreSQL (Supabase / Neon)"]
        DB[(PostgreSQL 15+ Instance)]
    end

    subgraph ExternalServices ["External Providers"]
        LLM[AI Intelligence API (Gemini / Claude / OpenAI)]
        Email[Transactional Email (Resend / SES)]
    end

    Browser -->|HTTPS| Edge
    Edge -->|Static Assets| Browser
    Edge -->|/api/* Requests| API
    API <-->|Pooled SSL Connection| DB
    CronWorker <-->|Pooled SSL Connection| DB
    API <-->|HTTPS API Key| LLM
    CronWorker -->|SMTP / API| Email
```

---

## 3. Environment Variables & Secret Management

All sensitive secrets and environment configuration must be loaded through environment variables. Under no circumstances should `.env` files be committed to git.

### Backend Required Variables
| Variable Name | Purpose | Example Value |
| :--- | :--- | :--- |
| `ENVIRONMENT` | Runtime environment | `development` / `staging` / `production` |
| `PORT` | Listening port | `8000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+asyncpg://user:pass@host:5432/deadline_radar` |
| `SECRET_KEY` | Secret for signing JWT tokens | `min_32_char_cryptographically_secure_random_string` |
| `ALGORITHM` | JWT signing algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime | `1440` (24 hours) |
| `CORS_ORIGINS` | Allowed frontend domains | `https://deadlineradar.com,http://localhost:5173` |
| `AI_PROVIDER` | Active AI service | `gemini` / `anthropic` / `openai` / `mock` |
| `AI_API_KEY` | API Key for LLM provider | `secret_api_key` |
| `EMAIL_API_KEY` | Transactional email provider key | `re_123456789` |
| `FROM_EMAIL` | Sender address for reminders | `alerts@deadlineradar.com` |

### Frontend Required Variables
| Variable Name | Purpose | Example Value |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Backend REST API endpoint | `https://api.deadlineradar.com/api/v1` |

---

## 4. Build Process & Containerization

### Backend Dockerfile Blueprint (`backend/Dockerfile`)
```dockerfile
FROM python:3.11-slim as base

WORKDIR /app
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends curl libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
```

### Database Migrations on Deployment
Every production backend deployment must execute migrations prior to serving traffic:
```bash
alembic upgrade head
```

---

## 5. CI / CD Pipeline (GitHub Actions)

A standard continuous integration pipeline should execute on pull requests to `main`:
1. **Lint & Code Quality**:
   - Backend: `ruff check .` and `mypy app`
   - Frontend: `eslint` and `tsc --noEmit`
2. **Automated Test Suites**:
   - Backend unit and API tests: `pytest`
   - Frontend component tests: `npm run test`
   - Schema validation test: Ensure OpenAPI matches `docs/api-contract.md`
3. **Automated Deployment**:
   - Merge to `main` triggers automatic deployment webhook on Render/Railway and Vercel.

---

## 6. Monitoring & Logging
- **Health Check Endpoint**: `/api/v1/health` polled every 60 seconds by uptime monitoring (e.g. BetterStack / UptimeKuma).
- **Application Logs**: Standardized JSON logs piped to stdout/stderr, captured by container runner.
- **Error Tracking**: Integration with Sentry for real-time unhandled exception alerting in production.

---

## 7. Backup & Disaster Recovery
- Automated daily PostgreSQL database snapshots retained for 7 days via managed database provider.
- Point-in-time recovery (PITR) enabled if available on the chosen database tier.
