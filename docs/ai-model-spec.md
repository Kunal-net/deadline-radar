# AI Model Specification — Deadline Radar

## Purpose
The AI subsystem in **Deadline Radar** delivers modular intelligence to reduce the manual effort of discovering, parsing, and tracking opportunities. It converts unstructured or semi-structured announcements (social media posts, email newsletters, contest notices, web pages) into validated, structured opportunity records, eliminates redundant duplicate records, and assists users with summarization and natural-language discovery.

---

## Problem Type
The subsystem encompasses multiple Natural Language Processing (NLP) and information extraction tasks:
1. **Named Entity Recognition (NER) & Structured Information Extraction**: Extracting key-value pairs (Deadline, Organization, Eligibility, Links) from messy text.
2. **Text Classification (Multi-class)**: Assigning an opportunity to predefined categories (`hackathon`, `internship`, `scholarship`, etc.).
3. **Text Summarization**: Generating concise 2-sentence overviews and bulleted requirements.
4. **Record Deduplication / Entity Resolution**: Identifying whether a newly submitted opportunity matches an existing listing.
5. **Semantic Embedding & Vector Search**: Enabling natural language search queries across opportunity descriptions.

---

## Inputs
- **Raw Announcement Text**: Unstructured text pasted by a user or scraped from an announcement (string, 50 to 10,000 characters).
- **Target URL (Optional)**: Link to an opportunity landing page where HTML text can be parsed.
- **User Query (for Search)**: Natural language string (e.g., *"remote hackathons with cash prizes in April"*).

---

## Outputs
- **Structured Opportunity Draft**: Validated JSON matching the Pydantic schema:
  - `title`: string
  - `organization`: string
  - `category`: string (one of the taxonomy categories)
  - `deadline`: ISO 8601 UTC timestamp
  - `start_date` / `end_date`: ISO 8601 UTC timestamp (or null)
  - `eligibility`: string summary of requirements
  - `location`: string ("Remote" or city/country)
  - `mode`: enum (`online`, `in_person`, `hybrid`)
  - `cost`: numeric value (0 for free)
  - `application_url`: string URL
  - `tags`: array of keyword strings
  - `summary`: 2-sentence executive summary
  - `confidence_score`: float (0.0 to 1.0)
- **Duplicate Detection Result**: Boolean flag and similarity score (0.0 to 1.0) with matching `opportunity_id` if found.

---

## Dataset
- **Status**: `TODO — DATASET CURATION`
- Currently, no static ground-truth dataset exists for Deadline Radar.
- An initial benchmarking dataset of 100-200 diverse, real-world opportunity announcements (hackathons, scholarships, internships) across different platforms will be collected and manually annotated with gold-standard fields.

---

## Data Collection
- **Sources**: Curated announcements from student communities, Devpost hackathon pages, public university scholarship boards, and internship listings.
- **Format**: JSONL records containing `{ raw_text: string, source_url: string, ground_truth: dict }`.

---

## Data Cleaning
- Stripping extraneous HTML boilerplates, navigation bars, cookie notices, and tracking query params (`utm_*`).
- Normalizing character encodings (UTF-8) and collapsing excessive whitespace.
- Anonymizing any private user submission identifiers.

---

## Preprocessing
- Truncating input text to context limits (e.g. 4,000 tokens) while preserving the beginning (title/org) and ending sections (where application links and deadlines commonly appear).
- Standardizing date text expressions (e.g., converting "April 15th 11:59 PM EST" to UTC).

---

## Feature Engineering
- For text embeddings: Sentence-Transformers or text-embedding models generating 384 to 1536-dimensional dense vectors.
- For deduplication: Normalized URL matching, exact title Jaro-Winkler distance, and cosine similarity between text embeddings.

---

## Model Selection
```text
TODO — MODEL SELECTION
```
The exact model architecture and provider have **not** yet been selected.

Candidate approaches under evaluation:
1. **Hosted LLM Structured Output API (e.g., Google Gemini 1.5 Flash, Anthropic Claude 3.5 Haiku, OpenAI GPT-4o-mini)**:
   - *Pros*: Exceptional zero-shot extraction precision, native JSON schema adherence (via tools or structured output modes), minimal operational overhead, low cost per extraction.
   - *Cons*: External API latency, per-token API cost, network dependency.
