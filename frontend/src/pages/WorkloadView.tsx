import React, { useState } from 'react';
import { SubNavigation } from '../components/layout/SubNavigation';

interface DayWorkload {
  date: string;
  dayName: string;
  title: string;
  booked: number;
  max: number;
  isPeak?: boolean;
  statusText: string;
  statusDotColor: string;
  isWeekend?: boolean;
}

const sevenDaysData: DayWorkload[] = [
  {
    date: 'OCT 14',
    dayName: 'Monday',
    title: 'System Architecture Review & Tech Spec draft',
    booked: 3.5,
    max: 4.5,
    statusText: 'Steady Cadence · 1.0h free',
    statusDotColor: 'bg-ink-primary',
  },
  {
    date: 'OCT 15',
    dayName: 'Tuesday',
    title: 'Design Systems Benchmark & Token refactor',
    booked: 2.0,
    max: 4.5,
    statusText: 'Ample recovery · 2.5h free',
    statusDotColor: 'bg-ink-primary',
  },
  {
    date: 'OCT 16',
    dayName: 'Wednesday',
    title: 'Core Synthesis & Quarterly Metric Analysis',
    booked: 1.0,
    max: 4.5,
    statusText: 'Low load day · 3.5h free',
    statusDotColor: 'bg-ink-primary',
  },
  {
    date: 'OCT 17',
    dayName: 'Thursday',
    title: 'Client Dossier Synthesis & Strategic Roadmap',
    booked: 4.0,
    max: 4.5,
    isPeak: true,
    statusText: 'Balanced · Green indicator',
    statusDotColor: 'bg-ink-primary',
  },
  {
    date: 'OCT 18',
    dayName: 'Friday',
    title: 'Sprint Retrospective & Editorial Sign-off',
    booked: 3.0,
    max: 4.5,
    statusText: 'Safe buffer · 1.5h free',
    statusDotColor: 'bg-ink-primary',
  },
  {
    date: 'OCT 19',
    dayName: 'Saturday',
    title: 'Personal Writing & Essay Drafting',
    booked: 3.0,
    max: 4.5,
    isWeekend: true,
    statusText: 'Morning only, evening free',
    statusDotColor: 'bg-ink-secondary',
  },
  {
    date: 'OCT 20',
    dayName: 'Sunday',
    title: 'Weekly Reset, Reading & Planning Log',
    booked: 1.0,
    max: 4.5,
    isWeekend: true,
    statusText: '90% open · Rest priority',
    statusDotColor: 'bg-ink-secondary',
  },
];

