# Deadline Radar — Design System

## 1. Product Identity

**Product:** Deadline Radar

**Category:** AI-powered personalized deadline monitoring and time-management system.

Deadline Radar helps a person answer:

> **What deserves my time right now?**

It is not a conventional to-do list.

The system understands the user's work, deadlines, available time, historical pace, workload, and personal commitments. It estimates effort, detects deadline risk, dynamically prioritizes work, proposes realistic plans, observes actual completion time, and improves future estimates.

### Core loop

```text
Add Work
   ↓
Understand Work
   ↓
Decompose
   ↓
Estimate Effort
   ↓
Learn Personal Pace
   ↓
Compare With Available Time
   ↓
Detect Risk
   ↓
Prioritize
   ↓
Plan
   ↓
Execute
   ↓
Observe Actual Time
   ↓
Learn
   ↓
Replan
```

The visual design must make this loop understandable without making the interface feel like a generic productivity app.

---

# 2. Visual Reference

Reference:

https://www.iremgeldry.com/templates/aperol?ref=land-book.com

The reference is **visual inspiration only**.

Take inspiration from:

- dark editorial aesthetic
- sophisticated serif + sans typography
- near-black layered backgrounds
- warm off-white text
- restrained warm accent
- large typography
- generous whitespace
- asymmetric layouts
- framed content/image compositions
- thin borders
- subtle depth
- strong visual hierarchy
- premium editorial presentation
- restrained navigation

Do NOT copy:

- Aperol branding
- Aperol name
- Aperol logo
- Aperol content
- exact layouts
- exact page compositions
- exact imagery
- proprietary assets
- distinctive illustrations
- copywriting

Deadline Radar must have an original product identity.

---

# 3. Design Personality

The interface should feel:

- intelligent
- calm
- premium
- editorial
- focused
- personal
- sophisticated
- slightly unconventional
- intentional

It should NOT feel:

- generic SaaS
- corporate enterprise software
- Trello
- Notion
- Linear clone
- Google Calendar clone
- AI chatbot
- futuristic cyberpunk UI
- productivity-gamification app
- template-generated dashboard

---

# 4. Anti-AI-Slop Rules

The following are explicitly prohibited unless there is a strong functional reason:

- purple/blue AI gradients
- neon gradients
- glassmorphism
- floating blobs
- excessive rounded cards
- every element inside a card
- identical card grids
- excessive pill-shaped controls
- giant metric-card dashboards
- excessive drop shadows
- excessive icons
- sparkle/AI icons everywhere
- robot illustrations
- meaningless statistics
- decorative charts
- excessive animations
- generic stock photography
- generic "Welcome back!" dashboard copy
- oversized "AI-powered" marketing language

Use:

- typography
- whitespace
- composition
- borders
- alignment
- scale
- contrast
- subtle accent color
- editorial image placement

as the primary visual tools.

---

# 5. Color System

Use a dark-first palette.

### Base

```text
Background:          #0B0C0C
Surface:             #121414
Secondary Surface:   #181A1A
Elevated Surface:    #1D2020
```

### Typography

```text
Primary:             #F2F0EA
Secondary:           #A5A6A2
Muted:               #70736F
```

### Borders

Use subtle neutral borders with low opacity.

### Accent

Use a restrained warm orange/amber.

The accent represents:

- action
- approaching deadlines
- active state
- important changes
- risk
- primary CTA

Do not use the accent everywhere.

### Semantic states

Use restrained semantic colors for:

```text
Safe
Watch
At Risk
Critical
Overdue
Complete
```

Color must never be the only way these states are communicated.

---

# 6. Typography

Use two complementary families.

### Display

Editorial serif.

Use for:

- hero headlines
- major page titles
- important statements
- large section headings

### UI

Modern clean sans-serif.

Use for:

- navigation
- body
- labels
- buttons
- forms
- metadata
- timestamps
- controls

Typography should carry significant visual identity.

