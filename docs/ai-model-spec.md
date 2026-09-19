# Deadline Radar — AI Subsystem & Intelligence Specification

## 1. Subsystem Mission & Boundaries

The AI subsystem in **Deadline Radar** delivers modular, disciplined intelligence to assist users in understanding work complexity, breaking large projects into actionable units, estimating initial effort, detecting missing information, and adapting daily plans.

### Critical Boundary: LLM Reasoning vs. Deterministic Calculation

A foundational architectural rule in Deadline Radar is:
> **Never delegate deterministic calculations, temporal math, or risk scoring to a generative LLM.**

| Capability | Engine Type | Implementation Method | Why Not Generative LLM? |
| :--- | :--- | :--- | :--- |
| **Natural Language Work Parsing** | LLM Reasoning | Structured JSON Extraction via LLM | Natural language requires contextual understanding and semantic parsing. |
| **Work Decomposition** | LLM Reasoning | Few-Shot Guided Prompting with Schema Validation | Breaking a project into logical steps requires domain knowledge and task modeling. |
| **Initial Effort Estimation** | LLM + Heuristics | Semantic Complexity Analysis + Historical Prior | Initial task sizing requires semantic understanding of domain tasks. |
| **Personalized Pace Learning** | Statistical Calculation | Exponential Moving Average (EMA) on Observed Time Entries | Statistical math is deterministic, reproducible, and verifiable. |
| **Deadline Risk Assessment** | Deterministic Math | $R = \text{RemainingEffort} / \text{AvailableHours}$ | Risk is a strict ratio between remaining effort and available capacity. LLMs hallucinate numbers. |
| **Dynamic Priority Scoring** | Deterministic Algorithm | Multi-factor weighted formula (Deadline, Risk, Capacity, Importance) | Ranking must be strictly consistent, explainable, and reproducible across refreshes. |
| **Schedule Slot Allocation** | Constraint Satisfaction | Deterministic Knapsack / Greedy Capacity Bin-Packing | Time slot placement must never overlap or violate user blackout blocks. |
| **Plan Adaptation Reasoning** | LLM + Rule Engine | Rule-based displacement + natural language summary | Deterministic reallocation with natural-language explanation of changes. |

---

## 2. Core AI Capabilities & Functional Specifications

### 2.1 Capability 1: Natural Language Work Understanding & Classification
- **Purpose**: Converts vague user inputs (e.g. *"Prepare for distributed systems midterm next Thursday"*) into structured work items.
- **Inputs**: User input text (string, 3–1000 characters), optional current date context.
- **LLM Task**: Infer title, primary category (`academic`, `project`, `exam_prep`, `career`, `administrative`, `personal`), deadline timestamp, and extracted tags.
- **Output Schema**:
  ```json
  {
    "title": "Distributed Systems Midterm Preparation",
    "category": "exam_prep",
    "detected_deadline_utc": "2026-09-24T18:00:00Z",
    "confidence_score": 0.88,
    "tags": ["distributed-systems", "exam", "cs"]
  }
  ```
- **Validation**: Enforces enum validation on category. Date string must be valid ISO 8601 UTC.

### 2.2 Capability 2: Work Decomposition
- **Purpose**: Decomposes a complex work item into 3 to 8 sequential, manageable work units (subtasks), each sized between 30 minutes and 3 hours.
- **Inputs**:
  - `work_title`: string
  - `work_description`: string (optional)
  - `category`: string
  - `target_deadline`: ISO UTC string (optional)
- **LLM Task**: Identify essential sequential milestones, describe each unit, and propose baseline estimated hours.
- **Output Schema**:
  ```json
  {
    "suggested_units": [
      {
        "sequence_order": 1,
        "title": "Review Consensus Algorithms (Raft & Paxos)",
        "description": "Lecture notes and paper readings",
        "estimated_hours": 2.0
      },
      {
        "sequence_order": 2,
        "title": "Practice Vector Clocks & Lamport Timestamps",
        "description": "Work through problem sets 3 and 4",
        "estimated_hours": 1.5
      },
      {
        "sequence_order": 3,
        "title": "Mock Exam & Past Papers",
        "description": "Timed run on Fall 2025 midterm exam",
        "estimated_hours": 2.0
      }
    ],
    "total_estimated_hours": 5.5,
    "confidence_score": 0.85
  }
  ```
