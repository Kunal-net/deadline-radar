import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export const ProductView: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [intentInput, setIntentInput] = useState(
    'Submit NSF grant proposal draft next Tuesday 4pm requiring 5.5 hours'
  );
  const [parsedEffort, setParsedEffort] = useState<string>('5.5h Net');
  const [parsedDeadline, setParsedDeadline] = useState<string>('Tue · 16:00');
  const [evaluated, setEvaluated] = useState(true);

  const handleEvaluateIntent = () => {
    const matchEffort = intentInput.match(/(\d+(?:\.\d+)?)\s*(?:hour|hr|h)/i);
    const matchTime = intentInput.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
    if (matchEffort) {
      setParsedEffort(`${matchEffort[1]}h Net`);
    } else {
      setParsedEffort('3.0h Estimated');
    }
    if (matchTime) {
      setParsedDeadline(`Target · ${matchTime[1]}`);
    }
    setEvaluated(true);
  };

  return (
    <div className="min-h-screen bg-surface font-body-md text-body-md text-ink-primary antialiased">
      {/* Editorial Landing Header */}
      <header className="fixed top-0 w-full z-50 bg-surface border-b border-border-hairline">
        <div className="h-20 w-full px-margin-mobile lg:px-margin flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <img
              src="/assets/logo-wordmark.svg"
              alt="Deadline Radar Logo"
              className="h-8 w-auto object-contain"
            />
            <Link
              to="/"
              className="font-headline-md text-headline-md tracking-tight text-ink-primary font-bold"
            >
              Deadline Radar
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-space-lg">
            <a
              href="#thesis"
              className="font-label-lg text-label-lg text-ink-secondary hover:text-ink-primary transition-colors"
            >
              Philosophy
            </a>
            <span
              className="font-label-lg text-label-lg text-ink-primary underline underline-offset-8 decoration-accent-terracotta cursor-default"
            >
              Product
            </span>
            <a
              href="#principles"
              className="font-label-lg text-label-lg text-ink-secondary hover:text-ink-primary transition-colors"
            >
              Methodology
            </a>
            <a
              href="#manifesto"
              className="font-label-lg text-label-lg text-ink-secondary hover:text-ink-primary transition-colors"
            >
              Manifesto
            </a>
          </nav>

          <div className="flex items-center gap-space-xs sm:gap-space-md">
            <Link
              to={isAuthenticated ? '/today' : '/login'}
              className="hidden sm:inline-block font-label-lg text-label-lg text-ink-secondary hover:text-ink-primary transition-colors"
            >
              {isAuthenticated ? 'Workspace' : 'Sign In'}
            </Link>
            <button
              onClick={() => navigate(isAuthenticated ? '/today' : '/signup')}
              className="px-space-sm sm:px-space-lg py-space-xs sm:py-space-sm bg-ink-primary text-canvas-paper font-label-lg text-label-lg rounded-none hover:bg-accent-terracotta transition-colors inline-flex items-center justify-center whitespace-nowrap"
            >
              Open Radar
            </button>
            <Link
              to={isAuthenticated ? '/settings' : '/login'}
              aria-label="User Profile"
              className="w-8 h-8 rounded-none bg-ink-primary text-canvas-paper flex items-center justify-center border border-border-hairline shrink-0 hover:bg-accent-terracotta transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="w-full pt-20 bg-surface">
        <div className="flex flex-col w-full">
          {/* Hero Section */}
          <section className="w-full px-margin-mobile lg:px-margin pt-space-lg pb-space-2xl bg-surface">
            <div className="max-w-[1440px] mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between pb-space-sm mb-space-lg">
                <div className="flex items-center gap-space-xs">
                  <span className="w-2 h-2 bg-accent-terracotta inline-block" />
                  <span className="font-label-md text-label-md tracking-widest text-ink-primary uppercase">
                    Volume IV — Issue 08
                  </span>
                </div>
                <span className="font-label-md text-label-md tracking-wider text-ink-muted uppercase mt-1 sm:mt-0">
                  An Intellectual Instrument for Human Capacity
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
                <div className="lg:col-span-7 flex flex-col space-y-space-md">
                  <h1 className="font-display-hero text-display-hero-mobile sm:text-display-hero text-ink-primary tracking-tight">
                    Your time is finite.
                    <br />
                    <span className="text-accent-terracotta italic font-normal">
                      Deadlines are moving.
                    </span>
                  </h1>
                  <p className="font-body-xl text-body-xl text-ink-secondary max-w-2xl pt-space-xs">
                    Deadline Radar is a personal deadline intelligence system that calculates what you
                    actually need to do against the hours you actually have. No synthetic urgency.
                    No buried tasks. Just mathematical honesty for how you live and work.
                  </p>

                  <div className="pt-space-md flex flex-wrap items-center gap-space-md">
                    <button
                      onClick={() => navigate('/onboarding')}
                      className="px-space-lg py-space-sm bg-ink-primary text-canvas-paper font-label-lg text-label-lg transition-colors duration-200 hover:bg-accent-terracotta inline-flex items-center justify-center"
                    >
                      Calculate Your Week
                    </button>
                    <a
                      href="#thesis"
                      className="font-label-lg text-label-lg text-ink-primary group inline-flex items-center gap-space-xs hover:text-accent-terracotta transition-colors duration-150"
                    >
                      <span>Read the 70% Capacity Principle</span>
                      <span className="transition-transform group-hover:translate-x-1 duration-150">
                        →
                      </span>
                    </a>
                  </div>

                  <div className="pt-space-xl max-w-md">
                    <div className="w-12 h-0.5 bg-accent-terracotta mb-space-xs" />
                    <p className="font-label-md text-label-md text-ink-muted leading-relaxed uppercase tracking-wider">
                      Calibrated for focused practitioners, researchers, and engineers who care about
                      cognitive craft over performative busyness.
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-5 relative mt-space-md lg:mt-0">
                  <div className="relative bg-surface-cream p-space-xs">
                    <img
                      src="/assets/temporal-constraint.jpg"
                      alt="Plate 1.0 Temporal Constraint"
                      className="w-full h-[520px] object-cover object-center grayscale contrast-[1.05]"
                    />
                    <div className="pt-space-xs px-1 flex items-start justify-between">
                      <span className="font-label-md text-label-md text-ink-muted">
                        FIG. 01 — HOURGLASS
                      </span>
                      <span className="font-label-md text-label-md text-ink-muted font-mono">
                        0.024 mL/s INVARIANT
                      </span>
                    </div>
                  </div>
                  <div className="mt-space-sm pl-space-xs">
                    <p className="font-label-md text-label-md text-ink-secondary italic max-w-sm">
                      “Figure 1.0 — Discrete temporal constraint. Sand flows at an invariant rate.
                      Your calendar should reflect the same physical reality.”
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Live Mathematical Reality Bar */}
          <section className="w-full bg-surface-cream py-space-md border-y border-border-hairline">
            <div className="max-w-[1440px] mx-auto px-margin-mobile lg:px-margin">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter items-baseline">
                <div>
                  <span className="font-label-md text-label-md text-ink-muted uppercase tracking-wider block">
                    Natural Diurnal Ceiling
                  </span>
                  <span className="font-numeric-hero text-headline-xl font-bold text-ink-primary">
                    4.5<span className="text-headline-md font-normal text-ink-muted">h/day</span>
                  </span>
                  <p className="font-label-md text-label-md text-ink-secondary mt-1">
                    Deep synthesis limit
                  </p>
                </div>
                <div>
                  <span className="font-label-md text-label-md text-ink-muted uppercase tracking-wider block">
                    Target Reserve Ratio
                  </span>
                  <span className="font-numeric-hero text-headline-xl font-bold text-accent-terracotta">
                    30<span className="text-headline-md font-normal text-ink-muted">%</span>
                  </span>
                  <p className="font-label-md text-label-md text-ink-secondary mt-1">
                    Uncommitted slack quota
                  </p>
                </div>
                <div>
                  <span className="font-label-md text-label-md text-ink-muted uppercase tracking-wider block">
                    Historical Error Variance
                  </span>
                  <span className="font-numeric-hero text-headline-xl font-bold text-ink-primary">
                    ±1.4<span className="text-headline-md font-normal text-ink-muted">h</span>
                  </span>
                  <p className="font-label-md text-label-md text-ink-secondary mt-1">
                    Algorithmic correction delta
                  </p>
                </div>
                <div>
                  <span className="font-label-md text-label-md text-ink-muted uppercase tracking-wider block">
                    Temporal Fidelity
                  </span>
                  <span className="font-numeric-hero text-headline-xl font-bold text-ink-primary">
                    100<span className="text-headline-md font-normal text-ink-muted">%</span>
                  </span>
                  <p className="font-label-md text-label-md text-ink-secondary mt-1">
                    Unskewed physical truth
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* The Thesis */}
          <section className="w-full px-margin-mobile lg:px-margin py-space-2xl bg-surface" id="thesis">
            <div className="max-w-[1440px] mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
                <div className="lg:col-span-5">
                  <div className="sticky top-28 space-y-space-md">
                    <span className="font-label-md text-label-md uppercase tracking-widest text-accent-terracotta block">
                      Thesis · The Fiction of Infinite Elasticity
                    </span>
                    <h2 className="font-headline-xl text-headline-xl text-ink-primary leading-tight">
                      Traditional to-do apps assume your day has 24 elastic hours. They are silent
                      accomplices to burnout.
                    </h2>
                    <p className="font-body-md text-body-md text-ink-secondary max-w-sm">
                      Productivity software was built by companies incentivized to keep you
                      organizing tasks, not completing them. We replaced the endless Kanban sprawl
                      with arithmetic.
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-7 space-y-space-xl pt-space-sm lg:pt-0">
                  {/* Flaw 01 */}
                  <div className="bg-canvas-paper p-space-lg border border-border-hairline">
                    <div className="flex items-baseline justify-between mb-space-sm">
                      <span className="font-numeric-hero text-headline-lg font-bold text-ink-primary">
                        01
                      </span>
                      <span className="font-label-md text-label-md uppercase tracking-wider text-ink-muted">
                        Structural Flaw
                      </span>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-ink-primary mb-space-xs">
                      The Infinite Queue Fallacy
                    </h3>
                    <p className="font-body-lg text-body-lg text-ink-secondary leading-relaxed">
                      Digital lists permit you to append forty hours of intellectual commitments to
                      a single afternoon without resistance. A paper notebook runs out of physical
                      fiber; software cheerfully lets you queue an impossible backlog, producing
                      passive subconscious dread.
                    </p>
                    <div className="mt-space-md pt-space-xs text-ink-muted font-mono text-label-md">
                      RADAR PRINCIPLE: ZERO UNBOUNDED INBOXES
                    </div>
                  </div>

                  {/* Flaw 02 */}
                  <div className="bg-canvas-paper p-space-lg border border-border-hairline">
                    <div className="flex items-baseline justify-between mb-space-sm">
                      <span className="font-numeric-hero text-headline-lg font-bold text-ink-primary">
                        02
                      </span>
                      <span className="font-label-md text-label-md uppercase tracking-wider text-ink-muted">
                        Cognitive Erosion
                      </span>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-ink-primary mb-space-xs">
                      Synthetic Urgency Dilution
                    </h3>
                    <p className="font-body-lg text-body-lg text-ink-secondary leading-relaxed">
                      When every software notification flashes red and every ticket is marked P0,
                      genuine horizons become invisible. Real deadlines do not shout; they approach
                      quietly along a temporal vector. Without accurate temporal calibration, humans
                      revert to firefighting whatever is loudest.
                    </p>
                    <div className="mt-space-md pt-space-xs text-ink-muted font-mono text-label-md">
                      RADAR PRINCIPLE: PROPORTIONAL ACCELERATION METRICS
                    </div>
                  </div>

                  {/* Flaw 03 */}
                  <div className="bg-canvas-paper p-space-lg border border-border-hairline">
                    <div className="flex items-baseline justify-between mb-space-sm">
                      <span className="font-numeric-hero text-headline-lg font-bold text-ink-primary">
                        03
                      </span>
                      <span className="font-label-md text-label-md uppercase tracking-wider text-ink-muted">
                        Physiological Reality
                      </span>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-ink-primary mb-space-xs">
                      The Biological Ceiling
                    </h3>
                    <p className="font-body-lg text-body-lg text-ink-secondary leading-relaxed">
                      Peer-reviewed neurobiology confirms the human prefrontal cortex can sustain
                      approximately 4 to 5 hours of true algorithmic problem-solving or dense
                      synthetic reasoning per diurnal cycle. Treating an 8-hour workday as 8 hours
                      of raw deep work is an exercise in self-delusion.
                    </p>
                    <div className="mt-space-md pt-space-xs text-accent-terracotta font-mono text-label-md font-semibold">
                      CALCULATED MAXIMUM: 4.5h NET SYNTHESIS / DIURNAL CYCLE
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* The Horizon Calculus in Practice */}
          <section className="w-full bg-surface-cream py-space-2xl px-margin-mobile lg:px-margin border-y border-border-hairline">
            <div className="max-w-[1440px] mx-auto">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-xl">
                <div>
                  <span className="font-label-md text-label-md uppercase tracking-widest text-accent-terracotta block mb-space-xs">
                    System Live Projection
                  </span>
                  <h2 className="font-headline-xl text-headline-xl text-ink-primary">
                    The Horizon Calculus in Practice
                  </h2>
                </div>
                <div className="mt-space-sm md:mt-0 font-label-md text-label-md text-ink-secondary">
                  <span className="inline-block w-1.5 h-1.5 bg-accent-terracotta mr-1.5 shrink-0 animate-pulse motion-reduce:animate-none" />
                  Simulating Active Horizon: Wk 43 (Oct 21 – 27)
                </div>
              </div>

              <div className="bg-canvas-paper p-space-md lg:p-space-lg border border-border-hairline">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md pb-space-md mb-space-md border-b border-border-hairline">
                  <div className="space-y-1">
                    <span className="font-label-md text-label-md text-ink-muted uppercase">
                      Cognitive Budget
                    </span>
                    <div className="font-headline-lg text-headline-lg text-ink-primary font-bold">
                      18.5{' '}
                      <span className="font-body-md text-body-md font-normal text-ink-secondary">
                        Hours Available
                      </span>
                    </div>
                    <p className="font-label-md text-label-md text-ink-muted">
                      After ring-fencing 42h sleep + 14h essentials
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-label-md text-label-md text-ink-muted uppercase">
                      Committed Effort
                    </span>
                    <div className="font-headline-lg text-headline-lg text-ink-primary font-bold">
                      14.5{' '}
                      <span className="font-body-md text-body-md font-normal text-ink-secondary">
                        Hours Allocated
                      </span>
                    </div>
                    <p className="font-label-md text-label-md text-ink-muted">
                      Calibrated against historical type velocity
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-label-md text-label-md text-ink-muted uppercase">
                      Protected Buffer Slack
                    </span>
                    <div className="font-headline-lg text-headline-lg text-accent-terracotta font-bold">
                      +4.0{' '}
                      <span className="font-body-md text-body-md font-normal text-accent-terracotta">
                        Hours Residual
                      </span>
                    </div>
                    <p className="font-label-md text-label-md text-accent-terracotta font-medium">
                      Safe margin intact · 21.6% shock absorber
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 bg-surface-tint flex overflow-hidden mb-space-lg">
                  <div
                    className="h-full bg-ink-primary"
                    style={{ width: '48%' }}
                    title="Deep Work Allocation (48%)"
                  />
                  <div
                    className="h-full bg-ink-secondary"
                    style={{ width: '30%' }}
                    title="Review & Feedback Loops (30%)"
                  />
                  <div
                    className="h-full bg-accent-terracotta"
                    style={{ width: '22%' }}
                    title="Protected Reserve Slack (22%)"
                  />
                </div>

                {/* Open commitments table */}
                <div className="space-y-0 divide-y divide-border-hairline">
                  <div className="py-space-md hover:bg-surface-cream transition-colors duration-150 px-space-xs grid grid-cols-1 md:grid-cols-12 gap-gutter items-center">
                    <div className="md:col-span-2">
                      <span className="font-label-md text-label-md font-mono text-ink-muted block uppercase">
                        Thu · 14:00 EST
                      </span>
                      <span className="font-label-lg text-label-lg text-accent-terracotta font-bold">
                        In 2.5 Days
                      </span>
                    </div>
                    <div className="md:col-span-6">
                      <h4 className="font-headline-md text-headline-md text-ink-primary">
                        ML Pipeline Model Evaluation Paper
                      </h4>
                      <p className="font-body-md text-body-md text-ink-secondary">
                        Validation curves, cross-attention benchmarks, and synthesis commentary.
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-body-md text-body-md text-ink-primary font-mono font-medium">
                        6.0h Estimate
                      </span>
                      <span className="font-label-md text-label-md text-ink-muted block">
                        +0.8h drift buffer applied
                      </span>
                    </div>
                    <div className="md:col-span-2 text-left md:text-right mt-2 md:mt-0">
                      <span className="inline-block px-space-xs py-1 bg-surface-cream text-ink-primary font-label-md text-label-md uppercase tracking-wider font-semibold">
                        Capacity Optimal
                      </span>
                    </div>
                  </div>

                  <div className="py-space-md hover:bg-surface-cream transition-colors duration-150 px-space-xs grid grid-cols-1 md:grid-cols-12 gap-gutter items-center">
                    <div className="md:col-span-2">
                      <span className="font-label-md text-label-md font-mono text-ink-muted block uppercase">
                        Fri · 18:00 EST
                      </span>
                      <span className="font-label-lg text-label-lg text-ink-primary font-bold">
                        In 3.5 Days
                      </span>
                    </div>
                    <div className="md:col-span-6">
                      <h4 className="font-headline-md text-headline-md text-ink-primary">
                        FastAPI Latency Microservice Refactor
                      </h4>
                      <p className="font-body-md text-body-md text-ink-secondary">
                        Async session pooling, Redis cache fallback headers, end-to-end load tests.
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-body-md text-body-md text-ink-primary font-mono font-medium">
                        5.0h Estimate
                      </span>
                      <span className="font-label-md text-label-md text-ink-muted block">
                        History: -12% faster finish
                      </span>
                    </div>
                    <div className="md:col-span-2 text-left md:text-right mt-2 md:mt-0">
                      <span className="inline-block px-space-xs py-1 bg-surface-cream text-ink-primary font-label-md text-label-md uppercase tracking-wider font-semibold">
                        Protected Window
                      </span>
                    </div>
                  </div>

                  <div className="py-space-md hover:bg-surface-cream transition-colors duration-150 px-space-xs grid grid-cols-1 md:grid-cols-12 gap-gutter items-center">
                    <div className="md:col-span-2">
                      <span className="font-label-md text-label-md font-mono text-ink-muted block uppercase">
                        Sun · 20:00 EST
                      </span>
                      <span className="font-label-lg text-label-lg text-ink-muted font-bold">
                        In 5.5 Days
                      </span>
                    </div>
                    <div className="md:col-span-6">
                      <h4 className="font-headline-md text-headline-md text-ink-primary">
                        Design Research Synthesis: Spatial Audio
                      </h4>
                      <p className="font-body-md text-body-md text-ink-secondary">
                        Transcribing user sessions from physical testing lab; extracting heuristic vectors.
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-body-md text-body-md text-ink-primary font-mono font-medium">
                        3.5h Estimate
                      </span>
                      <span className="font-label-md text-label-md text-ink-muted block">
                        Low cognitive drag
                      </span>
                    </div>
                    <div className="md:col-span-2 text-left md:text-right mt-2 md:mt-0">
                      <span className="inline-block px-space-xs py-1 bg-surface-cream text-ink-primary font-label-md text-label-md uppercase tracking-wider font-semibold">
                        Low Drag
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dynamic Warning Bar */}
                <div className="mt-space-md p-space-sm bg-surface-cream flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm border-t border-border-hairline">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-accent-terracotta text-lg">
                      info
                    </span>
                    <span className="font-label-md text-label-md text-ink-primary font-medium">
                      Next Critical Horizon: <strong>Thursday 14:00</strong>. If Thursday review
                      slips past 16:30, Friday refactor buffer compresses by 45%.
                    </span>
                  </div>
                  <span className="font-label-md text-label-md text-ink-muted uppercase tracking-wider whitespace-nowrap">
                    Auto-recalculating via sync
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Three Principles */}
          <section className="w-full px-margin-mobile lg:px-margin py-space-2xl bg-surface" id="principles">
            <div className="max-w-[1440px] mx-auto">
              <div className="mb-space-xl max-w-2xl">
                <span className="font-label-md text-label-md uppercase tracking-widest text-accent-terracotta block mb-space-xs">
                  The Foundations
                </span>
                <h2 className="font-headline-xl text-headline-xl text-ink-primary leading-tight">
                  Three principles designed around real human cognition, not machine throughput.
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
                <div className="flex flex-col justify-between bg-canvas-paper p-space-lg min-h-[460px] border border-border-hairline">
                  <div>
                    <div className="font-label-md text-label-md font-mono text-accent-terracotta mb-space-md">
                      01 · HORIZON VELOCITY
                    </div>
                    <h3 className="font-headline-md text-headline-md text-ink-primary mb-space-sm">
                      Active Velocity vs. Naive Estimates
                    </h3>
                    <p className="font-body-md text-body-md text-ink-secondary leading-relaxed mb-space-md">
                      Humans are chronically optimistic estimators. Deadline Radar quietly monitors
                      your historical completion coefficients across deliverable domains. If your
                      distributed backend tasks take 18% longer than forecast while slide decks ship
                      20% early, the Radar automatically shifts your deadlines accordingly.
                    </p>
                  </div>
                  <div className="pt-space-md bg-surface-cream p-space-sm">
                    <div className="flex justify-between items-center text-label-md font-mono">
                      <span className="text-ink-secondary">Backend Systems Drift</span>
                      <span className="text-accent-terracotta font-bold">+18.4%</span>
                    </div>
                    <div className="flex justify-between items-center text-label-md font-mono mt-1">
                      <span className="text-ink-secondary">Document Drafting Velocity</span>
                      <span className="text-ink-primary font-bold">-21.0%</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between bg-canvas-paper p-space-lg min-h-[460px] border border-border-hairline">
                  <div>
                    <div className="font-label-md text-label-md font-mono text-accent-terracotta mb-space-md">
                      02 · SANCTUARY FIRST
                    </div>
                    <h3 className="font-headline-md text-headline-md text-ink-primary mb-space-sm">
                      Diurnal Horizon &amp; Protected Sanctuary
                    </h3>
                    <p className="font-body-md text-body-md text-ink-secondary leading-relaxed mb-space-md">
                      Most tools start with empty hours and urge you to fill them. Deadline Radar
                      inverts the formula: it first ring-fences non-negotiable living — sleep,
                      family meals, physical exercise, and mental fallow time. Whatever focus hours
                      remain are the only hours you are permitted to commit.
                    </p>
                  </div>
                  <div className="pt-space-md bg-surface-cream p-space-sm">
                    <div className="flex justify-between items-center text-label-md font-mono">
                      <span className="text-ink-secondary">Diurnal Sleep &amp; Rest Reserve</span>
                      <span className="text-ink-primary font-bold">56.0h / wk</span>
                    </div>
                    <div className="flex justify-between items-center text-label-md font-mono mt-1">
                      <span className="text-ink-secondary">Biological Baseline Protected</span>
                      <span className="text-ink-primary font-bold">100.0%</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between bg-canvas-paper p-space-lg min-h-[460px] border border-border-hairline">
                  <div>
                    <div className="font-label-md text-label-md font-mono text-accent-terracotta mb-space-md">
                      03 · MINIMAL FRICTION
                    </div>
                    <h3 className="font-headline-md text-headline-md text-ink-primary mb-space-sm">
                      Natural Language Intent
                    </h3>
                    <p className="font-body-md text-body-md text-ink-secondary leading-relaxed mb-space-md">
                      No Jira hierarchies, no color-coded tags, and no nested sub-menus. Type in
                      conversational cadence: “Finish PyTorch attention layer before Thursday 5pm
                      taking roughly 4 hours.” The system extracts deadline, effort vector, and
                      immediately validates fit against available cognitive capacity.
                    </p>
                  </div>
                  <div className="pt-space-md bg-surface-cream p-space-sm">
                    <div className="text-label-md font-mono text-ink-secondary italic truncate">
                      “Draft thesis conclusion Fri 3p for 2.5h”
                    </div>
                    <div className="text-label-md font-mono text-accent-terracotta font-medium mt-1">
                      → Parsed &amp; Allocated: Friday 12:30–15:00
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Interactive Playground */}
          <section className="w-full bg-surface-tint/50 py-space-xl px-margin-mobile lg:px-margin border-y border-border-hairline">
            <div className="max-w-[1000px] mx-auto">
              <div className="text-center mb-space-md">
                <span className="font-label-md text-label-md uppercase tracking-widest text-ink-muted">
                  Interactive Instrument
                </span>
                <h3 className="font-headline-lg text-headline-lg text-ink-primary mt-1">
                  Test Natural Language Capacity Parsing
                </h3>
              </div>

              <div className="bg-surface p-space-lg border border-border-hairline">
                <div className="relative">
                  <label
                    htmlFor="intent-input"
                    className="block font-label-md text-label-md uppercase tracking-wider text-ink-muted mb-space-xs"
                  >
                    Enter commitment in plain English
                  </label>
                  <input
                    id="intent-input"
                    type="text"
                    value={intentInput}
                    onChange={(e) => {
                      setIntentInput(e.target.value);
                      handleEvaluateIntent();
                    }}
                    placeholder="Type your deadline and duration..."
                    className="w-full bg-transparent font-headline-md text-headline-md text-ink-primary outline-none pb-space-xs placeholder:text-ink-muted border-b border-border-hairline"
                  />
                </div>

                <div className="pt-space-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                  <div className="flex flex-wrap items-center gap-space-sm font-mono text-label-md">
                    <span className="bg-surface-cream px-2 py-1 text-ink-primary font-medium">
                      {parsedDeadline}
                    </span>
                    <span className="bg-surface-cream px-2 py-1 text-ink-primary font-medium">
                      Effort: {parsedEffort}
                    </span>
                    <span className="text-accent-terracotta font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-accent-terracotta inline-block shrink-0" />
                      Capacity Fit: +3.2h Buffer Safe
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleEvaluateIntent}
                    className="px-space-md py-2 bg-ink-primary text-canvas-paper font-label-md text-label-md hover:bg-accent-terracotta transition-colors"
                  >
                    {evaluated ? 'Parsed Deterministically' : 'Evaluate Fit'}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="w-full px-margin-mobile lg:px-margin py-space-2xl bg-surface" id="manifesto">
            <div className="max-w-[1440px] mx-auto">
              <div className="bg-surface-cream p-space-lg lg:p-space-2xl text-center flex flex-col items-center border border-border-hairline">
                <span className="font-label-md text-label-md uppercase tracking-widest text-accent-terracotta mb-space-sm block">
                  A Cadence for Sustainable Intellect
                </span>
                <h2 className="font-display-hero text-display-hero text-ink-primary max-w-3xl leading-tight mb-space-md">
                  Stop scheduling 100% of your day.
                  <br />
                  <span className="italic font-normal text-accent-terracotta">
                    Protect your margin.
                  </span>
                </h2>
                <p className="font-body-xl text-body-xl text-ink-secondary max-w-xl mb-space-lg">
                  No calendar clutter. No gamified streaks. Just the mathematical clarity required to
                  produce serious, enduring work without sacrificing your health.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-space-md">
                  <button
                    onClick={() => navigate('/onboarding')}
                    className="px-space-xl py-space-sm bg-ink-primary text-canvas-paper font-label-lg text-label-lg hover:bg-accent-terracotta transition-colors duration-200"
                  >
                    Open Deadline Radar
                  </button>
                  <button
                    onClick={() => navigate('/today')}
                    className="font-label-lg text-label-lg text-ink-primary hover:text-accent-terracotta transition-colors"
                  >
                    Enter Live Workspace →
                  </button>
                </div>

                <div className="mt-space-xl pt-space-md flex flex-wrap justify-center items-center gap-gutter text-ink-muted font-label-md text-label-md uppercase tracking-wider">
                  <span>Zero Telemetry Tracking</span>
                  <span>·</span>
                  <span>Pure Local Calculation</span>
                  <span>·</span>
                  <span>CalDAV &amp; ICS Native</span>
                  <span>·</span>
                  <span>No Enterprise Sprints</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Editorial Landing Footer */}
      <footer className="w-full bg-surface-container-low border-t border-border-hairline">
        <div className="w-full px-margin-mobile lg:px-margin py-space-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            <div className="lg:col-span-5 flex flex-col justify-between space-y-space-md">
              <div className="space-y-space-sm">
                <span className="font-headline-lg text-headline-lg text-ink-primary block font-bold">
                  Deadline Radar
                </span>
                <p className="font-body-lg text-body-lg text-ink-secondary max-w-md">
                  An editorial instrument for time capacity, commitments, and structural focus.
                  Rejecting artificial urgency in favor of human cadence.
                </p>
              </div>
              <p className="font-label-md text-label-md text-ink-muted">
                © 2026 Deadline Radar Inc. Precision time-intelligence.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-gutter">
              <div className="space-y-space-sm">
                <h4 className="font-label-md text-label-md uppercase tracking-wider text-ink-muted font-semibold">
                  Perspectives
                </h4>
                <ul className="space-y-space-xs font-body-md text-body-md text-ink-secondary">
                  <li>
                    <a href="#thesis" className="hover:text-ink-primary transition-colors">
                      Philosophy
                    </a>
                  </li>
                  <li>
                    <a href="#principles" className="hover:text-ink-primary transition-colors">
                      Methodology
                    </a>
                  </li>
                  <li>
                    <a href="#manifesto" className="hover:text-ink-primary transition-colors">
                      Manifesto
                    </a>
                  </li>
                </ul>
              </div>

              <div className="space-y-space-sm">
                <h4 className="font-label-md text-label-md uppercase tracking-wider text-ink-muted font-semibold">
                  System
                </h4>
                <ul className="space-y-space-xs font-body-md text-body-md text-ink-secondary">
                  <li>
                    <Link to="/radar" className="hover:text-ink-primary transition-colors">
                      Radar View
                    </Link>
                  </li>
                  <li>
                    <Link to="/work" className="hover:text-ink-primary transition-colors">
                      Work Ledger
                    </Link>
                  </li>
                  <li>
                    <Link to="/work/new" className="hover:text-ink-primary transition-colors">
                      Natural Intake
                    </Link>
                  </li>
                  <li>
                    <Link to="/today" className="hover:text-ink-primary transition-colors">
                      Today Console
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-space-sm">
                <h4 className="font-label-md text-label-md uppercase tracking-wider text-ink-muted font-semibold">
                  Protocol
                </h4>
                <ul className="space-y-space-xs font-body-md text-body-md text-ink-secondary">
                  <li>
                    <Link to="/settings" className="hover:text-ink-primary transition-colors">
                      Parameters &amp; Sanctuaries
                    </Link>
                  </li>
                  <li>
                    <Link to="/insights" className="hover:text-ink-primary transition-colors">
                      Velocity Calibration
                    </Link>
                  </li>
                  <li>
                    <Link to="/planning" className="hover:text-ink-primary transition-colors">
                      Focus Allocations
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
