# Deadline Radar — Frontend Agent Prompt Pack

## Purpose

This document is the operating instruction set for AI coding agents implementing the **Deadline Radar frontend**.

The frontend MUST be implemented from the finalized Stitch design retrieved through the connected Stitch MCP. The agent must preserve the product direction, design system, interaction model, and information hierarchy instead of inventing a new UI.

This document is intended to be placed in the repository working directory and referenced by the coding agent throughout implementation.

---

# 0. NON-NEGOTIABLE AGENT RULES

Before writing or modifying frontend code, the agent MUST follow all of these rules.

### Rule 1 — Use the downloaded skills

**STRICT REQUIREMENT: The agent MUST use the downloaded Antigravity/Gemini skills available in the project's configured skills directory whenever a relevant skill exists.**

Do not ignore the installed skills and independently implement the task from scratch.

Before each major frontend phase:

1. Inspect the available downloaded skills.
2. Identify which skills are relevant to the current task.
3. Read the relevant skill instructions.
4. Apply those skills during implementation.
5. If multiple relevant skills exist, use them together where appropriate.
6. Do not install a replacement skill merely because you prefer another workflow.
7. Do not claim a skill was used unless the agent actually inspected and applied it.

Relevant examples may include skills for:
- frontend development
- UI/UX
- design systems
- responsive design
- accessibility
- React/TypeScript
- visual validation
- browser testing
- code quality
- debugging
- component architecture

The exact installed skills are the source of truth. **Discover the actual available skills instead of assuming their names.**

### Rule 2 — Stitch is the visual source of truth

The finalized Stitch project is:

`https://stitch.withgoogle.com/projects/17354903279475530867`

The agent MUST use the connected Stitch MCP.

Do not recreate the design from memory or screenshots when Stitch HTML/CSS/export data is available.

Use:
- Stitch screen exports
- Stitch HTML
- Stitch CSS
- Stitch design tokens
- Stitch typography
- Stitch assets
- Stitch navigation information
- Stitch interaction information

The Stitch MCP export has priority over an agent's visual assumptions.

### Rule 3 — Do not redesign

The agent is implementing Deadline Radar, not redesigning it.

Do NOT:
- invent a different visual language
- introduce generic SaaS dashboards
- replace the editorial layout with conventional cards
- add gradients without design justification
- add excessive rounded corners
- add glassmorphism
- add unnecessary shadows
- add neon effects
- add decorative AI imagery
- replace the supplied photography
- create fake “AI futuristic” UI
- introduce random colors
- create additional navigation because it seems useful

If something appears ambiguous, inspect the Stitch source and project documentation before making a decision.

### Rule 4 — Do not generate replacement assets

Use the actual Stitch assets whenever available.

Do not:
- generate substitute images
- use stock images
- use random Unsplash/Pexels images
- replace the uploaded photography
- create fake illustrations when the design already contains an asset

### Rule 5 — Do not fabricate product behavior

The frontend must reflect actual Deadline Radar functionality.

Do not invent:
- fake analytics
- fake AI scores
- fake deadlines
- fake productivity statistics
- fake user history
- fake recommendations presented as real
- fake backend responses

During development, clearly separate mock/demo data from real API data.

---

# 1. FIRST PROMPT — PROJECT INITIALIZATION

Paste this prompt first.

