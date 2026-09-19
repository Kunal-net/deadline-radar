import React from 'react';
import { MetricBlock } from '../components/ui/MetricBlock';

export const PlanningView: React.FC = () => {
  return (
    <div className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin py-space-xl">
      <div className="max-w-screen-2xl mx-auto flex flex-col gap-space-lg">
        <div>
          <span className="font-label-md text-label-md text-accent-terracotta uppercase tracking-wider font-semibold">
            Adaptive Planning
          </span>
          <h1 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-ink-primary mt-1">
            Capacity Allocation
          </h1>
          <p className="font-body-md text-body-md text-ink-secondary mt-1 max-w-xl">
            Generates realistic focus allocations around your non-negotiable commitments and protected buffers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm">
          <MetricBlock
            label="Gross Capacity"
            value="35.0"
            unit="hrs"
            description="Available this week before commitments"
          />
          <MetricBlock
            label="Blackout Windows"
            value="16.5"
            unit="hrs"
            description="Classes, work shifts, personal buffers"
          />
          <MetricBlock
            label="Net Focus Buffer"
            value="18.5"
            unit="hrs"
            description="Actual usable deep execution envelopes"
            variant="cream"
          />
        </div>
      </div>
    </div>
  );
};
