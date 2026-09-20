# AI & Intelligence Subsystem — Deadline Radar

## Architectural Relationship: Production vs. Evaluation Laboratory

The AI capabilities in **Deadline Radar** are split between the **live production application runtime** and this **offline evaluation & prompt laboratory**:

```
deadline-radar/
├── backend/app/services/ai/         # 1. PRODUCTION RUNTIME ENGINE
│   ├── ai_service.py                # Master AIService facade
│   ├── provider.py                  # Pluggable BaseAIProvider, Gemini, Claude, Mock
│   ├── schemas.py                   # Pydantic v2 schemas for all AI outputs
│   ├── work_interpreter.py          # Natural language intake parsing
│   ├── work_decomposer.py           # Multi-step atomic task decomposition
│   ├── effort_estimator.py          # Calibrated effort & complexity sizing
│   ├── explainer.py                 # Grounded risk & priority explanations
│   ├── planner_assistant.py         # Schedule advisory & rebalancing tips
│   └── personalization_service.py   # Closed-loop pace factor tracking (EMA)
│
└── ai-model/                        # 2. PROMPT & EVALUATION LABORATORY (This folder)
    ├── prompts/                     # Versioned prompt engineering templates
    │   └── templates.py
    ├── eval_datasets/               # Benchmark JSONL test datasets
    │   ├── eval_decomposition.jsonl
    │   └── eval_interpretation.jsonl
    ├── tests/                       # Pytest benchmark evaluation suite
    │   └── test_decomposition_eval.py
    └── run_eval.py                  # CLI benchmark evaluation runner
```

---

## Why Is the Production AI Code in `backend/app/services/ai/`?

In accordance with the **modular monolith** architecture established in `docs/architecture.md` and the master execution prompts:
1. **Direct FastAPI Routing**: All AI endpoints (`POST /api/v1/ai/interpret`, `POST /api/v1/ai/decompose`, `POST /api/v1/ai/estimate-effort`, `POST /api/v1/ai/explain`, `GET /api/v1/planning/{date}/ai-assist`, `GET /api/v1/insights/summary`) depend directly on dependency injection from [`backend/app/api/deps.py`](../backend/app/api/deps.py).
2. **Database & Telemetry Coupling**: Personalization (`PersonalizationService`) requires access to real historical time tracking records (`TimeEntry`, `WorkItem`, `UserPaceFactor`) via SQLAlchemy async sessions to calibrate pace factors without circular dependencies.
3. **Deterministic Isolation (Rule #3)**: The backend domain engines ([`risk_engine.py`](../backend/app/domain/risk_engine.py), [`priority_engine.py`](../backend/app/domain/priority_engine.py), [`planner.py`](../backend/app/domain/planner.py)) execute pure arithmetic, while `backend/app/services/ai/` handles semantic reasoning.

---

## What Lives in `ai-model/`?

This directory serves as the dedicated offline evaluation harness:

1. **Prompt Templates (`prompts/templates.py`)**:
   - Centralized, versioned prompt definitions for task interpretation, decomposition, estimation, and telemetry-grounded explanations.
2. **Evaluation Datasets (`eval_datasets/`)**:
   - `eval_decomposition.jsonl`: Benchmark test tasks with expected unit counts (3 to 8 subtasks) and duration bounds (0.5h to 3.0h).
   - `eval_interpretation.jsonl`: Freeform natural language intake test cases across diverse categories.
3. **Automated Benchmark Tests (`tests/test_decomposition_eval.py`)**:
   - Verifies 100% Pydantic schema validation pass rate.
   - Asserts subtask plausibility and duration limits.
4. **CLI Evaluation Runner (`run_eval.py`)**:
   - Standalone CLI utility to measure pass rates, unit counts, and schema compliance across providers.

---

## Running AI Benchmarks

```bash
# Run CLI benchmark runner
backend/venv/bin/python ai-model/run_eval.py

# Run pytest evaluation suite
PYTHONPATH=backend backend/venv/bin/pytest ai-model/tests/test_decomposition_eval.py -v
```
