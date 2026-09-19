import React from 'react';
import { MetricBlock } from '../components/ui/MetricBlock';
import { Button } from '../components/ui/Button';
import { OpenListRow } from '../components/ui/OpenListRow';
import { Hairline } from '../components/ui/Hairline';
import { NaturalLanguageInput } from '../components/ui/NaturalLanguageInput';
import { MOCK_CAPACITY_METRIC, MOCK_WORK_ITEMS } from '../mocks/mockData';

export const RadarView: React.FC = () => {
  return (
    <div className="w-full flex flex-col">
      {/* SECTION 1: EDITORIAL HERO & ASYMMETRIC VISUAL SPLIT */}
      <section className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin pt-space-lg pb-space-xl">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          {/* Left Editorial Anchor */}
          <div className="lg:col-span-7 flex flex-col justify-between pr-0 lg:pr-space-md">
            <div>
              <div className="inline-flex items-center gap-space-xs mb-space-md">
                <span className="w-2 h-2 rounded-full bg-accent-terracotta" />
                <span className="font-label-md text-label-md uppercase tracking-widest text-ink-secondary">
                  Radar Horizon • Week {MOCK_CAPACITY_METRIC.weekNumber}
                </span>
              </div>
              <h1 className="font-display-hero text-display-hero-mobile md:text-display-hero text-ink-primary tracking-tight leading-none mb-space-md">
                Time is moving.
              </h1>
              <p className="font-body-xl text-body-xl text-ink-secondary max-w-xl mb-space-lg leading-relaxed">
                You have{' '}
                <span className="text-ink-primary font-semibold">
                  {MOCK_CAPACITY_METRIC.availableFocusHours} hours
                </span>{' '}
                of available focus before Friday evening.{' '}
                <span className="text-ink-primary font-semibold">
                  {MOCK_CAPACITY_METRIC.committedWorkHours} hours
                </span>{' '}
                of work are committed across 3 deadlines.
              </p>
            </div>

            {/* Quick Summary Metrics Stripe */}
            <div className="bg-surface-container-low p-space-md mt-space-md flex flex-col sm:flex-row items-baseline justify-between gap-space-md">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-md w-full items-baseline">
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-ink-muted uppercase">
                    Available Time
                  </span>
                  <div className="flex items-baseline gap-space-xs mt-space-xs">
                    <span className="font-headline-lg text-headline-lg text-ink-primary">
                      {MOCK_CAPACITY_METRIC.availableFocusHours}
                      <span className="text-label-lg text-ink-muted ml-0.5">h</span>
                    </span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-ink-muted uppercase">
                    Remaining Work
                  </span>
                  <div className="flex items-baseline gap-space-xs mt-space-xs">
                    <span className="font-headline-lg text-headline-lg text-ink-primary">
                      {MOCK_CAPACITY_METRIC.committedWorkHours}
                      <span className="text-label-lg text-ink-muted ml-0.5">h</span>
                    </span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-ink-muted uppercase">
                    Net Buffer
                  </span>
                  <div className="flex items-baseline gap-space-xs mt-space-xs">
                    <span className="font-headline-lg text-headline-lg text-ink-primary">
                      +{MOCK_CAPACITY_METRIC.netBufferHours.toFixed(1)}
                      <span className="text-label-lg text-ink-muted ml-0.5">h</span>
                    </span>
                  </div>
                </div>
                <div className="flex flex-col sm:items-end text-left sm:text-right">
                  <span className="font-label-md text-label-md text-ink-muted uppercase">
                    Current Risk
                  </span>
                  <span className="font-label-lg text-label-lg font-semibold text-accent-terracotta mt-space-xs">
                    Moderate
                  </span>
                  <span className="font-label-md text-label-md text-ink-secondary mt-0.5">
                    Thursday afternoon is tight
                  </span>
                </div>
              </div>
            </div>

            {/* Action Links */}
            <div className="flex flex-wrap items-center gap-space-md mt-space-lg">
              <Button variant="primary" size="lg">
                Review Schedule
              </Button>
              <Button variant="ghost" size="md" showArrow>
                View all tasks
              </Button>
            </div>
          </div>

          {/* Right Plate: Canonical Hourglass Object */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="relative w-full bg-surface-container overflow-hidden">
              <img
                src="/assets/hourglass-temporal.jpg"
                alt="Minimalist hourglass with fine sand trickling down resting in quiet morning light"
                className="w-full aspect-[4/5] object-cover object-center grayscale contrast-105 hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute bottom-0 inset-x-0 p-space-md bg-gradient-to-t from-ink-primary/80 via-ink-primary/30 to-transparent text-canvas-paper">
                <p className="font-label-md text-label-md uppercase tracking-wider text-canvas-paper/75">
                  Temporal Anchor • Reality Metric
                </p>
                <p className="font-body-md text-body-md text-canvas-paper mt-0.5">
                  Sand trickles at a constant rate regardless of urgency.
                </p>
              </div>
            </div>
            <div className="pt-space-xs flex justify-between items-center text-ink-muted font-label-md text-label-md">
              <span>HOURLY PACING • REALITY ANCHOR</span>
              <span>CALIBRATED TO THIS WEEK</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: THE REALITY CHECK / HORIZON CAPACITY BALANCE */}
      <section className="w-full bg-surface-container py-space-xl px-margin-mobile md:px-margin-tablet lg:px-margin">
        <div className="max-w-screen-2xl mx-auto flex flex-col gap-space-lg">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-sm">
            <div>
              <span className="font-label-md text-label-md text-ink-muted uppercase tracking-widest">
                Week Overview
              </span>
              <h2 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-ink-primary mt-1">
                Available focus vs. required energy.
              </h2>
            </div>
            <p className="font-body-md text-body-md text-ink-secondary max-w-md">
              Direct tally of confirmed calendar focus windows against remaining estimated deliverable hours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm">
            <MetricBlock
              label="Available Time"
              value={MOCK_CAPACITY_METRIC.availableFocusHours}
              unit="hrs"
              description="Open focus calendar windows"
              variant="surface"
            />
            <MetricBlock
              label="Remaining Work"
              value={MOCK_CAPACITY_METRIC.committedWorkHours}
              unit="hrs"
              description="3 defined commitments remaining"
              variant="surface"
            />
            <MetricBlock
              label="Net Buffer"
              value={`+${MOCK_CAPACITY_METRIC.netBufferHours.toFixed(1)}`}
              unit="hrs"
              description="Moderate risk. Zero recovery reserve if Thursday slips."
              variant="cream"
            />
          </div>

          {/* Progress Distribution Bar */}
          <div className="w-full bg-surface-variant h-3 relative overflow-hidden flex">
            <div className="bg-ink-primary h-full" style={{ width: '24.3%' }} title="Machine Learning: 4.5h" />
            <div className="bg-ink-secondary h-full border-l border-surface" style={{ width: '37.8%' }} title="FastAPI Microservice: 7h" />
            <div className="bg-outline h-full border-l border-surface" style={{ width: '16.2%' }} title="Design Research: 3h" />
            <div className="bg-surface-tint h-full border-l border-surface" style={{ width: '21.7%' }} title="Buffer Margin: 4h" />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs text-ink-secondary font-label-md text-label-md">
            <div className="flex items-center gap-space-md flex-wrap">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-ink-primary inline-block" /> ML Assignment (4.5h)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-ink-secondary inline-block" /> FastAPI Service (7.0h)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-outline inline-block" /> Design Research (3.0h)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-surface-tint inline-block" /> Buffer Reservoir (4.0h)
              </span>
            </div>
            <span className="text-ink-muted">Scale 100% = {MOCK_CAPACITY_METRIC.availableFocusHours} Available Focus Hours</span>
          </div>
        </div>
      </section>

      {/* SECTION 3: OPEN LIST OF DEADLINES */}
      <section className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin py-space-xl">
        <div className="max-w-screen-2xl mx-auto flex flex-col gap-space-xl">
          <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-space-md">
            <div>
              <span className="font-label-md text-label-md text-accent-terracotta uppercase tracking-wider font-semibold">
                Upcoming Deliverables
              </span>
              <h2 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-ink-primary tracking-tight mt-1">
                Approaching Deadlines
              </h2>
            </div>
            <span className="font-body-md text-body-md text-ink-muted mt-2 md:mt-0">
              Chronological order • Hours remaining &amp; risk level
            </span>
          </div>

          <div className="flex flex-col divide-y divide-border-hairline">
            {MOCK_WORK_ITEMS.slice(0, 3).map((item) => (
              <OpenListRow
                key={item.id}
                leftContent={
                  <div className="flex flex-col">
                    <div className="flex items-center gap-space-xs">
                      <span
                        className={`w-2 h-2 inline-block ${
                          item.riskLevel === 'CRITICAL' ? 'bg-accent-terracotta' : 'bg-ink-primary'
                        }`}
                      />
                      <span className="font-headline-md text-headline-md text-ink-primary">
                        Due soon
                      </span>
                    </div>
                    <span className="font-label-md text-label-md text-ink-secondary mt-0.5">
                      Thursday, 23:59
                    </span>
                  </div>
                }
                centerContent={
                  <>
                    <h3 className="font-headline-md text-headline-md text-ink-primary group-hover:text-accent-terracotta transition-colors">
                      {item.title}
                    </h3>
                    <p className="font-body-md text-body-md text-ink-secondary mt-1">
                      {item.description}
                    </p>
                    <div className="mt-space-xs p-space-xs bg-surface-container-high/60 inline-flex items-center gap-2 text-ink-primary">
                      <span className="font-label-md text-label-md font-semibold text-accent-terracotta">
                        Risk: {item.riskLevel}
                      </span>
                      <span className="font-body-md text-body-md">
                        Allocated focus fits within available buffer.
                      </span>
                    </div>
                  </>
                }
                rightContent={
                  <Button variant="primary" size="md" showArrow>
                    Start Focus
                  </Button>
                }
              />
            ))}
          </div>

          <Hairline />

          {/* Quick Feasibility Check */}
          <div className="max-w-2xl pt-space-md">
            <NaturalLanguageInput
              label="Check Deadline Feasibility"
              placeholder="e.g. Take on 4-hour freelance project due Monday..."
              helperText="Tests if your available focus buffers can safely accommodate new work without risk."
            />
          </div>
        </div>
      </section>
    </div>
  );
};
