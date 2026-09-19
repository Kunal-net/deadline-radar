# Deadline Radar --- Design System & Visual Direction

**Version:** 2.0\
**Status:** Foundation for new Stitch project\
**Product:** Deadline Radar\
**Reference direction:** Klarna-style principles of strong composition,
typography, grid, whitespace, and purposeful imagery --- never a visual
copy.

------------------------------------------------------------------------

# 1. Product Identity

Deadline Radar is an AI-powered personal deadline and time-management
system.

It helps a person understand:

-   what they need to do
-   how much work remains
-   how much suitable time they actually have
-   which deadlines are becoming risky
-   what deserves attention next
-   how their actual pace differs from estimates
-   how to plan work around real-life commitments

The product is fundamentally about:

> **Limited time + Work + Deadlines + Personal capacity**

The central product question is:

> **What should I actually spend my time on?**

Deadline Radar is **not**:

-   a generic to-do list
-   a project-management suite
-   a calendar replacement
-   an opportunity aggregator
-   a hackathon finder
-   an internship/application tracker
-   a chatbot with productivity features
-   an analytics dashboard

The visual identity must communicate the human experience of having
limited time, not the technical sophistication of the underlying AI.

------------------------------------------------------------------------

# 2. Core Design Philosophy

## Design the product, not the dashboard

The previous design direction became too dashboard-oriented because it
started with:

-   navigation
-   cards
-   metrics
-   tables
-   status labels
-   repeated components

The new design starts with:

> **Message + Image + Typography + Space + One Primary Action**

UI components are introduced only when they improve comprehension or
action.

The product should feel like a real consumer technology product with a
strong editorial identity.

It should feel:

-   human
-   confident
-   clear
-   modern
-   warm
-   intelligent
-   personal
-   slightly playful
-   editorial
-   energetic without being chaotic

It should not feel:

-   corporate
-   clinical
-   futuristic
-   sci-fi
-   technical
-   over-engineered
-   generic AI
-   generic productivity SaaS
-   "premium SaaS" by cliché

------------------------------------------------------------------------

# 3. Reference Philosophy

The new visual direction takes inspiration from contemporary consumer
brands such as Klarna.

Borrow principles, not visual assets.

Useful principles:

-   strong grid
-   bold composition
-   large typography
-   confident visual hierarchy
-   large image moments
-   edge-to-edge imagery where appropriate
-   flexible layouts
-   controlled asymmetry
-   clear communication
-   photography with a specific concept
-   visual contrast
-   generous whitespace
-   fewer elements with greater impact

Do not copy:

-   Klarna branding
-   Klarna logo
-   Klarna colors
-   Klarna typography
-   Klarna images
-   Klarna layouts
-   Klarna components
-   Klarna exact page structures

Deadline Radar must have its own visual identity.

------------------------------------------------------------------------

# 4. The Primary Visual Principle

## Space is a design element

Empty space is intentional.

Do not fill unused areas merely because they exist.

Whitespace should establish:

-   hierarchy
-   calm
-   separation
-   focus
-   visual rhythm
-   importance

A page should be allowed to contain large areas of empty space.

Preferred structure:

``` text
PRIMARY IDEA


large breathing space


PRIMARY IMAGE / VISUAL


large breathing space


SUPPORTING INFORMATION
```

Avoid:

``` text
TITLE
CARD
CARD
METRIC
CARD
IMAGE
CARD
CARD
TABLE
```

------------------------------------------------------------------------

# 5. Composition

Use a strong underlying grid without making every section look like a
grid of cards.

Layouts should vary between:

-   full-width compositions
-   50/50 splits
-   60/40
-   70/30
-   image-dominant layouts
-   typography-dominant layouts
-   UI-dominant layouts
-   asymmetric compositions
-   edge-aligned images
-   offset elements
-   open lists

The grid is infrastructure, not decoration.

## Controlled asymmetry

The product should not feel perfectly symmetrical.

Use:

-   large image on one side
-   text offset from image
-   different section widths
-   intentional empty space
-   visual weight concentrated in one area
-   images extending beyond conventional card boundaries

Asymmetry must remain usable and intentional.

------------------------------------------------------------------------

# 6. Typography

Typography is one of the primary visual tools.

Use a strong, modern sans-serif as the primary interface typeface.

Recommended weight range:

-   400 --- body
-   500 --- secondary emphasis
-   600 --- headings/buttons
-   700 --- rare strong emphasis

Avoid:

-   excessive serif use
-   decorative italic
-   excessive uppercase
-   excessive letter spacing
-   decorative monospace
-   tiny text used everywhere
-   oversized typography without meaning

## Headline principle

Large text should communicate something useful.

Examples:

> Your week has 23 hours.

> Three deadlines are approaching.

> You have enough time.

> You don't have enough time.

> What should you work on today?

Avoid meaningless "premium" headings.

Use normal page names:

-   Today
-   Radar
-   Work
-   Add Work
-   Timeline
-   Calendar
-   Workload
-   Planning
-   Insights
-   Settings

Avoid artificial terminology:

-   Command Center
-   Temporal Intelligence
-   Natural Intake
-   Horological Telemetry
-   Focus Reserve
-   Cadence Rules
-   Intelligence Layer
-   Predictive Engine

------------------------------------------------------------------------

# 7. Photography & Image Direction

Photography is part of the product identity.

Images are not decorative filler.

Every image must communicate something about the page.

## Canonical uploaded assets

The current Stitch project contains three final visual assets.

They must be used exactly as uploaded.

### Image 1 --- Laptop / Person Working

Meaning:

-   work
-   focus
-   execution
-   getting things done

Primary usage:

-   Today
-   Work
-   Work Detail

### Image 2 --- Desk / Notes / Planning

Meaning:

-   planning
-   organization
-   preparation
-   taking control of a busy week

Primary usage:

-   Add Work
-   Planning
-   Timeline
-   onboarding where appropriate

### Image 3 --- Hourglass

Meaning:

-   time
-   deadlines
-   time passing
-   limited capacity

Primary usage:

-   Radar
-   deadline-focused sections
-   landing/hero where appropriate

## Image rules

Use the exact uploaded images.

Do not:

-   generate new photographs
-   replace them
-   create similar images
-   use stock images
-   use Unsplash
-   use Pexels
-   reinterpret the photographs
-   create AI-generated variants
-   convert them into illustrations

Normal cropping is allowed when necessary.

Preserve the important subject.

Do not over-process the photography.

------------------------------------------------------------------------

# 8. Images as Composition, Not Components

Never automatically place an image into a small rounded card.

Avoid:

``` text
┌───────────────┐
│               │
│     IMAGE     │
│               │
└───────────────┘
```

when the image could become a major compositional element.

Prefer structures such as:

``` text
TITLE                         IMAGE
                              IMAGE
                              IMAGE

Supporting content
```

or:

``` text
              IMAGE
              IMAGE

TITLE
Description
Primary action
```

or:

``` text
CONTENT

                         IMAGE
                         IMAGE
```

Images may be:

-   large
-   edge-aligned
-   asymmetric
-   full-width
-   partially cropped
-   visually dominant
-   offset
-   adjacent to typography
-   separated from content by substantial whitespace

The image should help communicate why the page exists.

------------------------------------------------------------------------

# 9. Page-Specific Visual Language

All screens belong to one product, but they must not be clones.

## Today

**Question:** What should I actually do today?

Theme:

> A personal daily brief.

Visual direction:

-   laptop/person photograph
-   large available-time statement
-   small number of important work items
-   strong typography
-   generous whitespace
-   actionable hierarchy

Avoid:

-   metric-card dashboard
-   excessive statistics
-   dense schedules above the fold

------------------------------------------------------------------------

## Radar

**Question:** What is approaching, and will I have enough time?

Theme:

> Time is moving.

Visual direction:

-   hourglass photograph as a major visual anchor
-   approaching deadlines
-   remaining effort
-   available time
-   understandable risk
-   editorial temporal composition

Do not create a literal sci-fi radar.

Avoid:

-   glowing circles
-   futuristic radar graphics
-   holograms
-   telemetry
-   cyber interfaces
-   technical monitoring language

The page should communicate:

> **I can see what is coming.**

------------------------------------------------------------------------

## Work

**Question:** What am I currently working on?

Theme:

> Active workload.

Visual direction:

-   open list
-   strong typography
-   deadlines
-   remaining effort
-   laptop/person image where appropriate

Prefer:

``` text
Active work

ML Assignment
Due Friday
~3h remaining

FastAPI Project
Due Sunday
~6h remaining

Research Report
Due Tuesday
~4h remaining
```

Avoid a wall of cards.

------------------------------------------------------------------------

## Add Work

**Question:** What are you working on?

Theme:

> Start by telling the system what is happening.

Visual direction:

-   large natural-language input
-   minimal controls
-   planning/desk photograph
-   generous whitespace

