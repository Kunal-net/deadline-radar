import React from 'react';
import { Button } from '../components/ui/Button';
import { OpenListRow } from '../components/ui/OpenListRow';
import { Hairline } from '../components/ui/Hairline';
import { NaturalLanguageInput } from '../components/ui/NaturalLanguageInput';
import { MOCK_TODAY_OVERVIEW } from '../mocks/mockData';
import { useAppStore } from '../store/useAppStore';

export const TodayView: React.FC = () => {
  const { activeSession, startSession, stopSession } = useAppStore();

  return (
    <div className="w-full flex flex-col">
      {/* Top Daily Brief Hero Section */}
      <section className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin pt-space-md lg:pt-space-lg pb-space-xl">
        <div className="max-w-screen-2xl mx-auto flex flex-col gap-space-lg">
          {/* Overline & Timestamp */}
          <div className="flex flex-wrap items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-xs">
              <span className="w-2 h-2 bg-accent-terracotta inline-block" />
              <span className="font-label-lg text-label-lg tracking-widest uppercase text-ink-primary">
                Daily Brief · {MOCK_TODAY_OVERVIEW.dateDisplay}
              </span>
            </div>
            <span className="font-label-md text-label-md text-ink-muted">
              Issue No. {MOCK_TODAY_OVERVIEW.issueNumber} · Capacity Gauge Active
            </span>
          </div>

          {/* Primary Statement */}
          <div className="max-w-4xl flex flex-col gap-space-md">
            <h1 className="font-display-hero text-display-hero-mobile md:text-display-hero text-ink-primary tracking-tight">
              You have {MOCK_TODAY_OVERVIEW.availableFocusHours} hours of focus today.
            </h1>
            <p className="font-body-xl text-body-xl text-ink-secondary leading-relaxed max-w-3xl">
              {MOCK_TODAY_OVERVIEW.deadlinesCount} deadlines require attention before tonight. Scheduled breaks and evening protected.
            </p>
            <div className="pt-space-sm flex flex-wrap items-center gap-space-lg">
              {activeSession ? (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={stopSession}
                  icon={<span className="w-2 h-2 rounded-full bg-canvas-paper animate-ping" />}
                >
                  Sprint Active ({Math.floor(activeSession.elapsedSeconds / 60)}m) — Stop
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => startSession('Morning Deep Work Block')}
                  showArrow
                >
                  Start Focus Session
                </Button>
              )}
              <a
                href="#shape-of-day"
                className="font-label-lg text-label-lg text-ink-primary underline underline-offset-8 decoration-border-hairline hover:decoration-ink-primary transition-all duration-150"
              >
                Review Daily Timeline
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 55/45 Split Layout Plate */}
      <section id="shape-of-day" className="w-full bg-surface-container-low py-space-xl">
        <div className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin max-w-screen-2xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-space-xl items-start">
            {/* Left Plate: Canonical Editorial Photography */}
            <div className="lg:col-span-6 flex flex-col gap-space-xs">
              <div className="relative w-full aspect-[4/5] bg-surface-cream overflow-hidden">
                <img
                  src="/assets/focus-workspace.jpg"
                  alt="Hands typing on laptop at green desk with coffee cup"
                  className="w-full h-full object-cover object-center grayscale-[15%] contrast-[105%]"
                />
                <div className="absolute bottom-0 left-0 right-0 p-space-md bg-gradient-to-t from-ink-primary/80 via-ink-primary/30 to-transparent">
                  <span className="font-label-md text-label-md text-canvas-paper tracking-wider uppercase">
                    Deep Cognition State · Uninterrupted
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-baseline pt-space-xs text-ink-muted">
                <span className="font-label-md text-label-md tracking-widest uppercase">
                  Deep Execution · Laptop Workspace
                </span>
                <span className="font-label-md text-label-md">
                  Today&apos;s Intent: Zero Residual Guilt
                </span>
              </div>
            </div>

            {/* Right Plate: The Day's Shape */}
            <div className="lg:col-span-6 flex flex-col justify-between h-full pt-space-sm lg:pt-0">
              <div className="flex flex-col gap-space-md">
                <div className="flex flex-col gap-space-xs">
                  <span className="font-label-lg text-label-lg uppercase tracking-wider text-ink-secondary">
                    Today&apos;s Schedule
                  </span>
                  <h2 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-ink-primary">
                    The Day&apos;s Shape
                  </h2>
                  <p className="font-body-md text-body-md text-ink-secondary">
                    Structured blocks designed to balance focused effort with deliberate offline buffers.
                  </p>
                </div>

                <div className="flex flex-col mt-space-sm divide-y divide-border-hairline">
                  {MOCK_TODAY_OVERVIEW.planItems.map((item) => (
                    <div key={item.id} className="py-space-md flex items-start justify-between gap-space-md">
                      <div className="flex flex-col gap-space-xs">
                        <div className="flex items-center gap-space-xs">
                          <span
                            className={`w-1.5 h-1.5 inline-block ${
                              item.isProtected
                                ? 'bg-ink-muted'
                                : item.status === 'ACTIVE'
                                ? 'bg-accent-terracotta'
                                : 'bg-ink-secondary'
                            }`}
                          />
                          <span className="font-headline-md text-headline-md text-ink-primary">
                            {item.title}
                          </span>
                        </div>
                        <span className="font-body-md text-body-md text-ink-secondary">
                          {item.startTime} – {item.endTime} · {item.durationHours}h allocated
                        </span>
                        {item.notes && (
                          <p className="font-body-md text-body-md text-ink-muted">{item.notes}</p>
                        )}
                      </div>
                      <span
                        className={`font-label-lg text-label-lg shrink-0 px-space-xs py-0.5 ${
                          item.isProtected
                            ? 'bg-transparent text-ink-muted uppercase'
                            : 'bg-surface-cream text-ink-primary font-semibold'
                        }`}
                      >
                        {item.isProtected ? 'Protected' : item.status === 'ACTIVE' ? 'Priority' : 'Scheduled'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Bar Envelope */}
              <div className="mt-space-lg pt-space-md border-t border-border-hairline flex flex-col gap-space-xs">
                <div className="flex justify-between items-baseline font-label-md text-label-md">
                  <span className="text-ink-secondary">Allocated Focus Time</span>
                  <span className="text-ink-primary font-semibold">
                    {MOCK_TODAY_OVERVIEW.availableFocusHours}h / {MOCK_TODAY_OVERVIEW.maxFocusLimitHours}h max focus limit
                  </span>
                </div>
                <div className="w-full h-2 bg-surface-cream rounded-none overflow-hidden flex">
                  <div className="h-full bg-ink-primary w-[70%]" />
                  <div className="h-full bg-accent-terracotta w-[20%]" />
                  <div className="h-full bg-transparent flex-1" />
                </div>
                <div className="flex justify-between items-center text-ink-muted font-label-md text-label-md mt-1">
                  <span>90% scheduled capacity</span>
                  <span>30m safe buffer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Actionable Priorities List */}
      <section className="w-full py-space-2xl px-margin-mobile md:px-margin-tablet lg:px-margin">
        <div className="max-w-screen-2xl mx-auto flex flex-col gap-space-xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-sm">
            <div className="flex flex-col gap-space-xs">
              <span className="font-label-lg text-label-lg uppercase tracking-wider text-accent-terracotta">
                Actionable Priorities
              </span>
              <h2 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-ink-primary">
                What deserves your attention
              </h2>
            </div>
            <span className="font-body-md text-body-md text-ink-secondary">
              Ordered by deadline urgency and remaining workload
            </span>
          </div>

          <div className="flex flex-col w-full divide-y divide-border-hairline">
            {MOCK_TODAY_OVERVIEW.priorities.map((item, index) => (
              <OpenListRow
                key={item.id}
                leftContent={
                  <div className="flex items-baseline gap-space-md">
                    <span className="font-numeric-hero text-numeric-hero-mobile md:text-numeric-hero leading-none text-ink-primary select-none opacity-80 group-hover:opacity-100 transition-opacity">
                      {`0${index + 1}`}
                    </span>
                    <div className="flex flex-col">
                      <span
                        className={`font-label-lg text-label-lg uppercase tracking-wider ${
                          item.riskLevel === 'CRITICAL' ? 'text-status-alert font-semibold' : 'text-ink-secondary'
                        }`}
                      >
                        Due in 2 days
                      </span>
                      <span className="font-body-md text-body-md text-ink-secondary">
                        {item.remainingEffortHours}h remaining
                      </span>
                    </div>
                  </div>
                }
                centerContent={
                  <>
                    <h3 className="font-headline-md text-headline-md text-ink-primary group-hover:text-accent-terracotta transition-colors">
                      {item.title}
                    </h3>
                    <p className="font-body-md text-body-md text-ink-secondary max-w-2xl">
                      {item.description}
                    </p>
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

          {/* Natural Language Adjustment Section */}
          <div className="max-w-3xl pt-space-md">
            <NaturalLanguageInput
              label="Need to adjust today?"
              placeholder="e.g. Reschedule lecture review to tomorrow morning"
              helperText="Automatically recomputes your focus envelopes without guilt."
            />
          </div>
        </div>
      </section>
    </div>
  );
};
