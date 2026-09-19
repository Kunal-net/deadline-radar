import React from 'react';

export const TimelineView: React.FC = () => {
  return (
    <div className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin py-space-xl">
      <div className="max-w-screen-2xl mx-auto flex flex-col gap-space-lg">
        <div>
          <span className="font-label-md text-label-md text-accent-terracotta uppercase tracking-wider font-semibold">
            Forward Projection
          </span>
          <h1 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-ink-primary mt-1">
            Timeline
          </h1>
          <p className="font-body-md text-body-md text-ink-secondary mt-1">
            Gantt-style forward capacity mapping of deliverables against calendar availability windows.
          </p>
        </div>
        <div className="p-space-lg bg-surface-container-low border border-border-hairline text-ink-secondary font-body-md">
          Timeline forward projection engine active. Deliverable commitments mapped sequentially.
        </div>
      </div>
    </div>
  );
};