```text
You are the lead frontend implementation agent for Deadline Radar.

Before touching application code, perform a complete frontend initialization audit.

STRICT REQUIREMENT:
You MUST inspect and use the downloaded Antigravity/Gemini skills available in the project environment. Find the relevant installed skills for frontend engineering, UI implementation, design systems, responsive design, accessibility, browser/visual testing, React/TypeScript, and code quality. Read the relevant skill instructions and apply them. Do not skip this step.

Then inspect:

1. The existing repository.
2. The frontend directory.
3. Existing docs.
4. docs/frontend-spec.md
5. docs/api-contract.md
6. docs/architecture.md
7. docs/database-schema.md
8. deadline_radar_design.md if present.
9. The connected Stitch MCP.
10. Stitch project:
   https://stitch.withgoogle.com/projects/17354903279475530867

Use Stitch MCP to retrieve:
- project metadata
- design system
- design tokens
- all screens
- HTML exports
- CSS/design information
- assets
- navigation/routes
- available interaction behavior

Do not implement yet.

Create or update a frontend implementation plan documenting:

- frontend stack
- folder structure
- routing architecture
- shared components
- design-token strategy
- asset strategy
- screen mapping
- API integration strategy
- state management strategy
- responsive strategy
- accessibility strategy
- testing strategy
- Stitch-to-React conversion strategy
- which downloaded skills will be used and for what
- known conflicts between Stitch and existing project documentation

Do not make destructive changes.

Do not start building screens.

Stop after the implementation plan is complete.
```

---

# 2. SECOND PROMPT — FRONTEND FOUNDATION

Use this only after approving the initialization plan.

```text
Implement the Deadline Radar frontend foundation.

STRICT SKILL REQUIREMENT:
Before implementation, inspect the downloaded skills again and use every relevant installed skill for frontend architecture, React/TypeScript, UI systems, responsive implementation, accessibility, and code quality.

STRICT STITCH REQUIREMENT:
Use the connected Stitch MCP project as the visual source of truth:
https://stitch.withgoogle.com/projects/17354903279475530867

Implement the foundation before implementing individual pages.

Set up:

- React
- TypeScript
- Vite if confirmed by the approved architecture
- routing
- Tailwind/design-token system if confirmed by Stitch
- typography
- global styles
- asset handling
- API client structure
- query/state management
- error boundary
- loading primitives
- reusable layout primitives
- responsive breakpoints
- accessibility foundations

Import the actual Stitch design tokens.

Preserve the Stitch visual system.

Do not create page-specific UI yet unless necessary to validate the shell.

Create:

- AppShell
- Header/navigation
- primary navigation
- secondary navigation where required
- Add Work action
- typography primitives
- buttons
- inputs
- status indicators
- list-row primitives
- metric primitives
- image/media primitives
- loading states
- empty states
- error states

Do not introduce unnecessary component abstractions.

Do not use generic dashboard templates.

After implementation:
1. run the application
2. run type checking
3. run linting
4. run relevant tests
5. visually inspect the result
6. fix issues

Report exactly what was implemented and what remains.
```

---

# 3. THIRD PROMPT — STITCH SCREEN EXTRACTION

```text
Now convert the finalized Stitch screens into React views.

STRICT REQUIREMENT:
Use the downloaded frontend/design/visual implementation skills available in the environment. Inspect and apply the relevant skills before proceeding.

STRICT STITCH REQUIREMENT:
Retrieve the actual HTML/CSS/export information through Stitch MCP.

Do NOT manually approximate screens from screenshots.

Create the following routes:

/
 /onboarding
 /today
 /radar
 /work
 /work/:id
 /work/new
 /planning
 /timeline
 /calendar
 /workload
 /priorities
 /insights
 /settings

Map them to the corresponding Stitch screens.

For each screen:

1. retrieve the Stitch source
2. identify structure
3. identify reusable patterns
4. convert semantic HTML into React
5. preserve typography
6. preserve spacing
7. preserve image placement
8. preserve borders
9. preserve responsive behavior
10. preserve hierarchy
11. preserve navigation
12. preserve interactions where appropriate

Do not copy Stitch code blindly if it conflicts with React architecture.

Convert it cleanly into maintainable React components while preserving visual fidelity.

Do not redesign anything.

Do not add invented sections.

Do not shorten the design merely because it is easier to code.

After each screen, visually compare the React result with the Stitch source and correct discrepancies.
```

---

# 4. SHARED DESIGN SYSTEM PROMPT