export const WorkloadView: React.FC = () => {
  const [isRebalanceModalOpen, setIsRebalanceModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleApplyRebalance = () => {
    setIsRebalanceModalOpen(false);
    showToast('1.0h shifted to Wednesday. Thursday load eased.');
  };

  return (
    <div className="w-full bg-surface min-h-screen">
      {/* Sub-Navigation */}
      <SubNavigation
        items={[
          { label: 'Planning', path: '/planning' },
          { label: 'Timeline', path: '/timeline' },
          { label: 'Calendar', path: '/calendar' },
          { label: 'Workload', path: '/workload' },
        ]}
        rightContent={
          <div className="flex items-center gap-space-xs text-ink-secondary">
            <span className="inline-block w-1.5 h-1.5 bg-accent-terracotta shrink-0" />
            <span className="font-label-md text-label-md">Current Sprint: Week 42 (Oct 14 – 20)</span>
          </div>
        }
      />

      {/* Main Hero Editorial Statement */}
      <div className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin pt-space-lg pb-space-md">
        <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-space-sm">
          <div>
            <span className="font-label-md text-label-md uppercase tracking-widest text-ink-muted block mb-space-xs">
              Capacity Diagnostics · Section 11
            </span>
            <h1 className="font-headline-xl text-headline-xl text-ink-primary tracking-tight">
              Workload &amp; Capacity Equilibrium
            </h1>
            <p className="font-body-md text-body-md text-ink-secondary mt-1 max-w-2xl">
              An empirical balance sheet comparing scheduled assignments against biological limits and non-negotiable living sanctuaries.
            </p>
          </div>
          <div className="flex items-center gap-space-sm mt-space-sm md:mt-0">
            <button
              onClick={() => setIsRebalanceModalOpen(true)}
              className="bg-surface-cream hover:bg-surface-tint text-ink-primary font-label-lg text-label-lg px-space-md py-space-xs rounded-none transition-colors duration-150 flex items-center gap-space-xs cursor-pointer border border-border-hairline"
            >
              <span className="material-symbols-outlined text-[18px]">balance</span>
              <span>Rebalance Horizon</span>
            </button>
            <button
              onClick={() => showToast('Capacity recalculation synced with database.')}
              className="bg-ink-primary hover:bg-accent-terracotta text-canvas-paper font-label-lg text-label-lg px-space-md py-space-xs rounded-none transition-colors duration-150 flex items-center gap-space-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">sync</span>
              <span>Sync Telemetry</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 1: Macroscopic Weekly Balance */}
      <div className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin py-space-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          {/* Main Workload Card (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-space-md">
            <div className="bg-surface-cream p-space-lg rounded-none border border-border-hairline">
              <div className="flex items-center justify-between pb-space-sm border-b border-border-hairline">
                <span className="font-label-md text-label-md uppercase tracking-wider text-ink-secondary">
                  Macro Summary · Week 42
                </span>
                <span className="px-2 py-0.5 bg-ink-primary text-canvas-paper font-label-md text-[11px] rounded-none">
                  Stable Load
                </span>
              </div>

              <div className="mt-space-md flex flex-col gap-space-xs">
                <div className="flex items-baseline justify-between">
                  <span className="font-headline-lg text-headline-lg text-ink-primary">
                    14.5 hrs Total Demand
                  </span>
                  <span className="font-label-md text-label-md text-ink-muted">
                    of 18.5h focus baseline
                  </span>
                </div>
                <div className="flex items-center justify-between text-body-md text-ink-secondary pt-1">
                  <div className="flex items-center gap-space-xs">
                    <span className="w-3 h-3 bg-ink-primary inline-block rounded-none" />
                    <span>Focus Booked: <strong>78%</strong> (14.5h)</span>
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <span className="w-3 h-3 bg-surface-tint inline-block rounded-none" />
                    <span>Buffer Margin: <strong>22%</strong> (4.0h)</span>
                  </div>
                </div>

                {/* Custom Segmented Gauge Bar */}
                <div className="w-full h-4 bg-surface-tint rounded-none flex overflow-hidden">
                  <div className="h-full bg-ink-primary transition-all duration-500 ease-out" style={{ width: '78.38%' }} />
                  <div className="h-full bg-surface-tint transition-all duration-500 ease-out flex items-center justify-end pr-2" style={{ width: '21.62%' }}>
                    <span className="inline-block w-1.5 h-1.5 bg-accent-terracotta shrink-0" />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-baseline justify-between gap-space-sm mb-space-sm mt-space-md pt-space-md border-t border-border-hairline">
                <span className="font-label-md text-label-md uppercase tracking-wider text-ink-secondary">
                  Week 42 Primary Ledger
                </span>
                <span className="font-label-md text-label-md text-ink-muted">Refreshed 12m ago</span>
              </div>
              
              {/* Numbers juxtaposed */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md pt-space-xs pb-space-md">
                <div>
                  <span className="block font-label-md text-label-md text-ink-secondary">Booked Focus</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-numeric-hero text-numeric-hero text-ink-primary tracking-tight">14.5</span>
                    <span className="font-headline-md text-headline-md text-ink-secondary">h</span>
                  </div>
                  <span className="font-label-md text-label-md text-ink-muted block mt-space-xs">
                    Across 6 active work items
                  </span>
                </div>
                <div className="sm:pl-space-sm sm:border-l sm:border-border-hairline">
                  <span className="block font-label-md text-label-md text-ink-secondary">Available Ceiling</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-numeric-hero text-numeric-hero text-ink-primary tracking-tight">18.5</span>
                    <span className="font-headline-md text-headline-md text-ink-secondary">h</span>
                  </div>
                  <span className="font-label-md text-label-md text-ink-muted block mt-space-xs">
                    Realistic human max
                  </span>
                </div>
                <div className="sm:pl-space-sm sm:border-l sm:border-border-hairline">
                  <span className="block font-label-md text-label-md text-ink-secondary">Safe Margin</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-numeric-hero text-numeric-hero text-accent-terracotta tracking-tight">+4.0</span>
                    <span className="font-headline-md text-headline-md text-accent-terracotta">h</span>
                  </div>
                  <span className="font-label-md text-label-md text-accent-terracotta block mt-space-xs">
                    Resilient against shocks
                  </span>
                </div>
              </div>

              {/* Capacity Distribution Bar */}
              <div className="pt-space-sm mt-space-xs">
                <div className="flex items-center justify-between text-label-md font-label-md text-ink-primary mb-space-xs">
                  <div className="flex items-center gap-space-xs">
                    <span className="w-3 h-3 bg-ink-primary inline-block rounded-none" />
                    <span>Committed Load: <strong>78%</strong> (14.5h)</span>
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <span className="w-3 h-3 bg-surface-tint inline-block rounded-none" />
                    <span>Buffer Margin: <strong>22%</strong> (4.0h)</span>
                  </div>
                </div>

                {/* Custom Segmented Gauge Bar */}
                <div className="w-full h-4 bg-surface-tint rounded-none flex overflow-hidden">
                  <div className="h-full bg-ink-primary transition-all duration-500 ease-out" style={{ width: '78.38%' }} />
                  <div className="h-full bg-surface-tint transition-all duration-500 ease-out flex items-center justify-end pr-2" style={{ width: '21.62%' }}>
                    <span className="inline-block w-1.5 h-1.5 bg-accent-terracotta" />
                  </div>
                </div>
                <p className="font-body-md text-body-md text-ink-secondary mt-space-sm">
                  Your load operates in the <em>sustainable equilibrium zone</em>. Tasks are spaced with adequate breathing room to absorb unexpected editorial iterations.
                </p>
              </div>
            </div>

            {/* Risk Horizon & Overload Analysis */}
            <div className="p-space-md bg-surface-container rounded-none flex items-start gap-space-md border border-border-hairline">
              <div className="shrink-0 w-8 h-8 rounded-none bg-surface-cream flex items-center justify-center text-ink-primary">
                <span className="material-symbols-outlined text-[20px]">verified</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-space-xs">
                  <span className="font-label-lg text-label-lg text-ink-primary font-semibold">Zero Overload Hazards Detected</span>
                  <span className="text-ink-muted text-label-md font-label-md">· Current 7-day span</span>
                </div>
                <p className="font-body-md text-body-md text-ink-secondary mt-1">
                  Zero biological overload hazards flagged for Week 42. Next potential pressure horizon: <span className="text-ink-primary font-medium">Week 43 Midterm Synthesis review</span>, where scheduled commitments currently stand at 19.0h against an 18.0h threshold.
                </p>
                <div className="mt-space-xs flex items-center gap-space-md">
                  <button className="font-label-md text-label-md text-accent-terracotta hover:underline inline-flex items-center gap-1 cursor-pointer">
                    Inspect Week 43 Pre-allocation <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: The 4-Hour Biological Ceiling Explainer Card */}
          <div className="lg:col-span-5 flex flex-col gap-space-md">
            <div className="bg-surface-container-low p-space-lg rounded-none border border-border-hairline flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-space-sm">
                  <span className="font-label-md text-label-md uppercase tracking-wider text-ink-muted">Guiding Principle</span>
                  <span className="font-label-md text-label-md bg-surface-cream text-ink-primary px-space-xs py-0.5 rounded-none">Neurobiology of Focus</span>
                </div>
                <h2 className="font-headline-lg text-headline-lg text-ink-primary mb-space-xs leading-snug">The 4-Hour Daily Biological Ceiling</h2>
                <p className="font-body-md text-body-md text-ink-secondary">
                  Cognitive research consistently reveals that high-order synthesis, original writing, and deep technical architecture degrade rapidly after 4 to 4.5 hours of uninterrupted concentration per 24-hour cycle.
                </p>

                {/* Inline SVG Gauge Visualizing Degradation Threshold */}
                <div className="my-space-md py-space-sm">
                  <div className="flex justify-between items-baseline text-label-md font-label-md text-ink-secondary mb-1">
                    <span>Daily Deep Work Accumulation</span>
                    <span className="text-ink-primary font-semibold">4.5h Safe Threshold</span>
                  </div>
                  <svg className="w-full h-16" fill="none" viewBox="0 0 340 64" xmlns="http://www.w3.org/2000/svg">
                    {/* Zone backgrounds */}
                    <rect fill="#EFECE4" height="16" width="220" x="0" y="24" />
                    <rect fill="#d0c4bb" height="16" opacity="0.4" width="118" x="222" y="24" />
                    {/* Active bar for today: 4.0h */}
                    <rect fill="#1A1715" height="16" width="195" x="0" y="24" />
                    {/* Threshold Marker line */}
                    <line stroke="#C85A32" strokeDasharray="2 2" strokeWidth="2" x1="220" x2="220" y1="12" y2="48" />
                    <circle cx="220" cy="12" fill="#C85A32" r="3" />
                    {/* Text Annotations inside SVG */}
                    <text fill="#8C827A" fontFamily="Manrope" fontSize="10" x="2" y="58">0h</text>
                    <text fill="#1A1715" fontFamily="Manrope" fontSize="10" fontWeight="600" x="145" y="58">4.0h Booked</text>
                    <text fill="#C85A32" fontFamily="Manrope" fontSize="10" fontWeight="600" x="210" y="20">4.5h Biological Ceiling</text>
                    <text fill="#8C827A" fontFamily="Manrope" fontSize="10" x="260" y="58">Exhaustion Zone</text>
                  </svg>
                </div>

                <p className="font-body-md text-body-md text-ink-secondary">
                  Exceeding this boundary does not yield more output; it generates structural defect rates, cognitive exhaustion, and predictable multi-day velocity penalties.
                </p>
              </div>

              {/* Quotation Plate */}
              <div className="mt-space-md pt-space-sm bg-surface-cream/60 p-space-sm rounded-none border-l-2 border-accent-terracotta">
                <p className="font-body-md text-body-md italic text-ink-primary">
                  “Schedules that assume 8 hours of peak creativity mistake mechanical attendance for intellectual throughput.”
                </p>
                <span className="block font-label-md text-label-md text-ink-muted mt-1">— Radar Capacity Manifesto</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editorial Canonical Photography Plate */}
      <div className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin py-space-sm">
        <div className="relative w-full h-44 sm:h-56 bg-surface-tint overflow-hidden rounded-none border border-border-hairline">
          <img
            src="/assets/planning-architect-desk.jpg"
            alt="An editorial photograph of an organized minimalist wooden architect desk at dawn"
            className="w-full h-full object-cover filter contrast-105"
          />
        </div>
        <div className="pt-space-xs flex justify-between items-baseline text-ink-muted font-label-md text-label-md">
          <span>Deliberate Pacing · Architect Workstation</span>
          <span className="italic">“Protecting empty hours is the only antidote to accidental urgency.”</span>
        </div>
      </div>

      {/* Days Capacity Breakdown (Mon to Sun) */}
      <div className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin py-space-lg">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-space-md">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-ink-primary">Seven-Day Cadence</h2>
            <p className="font-body-md text-body-md text-ink-secondary mt-1">
              Granular analysis of scheduled commitments vs biological boundaries.
            </p>
          </div>
          <div className="flex items-center gap-space-md mt-space-xs sm:mt-0 font-label-md text-label-md text-ink-muted">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 inline-block shrink-0 bg-ink-primary" /> Deep Focus
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 inline-block shrink-0 bg-surface-dim" /> Buffer Margin
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 inline-block shrink-0 bg-accent-terracotta" /> Warning Threshold
            </span>
          </div>
        </div>

        {/* Editorial Open List */}
        <div className="flex flex-col gap-space-xs">
          {sevenDaysData.map((day) => {
            const percentage = Math.min(100, Math.round((day.booked / day.max) * 100));
            return (
              <div
                key={day.dayName}
                className={`group transition-colors duration-150 p-space-md rounded-none border border-border-hairline flex flex-col md:flex-row md:items-center justify-between gap-space-sm ${
                  day.isPeak ? 'bg-surface-cream hover:bg-surface-tint' : 'bg-surface-container-low hover:bg-surface-cream'
                }`}
              >
                <div className="w-full md:w-48 shrink-0 flex items-center gap-space-sm">
                  <span className={`font-label-lg text-label-lg w-12 ${day.isPeak ? 'text-ink-primary font-semibold' : 'text-ink-muted'}`}>
                    {day.date}
                  </span>
                  <span className={`font-headline-md text-headline-md text-ink-primary ${day.isPeak ? 'font-bold' : ''}`}>
                    {day.dayName}
                  </span>
                </div>

                <div className="flex-1 min-w-0 pr-space-md">
                  <div className="flex items-baseline justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-body-md text-body-md text-ink-primary ${day.isPeak ? 'font-semibold' : 'font-medium'}`}>
                        {day.title}
                      </span>
                      {day.isPeak && (
                        <span className="font-label-md text-label-md bg-surface-container-high px-1.5 py-0.5 rounded-none text-ink-primary">
                          Peak Day
                        </span>
                      )}
                    </div>
                    <span className="font-label-md text-label-md text-ink-secondary shrink-0 ml-2">
                      {day.booked.toFixed(1)}h {day.isWeekend ? 'booked' : `/ ${day.max.toFixed(1)}h max`}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-surface-tint rounded-none overflow-hidden flex">
                    <div
                      className={`h-full ${day.isWeekend ? 'bg-ink-secondary' : 'bg-ink-primary'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                <div className="w-full md:w-64 shrink-0 flex items-center justify-between md:justify-end gap-space-md">
                  <span className="font-label-md text-label-md text-ink-secondary flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 inline-block shrink-0 ${day.statusDotColor}`} />
                    {day.statusText}
                  </span>
                  <span className="font-label-md text-label-md text-ink-muted group-hover:text-ink-primary transition-colors cursor-pointer">
                    {day.isPeak ? 'Details →' : 'View'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Modal / Drawer Simulation for Quick Adjustments */}
      {isRebalanceModalOpen && (
        <div className="fixed inset-0 z-50 bg-ink-primary/60 flex items-center justify-center p-4">
          <div className="bg-canvas-paper w-full max-w-xl p-space-lg rounded-none flex flex-col gap-space-md border border-border-hairline">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-label-md text-label-md uppercase tracking-wider text-ink-muted">
                  Algorithmic Leveling
                </span>
                <h3 className="font-headline-lg text-headline-lg text-ink-primary">Rebalance Workload</h3>
              </div>
              <button
                onClick={() => setIsRebalanceModalOpen(false)}
                className="text-ink-secondary hover:text-ink-primary cursor-pointer"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>
            <p className="font-body-md text-body-md text-ink-secondary">
              Radar detects an opportunity to redistribute 1.0 hour from Thursday to Wednesday, lowering Thursday's capacity commitment to a calm 3.0h.
            </p>
            <div className="bg-surface-cream p-space-md rounded-none flex flex-col gap-space-xs border border-border-hairline">
              <div className="flex justify-between items-center text-label-md font-label-md">
                <span className="text-ink-primary font-semibold">Thursday: Move 1h Tech Spec review</span>
                <span className="text-accent-terracotta">→ To Wednesday Oct 16</span>
              </div>
              <span className="font-body-md text-body-md text-ink-secondary">
                This keeps both days under 3.5h and guarantees a 25% biological safety buffer.
              </span>
            </div>
            <div className="flex items-center justify-end gap-space-sm pt-space-xs">
              <button
                onClick={() => setIsRebalanceModalOpen(false)}
                className="bg-surface-container px-space-md py-space-xs font-label-lg text-label-lg text-ink-primary rounded-none hover:bg-surface-tint transition-colors cursor-pointer"
              >
                Dismiss
              </button>
              <button
                onClick={handleApplyRebalance}
                className="bg-ink-primary px-space-md py-space-xs font-label-lg text-label-lg text-canvas-paper rounded-none hover:bg-accent-terracotta transition-colors cursor-pointer"
              >
                Apply Balance Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-ink-primary text-canvas-paper px-space-md py-space-sm rounded-none border border-border-hairline flex items-center gap-space-xs transition-all duration-300">
          <span className="material-symbols-outlined text-[18px] text-accent-terracotta">check_circle</span>
          <span className="font-label-md text-label-md">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
