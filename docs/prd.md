# Product Requirements Document (PRD) — Deadline Radar

## 1. Product Overview
**Deadline Radar** is a centralized deadline and opportunity management application designed to help students and young professionals discover, track, organize, prioritize, and act upon time-sensitive opportunities before their deadlines expire. The platform bridges the gap between chaotic information discovery and timely execution through an intuitive dashboard, calendar views, lifecycle tracking, smart reminders, and modular AI assistance.

---

## 2. Problem
Students and early-career individuals must manage dozens of concurrent, high-stakes deadlines across disparate channels (hackathons, scholarships, internships, coding contests, college events, certifications).
- **Fragmented Data**: Information is scattered across emails, chat groups (Discord, Slack, WhatsApp), college notice boards, LinkedIn, and specialized websites.
- **Missed Opportunities**: Opportunities are frequently discovered too late or forgotten until the application window has already closed.
- **Cognitive Overload**: Manually tracking deadlines in notes apps or spreadsheets is tedious, lacks proximity alerting, and fails to provide status tracking across the application lifecycle.
- **Lack of Prioritization**: Users struggle to quickly assess which deadlines are imminent and require urgent action versus those far in the future.

---

## 3. Target Users
- **Primary Audience**: Undergraduate and graduate students actively applying for internships, hackathons, coding contests, scholarships, and academic competitions.
- **Secondary Audience**: Recent university graduates, bootcamp graduates, and young professionals seeking career-accelerating opportunities, fellowships, and professional certifications.

---

## 4. User Personas

### Persona A: "Aarav" — The Ambitious Computer Science Student
- **Profile**: 3rd-year CS student aiming for summer internships, active in collegiate hackathons and competitive programming.
- **Pain Points**: Bookmarks 20+ links across browser tabs, forgets to submit hackathon project proposals before the 11:59 PM deadline, loses track of which internship portals he has already applied to.
- **Needs**: A clean dashboard highlighting deadlines closing in the next 3 days, a single place to track application status (`Saved` -> `Applied` -> `Interviewing`), and a quick way to import an opportunity from a URL.

### Persona B: "Priya" — The Scholarship & Fellowship Seeker
- **Profile**: Final-year student researching international graduate school scholarships and research fellowships.
- **Pain Points**: Eligibility criteria are complex and buried in long PDFs or web pages; scholarship deadlines have multiple milestones (letters of recommendation, essay submission, final review).
- **Needs**: Ability to record notes, see eligibility requirements clearly, set reminder alerts 7 days and 3 days before submission, and view milestones on a monthly calendar.

---

## 5. Goals
- **Centralize Deadlines**: Provide a unified catalog and personal tracking system for time-sensitive opportunities.
- **Eliminate Missed Dates**: Deliver clear proximity indicators (countdown badges, urgent sections) and proactive reminders before deadlines.
- **Lifecycle Management**: Enable users to manage each opportunity from discovery to completion (`Saved`, `Applied`, `Completed`, `Archived`).
- **Low Friction Capture**: Support quick user-assisted addition of opportunities, enhanced by AI extraction.
- **High Signal-to-Noise**: Deliver a clean, distraction-free interface devoid of clutter and cognitive overload.

---

## 6. Non-Goals
- **Not an Applicant Tracking System (ATS) for Employers**: Deadline Radar is strictly a student/applicant-centric personal tool, not a corporate recruitment portal.
- **Not a Social Network**: No social feeds, likes, influencer profiles, or comment threads.
- **Not a Full-blown Calendar Replacement**: Deadline Radar will provide focused deadline calendars and iCal/export feeds, but will not seek to replace general Google Calendar/Outlook scheduling.
- **No Heavy Scraping Engine at MVP**: Opportunities will initially be ingested through curated feeds, user submissions, and verified sources, rather than brittle, unvetted web-wide scrapers.

---

## 7. Features

### Core Feature 1: Opportunity Catalog & Discovery
- Browse opportunities across categories:
  - Hackathons
  - Internships
  - Scholarships
  - Competitions
  - Coding Contests
  - Events & Conferences
  - Courses & Certifications
  - Fellowships
- Search by keyword, organization, or tags.
- Filter by category, delivery mode (`Online`, `In-Person`, `Hybrid`), cost (`Free`, `Paid`), and deadline range.

