import React, { useState } from 'react';

interface VelocityRow {
  title: string;
  category: string;
  planned: string;
  actual: string;
  variance: string;
  varianceColor: string;
}

const velocityHistory: VelocityRow[] = [
  {
    title: 'Q3 Architecture Review Document',
    category: 'Systems Specification',
    planned: '16.0h',
    actual: '17.5h',
    variance: '+1.5h (+9%)',
    varianceColor: 'text-accent-terracotta',
  },
  {
    title: 'Investor Board Pitch Deck',
    category: 'Narrative & Slide Synthesis',
    planned: '12.0h',
    actual: '9.8h',
    variance: '−2.2h (−18%)',
    varianceColor: 'text-ink-primary',
  },
  {
    title: 'Authentication Engine Refactor',
    category: 'Security & OAuth Layer',
    planned: '24.0h',
    actual: '27.0h',
    variance: '+3.0h (+12.5%)',
    varianceColor: 'text-accent-terracotta',
  },
  {
    title: 'Editorial Styleguide Manual',
    category: 'Documentation & Standards',
    planned: '8.0h',
    actual: '6.5h',
    variance: '−1.5h (−19%)',
    varianceColor: 'text-ink-primary',
  },
  {
    title: 'Database Indexing & Latency Tuning',
    category: 'Postgres Optimization',
    planned: '10.0h',
    actual: '10.5h',
    variance: '+0.5h (+5%)',
    varianceColor: 'text-ink-muted',
  },
];