```text
Audit the implemented Deadline Radar frontend against the Stitch design system.

STRICT REQUIREMENT:
Use the downloaded design-system/UI/frontend skills relevant to this task.

Use Stitch MCP to retrieve the authoritative design tokens.

Verify:

- colors
- typography
- font weights
- font sizes
- line heights
- letter spacing
- spacing scale
- borders
- border opacity
- corner radius
- buttons
- inputs
- navigation
- list rows
- metric blocks
- image treatment
- responsive behavior

The current Stitch system uses:

- Epilogue for display/headline typography
- Manrope for body/labels
- Material Symbols Outlined
- deep soot ink
- warm linen canvas
- warm neutral surfaces
- restrained terracotta urgency accent
- sharp 0px corners
- hairline structural borders

Do not arbitrarily change these values.

Create a centralized token system so screens do not independently redefine the visual language.

Remove duplicated or conflicting styling.

Do not introduce:
- gradients
- excessive shadows
- rounded SaaS cards
- neon colors
- glassmorphism
- decorative effects

unless they are explicitly present in the Stitch source.
```

---

# 5. TODAY SCREEN PROMPT

```text
Implement and polish the Today screen.

STRICTLY use relevant downloaded skills.

Use Stitch MCP and the exact Stitch Today screen as the source of truth.

The Today screen must answer:

"What should I actually do today?"

Preserve the Stitch composition.

The screen should communicate:

- available focus time
- today's workload
- current/next action
- deadlines
- priority
- planned work
- personal/available time
- meaningful capacity information

Avoid turning it into a generic productivity dashboard.

Do not add editorial essays or invented productivity philosophy.

Use real product information and concise human language.

Use the supplied imagery exactly as specified by Stitch.

After implementation, perform visual validation against the Stitch screen and fix mismatches.
```

---

# 6. RADAR SCREEN PROMPT

```text
Implement the Radar screen.

STRICTLY use relevant downloaded skills.

Use Stitch MCP as the source of truth.

Radar is NOT a literal sci-fi radar visualization.

It is Deadline Radar's time/deadline/capacity intelligence view.

Communicate:

- approaching deadlines
- remaining effort
- remaining suitable time
- capacity pressure
- risk
- conflicts
- workload concentration

Use deterministic backend/system calculations for numerical risk.

The frontend must display calculated values and AI explanations separately.

Do not allow an LLM-generated number to silently become an authoritative risk score.

Preserve the hourglass/temporal visual language from Stitch.

Do not add:
- radar charts unless Stitch contains them
- glowing rings
- futuristic dashboards
- excessive color coding
- fake risk percentages

Validate visually against Stitch after implementation.
```

---

# 7. WORK SCREEN PROMPT

```text
Implement the Work workspace.

STRICTLY use relevant downloaded skills.

Use the Stitch Work screen through MCP.

The Work screen should feel like a serious workspace containing things that require the user's energy.

Prioritize:

- work title
- type
- deadline
- remaining effort
- status
- priority
- risk
- next action

Use open editorial list structures where Stitch specifies them.

Avoid turning every work item into a rounded card.

Implement:
- search
- filtering
- sorting
- status handling
- work selection
- work detail navigation
- Add Work action

Do not invent filter categories that are unsupported by the product model.

Use backend data once API integration exists.
```

---

# 8. ADD WORK PROMPT

```text
Implement Add Work.

STRICTLY use relevant downloaded skills.

Use Stitch MCP.

Add Work is one of the most important product interactions.

The experience should allow the user to describe work naturally.

Example:

"Finish the ML assignment by Friday. I think it will take around 4 hours."

The interface should support:

1. natural-language input
2. AI interpretation
3. extracted title
4. deadline
5. estimated effort
6. work type
7. decomposition
8. missing-information detection
9. user confirmation
10. save

Clearly distinguish:

USER INPUT
AI INTERPRETATION
SYSTEM-CALCULATED DATA
OBSERVED DATA

Never silently save an AI assumption as user-confirmed truth.

Use explicit confirmation where required.

Do not make Add Work look like a generic CRM form.
```