### Core Feature 2: Detailed Opportunity Profiles
- Structured data presentation:
  - Title, organizing body, category badge.
  - Deadline timestamp (with timezone awareness) and start/end dates.
  - Eligibility criteria, location (city/country or remote), registration fee/cost.
  - Official application/registration URL.
  - Source attribution, tags, and summary.

### Core Feature 3: Personal Tracking & Radar
- Save opportunities to personal list with 1-click.
- Set tracking status:
  - `Saved`: Bookmarked for review.
  - `Interested`: High intent to apply.
  - `Applied`: Application submitted.
  - `Interviewing`: Under active evaluation.
  - `Offered`: Successful outcome.
  - `Rejected`: Application denied.
  - `Completed`: Event or milestone concluded.
  - `Archived`: Hidden from active dashboard.
- Custom personal notes per saved item (e.g., "Need to request LOR from Prof. Sharma").

### Core Feature 4: Deadline Dashboard
- **Urgent Radar**: Opportunities expiring in <24 hours, <3 days, <7 days.
- **Active Applications**: Quick glance at opportunities currently in `Applied` or `Interviewing` status.
- **Overdue Warning**: Opportunities where the deadline has elapsed without an updated status.
- **Recently Added**: New opportunities matching user interest.

### Core Feature 5: Calendar View
- Monthly and weekly grid view displaying opportunities by deadline date.
- Color-coded badges indicating opportunity category and user tracking status.

### Core Feature 6: Proximity Reminders & Notifications
- Pre-configured reminder triggers:
  - 7 days before deadline
  - 3 days before deadline
  - 1 day before deadline
  - Day-of deadline (morning alert)
- In-app notification center with read/unread status.
- Future notification channels (Email, Web Push) configurable in user preferences.

### Core Feature 7: Modular AI Capabilities
- **Unstructured Extraction**: User pastes opportunity text or a link; AI extracts title, deadline, organization, category, eligibility, and URL.
- **Opportunity Classification**: Automatic categorization into the standardized taxonomy.
- **Concise Summarization**: AI generates a 2-3 bullet point summary highlighting key perks and deadlines.
- **Deduplication**: Detection of identical opportunities arriving from multiple sources.
- **Semantic Search**: Natural language query search (e.g., "Remote AI hackathons with cash prizes").

---

## 8. User Stories

| ID | As a... | I want to... | So that... |
| :--- | :--- | :--- | :--- |
| **US-01** | Student | Filter opportunities by category and deadline proximity | I can focus on immediate opportunities relevant to my field. |
| **US-02** | Student | Save an opportunity to my personal radar | I don't lose the link or forget about it. |
| **US-03** | Applicant | Change the status of an opportunity to `Applied` | I know where I stand in my application pipeline. |
| **US-04** | User | View all my deadlines on a monthly calendar | I can plan my study and project schedule effectively. |
| **US-05** | User | Receive an alert 3 days before an important deadline | I have enough time to finish my submission without rushing. |
| **US-06** | Student | Paste a raw opportunity announcement into an AI input box | The application, deadline, and eligibility are extracted automatically without manual data entry. |
| **US-07** | User | Add private notes to a saved opportunity | I can track internal checklist items (e.g., resume draft, portfolio link). |
| **US-08** | User | Filter out expired or irrelevant opportunities | My dashboard remains clean and actionable. |

---

## 9. User Flows

### Flow 1: Discover and Track an Opportunity
```text
[Home / Discover Page]
       │
       ▼
[Filter by Category & Deadline]
       │
       ▼
[Click Opportunity Card]
       │
       ▼
[View Opportunity Detail Modal / Page]
       │
       ▼
[Click "Save to Radar"]
       │
       ▼
[Status defaults to "Saved" -> Appears on Dashboard & Calendar]
```

### Flow 2: Quick Capture via AI Extraction
```text
[Click "+ Add Opportunity"]
       │
       ▼
[Choose "Paste Text / URL"]
       │
       ▼
[Click "Extract with AI"]
       │
       ▼
[Review Extracted Fields (Title, Deadline, Eligibility, URL)]
       │
       ▼
[Make Minor Corrections if Needed]
       │
       ▼
[Confirm & Save -> Opportunity Created & Tracked]
```

