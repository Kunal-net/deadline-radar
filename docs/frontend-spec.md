# Frontend Specification — Deadline Radar

## Design Philosophy & Anti-Patterns
Deadline Radar is an operational, high-signal productivity tool for students and young professionals. Every screen must prioritize **clarity, urgency awareness, and low cognitive friction**.

### What This Frontend IS:
- Clean, deliberate, structured information hierarchy.
- Purposeful use of color to communicate urgency (e.g. red for <24h, amber for <3d, subtle slate for future dates).
- Highly readable typography optimized for scanning dates, requirements, and statuses.
- Fast, accessible, and responsive.

### What This Frontend MUST AVOID (AI-Generated Cliché Anti-Patterns):
- ❌ No excessive glowing gradients or neon purple backgrounds.
- ❌ No gratuitous glassmorphism or blurred backdrop cards that hurt contrast.
- ❌ No random cards floating without structural grid alignment.
- ❌ No excessive pill/border-radius on everything (`rounded-3xl` everywhere).
- ❌ No frivolous bouncy animations that delay interactions.
- ❌ No generic, empty dashboard widgets that take up screen space without delivering value.

---

## Recommended Frontend Tech Stack

```text
TODO — NEEDS DECISION: FRONTEND FRAMEWORK SELECTION
```

### Primary Recommendation: **React + Vite + TypeScript**
- **Why**: Extremely fast build times, lightweight bundle, zero server-side rendering complexity for a personal productivity tool, massive ecosystem, and full control over state and routing.
- **Routing**: TanStack Router or React Router v6.
- **Server State & Data Fetching**: TanStack Query (React Query) for caching, background revalidation, and optimistic updates.
- **Styling**: Tailwind CSS with strict design tokens OR Vanilla CSS Modules.
- **Icons**: Lucide React (clean, consistent line iconography).

*(Alternative considered: Next.js App Router — suitable if public SEO-driven catalog pages are prioritized later; Vite is currently lighter and faster for development).*

---

## Design System & Tokens

### Color Palette
A refined, high-contrast, professional palette with deliberate semantic urgency tokens:

```css
:root {
  /* Neutral Foundation */
  --bg-primary: #0F172A;       /* Slate 900: Deep, focused canvas */
  --bg-surface: #1E293B;       /* Slate 800: Card / container surface */
  --bg-surface-elevated: #334155; /* Slate 700: Hover / active item */
  --border-subtle: #334155;    /* Slate 700: Hairline borders */
  --border-focus: #38BDF8;     /* Sky 400: Focus ring */

  /* Typography Colors */
  --text-primary: #F8FAFC;     /* Slate 50: High-contrast headings & titles */
  --text-secondary: #94A3B8;   /* Slate 400: Metadata, labels, captions */
  --text-muted: #64748B;       /* Slate 500: Timestamps, hints */

  /* Brand & Interactive */
  --primary: #2563EB;          /* Royal Blue 600: Primary actions */
  --primary-hover: #1D4ED8;    /* Royal Blue 700 */
  --accent: #0284C7;           /* Sky 600 */

  /* Semantic Urgency Tiers */
  --urgency-critical: #EF4444; /* Red 500: Due in <24 hours / Overdue */
  --urgency-critical-bg: rgba(239, 68, 68, 0.12);
  --urgency-warning: #F59E0B;  /* Amber 500: Due in <3 days */
  --urgency-warning-bg: rgba(245, 158, 11, 0.12);
  --urgency-moderate: #10B981; /* Emerald 500: Due in <7 days */
  --urgency-moderate-bg: rgba(16, 185, 129, 0.12);
  --urgency-future: #64748B;   /* Slate 500: >7 days away */
  --urgency-future-bg: rgba(100, 116, 139, 0.12);

  /* Status Colors */
  --status-saved: #94A3B8;
  --status-applied: #38BDF8;
  --status-interviewing: #A855F7;
  --status-offered: #22C55E;
  --status-rejected: #64748B;
  --status-completed: #10B981;
}
```

### Typography
- **Font Family**: Inter, `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`.
- **Scale**:
  - `Display / Page Title`: 24px (1.5rem), font-weight 700, line-height 1.2.
  - `Section Heading`: 18px (1.125rem), font-weight 600, line-height 1.3.
  - `Card Title`: 16px (1.0rem), font-weight 600, line-height 1.4.
  - `Body Text`: 14px (0.875rem), font-weight 400, line-height 1.5.
  - `Metadata / Badges`: 12px (0.75rem), font-weight 500, letter-spacing 0.02em.
  - `Code / Date Badges`: Monospace (`ui-monospace, "SF Mono", monospace`), font-weight 600.