---

# 9. WORK DETAIL PROMPT

```text
Implement Work Detail.

STRICTLY use relevant downloaded skills.

Use Stitch MCP.

The page must expose the complete state of a work item.

Include only information supported by the product model and Stitch design.

Support:

- title
- description
- deadline
- estimated effort
- remaining effort
- status
- priority
- dependencies
- schedule
- AI interpretation
- risk explanation
- actual time
- predicted vs actual
- edit
- reschedule
- complete
- archive/delete where supported

Separate system calculations from AI-generated explanations.

Do not fabricate statistics.
```

---

# 10. PLANNING PROMPT

```text
Implement Planning.

STRICTLY use relevant downloaded skills.

Use Stitch MCP.

Planning must transform workload into a realistic schedule.

It must account for:

- available time
- commitments
- personal interests
- deadlines
- remaining work
- estimated effort
- dependencies
- user pace
- capacity

The UI should show why a plan exists where useful.

Do not imply that the plan is perfect.

The user must remain able to adjust the plan.

Do not create a generic calendar clone.

Preserve Stitch's composition and hierarchy.
```

---

# 11. TIMELINE / CALENDAR / WORKLOAD / PRIORITIES PROMPT

```text
Implement the Timeline, Calendar, Workload, and Priorities views.

STRICTLY use relevant downloaded skills.

Use Stitch MCP for each corresponding screen.

Timeline:
- show work against time
- preserve capacity-aware planning
- do not create a generic Gantt system unless Stitch specifies it

Calendar:
- represent commitments and planned focus
- make available capacity understandable

Workload:
- communicate capacity pressure
- distinguish available capacity from assigned work

Priorities:
- display dynamically calculated priorities
- show the factors behind priority where appropriate
- do not invent ranking logic in the frontend

All deterministic calculations must originate from backend/system logic.

Frontend is responsible for presentation and interaction, not inventing business logic.
```

---

# 12. INSIGHTS PROMPT

```text
Implement Insights.

STRICTLY use relevant downloaded skills.

Use Stitch MCP.

Insights should help Deadline Radar learn from observed behavior.

Relevant concepts include:

- predicted effort
- actual effort
- estimation variance
- personal pace
- historical patterns
- completed work
- schedule adherence

Do not create fake analytics.

If there is insufficient historical data, display an appropriate empty/early-data state rather than inventing insights.

Clearly distinguish observed facts from AI interpretation.

Do not turn the page into a generic analytics dashboard.
```

---

# 13. ONBOARDING PROMPT

```text
Implement onboarding.

STRICTLY use relevant downloaded skills.

Use Stitch MCP.

Onboarding should collect only information necessary for Deadline Radar to personalize planning.

Potential information includes:

- normal availability
- recurring commitments
- preferred working periods
- important personal activities
- planning preferences
- estimation confidence where applicable

Do not ask unnecessary questions.

Do not make onboarding a long marketing presentation.

Every collected value should have a clear purpose in the product.
```

---

# 14. RESPONSIVE DESIGN PROMPT

```text
Perform a responsive implementation pass.

STRICT REQUIREMENT:
Use the downloaded responsive-design and frontend skills relevant to this task.

Use Stitch's responsive intent as the source of truth.

Test:

- desktop
- laptop
- tablet
- mobile

Do not simply shrink the desktop UI.

For smaller screens:
- restructure grids
- preserve hierarchy
- preserve readable typography
- preserve important actions
- collapse secondary navigation appropriately
- maintain image composition
- prevent horizontal overflow

Do not create a separate visual design language for mobile.

Run actual browser validation.
```

---

# 15. ACCESSIBILITY PROMPT