2. **Open-Source Local / Self-Hosted Models (e.g., Llama 3 / Mistral via Ollama or vLLM)**:
   - *Pros*: Zero external API cost, complete data privacy, no third-party rate limits.
   - *Cons*: GPU hosting costs, operational complexity, potentially lower reliability on complex edge cases.
3. **Hybrid Lightweight Pipeline (Regex/Heuristic parser + Embedding similarity + LLM fallback)**:
   - *Pros*: Cost-effective; fast deterministic parsing for known platforms (e.g. Devpost URL patterns) with LLM invocation only for messy raw text.

*Decision criterion*: Evaluation against the benchmark dataset for date accuracy, extraction reliability, cost, and latency.

---

## Training
- If utilizing hosted LLMs: Zero-shot or few-shot in-context learning with strict Pydantic JSON schemas.
- If fine-tuning a small open model (e.g., for local classification/NER): Parameter-Efficient Fine-Tuning (PEFT / LoRA) on the curated dataset.

---

## Evaluation
Evaluation will be automated via a dedicated evaluation suite in `ai-model/tests/`:
- **Date Accuracy**: Exact match on deadline date and time conversion to UTC.
- **Field Extraction Completeness**: Macro-F1 score on presence of title, org, eligibility, and URL.
- **Classification Accuracy**: Confusion matrix across opportunity categories.
- **Deduplication Precision**: Zero false positive duplicates when two different opportunities share similar titles.

---

## Metrics
- **Extraction F1**: Target > 0.90 across all required fields.
- **Deadline Date Accuracy**: Target > 95% exact day match; zero hallucinated dates.
- **Inference Latency**: < 3.0 seconds for user text extraction.
- **Schema Validation Rate**: 100% of outputs must parse without Pydantic validation errors.

---

## Inference
- **Inference Pattern**: Synchronous API endpoint (`POST /api/v1/ai/extract`) for interactive user drafting.
- **Validation Pipeline**: Output from the model is passed through `OpportunityDraftSchema.model_validate_json()`. If validation fails, a repair loop or structured fallback is triggered.

---

## Model Versioning
- Model prompts, system instructions, and schema definitions versioned in git under `ai-model/prompts/v1/`.
- Model checkpoints (if local models are used) tracked with model cards, Git LFS, or Hugging Face Hub tags.

---

## Model Serving
- During development: Encapsulated as an internal service provider class (`backend/app/services/ai/extractor.py`).
- In production: May remain embedded in the FastAPI async worker or extracted into an independent microservice if local heavy weights require dedicated GPU containers.

---

## Backend Integration
- The backend accesses AI features through a unified interface:
  ```python
  class AIExtractionService(ABC):
      @abstractmethod
      async def extract_opportunity(self, text: str) -> ExtractedOpportunity:
          pass
      
      @abstractmethod
      async def compute_similarity(self, title: str, text: str) -> float:
          pass
  ```
- Any failure in the AI service triggers a fallback: the raw text is preserved, and the user is guided to fill fields manually.

---

## Failure Cases & Mitigations
1. **Missing Deadline in Announcement**:
   - *Mitigation*: Model returns `deadline: null` and sets a warning: `"Deadline not identified; please input manually."`
2. **Ambiguous Timezone (e.g., "by 11:59 PM" without timezone)**:
   - *Mitigation*: Default to 23:59:59 in the target country's primary timezone or UTC, with a clear UI tag indicating timezone uncertainty.
3. **Model Hallucination**:
   - *Mitigation*: The user is *always* presented with an edit/confirmation modal before the opportunity is officially saved to the database. AI acts as an assistant, never as an unreviewed authority.
4. **Third-Party API Outage or Rate Limit**:
   - *Mitigation*: Graceful HTTP 503 / fallback with message: `"AI extraction temporarily unavailable. You can enter details manually."` Core CRUD remains 100% functional.
