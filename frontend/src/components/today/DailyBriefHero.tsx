import React from 'react';
import { ActiveSession } from '../../store/useAppStore';

export interface DailyBriefHeroProps {
  dateDisplay: string;
  issueNumber: string;
  availableFocusHours: number;
  deadlinesCount: number;
  activeSession: ActiveSession | null;
  onStartSession: () => void;
  onPauseSession: () => void;
  onResumeSession: () => void;
  onStopSession: () => void;
}

function formatElapsed(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const DailyBriefHero: React.FC<DailyBriefHeroProps> = ({
  dateDisplay,
  issueNumber,
  availableFocusHours,
  deadlinesCount,
  activeSession,
  onStartSession,
  onPauseSession,
  onResumeSession,
  onStopSession,
}) => {
  return (
    <section
      aria-label="Daily Brief"
      className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin pt-space-md lg:pt-space-lg pb-space-xl"
    >
      <div className="max-w-screen-2xl mx-auto flex flex-col gap-space-lg">
        {/* Editorial Overline & Timestamp */}
        <div className="flex flex-wrap items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-xs">
            <span
              className="w-2 h-2 bg-accent-terracotta inline-block shrink-0"
              aria-hidden="true"
            />
            <span className="font-label-lg text-label-lg tracking-widest uppercase text-ink-primary">
              Daily Brief · {dateDisplay}
            </span>
          </div>
          <span className="font-label-md text-label-md text-ink-muted">
            Issue No. {issueNumber} · Capacity Gauge Active
          </span>
        </div>

        {/* Primary Statement: Unflinching Editorial Scale */}
        <div className="max-w-4xl flex flex-col gap-space-md">
          <h1 className="font-display-hero text-display-hero-mobile md:text-display-hero text-ink-primary tracking-tight">
            You have {availableFocusHours} hours of focus today.
          </h1>
          <p className="font-body-xl text-body-xl text-ink-secondary leading-relaxed max-w-3xl">
            {deadlinesCount} deadlines require attention before tonight. Scheduled breaks and evening protected.
          </p>

          {/* Action Row & Active Focus Session Controls */}
          <div className="pt-space-sm flex flex-wrap items-center gap-space-lg">
            {activeSession ? (
              <div
                role="region"
                aria-label="Active Focus Session"
                className="flex flex-wrap items-center gap-space-sm bg-surface-cream border border-border-hairline px-space-md py-space-xs transition-colors"
              >
                <div className="flex items-center gap-space-xs">
                  <span
                    className="w-2 h-2 bg-accent-terracotta inline-block animate-pulse motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                  <span className="font-label-lg text-label-lg font-semibold text-ink-primary">
                    Sprint Active ({activeSession.title})
                  </span>
                </div>
                <div className="flex items-center gap-space-xs pl-space-xs border-l border-border-hairline">
                  <span
                    className="font-headline-md text-headline-md font-medium text-ink-primary tracking-wider"
                    aria-live="polite"
                  >
                    {formatElapsed(activeSession.elapsedSeconds)}
                  </span>
                  {activeSession.isRunning ? (
                    <button
                      type="button"
                      onClick={onPauseSession}
                      className="font-label-md text-label-md text-ink-secondary hover:text-ink-primary px-space-xs py-0.5 underline underline-offset-4 transition-colors"
                      aria-label="Pause Session"
                    >
                      Pause
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onResumeSession}
                      className="font-label-md text-label-md text-accent-terracotta hover:text-ink-primary px-space-xs py-0.5 underline underline-offset-4 transition-colors"
                      aria-label="Resume Session"
                    >
                      Resume
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onStopSession}
                    className="bg-ink-primary hover:bg-accent-terracotta text-canvas-paper px-space-sm py-0.5 font-label-md text-label-md transition-colors ml-space-xs"
                    aria-label="Finish Session"
                  >
                    Finish
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                id="startSprintBtn"
                onClick={onStartSession}
                className="bg-ink-primary hover:bg-accent-terracotta text-canvas-paper px-space-lg py-space-sm font-label-lg text-label-lg tracking-wider transition-colors duration-200 flex items-center gap-space-xs"
              >
                <span>Start Focus Session</span>
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  arrow_forward
                </span>
              </button>
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
  );
};