```text
Perform a full accessibility pass.

STRICT REQUIREMENT:
Use the installed accessibility/frontend testing skills.

Check:

- semantic HTML
- keyboard navigation
- focus states
- labels
- form errors
- contrast
- heading hierarchy
- buttons
- links
- interactive list rows
- dialogs
- navigation
- screen-reader semantics
- reduced-motion behavior

Do not sacrifice the Stitch design.

Fix accessibility problems without redesigning the visual system.
```

---

# 16. BACKEND INTEGRATION PROMPT

```text
Connect the frontend to the existing Deadline Radar FastAPI backend.

STRICTLY use relevant downloaded skills for API integration, React state/query management, testing, and code quality.

Before coding:

1. inspect docs/api-contract.md
2. inspect backend routes
3. inspect schemas
4. inspect authentication requirements
5. inspect existing API behavior

Do not invent endpoints.

Do not change the backend contract simply to make frontend development easier.

Use appropriate query/mutation management.

Handle:

- loading
- success
- errors
- empty data
- retries where appropriate
- optimistic updates only when safe
- stale data
- API validation errors

Do not replace backend calculations with frontend guesses.
```

---

# 17. AI UX INTEGRATION PROMPT

```text
Implement the frontend UX for Deadline Radar's AI features.

STRICTLY use relevant downloaded AI/frontend/UI skills.

AI functionality may include:

- work interpretation
- decomposition
- effort estimation
- missing information detection
- risk explanation
- planning recommendations
- personalization
- learning from actual effort

The frontend must clearly distinguish:

AI-generated interpretation
SYSTEM-CALCULATED RESULT
USER-CONFIRMED VALUE
OBSERVED ACTUAL DATA

Do not make AI appear more certain than it is.

Use confidence/uncertainty where supported.

Do not use fake AI loading animations or decorative "AI magic" effects.

AI should feel like an intelligent part of the product, not a chatbot bolted onto the interface.
```

---

# 18. VISUAL QA PROMPT

```text
Perform a full visual QA pass.

STRICT REQUIREMENT:
Use all relevant downloaded visual QA, browser testing, frontend, and design skills.

Use Stitch MCP as the comparison source.

For every screen:

1. open the Stitch source
2. open the implemented React route
3. compare layout
4. compare typography
5. compare spacing
6. compare imagery
7. compare borders
8. compare colors
9. compare hierarchy
10. compare responsive behavior
11. compare navigation
12. compare interaction states

Fix visual discrepancies.

Do not "improve" the design by inventing a new style.

The goal is implementation fidelity, not subjective redesign.

Pay special attention to:
- excessive cards
- incorrect border radius
- incorrect typography
- incorrect spacing
- wrong image crops
- inconsistent navigation
- unnecessary shadows
- accidental gradients
- duplicated components
- inconsistent buttons
- inconsistent spacing
```

---

# 19. AI-SLOP PREVENTION PROMPT

Run this before considering the frontend complete.

```text
Perform an anti-AI-slop audit of the entire Deadline Radar frontend.

STRICT REQUIREMENT:
Use the downloaded UI/design-quality skills relevant to this audit.

Look for:

- generic SaaS dashboard patterns
- excessive cards
- excessive rounded corners
- repetitive layouts
- meaningless metrics
- fake statistics
- invented editorial copy
- unnecessary section headings
- unnecessary gradients
- excessive shadows
- decorative AI effects
- excessive badges
- excessive icons
- meaningless labels
- fake testimonials
- fake marketing copy
- stock imagery
- inconsistent typography
- inconsistent spacing
- over-designed empty space
- excessive dashboard chrome
- duplicated UI patterns where a simpler structure exists

Compare against the actual Stitch design.

Remove anything that does not contribute to the product.

Do not add more visual decoration to solve a structural problem.

Deadline Radar should feel like a real product designed for repeated daily use, not an AI-generated concept page.
```

---

# 20. FINAL PRODUCTION AUDIT

