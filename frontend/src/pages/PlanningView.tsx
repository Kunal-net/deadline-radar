import React, { useState } from 'react';
import { SubNavigation } from '../components/layout/SubNavigation';
import { MOCK_CAPACITY_METRIC } from '../mocks/mockData';
import { usePlanAIAssist } from '../services/apiHooks';

export const PlanningView: React.FC = () => {
  const [naturalAdjustment, setNaturalAdjustment] = useState('');
  const [adjustmentToast, setAdjustmentToast] = useState<string | null>(null);

  const { data: aiPlanAssist } = usePlanAIAssist();

  const handleAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!naturalAdjustment.trim()) return;
    setAdjustmentToast(`Re-allocated focus blocks for "${naturalAdjustment.trim()}". Buffer maintained.`);
    setNaturalAdjustment('');
    setTimeout(() => setAdjustmentToast(null), 4000);
  };

  return (
    <div className="w-full flex flex-col min-h-screen bg-canvas-paper">
      {/* Sub-Navigation */}
      <SubNavigation
        items={[
          { label: 'Planning', path: '/planning', indicator: true },
          { label: 'Timeline', path: '/timeline' },
          { label: 'Calendar', path: '/calendar' },
          { label: 'Workload', path: '/workload' },
        ]}
        statusText="Current Sprint: Week 42 (Oct 16 – 22)"
      />

      {/* Top Breathing Space & Editorial Statement */}
      <section className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin pt-space-lg md:pt-space-xl pb-space-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-space-xs mb-space-sm">
            <span className="w-1.5 h-1.5 bg-accent-terracotta inline-block" />
            <span className="font-label-md text-label-md uppercase tracking-widest text-ink-muted">
              Weekly Capacity &amp; Planning · Week {MOCK_CAPACITY_METRIC.weekNumber}
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-baseline">
            <div className="lg:col-span-8">
              <h1 className="font-display-hero text-display-hero text-ink-primary tracking-tight max-w-4xl">
                Plan around the life you actually live.
              </h1>
              <p className="font-body-xl text-body-xl text-ink-secondary mt-space-md max-w-3xl leading-relaxed">
                You have{' '}
                <span className="text-ink-primary font-medium">
                  {MOCK_CAPACITY_METRIC.availableFocusHours} hours
                </span>{' '}
                of suitable focus across the next 5 days.{' '}
                <span className="text-ink-primary font-medium">
                  {MOCK_CAPACITY_METRIC.committedWorkHours} hours
                </span>{' '}
                are committed to deliverables, with{' '}
                <span className="text-accent-terracotta font-medium">
                  {MOCK_CAPACITY_METRIC.netBufferHours.toFixed(1)} hours reserved as margin
                </span>
                .
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col justify-end lg:pl-space-md lg:border-l border-border-hairline">
              <div className="font-label-md text-label-md uppercase text-ink-muted mb-space-xs tracking-wider">
                Allocation Status
              </div>
              <div className="flex items-center gap-space-xs text-ink-primary font-body-md">
                <span className="material-symbols-outlined text-accent-terracotta text-body-lg">
                  verified
                </span>
                <span>Balanced load · Zero overlap hazard</span>
              </div>
              <p className="font-body-md text-body-md text-ink-muted mt-space-xs">
                Personal boundaries are sealed before any work commitment is scheduled.
              </p>
            </div>
          </div>

          {/* Minimal Numeric Stream */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter mt-space-xl pt-space-lg border-t border-border-hairline">
            <div className="flex flex-col">
              <span className="font-label-md text-label-md uppercase tracking-wider text-ink-muted">
                Available Focus
              </span>
              <div className="font-numeric-hero text-numeric-hero text-ink-primary mt-space-xs">
                {MOCK_CAPACITY_METRIC.availableFocusHours}
                <span className="font-label-lg text-label-lg ml-1 text-ink-secondary">hrs</span>
              </div>
              <span className="font-body-md text-body-md text-ink-muted mt-0.5">
                High-energy daytime windows
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md uppercase tracking-wider text-ink-muted">
                Committed Effort
              </span>
              <div className="font-numeric-hero text-numeric-hero text-ink-primary mt-space-xs">
                {MOCK_CAPACITY_METRIC.committedWorkHours}
                <span className="font-label-lg text-label-lg ml-1 text-ink-secondary">hrs</span>
              </div>
              <span className="font-body-md text-body-md text-ink-muted mt-0.5">
                3 active assignments mapped
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md uppercase tracking-wider text-accent-terracotta">
                Buffer Margin
              </span>
              <div className="font-numeric-hero text-numeric-hero text-accent-terracotta mt-space-xs">
                {MOCK_CAPACITY_METRIC.netBufferHours.toFixed(1)}
                <span className="font-label-lg text-label-lg ml-1 text-accent-terracotta">hrs</span>
              </div>
              <span className="font-body-md text-body-md text-ink-muted mt-0.5">
                Friction absorption reserve
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md uppercase tracking-wider text-ink-muted">
                Protected Personal
              </span>
              <div className="font-numeric-hero text-numeric-hero text-ink-primary mt-space-xs">
                16.0
                <span className="font-label-lg text-label-lg ml-1 text-ink-secondary">hrs</span>
              </div>
              <span className="font-body-md text-body-md text-ink-muted mt-0.5">
                Rest, exercise &amp; dinner blocks
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Photographic Plate Section */}
      <section className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin my-space-lg">
        <div className="max-w-7xl mx-auto">
          <div className="relative w-full h-[320px] md:h-[460px] overflow-hidden bg-surface-container border border-border-hairline">
            <img
              src="/assets/planning-architect-desk.jpg"
              alt="Editorial overhead photograph of an architect workspace desk"
              className="w-full h-full object-cover object-center grayscale contrast-[1.05] brightness-95 hover:scale-[1.01] transition-transform duration-700 ease-out"
            />
          </div>
          <div className="mt-space-xs flex justify-between items-baseline border-b border-border-hairline pb-space-sm">
            <p className="font-label-md text-label-md text-ink-muted max-w-3xl">
              <strong className="text-ink-secondary font-medium">Figure 03 — Planning &amp; Margin.</strong>{' '}
              A week scheduled to 100% capacity guarantees slippage. Uncommitted space absorbs friction,
              sickness, and sudden revisions without compromising deliverable dates.
            </p>
            <span className="font-label-md text-label-md text-ink-muted whitespace-nowrap pl-space-md">
              Oct 16 – Oct 22
            </span>
          </div>
        </div>
      </section>

      {/* Split Editorial Layout */}
      <section className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin py-space-xl">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Main Content: Focus Windows (8 Cols) */}
          <div className="lg:col-span-8">
            <div className="mb-space-lg">
              <div className="flex items-center gap-space-xs mb-space-xs">
                <span className="w-1.5 h-1.5 bg-ink-primary inline-block" />
                <span className="font-label-md text-label-md uppercase tracking-wider text-ink-muted">
                  Calibrated Timetable
                </span>
              </div>
              <h2 className="font-headline-xl text-headline-xl text-ink-primary">
                Suggested Focus Windows
              </h2>
              <p className="font-body-lg text-body-lg text-ink-secondary mt-space-xs">
                Chronological focus blocks tailored to your active work and natural circadian energy.
              </p>
            </div>

            <div className="divide-y divide-border-hairline border-t border-b border-border-hairline">
              {/* Block 1 */}
              <div className="group py-space-md transition-colors duration-200 hover:bg-surface-cream px-space-xs flex flex-col md:flex-row md:items-baseline justify-between gap-space-sm cursor-pointer">
                <div className="md:w-3/12 shrink-0">
                  <div className="font-headline-md text-headline-md text-ink-primary">Thursday</div>
                  <div className="font-label-lg text-label-lg text-ink-muted mt-0.5">09:00 – 11:30</div>
                  <span className="inline-block mt-space-xs font-label-md text-label-md uppercase tracking-wider text-ink-secondary bg-surface-container px-2 py-0.5">
                    2.5 hrs deep focus
                  </span>
                </div>
                <div className="md:w-6/12">
                  <div className="flex items-center gap-space-xs">
                    <span className="w-1.5 h-1.5 bg-accent-terracotta inline-block" />
                    <h3 className="font-headline-md text-headline-md text-ink-primary group-hover:text-accent-terracotta transition-colors">
                      Machine Learning Assignment
                    </h3>
                  </div>
                  <p className="font-body-md text-body-md text-ink-secondary mt-space-xs">
                    Model evaluation, validation confusion matrix, and loss curve analysis prior to
                    Friday submission deadline.
                  </p>
                </div>
                <div className="md:w-3/12 md:text-right flex md:flex-col justify-between items-end">
                  <span className="font-label-md text-label-md text-ink-muted">
                    High Circadian Band
                  </span>
                  <span className="font-label-lg text-label-lg text-ink-primary underline underline-offset-4 decoration-border-hairline group-hover:decoration-ink-primary transition-all mt-space-xs">
                    Modify →
                  </span>
                </div>
              </div>

              {/* Block 2 */}
              <div className="group py-space-md transition-colors duration-200 hover:bg-surface-cream px-space-xs flex flex-col md:flex-row md:items-baseline justify-between gap-space-sm cursor-pointer">
                <div className="md:w-3/12 shrink-0">
                  <div className="font-headline-md text-headline-md text-ink-primary">Thursday</div>
                  <div className="font-label-lg text-label-lg text-ink-muted mt-0.5">14:00 – 15:30</div>
                  <span className="inline-block mt-space-xs font-label-md text-label-md uppercase tracking-wider text-ink-secondary bg-surface-container px-2 py-0.5">
                    1.5 hrs sprint
                  </span>
                </div>
                <div className="md:w-6/12">
                  <div className="flex items-center gap-space-xs">
                    <span className="w-1.5 h-1.5 bg-ink-secondary inline-block" />
                    <h3 className="font-headline-md text-headline-md text-ink-primary group-hover:text-accent-terracotta transition-colors">
                      Review Lecture Notes
                    </h3>
                  </div>
                  <p className="font-body-md text-body-md text-ink-secondary mt-space-xs">
                    Synthesis and immediate submission buffer. Low resistance administrative task
                    suited for post-lunch energy dip.
                  </p>
                </div>
                <div className="md:w-3/12 md:text-right flex md:flex-col justify-between items-end">
                  <span className="font-label-md text-label-md text-ink-muted">Standard Energy</span>
                  <span className="font-label-lg text-label-lg text-ink-primary underline underline-offset-4 decoration-border-hairline group-hover:decoration-ink-primary transition-all mt-space-xs">
                    Modify →
                  </span>
                </div>
              </div>

              {/* Block 3 */}
              <div className="group py-space-md transition-colors duration-200 hover:bg-surface-cream px-space-xs flex flex-col md:flex-row md:items-baseline justify-between gap-space-sm cursor-pointer">
                <div className="md:w-3/12 shrink-0">
                  <div className="font-headline-md text-headline-md text-ink-primary">Friday</div>
                  <div className="font-label-lg text-label-lg text-ink-muted mt-0.5">09:30 – 12:30</div>
                  <span className="inline-block mt-space-xs font-label-md text-label-md uppercase tracking-wider text-ink-secondary bg-surface-container px-2 py-0.5">
                    3.0 hrs deep focus
                  </span>
                </div>
                <div className="md:w-6/12">
                  <div className="flex items-center gap-space-xs">
                    <span className="w-1.5 h-1.5 bg-accent-terracotta inline-block" />
                    <h3 className="font-headline-md text-headline-md text-ink-primary group-hover:text-accent-terracotta transition-colors">
                      FastAPI Microservice
                    </h3>
                  </div>
                  <p className="font-body-md text-body-md text-ink-secondary mt-space-xs">
                    Core endpoint scaffolding, asynchronous route handlers, and OpenAPI contract
                    validation.
                  </p>
                </div>
                <div className="md:w-3/12 md:text-right flex md:flex-col justify-between items-end">
                  <span className="font-label-md text-label-md text-ink-muted">
                    Peak Circadian Peak
                  </span>
                  <span className="font-label-lg text-label-lg text-ink-primary underline underline-offset-4 decoration-border-hairline group-hover:decoration-ink-primary transition-all mt-space-xs">
                    Modify →
                  </span>
                </div>
              </div>

              {/* Block 4: Protected Margin */}
              <div className="py-space-md px-space-xs bg-surface-container-low/60 flex flex-col md:flex-row md:items-baseline justify-between gap-space-sm border-l-2 border-accent-terracotta pl-space-xs">
                <div className="md:w-3/12 shrink-0">
                  <div className="font-headline-md text-headline-md text-accent-terracotta">
                    Friday
                  </div>
                  <div className="font-label-lg text-label-lg text-ink-muted mt-0.5">
                    Afternoon · Unscheduled
                  </div>
                  <span className="inline-block mt-space-xs font-label-md text-label-md uppercase tracking-wider text-canvas-paper bg-accent-terracotta px-2 py-0.5 font-medium">
                    Protected Margin
                  </span>
                </div>
                <div className="md:w-6/12">
                  <div className="flex items-center gap-space-xs">
                    <span className="w-1.5 h-1.5 bg-accent-terracotta inline-block" />
                    <h3 className="font-headline-md text-headline-md text-ink-primary">
                      Zero Work Commitments
                    </h3>
                  </div>
                  <p className="font-body-md text-body-md text-ink-secondary mt-space-xs">
                    Intentional air-gap. Reserved to absorb weekly runover, unbudgeted debugging, or
                    transition straight into the weekend unburdened.
                  </p>
                </div>
                <div className="md:w-3/12 md:text-right flex md:flex-col justify-between items-end">
                  <span className="font-label-md text-label-md text-accent-terracotta font-medium">
                    Protected Non-Negotiable
                  </span>
                  <span className="font-label-md text-label-md text-ink-muted mt-space-xs">
                    Auto-held buffer
                  </span>
                </div>
              </div>

              {/* Block 5 */}
              <div className="group py-space-md transition-colors duration-200 hover:bg-surface-cream px-space-xs flex flex-col md:flex-row md:items-baseline justify-between gap-space-sm cursor-pointer">
                <div className="md:w-3/12 shrink-0">
                  <div className="font-headline-md text-headline-md text-ink-primary">Saturday</div>
                  <div className="font-label-lg text-label-lg text-ink-muted mt-0.5">10:00 – 13:00</div>
                  <span className="inline-block mt-space-xs font-label-md text-label-md uppercase tracking-wider text-ink-secondary bg-surface-container px-2 py-0.5">
                    3.0 hrs deep focus
                  </span>
                </div>
                <div className="md:w-6/12">
                  <div className="flex items-center gap-space-xs">
                    <span className="w-1.5 h-1.5 bg-ink-secondary inline-block" />
                    <h3 className="font-headline-md text-headline-md text-ink-primary group-hover:text-accent-terracotta transition-colors">
                      FastAPI Staging &amp; PyTest
                    </h3>
                  </div>
                  <p className="font-body-md text-body-md text-ink-secondary mt-space-xs">
                    Integration tests execution, Docker containerization build tests, and staging
                    environment verification.
                  </p>
                </div>
                <div className="md:w-3/12 md:text-right flex md:flex-col justify-between items-end">
                  <span className="font-label-md text-label-md text-ink-muted">Morning Clarity</span>
                  <span className="font-label-lg text-label-lg text-ink-primary underline underline-offset-4 decoration-border-hairline group-hover:decoration-ink-primary transition-all mt-space-xs">
                    Modify →
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Protected Boundaries (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col justify-between pt-space-xs">
            <div>
              <div className="flex items-center gap-space-xs mb-space-xs">
                <span className="w-1.5 h-1.5 bg-accent-terracotta inline-block" />
                <span className="font-label-md text-label-md uppercase tracking-wider text-ink-muted">
                  Hard Non-Negotiables
                </span>
              </div>
              <h3 className="font-headline-lg text-headline-lg text-ink-primary">
                Protected Life &amp; Boundaries
              </h3>
              <p className="font-body-md text-body-md text-ink-secondary mt-space-xs">
                Personal time is sealed from work allocation automatically. Radar never schedules
                tasks into these sanctuaries.
              </p>

              <div className="mt-space-md space-y-space-md">
                <div className="border-b border-border-hairline pb-space-sm">
                  <div className="flex items-baseline justify-between">
                    <span className="font-headline-md text-headline-md text-ink-primary">
                      Sleep Baseline
                    </span>
                    <span className="font-label-lg text-label-lg text-ink-primary font-semibold">
                      8.0 hrs nightly
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-ink-muted mt-1">
                    23:00 to 07:00 permanently blacked out. Mental stamina prerequisite.
                  </p>
                </div>

                <div className="border-b border-border-hairline pb-space-sm">
                  <div className="flex items-baseline justify-between">
                    <span className="font-headline-md text-headline-md text-ink-primary">
                      Physical Training
                    </span>
                    <span className="font-label-lg text-label-lg text-ink-primary font-semibold">
                      1.5 hrs daily
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-ink-muted mt-1">
                    17:30 to 19:00. Strength, movement and physical reset buffer.
                  </p>
                </div>

                <div className="border-b border-border-hairline pb-space-sm">
                  <div className="flex items-baseline justify-between">
                    <span className="font-headline-md text-headline-md text-ink-primary">
                      Evenings Off
                    </span>
                    <span className="font-label-lg text-label-lg text-ink-primary font-semibold">
                      Thu &amp; Sat Locked
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-ink-muted mt-1">
                    Family dinner and social commitments. Zero notification dispatch.
                  </p>
                </div>

                <div className="bg-surface-cream p-space-md border border-border-hairline">
                  <div className="font-label-md text-label-md uppercase tracking-wider text-ink-muted mb-space-xs">
                    Integrity Rule
                  </div>
                  <p className="font-body-md text-body-md text-ink-primary italic">
                    “If a deliverable requires cutting sleep or non-negotiables, the deadline is
                    mathematically invalid, not your discipline.”
                  </p>
                </div>
              </div>
            </div>

            {/* 168 Hour Composition */}
            <div className="mt-space-xl pt-space-md border-t border-border-hairline">
              <div className="flex justify-between items-baseline mb-space-xs">
                <span className="font-label-md text-label-md uppercase tracking-wider text-ink-muted">
                  Weekly Equilibrium (168h Total)
                </span>
                <span className="font-label-md text-label-md text-ink-secondary">
                  Capacity: 78% Committed
                </span>
              </div>

              <svg
                className="w-full h-4"
                preserveAspectRatio="none"
                viewBox="0 0 100 8"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect fill="#57524D" height="8" width="33.3" x="0" y="0" />
                <rect fill="#8C827A" height="8" width="24.5" x="33.8" y="0" />
                <rect fill="#1A1715" height="8" width="8.6" x="58.8" y="0" />
                <rect fill="#C85A32" height="8" width="2.4" x="67.9" y="0" />
                <rect fill="#E4E2DD" height="8" width="29.2" x="70.8" y="0" />
              </svg>

              <div className="flex items-center justify-between text-ink-muted font-label-md text-label-md mt-space-xs flex-wrap gap-x-2">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-ink-secondary inline-block" /> Sleep (56h)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-ink-muted inline-block" /> Life (42h)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-ink-primary inline-block" /> Work (14.5h)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-accent-terracotta inline-block" /> Buffer (4h)
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Calibration & AI Schedule Advisory */}
      <section className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin pt-space-md pb-space-2xl bg-surface-cream/50 border-t border-border-hairline mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col gap-space-md">
          {/* AI Advisory Callout */}
          {aiPlanAssist && (
            <div className="max-w-4xl p-space-md bg-canvas-paper border border-border-hairline flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="w-1.5 h-1.5 bg-accent-terracotta inline-block" />
                  <span className="font-label-md text-label-md uppercase tracking-wider text-ink-muted">
                    AI Schedule Advisory
                  </span>
                  <span className="text-[10px] font-mono bg-surface-cream text-accent-terracotta px-1 py-0.5 border border-border-hairline ml-1">
                    AI INTERPRETATION
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-surface-cream font-label-md text-label-md text-ink-primary font-mono border border-border-hairline capitalize">
                  Load: {aiPlanAssist.pressure_tier}
                </span>
              </div>

              <p className="font-body-md text-body-md text-ink-primary font-medium">
                {aiPlanAssist.pace_advisory}
              </p>

              {aiPlanAssist.recommendations && aiPlanAssist.recommendations.length > 0 && (
                <ul className="text-xs text-ink-secondary list-disc pl-4 space-y-1 pt-1">
                  {aiPlanAssist.recommendations.map((rec: string, idx: number) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              )}

              <span className="text-[11px] text-ink-muted italic pt-1">
                Heuristic optimization proposal. You maintain complete calendar authority.
              </span>
            </div>
          )}

          <form onSubmit={handleAdjust} className="max-w-4xl flex flex-col gap-space-xs">
            <div className="flex items-center gap-space-xs mb-space-xs">
              <span className="w-1.5 h-1.5 bg-accent-terracotta inline-block" />
              <span className="font-label-md text-label-md uppercase tracking-wider text-ink-muted">
                Dynamic Calibration
              </span>
            </div>
            <h3 className="font-headline-lg text-headline-lg text-ink-primary">
              Need to adapt this distribution?
            </h3>
            <p className="font-body-md text-body-md text-ink-secondary mb-space-xs">
              Type natural shifts like &ldquo;Push Friday afternoon review to Saturday morning&rdquo;
            </p>
            <div className="relative w-full flex items-center">
              <input
                type="text"
                value={naturalAdjustment}
                onChange={(e) => setNaturalAdjustment(e.target.value)}
                placeholder="Adjust planning distribution..."
                className="w-full bg-transparent font-headline-md text-headline-md text-ink-primary placeholder:text-ink-muted/50 pb-space-xs focus:outline-none transition-colors border-b border-border-hairline"
              />
              <button
                type="submit"
                className="absolute right-0 bottom-space-xs p-1 text-ink-primary hover:text-accent-terracotta transition-colors"
              >
                <span className="material-symbols-outlined text-[24px]">arrow_forward</span>
              </button>
            </div>
            {adjustmentToast && (
              <div className="font-label-md text-label-md text-accent-terracotta font-semibold pt-space-xs animate-pulse">
                {adjustmentToast}
              </div>
            )}
          </form>
        </div>
      </section>
    </div>
  );
};