- **User Control Guarantee**: All suggested units are rendered in an editable frontend drawer. The user can rename, delete, adjust hours, or add custom subtasks before saving.

### 2.3 Capability 3: Missing Information Detection
- **Purpose**: Flags ambiguous or missing specifications that increase delivery risk.
- **Inputs**: Work item text and user-provided inputs.
- **LLM Task**: Detect unstated requirements (e.g. dataset format, grading rubrics, page limits, submission prerequisites).
- **Output**: Array of alert strings (e.g. `["No target grade or scope specified; assumed comprehensive prep.", "Check if cheat sheet is permitted.""]`).

### 2.4 Capability 4: Baseline Effort Estimation
- **Purpose**: Provides initial hour estimates for work items when the user has no personal history for that task type.
- **Method**: Few-shot prompt calibrated against typical academic and project tasks, producing a point estimate with confidence bounds:
  - `baseline_estimated_hours`: float (e.g., `4.0`)
  - `confidence_score`: float (0.0 to 1.0)
  - `min_expected_hours`: float (e.g., `3.0`)
  - `max_expected_hours`: float (e.g., `6.0`)

---

## 3. Personalization & Learning Loop (Statistical Engine)

The personalization loop is governed by **empirical observation**, not prompt memorization.

```text
Estimated Hours (E) ────────┐
                             ├──► Ratio = A / E ──► Exponential Moving Average (EMA) ──► Personal Pace Factor (P)
Actual Logged Hours (A) ────┘
```

### 3.1 Pace Factor Mathematics
For every completed work item or work unit with both predicted effort ($E > 0$) and actual logged time ($A > 0$):
1. **Single Observation Ratio**:
   $$\text{ObservedRatio}_i = \frac{A_i}{E_i}$$
2. **Category Pace Factor Update**:
   $$P_{\text{cat}, t} = \alpha \cdot \text{ObservedRatio}_t + (1 - \alpha) \cdot P_{\text{cat}, t-1}$$
   where $\alpha = 0.2$ (learning rate weighting recent observations while maintaining stability).
3. **Pace Factor Clamping**:
   $$P \in [0.5, 3.0]$$
   Prevents extreme outliers (e.g., leaving a timer running overnight) from permanently skewing estimates.
4. **Personalized Work Sizing**:
   $$\text{PersonalizedEstimate} = \text{BaselineEstimate} \times P_{\text{cat}}$$

### 3.2 Distinction From "Black-Box AI"
- The user can inspect their exact Pace Factors in `/insights` (e.g., "Academic: 1.25x based on 8 completed tasks").
- The user can manually override or reset their pace factor at any time.

---

## 4. Deterministic System Calculations (Non-AI)

These algorithms execute natively in Python/SQL without calling an LLM:

### 4.1 Available Capacity Calculation
Given a date interval $[T_{\text{now}}, T_{\text{deadline}}]$:
1. Fetch recurring weekly available windows from `time_availability`.
2. Subtract all overlapping `schedule_blocks` (blackouts, classes, gym, meals).
3. Result is **Usable Suitable Hours ($H_a$)**.

### 4.2 Deadline Risk Assessment
1. **Risk Ratio**:
   $$R = \frac{\text{RemainingEstimatedHours} \times P_{\text{cat}}}{H_a}$$
2. **State Categorization**:
   - $R \le 0.5$: `SAFE` (Abundant capacity, workload well within limits).
   - $0.5 < R \le 0.85$: `WATCH` (Comfortable, but requires monitoring if new tasks arise).
   - $0.85 < R \le 1.15$: `AT RISK` (Workload matches or slightly exceeds suitable time).
   - $R > 1.15$: `CRITICAL` (Deficit: more work remains than suitable time available).
   - $T_{\text{now}} > T_{\text{deadline}}$ and unfinished: `OVERDUE`.