The intended flow:

> Input → Understand → Confirm

Not:

> Form → Form → Form → Form

The first interaction should feel simple.

------------------------------------------------------------------------

## Work Detail

Theme:

> Understand one piece of work deeply.

Show:

-   work description
-   deadline
-   remaining effort
-   predicted effort
-   actual effort
-   dependencies
-   plan
-   progress
-   AI interpretation

But make the page feel like an editorial document, not an analytics
dashboard.

------------------------------------------------------------------------

## Timeline

Theme:

> Work moving through time.

Use a temporal flow.

Avoid turning every timeline item into a card.

------------------------------------------------------------------------

## Calendar

Theme:

> Where does my time go?

Use a clear spatial calendar.

Avoid tiny labels everywhere.

------------------------------------------------------------------------

## Workload

Theme:

> How much can I actually handle?

Show:

-   available time
-   required effort
-   overloaded periods
-   free periods

The user should understand the capacity situation immediately.

------------------------------------------------------------------------

## Priorities

Theme:

> What deserves my attention?

Prioritization should be explained in human language.

Example:

> Finish this first because it is due tomorrow and still needs 3 hours.

Avoid arbitrary-looking ranking systems unless they provide real value.

------------------------------------------------------------------------

## Planning

Theme:

> How should I use the week I have?

Use the desk/planning photograph where appropriate.

Planning must include real-life capacity and protected personal time.

The user is not available 24/7.

------------------------------------------------------------------------

## Insights

Theme:

> What have I learned about how I work?

Examples:

> You usually underestimate backend tasks by about 30 minutes.

> You tend to finish assignments earlier when you start two days before
> the deadline.

Insights should feel personal and useful.

Avoid turning Insights into a generic analytics dashboard.

------------------------------------------------------------------------

# 10. Navigation

Keep navigation simple.

Primary navigation:

-   Today
-   Radar
-   Work
-   Planning
-   Insights

Secondary:

-   Calendar
-   Timeline
-   Workload
-   Settings

Do not overcrowd navigation.

Navigation should support the product rather than become a major visual
feature.

------------------------------------------------------------------------

# 11. AI UX

AI should feel embedded in the product.

Do not create a chatbot-first interface.

Avoid:

-   giant "Ask AI" panels
-   floating robot buttons
-   AI sparkle icons everywhere
-   separate AI dashboards

Instead, AI should appear naturally.

Examples:

> This looks like about 3 hours of work.

> You usually take longer on similar tasks.

> You have 5 hours available before Friday.

> You may want to start this today.

The product should feel intelligent because it makes useful
interpretations.

Not because it repeatedly announces that AI is present.

------------------------------------------------------------------------

# 12. Information Hierarchy

Every page should have:

1.  One primary idea
2.  One primary visual focus
3.  Supporting information
4.  One obvious next action

Not every piece of data deserves equal visual weight.

Ask:

> What does the user need to understand first?

Then:

> What helps them act on it?

Everything else becomes secondary.

------------------------------------------------------------------------

# 13. Card Usage

Cards are allowed but should be used intentionally.

Do not put every piece of information into a rectangle.

Use:

-   whitespace
-   typography
-   alignment
-   indentation
-   scale
-   subtle dividers

to establish hierarchy.

Before creating a card, ask:

> Can typography and whitespace communicate this more naturally?

If yes, do not use the card.

------------------------------------------------------------------------

# 14. Borders and Dividers

Use fewer borders.

Do not add a divider simply because two sections exist.

Use borders only when they materially improve:

-   grouping
-   scanability
-   interaction
-   structure

Whitespace should do most of the separating.

------------------------------------------------------------------------

# 15. Color

The project's current color system is intentionally established
separately.

Do not replace it during layout refinement.

Do not introduce:

-   purple AI gradients
-   blue AI gradients
-   neon
-   glowing effects
-   unnecessary accent colors

Visual impact should primarily come from:

> Typography + Photography + Composition + Space

The current palette should remain the source of color identity.

------------------------------------------------------------------------

# 16. Anti-AI-Slop Rules

Absolutely avoid:

-   repeated card grids
-   identical page templates
-   excessive rounded cards
-   excessive borders
-   excessive pills
-   excessive icons
-   decorative AI symbols
-   sparkle icons
-   gradients
-   glassmorphism
-   neon
-   holograms
-   glowing UI
-   generic dashboard charts
-   fake telemetry
-   meaningless metrics
-   excessive metadata
-   tiny labels everywhere
-   generic stock photography
-   futuristic productivity imagery
-   excessive shadows
-   "premium SaaS" clichés

