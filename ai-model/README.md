# AI & Intelligence Subsystem — Deadline Radar

## Purpose
The `ai-model/` directory houses the prompt templates, evaluation datasets, benchmark test suites, and provider integrations for **Deadline Radar**. It delivers modular intelligence to assist users in understanding work complexity, breaking large projects into actionable units, estimating initial baseline effort, and detecting missing information.

## Core Responsibilities
- **Natural Language Work Parsing**: Extracting structured work item titles, descriptions, categories, and target deadlines from freeform text.
- **Work Item Decomposition**: Decomposing complex tasks into 3 to 8 sequential, manageable work units sized between 30 minutes and 3 hours.
- **Baseline Effort Estimation**: Providing initial hour estimates with confidence bounds for novel tasks where no user history exists.
- **Missing Information Detection**: Flagging ambiguous requirements (e.g. unstated rubrics, dataset sizes, submission formatting rules).
- **Evaluation Suite**: Running automated benchmarking suites against test prompt datasets (`tests/eval_decomposition.jsonl`) to guarantee 100% Pydantic schema adherence.

## Critical Architectural Boundary: Generative vs. Deterministic
The AI subsystem strictly enforces the distinction between generative reasoning and deterministic mathematics:

- **Generative AI Tasks (LLM)**: Semantic parsing, task decomposition, and heuristic sizing.
- **Deterministic Math (Python/SQL)**: Deadline risk ratio ($R = E_r / H_a$), dynamic priority scores ($S$), and empirical pace factor learning ($P_{t} = 0.2 \cdot \text{Ratio} + 0.8 \cdot P_{t-1}$). **LLMs are never permitted to calculate risk or priority scores.**

## Model Serving & Provider Abstractions
- Decoupled from the backend API via a pluggable provider interface (`AIServiceInterface`).
- Supported providers:
  1. **Google Gemini** (`gemini-1.5-flash` / `gemini-1.5-pro`) via Google GenAI SDK with structured JSON outputs.
  2. **Anthropic Claude** (`claude-3-5-haiku` / `claude-3-5-sonnet`) via Anthropic SDK.
  3. **OpenAI** (`gpt-4o-mini` / `gpt-4o`) with strict JSON schema enforcement.
  4. **MockAIService**: Deterministic local stub for unit tests, offline development, and CI/CD pipelines (zero API cost, zero network latency).

## Evaluation & Benchmarks
- Automated evaluation runs in CI:
  - **Schema Validation Pass Rate**: Must be 100% Pydantic compliant.
  - **Subtask Plausibility**: Verified to produce between 3 and 8 units with durations between 0.5h and 3.0h.
  - **Resilience**: Verified to fall back gracefully to manual input when provider times out or errors.

## Relevant Documentation
- [AI Model Specification](../docs/ai-model-spec.md)
- [Architecture Overview](../docs/architecture.md)
- [API Contract](../docs/api-contract.md)
- [Development Workflow](../docs/development-workflow.md)