### Spacing & Grid System
- 4px baseline grid (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`).
- Consistent container max-width: `1200px` centered with responsive horizontal gutters (`16px` mobile, `32px` desktop).
- Card border-radius: `8px` (`rounded-lg`). Avoid oversized bubble corners.

---

## Pages & Routes

| Route | Page Name | Purpose |
| :--- | :--- | :--- |
| `/` | **Radar Dashboard** | Main home: Urgent deadlines (<24h, <3d, <7d), active applications, overdue warnings, quick actions. |
| `/discover` | **Opportunity Catalog** | Global searchable, filterable directory of hackathons, internships, scholarships, and contests. |
| `/opportunities/:id` | **Opportunity Detail** | In-depth breakdown of eligibility, dates, requirements, links, and personal tracking controls. |
| `/calendar` | **Deadline Calendar** | Month & week views showing deadline markers, color-coded by category and status. |
| `/radar/my-list` | **My Tracked Radar** | Full table/kanban view of user's saved opportunities categorized by tracking status (`Saved`, `Applied`, etc.). |
| `/opportunities/new` | **Add Opportunity** | Ingestion modal/page with dual mode: Manual entry or AI text/URL extraction. |
| `/settings` | **Preferences** | Configure reminder frequencies (7d, 3d, 1d), default categories, and notification channels. |
| `/login` & `/register` | **Authentication** | Sign in and registration views. |

---

## Key Components

### 1. `UrgencyBadge`
- Renders remaining time dynamically (e.g. `14h left`, `2d left`, `Oct 24`).
- Visual indicator matches the urgency token (`--urgency-critical`, `--urgency-warning`, etc.).

### 2. `OpportunityCard`
- Compact, high-information-density card.
- Displays: Title, Organizing Body, Category Tag, Mode Badge (`Online`/`In-Person`), Urgency Countdown, and Quick Action ("Save" / "Mark Applied").

### 3. `AIExtractorBox`
- Clean textarea allowing user to paste an announcement text or URL.
- Includes an "Extract Details" button with inline loading spinner.
- Displays pre-filled fields in an editable review panel before saving.

### 4. `StatusSelector`
- Dropdown or pill selector for application status (`Saved`, `Interested`, `Applied`, `Interviewing`, `Offered`, `Rejected`, `Completed`).
- Seamless optimistic UI update on status change.

### 5. `CalendarGrid`
- Accessible monthly calendar view.
- Days with deadlines display indicator chips with count and top urgency level. Clicking a day opens a sidebar drawer listing that day's deadlines.

---

## User Flows & Responsive Behavior

### Mobile (< 768px)
- Bottom navigation bar: `Dashboard`, `Discover`, `My Radar`, `Calendar`.
- Single column feed with full-width cards.
- Sticky action bar on Opportunity Detail page ("Apply Now" & "Save to Radar").

### Desktop (>= 768px)
- Fixed left sidebar navigation (240px) + main scrollable content area.
- Multi-column grid on Discover page (2 to 3 cards per row).
- Split-screen drawer on Calendar for immediate inspection of day details without leaving the view.

---

## State Handling

### Loading States
- **Skeleton Screens**: Content-shaped pulse skeletons instead of generic full-screen spinners to minimize perceived latency.
- **Action Buttons**: Subtle inline spinners with disabled state to prevent duplicate submissions.

### Error States
- **Banner Alerts**: Dismissible top banners for network errors.
- **Field-Level Validation**: Clear red validation hints beneath invalid form inputs (e.g., `"Please provide a valid URL"` or `"Deadline must be in the future"`).
- **Graceful Fallbacks**: If the AI extraction service fails, an inline message displays: *"AI extraction timed out. Please enter details manually"* while preserving the user's pasted text in the textarea.

### Empty States
- Informative, action-oriented empty states:
  - *Empty Radar*: "You haven't saved any deadlines yet. [Browse Discover Catalog] or [Add Opportunity]."
  - *No Urgent Deadlines*: "All caught up! No deadlines approaching in the next 7 days."

---

## Accessibility (a11y)
- WCAG AA contrast compliance across all text and background tokens.
- All interactive elements keyboard navigable (`Tab`, `Enter`, `Space`) with visible focus outlines (`--border-focus`).
- Semantic HTML tags (`<main>`, `<nav>`, `<article>`, `<header>`, `<time>`).
- Screen reader accessible `aria-label` for icon-only buttons.
- Deadline timestamps use the `<time datetime="...">` semantic tag.