export const InsightsView: React.FC = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grounded' | 'early'>('grounded');
  const [multiplierApplied, setMultiplierApplied] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleApplyMultiplier = () => {
    setMultiplierApplied(true);
    showToast('Drafting multiplier calibrated: 1.12x applied to all technical repositories.');
  };

  return (
    <div className="w-full bg-surface min-h-screen">
      {/* Observation Journal Header */}
      <section className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin pt-space-lg md:pt-space-xl pb-space-lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-baseline">
          <div className="lg:col-span-8 flex flex-col gap-space-xs">
            <div className="flex items-center gap-space-xs text-ink-muted font-label-md text-label-md tracking-wider uppercase">
              <span>Observation Journal</span>
              <span>·</span>
              <span>{viewMode === 'grounded' ? 'Cycle 08 — Rolling 30 Days' : 'Cycle 01 — Cold Start'}</span>
            </div>
            <h1 className="font-display-hero text-display-hero-mobile sm:text-display-hero text-ink-primary tracking-tight">
              Insights
            </h1>
            <p className="font-body-xl text-body-xl text-ink-secondary max-w-2xl mt-space-xs">
              {viewMode === 'grounded'
                ? 'Empirical patterns from your last 30 days of work, estimates, and completed deadlines.'
                : 'Observational baseline in training. Genuine cadence requires empirical focus logging.'}
            </p>
          </div>
          <div className="lg:col-span-4 flex flex-col justify-end lg:items-end gap-space-xs pt-space-sm lg:pt-0">
            <div className="flex items-center gap-1 bg-surface-cream border border-border-hairline p-0.5 mb-1">
              <button
                onClick={() => setViewMode('grounded')}
                className={`px-space-sm py-1 font-label-md text-label-md transition-colors ${
                  viewMode === 'grounded' ? 'bg-ink-primary text-canvas-paper' : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                Grounded (34 Blocks)
              </button>
              <button
                onClick={() => setViewMode('early')}
                className={`px-space-sm py-1 font-label-md text-label-md transition-colors ${
                  viewMode === 'early' ? 'bg-ink-primary text-canvas-paper' : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                Early Data State
              </button>
            </div>
            <span className="font-label-md text-label-md text-ink-muted">Synthesis Status</span>
            <div className="flex items-center gap-space-xs">
              <span className={`w-1.5 h-1.5 ${viewMode === 'grounded' ? 'bg-accent-terracotta' : 'bg-status-warning'}`} />
              <span className="font-label-lg text-label-lg text-ink-primary font-semibold">
                {viewMode === 'grounded' ? 'Grounded in 34 recorded blocks' : 'Calibrating: 3 / 10 minimum blocks'}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin">
        <div className="w-full h-px bg-border-hairline" />
      </div>

      {/* Body Content: Grounded vs Early Data State */}
      {viewMode === 'early' ? (
        <section className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin py-space-xl">
          <div className="max-w-3xl flex flex-col gap-space-lg">
            <div className="flex flex-col gap-space-xs">
              <span className="font-label-md text-label-md text-ink-muted uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 bg-status-warning" />
                Empirical Observation Initializing · [SYSTEM CALIBRATION]
              </span>
              <h2 className="font-headline-xl text-headline-xl text-ink-primary tracking-tight leading-tight">
                Authentic velocity intelligence requires observed human data.
              </h2>
              <p className="font-body-lg text-body-lg text-ink-secondary leading-relaxed">
                Deadline Radar refuses to manufacture artificial trends, synthetic graphs, or pseudo-scientific scores. To guarantee mathematical validity, personal estimation drift models unlock only after 10 verified focus blocks have been executed and logged.
              </p>
            </div>

            {/* Calibration Progress Card */}
            <div className="p-space-lg bg-surface-cream border border-border-hairline flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-ink-muted uppercase">Calibration Progress</span>
                <span className="font-label-lg text-label-lg text-ink-primary font-semibold">3 / 10 Sessions (30%)</span>
              </div>
              <div className="w-full h-2 bg-surface-tint overflow-hidden">
                <div className="h-full bg-ink-primary" style={{ width: '30%' }} />
              </div>
              <span className="font-body-md text-body-md text-ink-secondary">
                7 more logged intervals needed before generating your empirical Circadian Profile and Category Drift Multipliers.
              </span>
            </div>

            {/* Tracking Status Matrix */}
            <div className="border border-border-hairline p-space-md bg-surface-container-low flex flex-col gap-space-sm">
              <span className="font-label-md text-label-md text-ink-muted uppercase tracking-wider">
                Telemetry Verification Matrix
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm font-body-md text-body-md">
                <div className="flex items-start gap-2 text-ink-primary">
                  <span className="material-symbols-outlined text-accent-terracotta text-[18px]">check_circle</span>
                  <div>
                    <span className="font-medium block">Timestamp Integrity</span>
                    <span className="text-ink-secondary text-label-md">Hardware clock sync active</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-ink-primary">
                  <span className="material-symbols-outlined text-accent-terracotta text-[18px]">check_circle</span>
                  <div>
                    <span className="font-medium block">Interval Logging</span>
                    <span className="text-ink-secondary text-label-md">3 focus blocks recorded</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-ink-muted">
                  <span className="material-symbols-outlined text-ink-muted text-[18px]">hourglass_empty</span>
                  <div>
                    <span className="font-medium block">Circadian Peak Window</span>
                    <span className="text-ink-muted text-label-md">Locked (requires 7 more sessions)</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-ink-muted">
                  <span className="material-symbols-outlined text-ink-muted text-[18px]">hourglass_empty</span>
                  <div>
                    <span className="font-medium block">Category Drift Multiplier</span>
                    <span className="text-ink-muted text-label-md">Locked (requires 7 more sessions)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-space-md pt-space-xs">
              <a
                href="#/work"
                className="bg-ink-primary hover:bg-accent-terracotta text-canvas-paper px-space-md py-space-sm font-label-lg text-label-lg transition-colors cursor-pointer"
              >
                Log Intervals in Work Workspace →
              </a>
              <button
                onClick={() => setViewMode('grounded')}
                className="text-ink-secondary hover:text-ink-primary underline font-label-md text-label-md cursor-pointer"
              >
                Preview established Cycle 08 telemetry
              </button>
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* 3 Core Editorial Findings */}
          <section className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin py-space-xl">
            <div className="flex flex-col gap-space-2xl">
              {/* Finding 01 */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start group">
                <div className="lg:col-span-4 flex flex-col gap-space-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-label-md text-label-md text-ink-muted uppercase tracking-widest">
                      Finding 01 — Drift Pattern
                    </span>
                    <span className="font-label-md text-[10px] text-ink-primary bg-surface-cream px-1.5 py-0.5 border border-border-hairline">
                      [OBSERVED FACT]
                    </span>
                  </div>
                  <div className="flex items-baseline gap-space-xs text-ink-primary">
                    <span className="font-numeric-hero text-numeric-hero font-medium text-accent-terracotta">+12%</span>
                    <span className="font-headline-md text-headline-md text-ink-secondary">/ −18%</span>
                  </div>
                  <span className="font-label-md text-label-md text-ink-muted">Code vs. Synthesis</span>
                </div>
                <div className="lg:col-span-8 flex flex-col gap-space-sm pl-0 lg:pl-space-md border-l-0 lg:border-l lg:border-border-hairline">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-label-md text-[10px] text-accent-terracotta bg-surface-cream px-1.5 py-0.5 border border-border-hairline">
                      [AI INTERPRETATION]
                    </span>
                  </div>
                  <h2 className="font-headline-xl text-headline-xl text-ink-primary tracking-tight leading-tight">
                    Your estimation drift is +12% on technical coding, but -18% on writing &amp; research.
                  </h2>
                  <p className="font-body-lg text-body-lg text-ink-secondary max-w-2xl leading-relaxed">
                    You tend to finish essays and slide decks faster than planned, but debugging and configuration run slightly longer. Consider auto-allocating a 20-minute buffer specifically when scheduling structural systems engineering.
                  </p>
                  <div className="mt-space-sm p-space-md bg-surface-cream rounded-none flex flex-col md:flex-row md:items-center justify-between gap-space-sm border border-border-hairline">
                    <button
                      onClick={handleApplyMultiplier}
                      className="flex items-center gap-space-sm text-left hover:text-accent-terracotta transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-accent-terracotta text-[20px]">tune</span>
                      <span className="font-body-md text-body-md text-ink-primary font-medium">
                        {multiplierApplied ? 'Multiplier active: 1.12x applied' : 'Calibrate drafting multiplier'}
                      </span>
                    </button>
                    <span className="font-label-md text-label-md text-ink-muted">
                      Adjusted baseline: 1.12x for code repositories
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-full h-px bg-border-hairline" />

              {/* Finding 02 */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start group">
                <div className="lg:col-span-4 flex flex-col gap-space-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-label-md text-label-md text-ink-muted uppercase tracking-widest">
                      Finding 02 — Circadian Rhythm
                    </span>
                    <span className="font-label-md text-[10px] text-ink-primary bg-surface-cream px-1.5 py-0.5 border border-border-hairline">
                      [OBSERVED FACT]
                    </span>
                  </div>
                  <div className="flex items-baseline gap-space-xs text-ink-primary">
                    <span className="font-numeric-hero text-numeric-hero font-medium">09:30</span>
                    <span className="font-headline-md text-headline-md text-ink-muted">– 12:30</span>
                  </div>
                  <span className="font-label-md text-label-md text-ink-muted">High-Affinity Window</span>
                </div>
                <div className="lg:col-span-8 flex flex-col gap-space-sm pl-0 lg:pl-space-md border-l-0 lg:border-l lg:border-border-hairline">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-label-md text-[10px] text-accent-terracotta bg-surface-cream px-1.5 py-0.5 border border-border-hairline">
                      [AI INTERPRETATION]
                    </span>
                  </div>
                  <h2 className="font-headline-xl text-headline-xl text-ink-primary tracking-tight leading-tight">
                    Your optimal focus window is 09:30 – 12:30.
                  </h2>
                  <p className="font-body-lg text-body-lg text-ink-secondary max-w-2xl leading-relaxed">
                    Sessions started during morning daylight complete with 40% fewer context switches. When critical milestones are positioned prior to noon, you maintain unbroken attention spans averaging 84 minutes without synthetic stimulants.
                  </p>
                  <div className="mt-space-sm flex flex-wrap items-center gap-space-md pt-space-xs">
                    <div className="flex items-center gap-space-xs">
                      <span className="w-1.5 h-1.5 bg-ink-primary" />
                      <span className="font-label-md text-label-md text-ink-primary">
                        Morning clarity quotient: 9.4 / 10
                      </span>
                    </div>
                    <div className="flex items-center gap-space-xs">
                      <span className="w-1.5 h-1.5 bg-ink-muted" />
                      <span className="font-label-md text-label-md text-ink-secondary">
                        Afternoon friction: 3.2x more interruptions
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full h-px bg-border-hairline" />

              {/* Finding 03 */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start group">
                <div className="lg:col-span-4 flex flex-col gap-space-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-label-md text-label-md text-ink-muted uppercase tracking-widest">
                      Finding 03 — Chunking Leverage
                    </span>
                    <span className="font-label-md text-[10px] text-ink-primary bg-surface-cream px-1.5 py-0.5 border border-border-hairline">
                      [OBSERVED FACT]
                    </span>
                  </div>
                  <div className="flex items-baseline gap-space-xs text-accent-terracotta">
                    <span className="font-numeric-hero text-numeric-hero font-medium">2.1</span>
                    <span className="font-headline-md text-headline-md text-ink-primary">days ahead</span>
                  </div>
                  <span className="font-label-md text-label-md text-ink-muted">Sub-2h Grain Size</span>
                </div>
                <div className="lg:col-span-8 flex flex-col gap-space-sm pl-0 lg:pl-space-md border-l-0 lg:border-l lg:border-border-hairline">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-label-md text-[10px] text-accent-terracotta bg-surface-cream px-1.5 py-0.5 border border-border-hairline">
                      [AI INTERPRETATION]
                    </span>
                  </div>
                  <h2 className="font-headline-xl text-headline-xl text-ink-primary tracking-tight leading-tight">
                    You finish 2.1 days earlier when you break deliverables into sub-2-hour focus windows.
                  </h2>
                  <p className="font-body-lg text-body-lg text-ink-secondary max-w-2xl leading-relaxed">
                    Large monoliths of ambiguous work (“Finish quarterly report”) incur 3.4 days of initial procrastination inertia. Atomized tasks under 90 minutes have a 91% day-of-assignment completion velocity.
                  </p>
                  <div className="mt-space-sm grid grid-cols-1 sm:grid-cols-2 gap-space-md pt-space-xs">
                    <div className="bg-surface-container-low p-space-md flex flex-col gap-space-xs border border-border-hairline">
                      <span className="font-label-md text-label-md text-ink-muted uppercase">Macro Blocks (&gt;4h)</span>
                      <span className="font-headline-md text-headline-md text-status-alert">6.8 days</span>
                      <span className="font-body-md text-body-md text-ink-secondary">
                        Average completion span with heavy delay risk
                      </span>
                    </div>
                    <div className="bg-surface-cream p-space-md flex flex-col gap-space-xs border border-border-hairline">
                      <span className="font-label-md text-label-md text-ink-muted uppercase">Micro Slices (&lt;2h)</span>
                      <span className="font-headline-md text-headline-md text-ink-primary">4.7 days</span>
                      <span className="font-body-md text-body-md text-ink-secondary">
                        Predictable delivery with zero weekend encroachment
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Historical Accuracy Table */}
          <section className="w-full bg-surface-container-low py-space-xl border-t border-border-hairline">
            <div className="px-margin-mobile md:px-margin-tablet lg:px-margin flex flex-col gap-space-lg">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
                <div className="flex flex-col gap-space-xs max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-label-md text-label-md text-ink-muted uppercase tracking-widest">
                      Historical Accuracy
                    </span>
                    <span className="font-label-md text-[10px] text-ink-primary bg-surface-cream px-1.5 py-0.5 border border-border-hairline">
                      [OBSERVED FACTS]
                    </span>
                  </div>
                  <h3 className="font-headline-lg text-headline-lg text-ink-primary">Weekly Velocity Comparison</h3>
                  <p className="font-body-md text-body-md text-ink-secondary">
                    Estimated vs. actual duration across your 8 most recent completed deliverables.
                  </p>
                </div>
                <div className="flex items-baseline gap-space-xs bg-surface-cream px-space-md py-space-sm rounded-none border border-border-hairline">
                  <span className="font-headline-md text-headline-md text-ink-primary font-semibold">72% → 88%</span>
                  <span className="font-label-md text-label-md text-ink-muted ml-space-xs">
                    accuracy gain over 4 weeks
                  </span>
                </div>
              </div>

              <div className="flex flex-col w-full">
                <div className="grid grid-cols-12 py-space-xs text-ink-muted font-label-md text-label-md border-b border-border-hairline">
                  <div className="col-span-5 md:col-span-4">Project Scope</div>
                  <div className="col-span-3 md:col-span-2 text-right">Planned</div>
                  <div className="col-span-3 md:col-span-2 text-right">Actual</div>
                  <div className="hidden md:block md:col-span-3 text-right">Variance</div>
                  <div className="col-span-1 text-right">State</div>
                </div>

                {velocityHistory.map((row) => (
                  <div
                    key={row.title}
                    className="grid grid-cols-12 py-space-md items-center border-b border-border-hairline hover:bg-surface-cream/50 transition-colors"
                  >
                    <div className="col-span-5 md:col-span-4 flex flex-col">
                      <span className="font-headline-md text-headline-md text-ink-primary text-base md:text-headline-md">
                        {row.title}
                      </span>
                      <span className="font-body-md text-body-md text-ink-muted text-xs md:text-body-md">
                        {row.category}
                      </span>
                    </div>
                    <div className="col-span-3 md:col-span-2 text-right font-body-lg text-body-lg text-ink-secondary">
                      {row.planned}
                    </div>
                    <div className="col-span-3 md:col-span-2 text-right font-body-lg text-body-lg text-ink-primary font-medium">
                      {row.actual}
                    </div>
                    <div className={`hidden md:block md:col-span-3 text-right font-label-lg text-label-lg ${row.varianceColor}`}>
                      {row.variance}
                    </div>
                    <div className="col-span-1 text-right">
                      <span className="material-symbols-outlined text-ink-secondary text-[18px]">check_circle</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-space-sm flex flex-col md:flex-row justify-between items-baseline gap-space-xs text-ink-muted font-body-md text-body-md">
                <span>Displaying latest 5 of 8 completed deliverables for Cycle 08.</span>
                <button
                  onClick={() => showToast('Full chronological archive export prepared.')}
                  className="text-ink-primary hover:text-accent-terracotta underline font-label-lg text-label-lg cursor-pointer"
                >
                  View full chronological archive →
                </button>
              </div>
            </div>
          </section>

          {/* Discipline & Rest: Boundary Integrity */}
          <section className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin py-space-xl">
            <div className="flex flex-col gap-space-lg">
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center gap-2">
                  <span className="font-label-md text-label-md text-ink-muted uppercase tracking-widest">
                    Discipline &amp; Rest
                  </span>
                  <span className="font-label-md text-[10px] text-ink-primary bg-surface-cream px-1.5 py-0.5 border border-border-hairline">
                    [OBSERVED BOUNDARIES]
                  </span>
                </div>
                <h3 className="font-headline-lg text-headline-lg text-ink-primary">Habit &amp; Boundary Integrity</h3>
                <p className="font-body-md text-body-md text-ink-secondary max-w-xl">
                  Sustainable pace is not incidental; it is protected. These signals reflect your boundary enforcement against cognitive burnout.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
                <div className="p-space-lg bg-surface-cream rounded-none flex flex-col justify-between gap-space-lg border border-border-hairline">
                  <div className="flex flex-col gap-space-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-label-md text-label-md text-ink-muted uppercase">Threshold Metric</span>
                      <span className="inline-flex items-center gap-1 font-label-md text-label-md text-ink-primary font-medium">
                        <span className="material-symbols-outlined text-[16px] text-accent-terracotta">nights_stay</span>
                        Healthy Boundary
                      </span>
                    </div>
                    <h4 className="font-headline-md text-headline-md text-ink-primary mt-space-xs">
                      Protected Evening Sanctuary
                    </h4>
                    <p className="font-body-md text-body-md text-ink-secondary mt-space-xs">
                      Laptops closed and work threads terminated before 19:30. Zero emergency syncs logged during off-hours.
                    </p>
                  </div>
                  <div className="flex items-baseline justify-between pt-space-md border-t border-border-hairline">
                    <span className="font-numeric-hero text-numeric-hero font-medium text-ink-primary">92%</span>
                    <span className="font-label-lg text-label-lg text-ink-secondary">26 of 28 evenings guarded</span>
                  </div>
                </div>

                <div className="p-space-lg bg-surface-cream rounded-none flex flex-col justify-between gap-space-lg border border-border-hairline">
                  <div className="flex flex-col gap-space-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-label-md text-label-md text-ink-muted uppercase">Risk Equilibrium</span>
                      <span className="inline-flex items-center gap-1 font-label-md text-label-md text-ink-primary font-medium">
                        <span className="material-symbols-outlined text-[16px] text-accent-terracotta">shield</span>
                        Intact Defenses
                      </span>
                    </div>
                    <h4 className="font-headline-md text-headline-md text-ink-primary mt-space-xs">
                      Buffer Margin Preservation
                    </h4>
                    <p className="font-body-md text-body-md text-ink-secondary mt-space-xs">
                      Deliverables retained at least 15% slack capacity before actual deadline delivery, preventing eleventh-hour fire drills.
                    </p>
                  </div>
                  <div className="flex items-baseline justify-between pt-space-md border-t border-border-hairline">
                    <span className="font-numeric-hero text-numeric-hero font-medium text-accent-terracotta">0</span>
                    <span className="font-label-lg text-label-lg text-ink-secondary">crises in the past 21 days</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Adaptive Parameters Footer Callout */}
          <section className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin py-space-xl border-t border-border-hairline">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-center">
              <div className="md:col-span-8 flex flex-col gap-space-xs">
                <div className="flex items-center gap-2">
                  <h4 className="font-headline-md text-headline-md text-ink-primary">
                    Apply learnings to next week’s schedule?
                  </h4>
                  <span className="font-label-md text-[10px] text-accent-terracotta bg-surface-cream px-1.5 py-0.5 border border-border-hairline">
                    [AI REBALANCING]
                  </span>
                </div>
                <p className="font-body-md text-body-md text-ink-secondary">
                  Deadline Radar can automatically expand code deliverable buffers by 12% and cluster deep work blocks into your 09:30–12:30 prime window.
                </p>
              </div>
              <div className="md:col-span-4 flex md:justify-end gap-space-sm pt-space-sm md:pt-0">
                <button
                  onClick={() => showToast('Adaptive parameters adopted for upcoming planning cycle.')}
                  className="bg-ink-primary hover:bg-accent-terracotta text-canvas-paper px-space-lg py-space-sm font-label-lg text-label-lg transition-colors duration-200 cursor-pointer rounded-none"
                >
                  Adopt Adaptive Parameters
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-ink-primary text-canvas-paper px-space-md py-space-sm rounded-none flex items-center gap-space-xs border border-border-hairline transition-all duration-300">
          <span className="material-symbols-outlined text-[18px] text-accent-terracotta">check_circle</span>
          <span className="font-label-md text-label-md">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