```text
You are now performing the final production-readiness audit for Deadline Radar.

STRICT REQUIREMENT:
Use all relevant downloaded skills available in the project for:
- frontend engineering
- React/TypeScript
- UI/UX
- accessibility
- responsive design
- testing
- performance
- code quality
- browser validation

Verify:

## Design
- Stitch fidelity
- design tokens
- typography
- spacing
- imagery
- navigation
- responsive behavior

## Architecture
- clean React structure
- reusable components
- no unnecessary duplication
- no giant monolithic components
- clear separation of concerns

## Data
- no fabricated production data
- correct API usage
- correct loading states
- correct empty states
- correct errors

## AI
- AI output clearly separated from deterministic calculations
- uncertainty handled correctly
- no fake AI behavior

## UX
- keyboard accessibility
- error handling
- loading states
- empty states
- confirmation flows
- navigation consistency

## Performance
- unnecessary rerenders
- asset loading
- bundle issues
- image optimization
- network requests

## Security
- no secrets in frontend
- no hardcoded credentials
- safe API handling
- safe user-generated content rendering

## Code quality
- type safety
- lint
- tests
- maintainability
- readable naming

Run the complete available validation suite.

Fix issues rather than merely reporting them.

At the end, provide:

1. completed screens
2. completed components
3. API integrations
4. AI integrations
5. tests run
6. visual QA performed
7. remaining known issues
8. technical debt
9. recommended next steps

Do not declare the project production-ready if critical issues remain.
```

---

# 21. AGENT OPERATING PRINCIPLES

These rules apply during every prompt above.

### Source priority

When sources disagree, use this order:

1. Current repository code and actual backend behavior
2. Finalized Stitch MCP output for visual implementation
3. Approved project documentation
4. Installed skill instructions
5. Agent assumptions

If a conflict exists, stop and report it instead of silently inventing a solution.

### Never silently change architecture

If implementation reveals that the approved architecture is insufficient:

1. document the problem
2. explain the impact
3. propose the smallest change
4. wait for approval for major architectural changes

### Never rewrite working code unnecessarily

Prefer incremental implementation.

Do not replace working components simply because another implementation is stylistically preferred.

### Never hide errors

Errors must be surfaced clearly during development.

Do not swallow exceptions merely to make the UI appear functional.

### Never use fake data as real data

If mock data is necessary:
- put it in an explicit mock/data layer
- label it clearly
- make it easy to replace with API data

### Never make business logic UI-specific

Deadline calculations, priority calculations, capacity calculations, effort learning, and risk calculations belong in the appropriate backend/domain layer.

The frontend displays and interacts with those results.

---

# 22. DEFINITION OF DONE

Frontend implementation is complete only when:

- All required Stitch screens are implemented.
- Routes work.
- Navigation works.
- Stitch design system is implemented.
- Actual Stitch assets are used.
- Responsive behavior works.
- Accessibility has been checked.
- Backend API integration works.
- Loading/empty/error states exist.
- AI UX is implemented where required.
- No fabricated production data remains.
- No generic AI-slop UI remains.
- Type checking passes.
- Linting passes.
- Tests pass.
- Browser validation passes.
- Visual QA has been performed against Stitch.
- Relevant downloaded skills were actually inspected and applied.

The final implementation must feel like **Deadline Radar**, not like a generic React dashboard.

---

# 23. IMPORTANT EXECUTION RULE

Do not execute all prompts blindly in one giant generation.

Use them sequentially.

Recommended order:

1. Project Initialization
2. Frontend Foundation
3. Stitch Screen Extraction
4. Shared Design System
5. Today
6. Work
7. Add Work
8. Work Detail
9. Radar
10. Planning
11. Timeline / Calendar / Workload / Priorities
12. Insights
13. Onboarding
14. Responsive Design
15. Accessibility
16. Backend Integration
17. AI UX Integration
18. Visual QA
19. Anti-AI-Slop Audit
20. Final Production Audit

After each major phase:
- run the app
- inspect the result
- validate
- commit working changes
- only then continue

Never allow the agent to implement the entire frontend in one uncontrolled pass.
