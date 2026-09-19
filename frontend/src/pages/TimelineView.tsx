import React, { useState } from 'react';
import { SubNavigation } from '../components/layout/SubNavigation';

export const TimelineView: React.FC = () => {
  const [horizonScope, setHorizonScope] = useState<'this-week' | 'next-week' | '14-day'>('14-day');

  return (
    <div className="w-full flex flex-col min-h-screen bg-surface">
      {/* Sub-Navigation Strip */}
      <SubNavigation
        items={[
          { label: 'Planning', path: '/planning' },
          { label: 'Timeline', path: '/timeline', indicator: true },
          { label: 'Calendar', path: '/calendar' },
          { label: 'Workload', path: '/workload' },
        ]}
        statusText="14-Day Temporal Horizon"
        rightContent={
          <div className="flex items-center bg-surface-tint/20 p-0.5 border border-border-hairline">
            <button
              onClick={() => setHorizonScope('this-week')}
              className={`px-space-sm py-1 font-label-md text-label-md transition-colors ${
                horizonScope === 'this-week'
                  ? 'bg-canvas-paper text-ink-primary font-semibold border-b-2 border-ink-primary'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setHorizonScope('next-week')}
              className={`px-space-sm py-1 font-label-md text-label-md transition-colors ${
                horizonScope === 'next-week'
                  ? 'bg-canvas-paper text-ink-primary font-semibold border-b-2 border-ink-primary'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              Next Week
            </button>
            <button
              onClick={() => setHorizonScope('14-day')}
              className={`px-space-sm py-1 font-label-md text-label-md transition-colors ${
                horizonScope === '14-day'
                  ? 'bg-canvas-paper text-ink-primary font-semibold border-b-2 border-ink-primary'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              14-Day Horizon
            </button>
          </div>
        }
      />

      {/* Header Section: Editorial Contrast & Scale */}
      <div className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin pt-space-xl pb-space-lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-end">
          <div className="lg:col-span-8 flex flex-col gap-space-xs">
            <div className="flex items-center gap-space-xs text-ink-muted">
              <span className="font-label-md text-label-md uppercase tracking-wider">
                Temporal Projection
              </span>
              <span className="text-border-hairline">•</span>
              <span className="font-label-md text-label-md">Oct 16 — Oct 29, 2026</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-ink-primary tracking-tight">
              Timeline
            </h1>
            <p className="font-body-xl text-body-xl text-ink-secondary max-w-2xl mt-space-xs">
              A calm, temporal flow of commitments, focus blocks, and immovable deadlines across the
              next fourteen days.
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col lg:items-end justify-end gap-space-xs">
            <div className="flex items-center gap-space-md">
              <div className="flex flex-col text-left lg:text-right">
                <span className="font-numeric-hero-mobile text-numeric-hero-mobile text-ink-primary leading-none font-medium">
                  38.5h
                </span>
                <span className="font-label-md text-label-md text-ink-muted mt-1">
                  Committed Focus
                </span>
              </div>
              <div className="w-px h-10 bg-border-hairline" />
              <div className="flex flex-col text-left lg:text-right">
                <span className="font-numeric-hero-mobile text-numeric-hero-mobile text-accent-terracotta leading-none font-medium">
                  3
                </span>
                <span className="font-label-md text-label-md text-ink-muted mt-1">
                  Immovable Gates
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Temporal Flow Legend */}
      <div className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin pb-space-md">
        <div className="bg-surface-cream p-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-md border border-border-hairline">
          <div className="flex flex-wrap items-center gap-space-lg">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-accent-terracotta shrink-0" />
              <span className="font-label-md text-label-md text-ink-primary">
                Hard Deadline (Firm Closure)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-ink-primary shrink-0" />
              <span className="font-label-md text-label-md text-ink-primary">
                Dedicated Focus Block
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-surface-dim shrink-0" />
              <span className="font-label-md text-label-md text-ink-secondary">
                Sanctuary / Protected Non-Work
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-status-warning text-base">
                warning
              </span>
              <span className="font-label-md text-label-md text-status-warning">
                Tight Execution Window
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-label-md text-label-md text-ink-muted">Dependency Logic:</span>
            <span className="font-label-md text-label-md text-ink-primary font-medium">
              Sequential Gate → Deliverable
            </span>
          </div>
        </div>
      </div>

      {/* Editorial Timeline Stream */}
      <div className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin pb-space-2xl">
        <div className="flex flex-col">
          {/* Week 1 Identifier Banner */}
          <div className="py-space-sm bg-surface-container-low px-space-md flex items-center justify-between mb-2 border-y border-border-hairline">
            <span className="font-label-lg text-label-lg text-ink-primary uppercase tracking-wider font-semibold">
              Week 42 · Critical Path Active
            </span>
            <span className="font-label-md text-label-md text-ink-muted">
              4 Deadlines · 22.5 Focus Hours Scheduled
            </span>
          </div>

          {/* Monday Oct 16 */}
          <div className="py-space-md px-space-md bg-canvas-paper hover:bg-surface-cream transition-colors duration-150 flex flex-col md:flex-row md:items-center justify-between gap-space-md opacity-60 border-b border-border-hairline">
            <div className="flex items-start md:items-center gap-space-lg min-w-[200px]">
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-ink-muted uppercase">Mon</span>
                <span className="font-headline-md text-headline-md text-ink-primary">Oct 16</span>
              </div>
              <span className="font-label-md text-label-md text-ink-muted italic">Historical</span>
            </div>
            <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-space-md">
              <div className="flex flex-col">
                <span className="font-headline-md text-headline-md text-ink-secondary line-through">
                  Literature Review &amp; Indexing
                </span>
                <span className="font-body-md text-body-md text-ink-muted">
                  Academic Synthesis · Completed 3.0h
                </span>
              </div>
              <span className="font-label-md text-label-md text-ink-muted">Archived</span>
            </div>
          </div>

          {/* Tuesday Oct 17 */}
          <div className="py-space-md px-space-md bg-canvas-paper hover:bg-surface-cream transition-colors duration-150 flex flex-col md:flex-row md:items-center justify-between gap-space-md opacity-60 border-b border-border-hairline">
            <div className="flex items-start md:items-center gap-space-lg min-w-[200px]">
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-ink-muted uppercase">Tue</span>
                <span className="font-headline-md text-headline-md text-ink-primary">Oct 17</span>
              </div>
              <span className="font-label-md text-label-md text-ink-muted italic">Historical</span>
            </div>
            <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-space-md">
              <div className="flex flex-col">
                <span className="font-headline-md text-headline-md text-ink-secondary line-through">
                  Vector Index Ingestion Benchmarking
                </span>
                <span className="font-body-md text-body-md text-ink-muted">
                  Core Infrastructure · Completed 4.5h
                </span>
              </div>
              <span className="font-label-md text-label-md text-ink-muted">Archived</span>
            </div>
          </div>

          {/* Wednesday Oct 18 (Today) */}
          <div className="py-space-lg px-space-md bg-surface-cream relative transition-colors duration-150 flex flex-col md:flex-row md:items-start justify-between gap-space-md border-b border-border-hairline">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-ink-primary" />
            <div className="flex items-start gap-space-lg min-w-[200px]">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-label-md text-label-md text-accent-terracotta uppercase font-bold tracking-wider">
                    Today
                  </span>
                  <span className="w-2 h-2 bg-accent-terracotta animate-pulse motion-reduce:animate-none" />
                </div>
                <span className="font-headline-lg text-headline-lg text-ink-primary">
                  Wed Oct 18
                </span>
                <span className="font-label-md text-label-md text-ink-muted mt-1">
                  Available: 2h 15m
                </span>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-space-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between p-space-sm bg-canvas-paper border border-border-hairline">
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-ink-primary text-xl">
                    check_circle
                  </span>
                  <div className="flex flex-col">
                    <span className="font-headline-md text-headline-md text-ink-primary">
                      Lecture Notes Review
                    </span>
                    <span className="font-body-md text-body-md text-ink-secondary">
                      Cognitive Neuroscience module 4
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-space-md mt-space-xs md:mt-0">
                  <span className="font-label-md text-label-md text-ink-muted">Due Tonight · 45m</span>
                  <span className="font-label-md text-label-md bg-surface-tint text-ink-primary px-2 py-0.5">
                    Complete
                  </span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between p-space-sm bg-canvas-paper border border-border-hairline">
                <div className="flex items-center gap-space-sm">
                  <span className="w-2 h-2 bg-ink-primary shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-headline-md text-headline-md text-ink-primary">
                      Drafting Neural Network Pipeline
                    </span>
                    <span className="font-body-md text-body-md text-ink-secondary">
                      Preparatory for Friday ML Milestone
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-space-md mt-space-xs md:mt-0">
                  <span className="font-label-md text-label-md text-ink-secondary">
                    19:30 — 21:00 (1.5h)
                  </span>
                  <span className="font-label-md text-label-md text-ink-muted">In Progress</span>
                </div>
              </div>
            </div>
          </div>

          {/* Thursday Oct 19 */}
          <div className="py-space-lg px-space-md bg-canvas-paper hover:bg-surface-cream transition-colors duration-150 flex flex-col md:flex-row md:items-start justify-between gap-space-md border-b border-border-hairline">
            <div className="flex items-start gap-space-lg min-w-[200px]">
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-ink-muted uppercase">Thu</span>
                <span className="font-headline-md text-headline-md text-ink-primary">Oct 19</span>
                <span className="font-label-md text-label-md text-ink-muted mt-1">
                  5.5h Focus Capacity
                </span>
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-space-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between py-space-xs">
                <div className="flex items-start gap-space-sm">
                  <span className="w-2 h-2 bg-ink-primary mt-2 shrink-0" />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-space-xs">
                      <span className="font-headline-md text-headline-md text-ink-primary">
                        Focus Block: ML Assignment Modeling
                      </span>
                      <span className="font-label-md text-label-md bg-surface-container-high px-2 py-0.5 text-ink-secondary">
                        09:00 — 11:30
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-ink-secondary max-w-xl mt-0.5">
                      Hyperparameter tuning &amp; validation folds run. Must yield final weights to
                      unblock tomorrow&apos;s writeup.
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5 text-accent-terracotta">
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      <span className="font-label-md text-label-md font-medium">
                        Unlocks Fri Oct 20 Submission at 17:00
                      </span>
                    </div>
                  </div>
                </div>
                <span className="font-numeric-hero-mobile text-2xl text-ink-primary font-light">
                  2.5h
                </span>
              </div>

              <div className="h-px w-full bg-border-hairline" />

              <div className="flex flex-col md:flex-row md:items-center justify-between py-space-xs">
                <div className="flex items-center gap-space-sm">
                  <span className="w-2 h-2 bg-surface-dim shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-headline-md text-headline-md text-ink-secondary">
                      Personal Sanctuary: Physical Training
                    </span>
                    <span className="font-body-md text-body-md text-ink-muted">
                      Weight room &amp; recovery protocol · Preserved slot
                    </span>
                  </div>
                </div>
                <span className="font-label-md text-label-md text-ink-muted">17:30 — 19:00</span>
              </div>
            </div>
          </div>

          {/* Friday Oct 20 */}
          <div className="py-space-lg px-space-md bg-canvas-paper hover:bg-surface-cream transition-colors duration-150 flex flex-col md:flex-row md:items-start justify-between gap-space-md border-b border-border-hairline">
            <div className="flex items-start gap-space-lg min-w-[200px]">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-label-md text-label-md text-status-warning uppercase font-bold tracking-wider">
                    Tight Window
                  </span>
                  <span className="w-2 h-2 bg-status-warning" />
                </div>
                <span className="font-headline-lg text-headline-lg text-ink-primary">
                  Fri Oct 20
                </span>
                <span className="font-label-md text-label-md text-status-warning mt-1">
                  Margin: 45 min slack
                </span>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-space-md">
              <div className="bg-surface-container-low p-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-md border border-border-hairline">
                <div className="flex items-start gap-space-sm">
                  <span className="w-2.5 h-2.5 bg-accent-terracotta mt-1.5 shrink-0" />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-headline-md text-headline-md text-ink-primary">
                        Machine Learning Assignment
                      </span>
                      <span className="font-label-md text-label-md bg-accent-terracotta text-canvas-paper px-2 py-0.5 font-medium">
                        Immovable Gate
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-ink-secondary mt-1">
                      Submission portal cuts off strictly at 17:00. Requires PDF paper &amp; Jupyter
                      notebook execution traces.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col md:items-end shrink-0">
                  <span className="font-headline-md text-headline-md text-accent-terracotta font-semibold">
                    Due 17:00
                  </span>
                  <span className="font-label-md text-label-md text-ink-muted">
                    Depends on Thu 11:30 tuning
                  </span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between py-space-xs px-space-xs">
                <div className="flex items-center gap-space-sm">
                  <span className="w-2 h-2 bg-ink-primary shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-headline-md text-headline-md text-ink-primary">
                      Focus: FastAPI Microservice Endpoints
                    </span>
                    <span className="font-body-md text-body-md text-ink-secondary">
                      Async schema migrations &amp; routing verification
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-space-md mt-space-xs md:mt-0">
                  <span className="font-label-md text-label-md text-ink-secondary">
                    09:30 — 12:30
                  </span>
                  <span className="font-numeric-hero-mobile text-2xl text-ink-primary font-light">
                    3.0h
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Saturday Oct 21 */}
          <div className="py-space-md px-space-md bg-canvas-paper hover:bg-surface-cream transition-colors duration-150 flex flex-col md:flex-row md:items-center justify-between gap-space-md border-b border-border-hairline">
            <div className="flex items-start md:items-center gap-space-lg min-w-[200px]">
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-ink-muted uppercase">Sat</span>
                <span className="font-headline-md text-headline-md text-ink-primary">Oct 21</span>
              </div>
              <span className="font-label-md text-label-md text-ink-secondary bg-surface-cream px-2 py-0.5">
                Protected Day
              </span>
            </div>
            <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-space-md">
              <div className="flex items-center gap-space-sm">
                <span className="w-2 h-2 bg-ink-secondary shrink-0" />
                <div className="flex flex-col">
                  <span className="font-headline-md text-headline-md text-ink-primary">
                    Staging PyTest Integration Suite
                  </span>
                  <span className="font-body-md text-body-md text-ink-secondary">
                    Voluntary catch-up buffer to protect Sunday peace
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-space-md">
                <span className="font-label-md text-label-md text-ink-muted">
                  Morning execution
                </span>
                <span className="font-numeric-hero-mobile text-2xl text-ink-primary font-light">
                  3.0h
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grounding Photographic Plate */}
      <section className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin pb-space-2xl">
        <div className="max-w-7xl mx-auto border border-border-hairline">
          <img
            src="/assets/timeline-studio.jpg"
            alt="Monochrome fine-art architectural photography of an open studio desk"
            className="w-full h-72 md:h-80 object-cover"
          />
          <div className="p-space-xs bg-surface-cream/60 flex justify-between items-center font-label-md text-label-md text-ink-muted">
            <span>Plate 05 — The Architecture of Intentional Flow</span>
            <span className="font-mono uppercase">Horizon Week 42</span>
          </div>
        </div>
      </section>
    </div>
  );
};