Do not try to make the design look sophisticated by adding more design
elements.

Sophistication should come from restraint.

------------------------------------------------------------------------

# 17. Realistic Content

Use believable individual/student work.

Examples:

-   Finish ML assignment
-   FastAPI project
-   Review lecture notes
-   Prepare tomorrow's test
-   Submit project report
-   Gym
-   Personal project
-   Research task

Avoid fictional enterprise data.

The product should feel like it belongs to a real person.

------------------------------------------------------------------------

# 18. Design Through Subtraction

Before adding anything ask:

> Does this help the user?

If no:

**Remove it.**

Before adding a card:

> Can whitespace and typography communicate this instead?

If yes:

**Do not add the card.**

Before adding an image:

> Does the image reinforce the meaning of the page?

If no:

**Do not add it.**

Before adding a label:

> Does the user need this information?

If no:

**Remove it.**

------------------------------------------------------------------------

# 19. Responsive Design

The visual identity must survive different screen sizes.

## Desktop

Use the grid fully.

Allow:

-   large imagery
-   wide compositions
-   asymmetric layouts
-   generous whitespace

## Tablet

Reduce:

-   column count
-   image width
-   navigation complexity

Maintain hierarchy.

## Mobile

Do not simply stack the desktop design.

Recompose it.

Preserve:

-   primary message
-   primary image
-   primary action

Remove secondary visual complexity.

------------------------------------------------------------------------

# 20. Accessibility

Maintain:

-   readable text sizes
-   strong contrast
-   visible focus states
-   keyboard navigation
-   meaningful image alt text
-   logical heading hierarchy
-   non-color-only status communication
-   touch targets appropriate for mobile

Visual personality must never reduce usability.

------------------------------------------------------------------------

# 21. Motion

Motion should be subtle.

Useful motion:

-   page transitions
-   image reveal
-   list insertion
-   progress updates
-   timeline movement
-   small interaction feedback

Avoid:

-   excessive parallax
-   constant floating animations
-   glowing effects
-   unnecessary animated gradients
-   distracting loops

Motion should communicate change, not advertise technology.

------------------------------------------------------------------------

# 22. Initial Stitch Generation Strategy

Do not generate the entire product at once.

Start with five screens:

1.  Landing / Product Introduction
2.  Today
3.  Radar
4.  Work
5.  Add Work

These five screens establish the visual language.

Only after the visual direction is accepted should the remaining screens
be designed:

6.  Work Detail
7.  Timeline
8.  Calendar
9.  Workload
10. Priorities
11. Planning
12. Insights
13. Settings

The first five screens must establish:

-   typography
-   spacing
-   image treatment
-   grid
-   composition
-   visual personality
-   navigation
-   interaction language

------------------------------------------------------------------------

# 23. Quality Checklist

Before approving a screen:

### Composition

-   Is there one clear primary idea?
-   Is there enough whitespace?
-   Is the composition asymmetric where useful?
-   Does the page avoid repetitive card grids?
-   Does the page feel intentionally composed?

### Imagery

-   Does the image have a reason to exist?
-   Is it large enough to contribute?
-   Is the exact supplied image being used?
-   Does it reinforce the page's theme?
-   Is it integrated into the composition rather than placed in a
    generic card?

### Typography

-   Is the hierarchy obvious?
-   Is large text meaningful?
-   Is the interface readable?
-   Is typography doing enough of the hierarchy work?

### UI

-   Are there unnecessary cards?
-   Are there unnecessary borders?
-   Are there unnecessary labels?
-   Are there unnecessary metrics?
-   Could something be removed?

### Product

-   Does the page answer a real user question?
-   Is the next action obvious?
-   Does the page feel personal?
-   Does the page feel like Deadline Radar rather than a generic
    productivity app?

------------------------------------------------------------------------

# 24. North Star

Deadline Radar should feel like:

> **A thoughtful personal planner + an editorial magazine + a modern
> consumer technology product.**

Its visual identity should communicate:

> **YOUR TIME IS LIMITED.\
> DEADLINES ARE MOVING.\
> DEADLINE RADAR HELPS YOU DECIDE WHAT DESERVES YOUR TIME.**

The final product should be distinctive without being complicated.

It should feel designed, not decorated.

It should feel intelligent without constantly showing AI.

It should feel premium through restraint, not ornament.

And most importantly:

> **Do not design another productivity dashboard. Design Deadline
> Radar.**