### Flow 3: Updating Status from Dashboard
```text
[Open Dashboard]
       │
       ▼
[Review "Urgent Deadlines (<3 Days)"]
       │
       ▼
[Click "Apply Now" (Opens Official URL in New Tab)]
       │
       ▼
[Return to Radar & Click "Mark as Applied"]
       │
       ▼
[Opportunity moves to "Active Applications" section]
```

---

## 10. Functional Requirements
- **FR-01**: The system must persist opportunity entities with required fields: Title, Organization, Category, Deadline (ISO 8601 with UTC timezone), Application URL.
- **FR-02**: The system must support optional fields: Description, Start Date, End Date, Eligibility Criteria, Location, Delivery Mode (`Online`, `In-Person`, `Hybrid`), Cost, Tags, and Source.
- **FR-03**: The system must enforce uniqueness or flag potential duplicates when saving opportunities.
- **FR-04**: The system must allow users to associate personal metadata with an opportunity: Tracking Status, Personal Notes, and Reminder Configurations.
- **FR-05**: The system must query opportunities sorted by urgency (ascending deadline relative to `now()`).
- **FR-06**: The system must calculate deadline proximity buckets: Overdue, <24 Hours, <3 Days, <7 Days, and Later.
- **FR-07**: The system must provide a calendar-compatible endpoint returning events grouped by date.
- **FR-08**: The AI extraction endpoint must accept raw text or URL content and return a validated structured JSON payload conforming to the opportunity schema.
- **FR-09**: The system must maintain an audit timestamp (`created_at`, `updated_at`) on all database entities.

---

## 11. Non-Functional Requirements
- **Performance**: Standard API queries (catalog listing, dashboard stats) must respond in under 150ms for typical page sizes (20-50 items).
- **Timezone Precision**: All deadlines must be stored in UTC in the database, with timezone offset stored or converted dynamically on the client based on user locale.
- **Modularity**: AI extraction and classification must be decoupled via clean service interfaces, allowing background job processing or third-party LLM failover.
- **Reliability & Resilience**: If the AI extraction service is unavailable or errors, the user must still be able to create and edit opportunities manually without disruption.
- **Cost Efficiency**: Backend and database must run within standard free/low-cost tiers (e.g., PostgreSQL on Supabase/Neon, API on Render/Railway).
- **Security & Privacy**: User personal notes and tracking states must be isolated and protected; zero credentials committed.

---

## 12. Edge Cases
- **Deadline without Explicit Time**: When an announcement specifies a date without a time (e.g., "Deadline: March 31, 2026"), default to 23:59:59 in the opportunity's local timezone (or UTC if unknown).
- **Rolling / Ongoing Deadlines**: Some internships or fellowships have rolling admissions. The system must support a `is_rolling` boolean flag and present them appropriately without false overdue warnings.
- **Timezone Ambiguity**: If a contest specifies "AoE" (Anywhere on Earth) or local time, the backend/AI extractor must convert accurately to UTC.
- **Expired Opportunities**: Opportunities whose deadline has passed should not vanish; they transition to `Overdue` for active trackers or `Expired` in the public catalog.
- **Duplicate URL Submission**: If a user submits an opportunity with an identical URL to an existing record, the system should prompt to view or merge rather than creating an unlinked duplicate.
- **AI Hallucinations / Missing Dates**: If the AI extractor cannot identify a deadline with confidence, it must return `deadline: null` and flag the field for mandatory user review before saving.

---

## 13. Success Criteria
- **Zero Missed Deadlines**: A user tracking an opportunity is alerted before the deadline arrives.
- **Fast Ingestion**: Creating a tracked opportunity via AI extraction takes under 15 seconds end-to-end.
- **Clear Information Density**: Users can assess all urgent deadlines across categories in under 10 seconds from the dashboard.
- **Extensible Architecture**: Adding a new opportunity source or switching AI models requires zero schema changes to the core application.

---

## 14. Future Scope
- Automated ingestion scrapers for major student platforms (Devfolio, Unstop, MLH, LinkedIn, Kaggle).
- Browser extension for 1-click opportunity capture while browsing external websites.
- iCal / Google Calendar / Outlook calendar feed sync (.ics subscription link).
- Multi-channel notification delivery (Discord webhook, Slack bot, Telegram bot, WhatsApp).
- Collaborative team/group tracking for group hackathons or collegiate squads.
- AI personalized recommendation engine matching user resume/portfolio with live opportunities.
