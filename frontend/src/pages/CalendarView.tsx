import React from 'react';

export const CalendarView: React.FC = () => {
  return (
    <div className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin py-space-xl">
      <div className="max-w-screen-2xl mx-auto flex flex-col gap-space-lg">
        <div>
          <span className="font-label-md text-label-md text-accent-terracotta uppercase tracking-wider font-semibold">
            Calendar Integration
          </span>
          <h1 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-ink-primary mt-1">
            Schedule &amp; Blackout Windows
          </h1>
          <p className="font-body-md text-body-md text-ink-secondary mt-1">
            Unified schedule view combining external calendar commitments, protected interests, and focus sessions.
          </p>
        </div>
        <div className="p-space-lg bg-surface-container-low border border-border-hairline text-ink-secondary font-body-md">
          Calendar schedule view calibrated. Blackout envelopes and focus blocks highlighted.
        </div>
      </div>
    </div>
  );
};