### 4.3 Dynamic Priority Calculation
$$S = w_d \cdot D_{\text{score}} + w_r \cdot R_{\text{score}} + w_i \cdot I + w_u \cdot U_{\text{score}}$$
- $D_{\text{score}}$: Inverse proximity to deadline (exponential decay as deadline nears).
- $R_{\text{score}}$: Continuous mapped risk ratio.
- $I$: User importance multiplier ($0.5$ to $2.0$).
- $U_{\text{score}}$: Penalty if competing tasks crowd the same upcoming capacity window.
- Produces normalized score $S \in [0, 100]$.

---

## 5. Model Provider Abstraction Layer

To ensure vendor independence and high availability, the backend accesses AI capabilities through a decoupled facade:

```python
class AIServiceInterface(ABC):
    @abstractmethod
    async def decompose_work(self, title: str, description: Optional[str], category: str) -> DecompositionResult:
        pass

    @abstractmethod
    async def estimate_effort(self, title: str, category: str, description: Optional[str]) -> EffortEstimateResult:
        pass

    @abstractmethod
    async def detect_missing_info(self, title: str, description: Optional[str]) -> List[str]:
        pass
```

### Supported Providers:
1. **Google Gemini** (`gemini-1.5-flash` / `gemini-1.5-pro`): Primary provider via Google GenAI SDK with structured JSON mode.
2. **Anthropic Claude** (`claude-3-5-haiku` / `claude-3-5-sonnet`): Alternative provider via Anthropic SDK.
3. **OpenAI** (`gpt-4o-mini` / `gpt-4o`): Alternative provider with JSON schema enforcement.
4. **MockAIService**: Deterministic local stub for unit tests, offline development, and CI pipelines (zero API cost, zero network latency).

---

## 6. Prompt Engineering & Structured Outputs

All LLM calls utilize strict schema enforcement (Structured Outputs) via Pydantic v2 schemas. Freeform markdown generation is prohibited for system orchestration.

### System Prompt Directive
```text
You are the Deadline Radar Intelligence Engine.
Your responsibility is to analyze academic and professional work items and break them down into realistic, sequential subtasks.
You do NOT calculate final deadline risk scores or schedule slots—those are handled by the deterministic calculation engine.
Follow these rules strictly:
1. Subtasks must be actionable and concise (3 to 8 subtasks per work item).
2. Each subtask must be estimated between 0.5 hours and 3.0 hours.
3. Output valid JSON adhering strictly to the requested schema.
4. Do not provide conversational chit-chat or preambles.
```

---

## 7. Resilience, Fallbacks, and Hallucination Mitigation

1. **Timeout & Circuit Breaker**: All AI calls have an 8-second timeout. If the external provider fails or times out, the system catches the exception and returns a graceful fallback.
2. **Fallback Response**:
   ```json
   {
     "suggested_units": [],
     "total_estimated_hours": 1.0,
     "confidence_score": 0.0,
     "fallback_used": true,
     "reasoning_summary": "AI service temporarily unavailable. Please enter subtasks manually."
   }
   ```
3. **Schema Validation Guard**: Every raw LLM response passes through Pydantic model parsing. If validation fails, a single retry with error feedback is attempted; if that fails, the fallback is returned.
4. **Zero Silent Hallucination**: AI estimates are always badged with `confidence_score` and flagged as `AI-DERIVED DATA` until the user confirms or edits them (`USER-VERIFIED DATA`).

---

## 8. Privacy, Security, and Cost Controls

1. **Zero User PII in Prompts**: Prompts contain only work item titles, descriptions, and categories. User emails, real names, passwords, and calendar account IDs are never included in LLM context.
2. **Aggressive Token Optimization**:
   - Prompts are restricted to essential instructions and concise few-shot examples (< 500 input tokens per call).
   - Expected output size is < 400 tokens per decomposition.
3. **Client-Side Throttling & Caching**:
   - Decomposition requests are triggered only by explicit user button click ("Decompose with AI"), never on keystroke debounce.
   - Identical title + category queries are cached in memory for 10 minutes to prevent redundant API calls.
