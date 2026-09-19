import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SubNavigation } from '../components/layout/SubNavigation';

export const PrioritiesView: React.FC = () => {
  const navigate = useNavigate();
  const [isFocusActive, setIsFocusActive] = useState(false);

  return (
    <div className="w-full bg-surface min-h-screen">
      {/* Sub-Navigation Bar */}
      <SubNavigation
        items={[
          { label: 'Work Ledger', path: '/work', badge: '14' },
          { label: 'Priorities', path: '/priorities', badge: '4 Active', indicator: true },
          { label: 'Work Detail', path: '/work/w-01' },
        ]}
        rightContent={
          <div className="flex items-center gap-space-sm text-ink-muted font-label-md text-label-md">
            <span>Evaluated at 13:42 Today</span>
            <span className="w-1.5 h-1.5 bg-ink-muted/40" />
            <span className="text-ink-secondary">Natural Pacing Mode</span>
          </div>
        }
      />

      {/* Main Editorial Surface */}
      <div className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin pt-space-lg pb-space-2xl flex flex-col">
        {/* Header Block */}
        <header className="w-full max-w-4xl mb-space-xl">
          <div className="flex items-center gap-2 mb-space-xs">
            <span className="font-label-md text-label-md uppercase tracking-widest text-accent-terracotta">
              Attention Ledger · Stage 01
            </span>
            <span className="text-ink-muted">/</span>
            <span className="font-label-md text-label-md text-ink-secondary">Human-Calibrated Sequence</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-ink-primary mb-space-xs tracking-tight">
            Priorities
          </h1>
          <p className="font-body-xl text-body-xl text-ink-secondary leading-relaxed max-w-3xl">
            Clear, sequential recommendations based on deadline proximity, remaining effort, and unblocking downstream dependencies—grounded in real human capacity instead of opaque numerical scores.
          </p>
        </header>

        {/* Primary Decision Hero: Asymmetric Split (70/30) */}
        <section className="w-full mb-space-2xl bg-surface-container-low p-space-md md:p-space-lg lg:p-space-xl border border-border-hairline">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-stretch">
            {/* Left: Reasoning & Directive Action (8 cols) */}
            <div className="lg:col-span-8 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-space-sm mb-space-md">
                  <span className="inline-flex items-center gap-1.5 px-space-xs py-0.5 bg-accent-terracotta text-canvas-paper font-label-md text-label-md uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[14px]">bolt</span> Immediate Priority
                  </span>
                  <span className="font-label-lg text-label-lg text-ink-secondary">Due Friday · 17:00</span>
                  <span className="text-ink-muted hidden sm:inline">·</span>
                  <span className="font-label-lg text-label-lg text-accent-terracotta font-semibold">
                    Compute queue latency buffer recommended
                  </span>
                </div>
                <h2 className="font-display-hero text-display-hero-mobile sm:text-display-hero text-ink-primary mb-space-md tracking-tight">
                  Machine Learning Assignment
                </h2>
                <div className="bg-surface-cream/80 p-space-md mb-space-lg border border-border-hairline">
                  <span className="font-label-md text-label-md uppercase tracking-wider text-ink-muted block mb-1">
                    Human Reasoning
                  </span>
                  <p className="font-body-lg text-body-lg text-ink-primary leading-relaxed">
                    Due Friday at 17:00. Requires <strong className="font-semibold text-ink-primary">3.0 remaining hours</strong>. Starting during today’s afternoon window (14:00) gives you a full <span className="text-accent-terracotta font-medium">24-hour margin</span> before submission. This absorbs the known 90-minute server cluster queue delay without late penalty risk.
                  </p>
                </div>
              </div>

              {/* Direct Action Area */}
              <div className="flex flex-wrap items-center gap-space-md pt-space-xs">
                <button
                  onClick={() => setIsFocusActive(!isFocusActive)}
                  className={`inline-flex items-center gap-space-xs font-label-lg text-label-lg px-space-lg py-space-sm transition-colors duration-200 cursor-pointer rounded-none ${
                    isFocusActive
                      ? 'bg-accent-terracotta text-canvas-paper'
                      : 'bg-ink-primary hover:bg-accent-terracotta text-canvas-paper'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isFocusActive ? 'pause' : 'timelapse'}
                  </span>
                  <span>{isFocusActive ? 'Focus Block Active (01:59:58)' : 'Start 2-Hour Focus Block Now'}</span>
                  {!isFocusActive && <span>→</span>}
                </button>
                <button
                  onClick={() => navigate('/work/w-01')}
                  className="font-label-lg text-label-lg text-ink-secondary hover:text-ink-primary transition-colors py-space-sm px-space-xs flex items-center gap-1 cursor-pointer"
                >
                  <span>View assignment brief</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_outward</span>
                </button>
                <span
                  className={`w-full sm:w-auto font-label-md text-label-md ${
                    isFocusActive ? 'text-accent-terracotta font-medium' : 'text-ink-muted'
                  }`}
                >
                  {isFocusActive
                    ? 'Focus window active. Notifications silenced.'
                    : 'Target completion window: 16:00 today'}
                </span>
              </div>
            </div>

            {/* Right: Canonical Visual Plate & Context Metadata (4 cols) */}
            <div className="lg:col-span-4 flex flex-col justify-between bg-surface-cream p-space-md border border-border-hairline">
              <div className="w-full">
                <div className="w-full h-48 mb-space-sm overflow-hidden relative">
                  <img
                    alt="Focused deep work session workspace"
                    className="w-full h-full object-cover"
                    src="/assets/priorities-workspace.jpg"
                  />
                  <span className="absolute bottom-2 left-2 bg-ink-primary/90 text-canvas-paper px-2 py-0.5 font-label-md text-label-md">
                    Focus Track: Math &amp; Code
                  </span>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex items-baseline justify-between">
                    <span className="font-label-md text-label-md text-ink-muted">Estimated Effort</span>
                    <span className="font-headline-md text-headline-md text-ink-primary">
                      3.0 <span className="font-body-md text-body-md text-ink-secondary">hrs</span>
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="font-label-md text-label-md text-ink-muted">Remaining Window</span>
                    <span className="font-body-md text-body-md text-ink-primary font-medium">
                      27.5 hrs before hard cutoff
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="font-label-md text-label-md text-ink-muted">Safety Buffer</span>
                    <span className="font-body-md text-body-md text-accent-terracotta font-medium">
                      +24.5 hrs slack
                    </span>
                  </div>
                </div>
              </div>

              {/* Mini Inline SVG Micro-Chart: Effort Allocation Timeline */}
              <div className="pt-space-md mt-space-sm bg-surface-container-lowest p-3 border border-border-hairline">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-label-md text-label-md text-ink-secondary">Capacity Fit Today</span>
                  <span className="font-label-md text-label-md text-ink-primary font-medium">3h of 4.5h Free</span>
                </div>
                <svg className="w-full h-3" fill="none" viewBox="0 0 100 8" xmlns="http://www.w3.org/2000/svg">
                  <rect fill="#EFECE4" height="8" rx="1" width="100" />
                  <rect fill="#1A1715" height="8" rx="1" width="66" />
                  <rect fill="#C85A32" height="8" rx="1" width="22" x="66" />
                </svg>
                <div className="flex justify-between text-[11px] text-ink-muted mt-1.5 font-body-md">
                  <span>Block 1: 2.0h</span>
                  <span>Block 2: 1.0h</span>
                  <span>Reserve: 1.5h</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ordered Priority Stack Header */}
        <div className="w-full flex flex-col md:flex-row md:items-baseline justify-between gap-space-xs mb-space-md">
          <div>
            <span className="font-label-md text-label-md uppercase tracking-wider text-ink-muted block">The Queue</span>
            <h2 className="font-headline-lg text-headline-lg text-ink-primary">Ordered Priority Stack</h2>
          </div>
          <p className="font-body-md text-body-md text-ink-secondary max-w-md">
            Ranked not by emotional stress, but by the physical math of time, dependencies, and cognitive velocity.
          </p>
        </div>

        {/* Editorial Open List */}
        <div className="w-full flex flex-col mb-space-2xl border-t border-border-hairline">
          {/* Priority Item 1 */}
          <article className="group w-full py-space-md px-space-sm sm:px-space-md bg-surface-cream transition-colors duration-200 border-b border-border-hairline">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-y-3 md:gap-gutter items-center">
              <div className="md:col-span-2 flex items-baseline md:flex-col gap-2 md:gap-0">
                <span className="font-numeric-hero text-headline-xl text-accent-terracotta leading-none">01</span>
                <span className="font-label-md text-label-md uppercase tracking-widest text-accent-terracotta font-semibold">Immediate</span>
                <span className="font-label-md text-label-md text-ink-muted">Due Fri 17:00</span>
              </div>
              <div className="md:col-span-7 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h3
                    onClick={() => navigate('/work/w-01')}
                    className="font-headline-md text-headline-md text-ink-primary group-hover:text-accent-terracotta transition-colors cursor-pointer"
                  >
                    Machine Learning Assignment
                  </h3>
                  <span className="inline-block w-1.5 h-1.5 bg-accent-terracotta" title="High Urgency" />
                </div>
                <p className="font-body-md text-body-md text-ink-secondary leading-normal">
                  High urgency because compute queue clusters typically experience Friday afternoon throttles. Allocate 3.0h today to leave an unhurried 24-hour verification margin.
                </p>
                <div className="flex flex-wrap items-center gap-space-md text-ink-muted font-label-md text-label-md pt-1">
                  <span>Remaining: <strong className="text-ink-primary font-medium">3.0 hours</strong></span>
                  <span>·</span>
                  <span>Dependency: GPU Cluster Availability</span>
                  <span>·</span>
                  <span className="text-accent-terracotta">Needs action by 15:00</span>
                </div>
              </div>
              <div className="md:col-span-3 flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2">
                <div className="text-right">
                  <span className="font-label-md text-label-md block text-accent-terracotta font-semibold">High Urgency</span>
                  <span className="font-label-md text-label-md text-ink-muted">Buffer: 24h</span>
                </div>
                <button
                  onClick={() => navigate('/work/w-01')}
                  className="bg-ink-primary hover:bg-accent-terracotta text-canvas-paper font-label-lg text-label-lg px-space-md py-1.5 transition-colors duration-150 cursor-pointer rounded-none"
                >
                  Work on this →
                </button>
              </div>
            </div>
          </article>

          {/* Priority Item 2 */}
          <article className="group w-full py-space-md px-space-sm sm:px-space-md bg-canvas-paper hover:bg-surface-cream transition-colors duration-200 border-b border-border-hairline">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-y-3 md:gap-gutter items-center">
              <div className="md:col-span-2 flex items-baseline md:flex-col gap-2 md:gap-0">
                <span className="font-numeric-hero text-headline-xl text-ink-primary leading-none">02</span>
                <span className="font-label-md text-label-md uppercase tracking-widest text-ink-secondary font-semibold">Next in Queue</span>
                <span className="font-label-md text-label-md text-ink-muted">Due Sun 23:59</span>
              </div>
              <div className="md:col-span-7 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h3
                    onClick={() => navigate('/work/w-02')}
                    className="font-headline-md text-headline-md text-ink-primary group-hover:text-accent-terracotta transition-colors cursor-pointer"
                  >
                    FastAPI Microservice &amp; Database Migration
                  </h3>
                  <span className="inline-block w-1.5 h-1.5 bg-status-warning" title="Medium Urgency" />
                </div>
                <p className="font-body-md text-body-md text-ink-secondary leading-normal">
                  Medium urgency. Due Sunday midnight with 6.0h required. Optimal strategy is scaffolding database schema Friday morning (2.0h), avoiding a compressed weekend sprint.
                </p>
                <div className="flex flex-wrap items-center gap-space-md text-ink-muted font-label-md text-label-md pt-1">
                  <span>Remaining: <strong className="text-ink-primary font-medium">6.0 hours</strong></span>
                  <span>·</span>
                  <span>Recommended Start: Fri 09:30</span>
                  <span>·</span>
                  <span className="text-ink-secondary">Split over 2 sessions</span>
                </div>
              </div>
              <div className="md:col-span-3 flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2">
                <div className="text-right">
                  <span className="font-label-md text-label-md block text-ink-primary font-medium">Medium Urgency</span>
                  <span className="font-label-md text-label-md text-ink-muted">6.0h remaining</span>
                </div>
                <button
                  onClick={() => navigate('/calendar')}
                  className="border-b border-ink-primary hover:text-accent-terracotta hover:border-accent-terracotta font-label-lg text-label-lg py-1 transition-colors cursor-pointer"
                >
                  Schedule Friday →
                </button>
              </div>
            </div>
          </article>

          {/* Priority Item 3 */}
          <article className="group w-full py-space-md px-space-sm sm:px-space-md bg-canvas-paper hover:bg-surface-cream transition-colors duration-200 border-b border-border-hairline">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-y-3 md:gap-gutter items-center">
              <div className="md:col-span-2 flex items-baseline md:flex-col gap-2 md:gap-0">
                <span className="font-numeric-hero text-headline-xl text-ink-muted leading-none">03</span>
                <span className="font-label-md text-label-md uppercase tracking-widest text-ink-muted font-medium">Deferred</span>
                <span className="font-label-md text-label-md text-ink-muted">Due Tue Oct 24</span>
              </div>
              <div className="md:col-span-7 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h3
                    onClick={() => navigate('/work/w-04')}
                    className="font-headline-md text-headline-md text-ink-primary group-hover:text-accent-terracotta transition-colors cursor-pointer"
                  >
                    Design Research Synthesis Report
                  </h3>
                </div>
                <p className="font-body-md text-body-md text-ink-secondary leading-normal">
                  Low urgency, 4.0h needed. Can safely wait until Monday afternoon. Your user interviews conclude Friday at 16:00, so starting prior to transcript sync yields wasted effort.
                </p>
                <div className="flex flex-wrap items-center gap-space-md text-ink-muted font-label-md text-label-md pt-1">
                  <span>Remaining: <strong className="text-ink-primary font-medium">4.0 hours</strong></span>
                  <span>·</span>
                  <span>Waiting on 2 Interview Transcripts</span>
                  <span>·</span>
                  <span className="text-ink-muted">Protected silence window</span>
                </div>
              </div>
              <div className="md:col-span-3 flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2">
                <div className="text-right">
                  <span className="font-label-md text-label-md block text-ink-secondary">Low Urgency</span>
                  <span className="font-label-md text-label-md text-ink-muted">Safe until Mon</span>
                </div>
                <button
                  onClick={() => navigate('/work/w-04')}
                  className="font-label-lg text-label-lg text-ink-muted hover:text-ink-primary py-1 transition-colors cursor-pointer"
                >
                  Inspect Blockers
                </button>
              </div>
            </div>
          </article>

          {/* Priority Item 4 */}
          <article className="group w-full py-space-md px-space-sm sm:px-space-md bg-canvas-paper hover:bg-surface-cream transition-colors duration-200 border-b border-border-hairline">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-y-3 md:gap-gutter items-center">
              <div className="md:col-span-2 flex items-baseline md:flex-col gap-2 md:gap-0">
                <span className="font-numeric-hero text-headline-xl text-ink-muted leading-none">04</span>
                <span className="font-label-md text-label-md uppercase tracking-widest text-ink-muted font-medium">Long Horizon</span>
                <span className="font-label-md text-label-md text-ink-muted">Due Oct 28</span>
              </div>
              <div className="md:col-span-7 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h3
                    onClick={() => navigate('/work/w-03')}
                    className="font-headline-md text-headline-md text-ink-primary group-hover:text-accent-terracotta transition-colors cursor-pointer"
                  >
                    Portfolio Case Study (Editorial Redesign)
                  </h3>
                </div>
                <p className="font-body-md text-body-md text-ink-secondary leading-normal">
                  Milestone progress on track. 8.5h total scope remaining with 10 calendar days. No immediate risk; keep current 45-minute daily maintenance pace or pause until urgent items clear.
                </p>
                <div className="flex flex-wrap items-center gap-space-md text-ink-muted font-label-md text-label-md pt-1">
                  <span>Remaining: <strong className="text-ink-primary font-medium">8.5 hours</strong></span>
                  <span>·</span>
                  <span>Milestone 2 of 4 Complete</span>
                  <span>·</span>
                  <span className="text-ink-muted">Velocity: Healthy</span>
                </div>
              </div>
              <div className="md:col-span-3 flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2">
                <div className="text-right">
                  <span className="font-label-md text-label-md block text-ink-muted">Horizon Project</span>
                  <span className="font-label-md text-label-md text-ink-muted">Pacing: Stable</span>
                </div>
                <button
                  onClick={() => navigate('/planning')}
                  className="font-label-lg text-label-lg text-ink-muted hover:text-ink-primary py-1 transition-colors cursor-pointer"
                >
                  Adjust cadence
                </button>
              </div>
            </div>
          </article>
        </div>

        {/* Editorial Canonical Photography & "Why This Order?" Section */}
        <section className="w-full pt-space-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
            {/* Left Photography Plate (5 cols) */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="w-full h-80 overflow-hidden relative mb-space-xs border border-border-hairline">
                <img
                  alt="Physical representation of measured time"
                  className="w-full h-full object-cover"
                  src="/assets/priorities-time.jpg"
                />
              </div>
              <span className="font-label-md text-label-md text-ink-muted">
                Fig. 12 — Human velocity is physiological, not algorithmic. Rest and recovery buffers are treated as non-negotiable hard constraints.
              </span>
            </div>

            {/* Right: "Why This Order?" Editorial Deep Dive (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-start">
              <div className="flex items-center gap-2 mb-space-xs">
                <span className="font-label-md text-label-md uppercase tracking-wider text-accent-terracotta">
                  Methodology
                </span>
                <span className="text-ink-muted">·</span>
                <span className="font-label-md text-label-md text-ink-secondary">Deterministic Pacing</span>
              </div>
              <h2 className="font-headline-xl text-headline-xl text-ink-primary mb-space-md tracking-tight">
                Why This Order?
              </h2>
              <p className="font-body-lg text-body-lg text-ink-secondary mb-space-lg leading-relaxed">
                Conventional task engines assign pseudo-scientific priority scores (1 to 100) that foster anxiety without offering navigational clarity. Deadline Radar synthesizes four concrete physical dimensions to order your attention:
              </p>

              {/* 4 Pillars Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md pt-space-xs">
                {/* Pillar 1 */}
                <div className="bg-surface-cream p-space-md border border-border-hairline">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-headline-md text-headline-md text-accent-terracotta">01</span>
                    <h4 className="font-headline-md text-headline-md text-ink-primary">Deadline Proximity</h4>
                  </div>
                  <p className="font-body-md text-body-md text-ink-secondary">
                    Absolute distance to the hard submission window, adjusted for real office hours and external submission server queues.
                  </p>
                </div>
                {/* Pillar 2 */}
                <div className="bg-surface-cream p-space-md border border-border-hairline">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-headline-md text-headline-md text-accent-terracotta">02</span>
                    <h4 className="font-headline-md text-headline-md text-ink-primary">Remaining Effort</h4>
                  </div>
                  <p className="font-body-md text-body-md text-ink-secondary">
                    The net focused hours required to cross completion threshold, without assuming unsustainable hero sprints.
                  </p>
                </div>
                {/* Pillar 3 */}
                <div className="bg-surface-cream p-space-md border border-border-hairline">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-headline-md text-headline-md text-accent-terracotta">03</span>
                    <h4 className="font-headline-md text-headline-md text-ink-primary">Historical Velocity</h4>
                  </div>
                  <p className="font-body-md text-body-md text-ink-secondary">
                    Your empirical execution pace on analogous engineering or writing assignments over the trailing 90 days.
                  </p>
                </div>
                {/* Pillar 4 */}
                <div className="bg-surface-cream p-space-md border border-border-hairline">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-headline-md text-headline-md text-accent-terracotta">04</span>
                    <h4 className="font-headline-md text-headline-md text-ink-primary">Biological Energy</h4>
                  </div>
                  <p className="font-body-md text-body-md text-ink-secondary">
                    Matching deep-cognition work (e.g., algorithm proofs) to high-alert morning and mid-afternoon chronotype windows.
                  </p>
                </div>
              </div>

              {/* Bottom Summary Bar */}
              <div className="mt-space-lg p-space-md bg-surface-container-low flex flex-col sm:flex-row items-baseline justify-between gap-space-sm border border-border-hairline">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-ink-primary text-[20px]">check_circle</span>
                  <span className="font-body-md text-body-md text-ink-primary font-medium">
                    No algorithmic lock-in. Override anytime.
                  </span>
                </div>
                <button
                  onClick={() => navigate('/planning')}
                  className="font-label-lg text-label-lg text-ink-primary hover:text-accent-terracotta transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Inspect full capacity model</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