Avoid using one generic sans-serif everywhere.

---

# 7. Layout System

Use a responsive editorial grid.

Desktop:

- centered max-width
- 12-column grid
- asymmetric compositions
- generous horizontal margins
- large vertical rhythm

Not every section should have equal-width columns.

Use:

- large feature areas
- narrow supporting areas
- full-width timelines
- offset sections
- editorial splits

Mobile:

- recompose rather than shrink
- one primary column
- intentional stacking
- compact navigation
- touch-friendly interactions

---

# 8. Global Navigation

## Desktop

Minimal top navigation:

**Deadline Radar**

- Today
- Work
- Timeline
- Workload
- Insights

Right:

- Search
- Notifications
- Profile

Do not default to a giant sidebar.

The product should retain the feeling of a premium editorial application.

## Mobile

Use:

- wordmark
- search
- profile/menu

and a compact bottom navigation for:

- Today
- Work
- Timeline
- Insights

---

# 9. Information Architecture

Required screens:

## Marketing

1. Landing
2. How It Works

## Authentication

3. Sign In
4. Sign Up
5. Forgot Password

## Onboarding

6. Welcome
7. Work Context
8. Available Time
9. Interests / Personal Time
10. Notification Preferences
11. Onboarding Complete

## Core Product

12. Today
13. Dashboard / Radar
14. Work
15. Add Work
16. Work Detail
17. Timeline
18. Calendar
19. Workload
20. Priorities
21. Planning
22. Insights
23. Notifications

## Account

24. Profile
25. Settings

## System

26. Empty States
27. Loading States
28. Error States
29. 404

---

# 10. Landing Page

The landing page must communicate the new product clearly.

## Hero

Core message:

> **Your deadlines are not the problem. Your time is.**

Alternative supporting message:

> Deadline Radar understands your work, learns how long things take you, and continuously adjusts what deserves your attention.

Primary CTA:

**Build My Radar**

Secondary CTA:

**See How It Works**

### Hero visual

Do not use generic productivity imagery.

Instead show an art-directed Deadline Radar interface containing:

- approaching deadlines
- workload pressure
- available time
- recommended work
- subtle Radar visualization

The hero should look like a premium product presentation.

---

# 11. Landing — Problem Section

Show the reality of competing work.

Example:

```text
ML Project              8h remaining
Math Exam               6h preparation
Database Assignment     3h remaining
Personal Project        2h
```

Then show:

```text
Available time this week: 14h
Estimated work:          19h
```

The visual should communicate why a simple task list is insufficient.

---

# 12. Landing — Personalization Section

Explain:

```text
Predicted
   ↓
Actual
   ↓
Difference
   ↓
Personal model
   ↓
Better prediction
```

Use a visually interesting comparison.

Avoid fake precision or claims of perfect AI prediction.

---

# 13. Landing — Dynamic Planning Section

Show how the same tasks can receive different priorities as circumstances change.

Example:

```text
Monday

ML Report
6h remaining
4 days left

→ Watch
```

Later:

```text
Thursday

ML Report
6h remaining
1 day left

→ Critical
```

Explain that priority is dynamic.

---

# 14. Landing — Available Time

Show:

```text
Required work:       18h
Available capacity:  14h
```

Then show personal blocks:

```text
Study
Project
Gym
Personal Project
Rest
```

The system should protect user-defined personal time.

---

# 15. Landing — How It Works

Use four major stages:

### 01 — Add

Tell Deadline Radar what you're working on.

### 02 — Understand

AI understands and decomposes the work.

### 03 — Plan

Deadline Radar compares effort, deadlines, and available time.

### 04 — Adapt

Actual completion changes future estimates and plans.

Use large typography and editorial composition.

---

# 16. Landing — Final CTA

Headline:

> **Know what deserves your time.**

CTA:

**Build My Radar**

---

# 17. Onboarding

Onboarding should feel like a personalized setup, not a form wizard.

Collect progressively:

- work/study context
- common work types
- available hours
- working preferences
- personal interests
- protected time
- notification preferences

Explain why important questions are asked.

Example:

> "Knowing when you normally have time helps Radar build plans that fit your actual life."

Keep each step focused.

---

# 18. Today

The Today page should answer:

> **What should I do now?**

Primary hierarchy:

### NOW

The work currently recommended.

### NEXT

The next useful work block.

### DEADLINE

The most relevant upcoming deadline.

### PLAN

Today's suggested time allocation.

### PERSONAL

Protected personal/interest time.

Do not use a wall of cards.

Use one strong focal area plus supporting sections.

---

# 19. Radar / Dashboard

The Radar is the product's signature visual.

It should communicate:

- approaching deadlines
- workload pressure
- risk
- available capacity

Avoid literal sci-fi radar graphics.

Prefer a refined editorial visualization such as:

- horizontal time field
- deadline markers
- distance-to-deadline
- workload bands
- subtle lines
- typographic labels

Example concept:

```text
NOW ──────────────── THIS WEEK ──────────────── LATER

      ML Report ●
                     Database ●
                              Exam ●
```

Risk can be communicated through:

- position
- scale
- typography
- subtle accent
- status labels

---

# 20. Work Page

Title:

**Your Work**

Show all active work.

Each item should communicate:

- title
- deadline
- remaining effort
- progress
- priority
- risk
- next action

Allow:

- search
- filtering
- sorting
- grouping

Possible filters:

- Today
- Upcoming
- At Risk
- Overdue
- Completed

Avoid a conventional dense table.

---

# 21. Add Work

Primary action:

**Add Work**

The experience should support natural language.

Example:

> "Finish my ML project report by Friday. I still need the results section and final editing."

The AI can extract:

- title
- deadline
- work units
- estimated effort

User must be able to review and edit the result.

Also support structured input:

- title
- description
- deadline
- importance
- category
- attachments
- notes

Do not force users through a huge form.

---

# 22. Work Detail

The Work Detail screen is one of the most important product screens.

Header:

- work title
- deadline
- priority
- risk
- progress

Sections:

### Work Breakdown

AI-generated work units.

### Estimated Effort

```text
Estimated:
8h 30m

Confidence:
Moderate
```

### Available Time

```text
Suitable time remaining:
6h
```

### Deadline Risk

Explain why the task is at risk.

### Personal History

When enough history exists:

```text
Similar work:
Usually takes you 15–20% longer than baseline.
```

### Plan

Recommended work sessions.

### Actual vs Predicted

```text
Predicted: 2h
Actual:    2h 35m
```

### Actions

- Start
- Pause
- Complete
- Adjust
- Reschedule

---

# 23. Timeline

Timeline should connect:

- deadlines
- planned work
- completed work
- personal blocks

Use a strong horizontal temporal composition.

Deadlines and work sessions must be visually distinguishable.

---

# 24. Calendar

Calendar is not the primary product experience.

It is a supporting time-management view.

Views:

- Month
- Week
- Agenda

Show:

- deadlines
- work sessions
- personal blocks
- conflicts

Keep it visually aligned with the rest of Deadline Radar.

---

# 25. Workload

This is a core screen.

Primary visualization:

```text
REQUIRED WORK
18h

AVAILABLE TIME
14h
```

Then show:

- overloaded days
- deadline clusters
- available capacity
- remaining buffer
- pressure periods

Avoid business-analytics styling.

This is personal workload intelligence.

---

# 26. Priorities

Show dynamically changing priority.

States:

- Critical
- High
- Medium
- Low

Every meaningful priority should have a reason.

Example:

> "6h remain and only 4h of suitable time are available before Friday."

Avoid:

> "AI Priority Score: 94"

unless there is a clearly explained and useful model behind it.

---

# 27. Planning

Planning answers:

> **How should I use my available time?**

Example:

```text
09:00–10:30
ML Report — Methodology

11:00–12:00
Database Assignment

16:00–17:00
Personal Project
```

The plan should be:

- editable
- understandable
- realistic
- aware of available time
- aware of deadlines
- aware of personal interests

---

# 28. Insights

Insights should show how Deadline Radar is learning the user.

Useful insights:

- predicted vs actual effort
- estimation accuracy
- work patterns
- workload trends
- planning accuracy
- deadline pressure

Do not overload the user with charts.

The goal is:

> **The system is learning how you work.**

---

# 29. AI UX

AI should be integrated into workflows.

Do not make a chatbot the primary experience.

AI can assist with:

- work understanding
- decomposition
- effort estimation
- missing information
- deadline-risk explanation
- planning
- personalization
- adaptation

Clearly distinguish:

**User-provided data**

**AI-generated interpretation**

**System-calculated values**

**Observed actual data**

AI should never look authoritative merely because it is AI.

---

# 30. Notifications

Notifications should be actionable.

Types:

- deadline approaching
- workload risk
- task overdue
- plan changed
- estimate updated
- scheduling conflict
- reminder

Examples:

> "Your ML report now needs attention today."

> "Thursday has 7h of planned work but only 5h of available capacity."

Avoid generic notification spam.

---

# 31. Profile

Include:

- personal information
- work/study context
- interests
- available time
- planning preferences
- notification preferences

---

# 32. Settings

Sections:

- Account
- Preferences
- Working Hours
- Planning
- Notifications
- Privacy
- Data
- Security

---

# 33. Empty States

Design polished states for:

- no work
- no deadlines
- no plan
- no insights
- no historical data
- no notifications

First-use empty state:

> **Your radar is quiet.**

> Add your first piece of work and let Deadline Radar start understanding your schedule.

CTA:

**Add Work**

---

# 34. Loading States

Create:

- dashboard loading
- AI analysis loading
- work loading
- timeline loading
- workload loading
- insights loading

Use subtle skeletons.

Do not use fake percentages.

---

# 35. Error States

Create:

- AI analysis failed
- work save failed
- file processing failed
- network error
- planning conflict
- unavailable data

Always provide recovery actions.

---

# 36. 404

Minimal editorial page.

Example:

> **This page isn't on your radar.**

CTA:

**Back to Today**

---

# 37. Responsive Design

Desktop:

- editorial
- asymmetric
- spacious
- large typography

Tablet:

- reduce columns
- preserve hierarchy

Mobile:

- single column
- compact navigation
- large readable type
- touch-friendly actions
- simplified radar
- focused Today view

Never simply shrink the desktop layout.

---

# 38. Accessibility

Required:

- semantic HTML
- keyboard navigation
- visible focus
- accessible labels
- sufficient contrast
- no color-only status
- reduced motion
- readable typography
- touch-friendly controls

---

# 39. Motion

Motion should communicate meaningful changes.

Use:

- subtle timeline movement
- progress transitions
- task completion transitions
- plan changes
- deadline state transitions

Avoid:

- bouncing
- excessive parallax
- scroll hijacking
- decorative animation everywhere

---

# 40. Design Tokens

Create tokens for:

- colors
- typography
- spacing
- borders
- radius
- shadows
- motion
- breakpoints

Use the tokens consistently.

---

# 41. Final Quality Test

Before approving the design, ask:

1. Does this look like one coherent product?
2. Does it clearly communicate time + deadlines + workload?
3. Is personalization central?
4. Does the Radar feel distinctive?
5. Does the design feel editorial rather than template-generated?
6. Is the dark palette nuanced?
7. Is typography doing meaningful visual work?
8. Are there too many cards?
9. Are there too many rounded containers?
10. Does it look like generic AI-generated SaaS?
11. Can a user understand what to do today?
12. Can a user understand why something is risky?
13. Can a user understand how the system learns their pace?
14. Does mobile retain the identity?

If the answer to #10 is yes, redesign the relevant screen.
