# AI & Machine Learning Module — Deadline Radar

## Purpose
The `ai-model/` directory houses the machine learning models, extraction pipelines, prompt templates, and natural language processing logic for **Deadline Radar**. It provides modular intelligence for:
- Unstructured deadline and metadata extraction (from text, URLs, or announcements)
- Automatic classification of opportunities into domains (Hackathons, Internships, Scholarships, etc.)
- Opportunity summarization and key eligibility parsing
- Deduplication of opportunities from multiple sources
- Semantic search and user personalization

## Dataset
- **Status**: `TODO — DATASET CURATION`
- Currently, no static dataset exists. Data will be collected from curated public opportunity notices, synthetic samples, and user-provided inputs.
- Training/fine-tuning datasets and validation splits will be documented under `data/` and excluded from git version control via `.gitignore`.

## Training
- Pipeline specifications for fine-tuning open models or training lightweight classifiers (e.g. Scikit-learn, SetFit, or Hugging Face Transformers) will be defined here.
- Any heavy training scripts must run decoupled from the core API web server.

## Evaluation
- Standardized benchmarks will evaluate:
  - **Extraction Accuracy**: Exact-match and F1 score on critical date fields (Deadline, Start Date, End Date).
  - **Classification Metrics**: Precision, Recall, and F1 across opportunity taxonomy categories.
  - **Deduplication Precision**: Minimizing false duplicates while clustering identical events across different platforms.

## Inference
- Inference engines may run as:
  1. A standalone microservice (e.g. FastAPI serving a small Transformer/ONNX model)
  2. Direct client calls to structured LLM APIs (e.g. Claude, Gemini, OpenAI) using typed schemas (Pydantic / Instructor)
  3. Local embedding models (e.g. Sentence-Transformers) for semantic search

## Model Serving & Backend Integration
- Decoupled from the primary CRUD backend: the backend interacts with AI capabilities via an abstracted client interface.
- Asynchronous execution: heavy or slow AI extraction tasks will execute via background jobs or task queues to keep API response times minimal.

## Relevant Documentation
- [AI Model Specification](../docs/ai-model-spec.md)
- [Architecture Overview](../docs/architecture.md)
- [API Contract](../docs/api-contract.md)
