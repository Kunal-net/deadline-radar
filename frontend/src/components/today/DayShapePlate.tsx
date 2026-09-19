import React from 'react';

export interface DayShapePlateProps {
  availableFocusHours?: number;
  maxFocusLimitHours?: number;
}

export const DayShapePlate: React.FC<DayShapePlateProps> = ({
  availableFocusHours = 4.5,
  maxFocusLimitHours = 5.0,
}) => {
  return (
    <section
      id="shape-of-day"
      aria-labelledby="shape-of-day-heading"
      className="w-full bg-surface-container-low py-space-xl"
    >
      <div className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-space-xl items-start">
          {/* Left Plate: Canonical Editorial Photography */}
          <div className="lg:col-span-6 flex flex-col gap-space-xs">
            <div className="relative w-full aspect-[4/5] bg-surface-cream overflow-hidden">
              <img
                src="/assets/focus-workspace.jpg"
                alt="Hands typing on laptop at green desk with coffee cup"
                className="w-full h-full object-cover object-center grayscale-[15%] contrast-[105%]"
                loading="lazy"
              />
              <div className="absolute bottom-0 left-0 right-0 p-space-md bg-gradient-to-t from-ink-primary/80 via-ink-primary/30 to-transparent">
                <span className="font-label-md text-label-md text-canvas-paper tracking-wider uppercase">
                  Deep Cognition State · Uninterrupted
                </span>
              </div>
            </div>
            <div className="flex justify-between items-baseline pt-space-xs text-ink-muted flex-wrap gap-space-xs">
              <span className="font-label-md text-label-md tracking-widest uppercase">
                Deep Execution · Laptop Workspace &amp; Focus
              </span>
              <span className="font-label-md text-label-md">
                Today&apos;s Intent: Zero Residual Guilt
              </span>
            </div>
          </div>

          {/* Right Plate: The Day's Shape Breakdown */}
          <div className="lg:col-span-6 flex flex-col justify-between h-full pt-space-sm lg:pt-0">
            <div className="flex flex-col gap-space-md">
              <div className="flex flex-col gap-space-xs">
                <span className="font-label-lg text-label-lg uppercase tracking-wider text-ink-secondary">
                  Today&apos;s Schedule
                </span>
                <h2
                  id="shape-of-day-heading"
                  className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-ink-primary"
                >
                  The Day&apos;s Shape
                </h2>
                <p className="font-body-md text-body-md text-ink-secondary">
                  Structured blocks designed to balance focused effort with deliberate offline buffers.
                </p>
              </div>

              {/* Schedule Blocks */}
              <div className="flex flex-col mt-space-sm">
                {/* 1. Morning Focus */}
                <div className="py-space-md flex items-start justify-between gap-space-md">
                  <div className="flex flex-col gap-space-xs">
                    <div className="flex items-center gap-space-xs">
                      <span
                        className="w-1.5 h-1.5 bg-accent-terracotta inline-block shrink-0"
                        aria-hidden="true"
                      />
                      <span className="font-headline-md text-headline-md text-ink-primary">
                        Morning Focus
                      </span>
                    </div>
                    <span className="font-body-md text-body-md text-ink-secondary">
                      09:30 – 11:30 · 2h allocated
                    </span>
                    <p className="font-body-md text-body-md text-ink-muted">
                      Dedicated to high-priority coursework and core problem solving.
                    </p>
                  </div>
                  <span className="font-label-lg text-label-lg font-semibold text-ink-primary shrink-0 bg-surface-cream px-space-xs py-0.5">
                    Priority
                  </span>
                </div>

                <div className="w-full h-px bg-border-hairline" />

                {/* 2. Afternoon Focus */}
                <div className="py-space-md flex items-start justify-between gap-space-md">
                  <div className="flex flex-col gap-space-xs">
                    <div className="flex items-center gap-space-xs">
                      <span
                        className="w-1.5 h-1.5 bg-ink-secondary inline-block shrink-0"
                        aria-hidden="true"
                      />
                      <span className="font-headline-md text-headline-md text-ink-primary">
                        Afternoon Focus
                      </span>
                    </div>
                    <span className="font-body-md text-body-md text-ink-secondary">
                      14:30 – 17:00 · 2.5h allocated
                    </span>
                    <p className="font-body-md text-body-md text-ink-muted">
                      Implementation work, code reviews, and test validations.
                    </p>
                  </div>
                  <span className="font-label-lg text-label-lg font-semibold text-ink-secondary shrink-0 bg-surface-cream px-space-xs py-0.5">
                    Active
                  </span>
                </div>

                <div className="w-full h-px bg-border-hairline" />

                {/* 3. Evening Protected */}
                <div className="py-space-md flex items-start justify-between gap-space-md">
                  <div className="flex flex-col gap-space-xs">
                    <div className="flex items-center gap-space-xs">
                      <span
                        className="material-symbols-outlined text-[18px] text-ink-primary shrink-0"
                        aria-hidden="true"
                      >
                        nightlight
                      </span>
                      <span className="font-headline-md text-headline-md text-ink-primary">
                        Evening Protected
                      </span>
                    </div>
                    <span className="font-body-md text-body-md text-ink-secondary">
                      18:30 – Bedtime · Off-hours &amp; personal time
                    </span>
                    <p className="font-body-md text-body-md text-ink-muted">
                      Dinner, gym, and complete screen-off rest.
                    </p>
                  </div>
                  <span className="font-label-md text-label-md tracking-wider uppercase text-ink-primary shrink-0 font-medium">
                    Protected
                  </span>
                </div>
              </div>
            </div>

            {/* Allocated Focus Time Gauge */}
            <div className="mt-space-lg pt-space-md border-t border-border-hairline flex flex-col gap-space-xs">
              <div className="flex justify-between items-baseline font-label-md text-label-md">
                <span className="text-ink-secondary">Allocated Focus Time</span>
                <span className="text-ink-primary font-semibold">
                  {availableFocusHours}h / {maxFocusLimitHours}h max focus limit
                </span>
              </div>
              <div
                className="w-full h-2 bg-surface-cream rounded-none overflow-hidden flex"
                role="progressbar"
                aria-valuenow={90}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Allocated focus capacity: 90%"
              >
                <div className="h-full bg-ink-primary w-[70%]" title="Morning Focus (2.0h)" />
                <div className="h-full bg-accent-terracotta w-[20%]" title="Afternoon Focus (2.5h)" />
                <div className="h-full bg-transparent flex-1" title="Buffer (0.5h)" />
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
  );
};
